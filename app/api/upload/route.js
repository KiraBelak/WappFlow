import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';
import Message from '@/models/Message';
import connectDB from '@/libs/mongoose';

export async function POST(req) {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Obtener la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // 1. Obtener el formData del request
    const formData = await req.formData();
    
    // 2. Extraer el archivo
    const file = formData.get('file');
    
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No se recibió ningún archivo válido.' },
        { status: 400 }
      );
    }
    
    // 3. Convertir a texto
    const text = await file.text();
    // console.log("text", text)
    // 4. Procesar el contenido del archivo
    const lines = text.split('\n');
    const messages = [];
    const participants = new Set();
    // console.log("lines", lines)
    
    // Expresión regular actualizada para manejar más casos
    const messageRegex = /^\s*‎?\[(\d{1,2}\/\d{1,2}\/\d{2}),\s*(\d{1,2}:\d{2}:\d{2})(?:\s*[ap]\.m\.)?\]\s+([^:]+):\s*(.+?)\r?$/i;

    for (const line of lines) {
      const match = line.trim().match(messageRegex);
      if (match) {
        // console.log("match", match);
        const [, date, time, sender, content] = match;
        
        // Convertir la fecha y hora al formato ISO
        const [day, month, year] = date.split('/');
        // Convertir hora de 12h a 24h si es necesario
        let [hour, minute, second] = time.split(':');
        hour = parseInt(hour);
        
        // Ajustar hora si es PM
        if (line.toLowerCase().includes('p.m.') && hour !== 12) {
          hour += 12;
        }
        // Ajustar hora si es AM
        if (line.toLowerCase().includes('a.m.') && hour === 12) {
          hour = 0;
        }

        const timestamp = new Date(
          `20${year}`,
          month - 1,
          day,
          hour,
          parseInt(minute),
          parseInt(second)
        );

        // No guardar mensajes del sistema o medios omitidos
        const normalizedContent = content.trim();
        if (!normalizedContent.includes('Los mensajes y las llamadas están cifrados') &&
            !normalizedContent.endsWith('omitida')) {
          console.log("this Push", sender.trim(), normalizedContent, timestamp);
          messages.push({
            sender: sender.trim(),
            content: normalizedContent,
            timestamp
          });
          participants.add(sender.trim());
        }
      }
    }

    // 5. Crear una nueva conversación
    const conversation = await Message.create({
      title: `Chat de WhatsApp - ${new Date().toLocaleDateString()}`,
      participants: Array.from(participants),
      messages,
      userId: session.user.id,
      metadata: {
        source: 'whatsapp_import',
        importDate: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Chat importado correctamente',
      data: {
        conversationId: conversation._id,
        messageCount: messages.length,
        participantCount: participants.size
      }
    });

  } catch (error) {
    console.error('[ERROR procesando archivo]', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo.' },
      { status: 500 }
    );
  }
}
