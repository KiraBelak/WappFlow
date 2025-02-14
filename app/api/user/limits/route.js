import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Message from "@/models/Message";

export async function GET() {
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
    const conversations = await Message.find({ userId: session.user.id });
    const currentCount = conversations.length;

    // Determinar límite según el plan
    let limit = 1; // Plan gratuito por defecto

    if (user.subscriptionStatus === 'active') {
      if (user.subscriptionPriceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
        limit = 15; // Plan Río
      } else if (user.subscriptionPriceId === process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID) {
        limit = 100; // Plan Oceano
      }
    }

    return NextResponse.json({
      currentCount,
      limit,
      canUpload: currentCount < limit
    });
  } catch (error) {
    console.error('Error al verificar límites:', error);
    return NextResponse.json(
      { error: "Error al verificar límites" },
      { status: 500 }
    );
  }
} 