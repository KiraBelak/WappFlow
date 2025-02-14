import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// By default, it doesn't force users to be authenticated. But if they are, it will prefill the Checkout data with their email and/or credit card
export async function POST(req) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para suscribirte" },
        { status: 401 }
      );
    }

    if (!body.priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    if (!body.successUrl || !body.cancelUrl) {
      return NextResponse.json(
        { error: "Success and cancel URLs are required" },
        { status: 400 }
      );
    }

    await connectMongo();
    const user = await User.findById(session.user.id);

    // Si el usuario ya tiene una suscripción activa
    if (user.subscriptionStatus === 'active') {
      return NextResponse.json(
        { error: "Ya tienes una suscripción activa" },
        { status: 400 }
      );
    }

    // Crear o recuperar el cliente de Stripe
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user._id.toString()
        }
      });
      customerId = customer.id;
      
      // Actualizar el usuario con el ID del cliente de Stripe
      await User.findByIdAndUpdate(user._id, {
        stripeCustomerId: customerId
      });
    }

    // Crear la sesión de Stripe Checkout
    const stripeSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: body.priceId,
          quantity: 1,
        },
      ],
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
      metadata: {
        userId: user._id.toString()
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString()
        }
      },
      allow_promotion_codes: true
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (e) {
    console.error('Error creating checkout session:', e);
    return NextResponse.json(
      { error: "Error al crear la sesión de pago" },
      { status: 500 }
    );
  }
}
