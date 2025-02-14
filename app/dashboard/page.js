import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import Message from "@/models/Message";
import connectDB from "@/libs/mongoose";
import { getSubscriptionLimits } from "./layout";

// Forzar revalidación dinámica
export const revalidate = 0;
export const dynamic = "force-dynamic";
export const fetchCache = 'force-no-store';

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function Dashboard() {
  await connectDB();
  const session = await getServerSession(authOptions);
  
  // Obtener todas las conversaciones del usuario
  const conversations = await Message.find({ 
    userId: session.user.id 
  }).sort({ createdAt: -1 }).lean(); // Usar lean() para mejor rendimiento

  // Obtener límites de suscripción
  const { conversationLimit, currentCount } = await getSubscriptionLimits(session.user.id);
  const canCreateMore = currentCount < conversationLimit;

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            title="Recargar conversaciones"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-5 h-5"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" 
              />
            </svg>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {currentCount} de {conversationLimit} conversaciones
          </div>
          {canCreateMore ? (
            <Link 
              href="/dashboard/upload" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Subir Nueva Conversación
            </Link>
          ) : (
            <Link 
              href="/#pricing" 
              className="bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#128C7E] transition-colors"
            >
              Mejorar Plan
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {conversations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No tienes conversaciones aún.</p>
            {canCreateMore ? (
              <p className="text-gray-500 mt-2">¡Sube tu primer chat de WhatsApp!</p>
            ) : (
              <p className="text-gray-500 mt-2">
                Has alcanzado el límite de conversaciones de tu plan.{' '}
                <Link href="/#pricing" className="text-[#25D366] hover:text-[#128C7E]">
                  Mejora tu plan
                </Link>
              </p>
            )}
          </div>
        ) : (
          conversations.map((conv) => (
            <Link 
              key={conv._id} 
              href={`/dashboard/conversation/${conv._id}`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{conv.title}</h2>
                  <p className="text-gray-500 mt-1">
                    {conv.participants.length} participantes · {conv.messages.length} mensajes
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {conv.participants.map((participant) => (
                  <span 
                    key={participant} 
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
                  >
                    {participant}
                  </span>
                ))}
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
