import ButtonAccount from "@/components/ButtonAccount";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import Message from "@/models/Message";
import connectDB from "@/libs/mongoose";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function Dashboard() {
  await connectDB();
  const session = await getServerSession(authOptions);
  
  // Obtener todas las conversaciones del usuario
  const conversations = await Message.find({ 
    userId: session.user.id 
  }).sort({ createdAt: -1 }); // Ordenar por fecha de creación descendente

  return (
    <main className="min-h-screen p-8 pb-24 bg-gray-50">
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Mis Conversaciones</h1>
          <ButtonAccount />
        </div>

        <div className="flex justify-end">
          <Link 
            href="/dashboard/upload" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Subir Nueva Conversación
          </Link>
        </div>

        <div className="grid gap-4">
          {conversations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No tienes conversaciones aún.</p>
              <p className="text-gray-500 mt-2">¡Sube tu primer chat de WhatsApp!</p>
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
      </section>
    </main>
  );
}
