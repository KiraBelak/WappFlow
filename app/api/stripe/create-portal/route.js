import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    await connectMongo();
    const user = await User.findById(session.user.id);

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No tienes una cuenta de facturación. Realiza una suscripción primero." },
        { status: 400 }
      );
    }

    const body = await req.json();
    if (!body.returnUrl) {
      return NextResponse.json(
        { error: "URL de retorno requerida" },
        { status: 400 }
      );
    }

    // Crear la sesión del portal de Stripe
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: body.returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error al crear la sesión del portal:', error);
    return NextResponse.json(
      { error: "Error al crear la sesión del portal" },
      { status: 500 }
    );
  }
}
