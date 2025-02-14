import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Configure the route handler to not parse the raw body
// export const dynamic = 'force-dynamic';
// export const runtime = 'edge';

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature");

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed.`, err.message);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Manejar los diferentes eventos
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata.userId;

        if (!userId) {
          console.error('No user ID found in subscription metadata');
          return NextResponse.json(
            { error: "No user ID found" },
            { status: 400 }
          );
        }

        // Actualizar el estado de la suscripción del usuario
        await User.findByIdAndUpdate(userId, {
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          subscriptionPriceId: subscription.items.data[0].price.id,
          subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata.userId;

        if (!userId) {
          console.error('No user ID found in subscription metadata');
          return NextResponse.json(
            { error: "No user ID found" },
            { status: 400 }
          );
        }

        // Actualizar el usuario cuando se cancela la suscripción
        await User.findByIdAndUpdate(userId, {
          subscriptionStatus: 'canceled',
          subscriptionPriceId: null,
          subscriptionCurrentPeriodEnd: null,
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const userId = invoice.subscription?.metadata?.userId;

        if (userId) {
          await User.findByIdAndUpdate(userId, {
            subscriptionStatus: 'past_due',
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}