import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import Message from "@/models/Message";
import connectDB from "@/libs/mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// Lista de stop words en español
const STOP_WORDS = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero', 'si', 'no', 'en', 'de', 'a', 'que', 'por', 'para', 'con', 'se', 'su', 'sus', 'este', 'esta', 'estos', 'estas','omitido','sticker']);

function calculateStats(messages) {
  const stats = {
    // Métricas básicas
    totalMessages: messages.length,
    messagesByParticipant: {},
    participationRate: {},
    
    // Métricas de contenido
    averageWordsByParticipant: {},
    averageCharsByParticipant: {},
    wordFrequency: {},
    longestMessage: { content: '', sender: '', length: 0 },
    shortestMessage: { content: '', sender: '', length: Number.MAX_SAFE_INTEGER },
    
    // Métricas temporales
    messagesByHour: Array(24).fill(0),
    messagesByDay: Array(7).fill(0),
    responseTimeByParticipant: {},
    consecutiveMessagesByParticipant: {},
    inactivityPeriods: [],
    
    // Métricas de contenido especial
    emojiCount: {},
    mediaMessages: { total: 0, byParticipant: {} },
    
    // Duración
    firstMessage: null,
    lastMessage: null
  };

  // Ordenar mensajes cronológicamente
  const sortedMessages = [...messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  if (sortedMessages.length > 0) {
    stats.firstMessage = new Date(sortedMessages[0].timestamp);
    stats.lastMessage = new Date(sortedMessages[sortedMessages.length - 1].timestamp);
  }

  let lastSender = null;
  let lastMessageTime = null;

  sortedMessages.forEach((msg, index) => {
    const sender = msg.sender.trim();
    const content = msg.content.trim();
    const timestamp = new Date(msg.timestamp);
    
    // Conteo básico de mensajes
    stats.messagesByParticipant[sender] = (stats.messagesByParticipant[sender] || 0) + 1;
    
    // Análisis de contenido
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const chars = content.length;
    
    // Actualizar promedios por participante
    if (!stats.averageWordsByParticipant[sender]) {
      stats.averageWordsByParticipant[sender] = { total: 0, count: 0 };
      stats.averageCharsByParticipant[sender] = { total: 0, count: 0 };
    }
    stats.averageWordsByParticipant[sender].total += words.length;
    stats.averageWordsByParticipant[sender].count++;
    stats.averageCharsByParticipant[sender].total += chars;
    stats.averageCharsByParticipant[sender].count++;

    // Mensajes más largos/cortos
    if (words.length > stats.longestMessage.length) {
      stats.longestMessage = { content, sender, length: words.length };
    }
    if (words.length > 0 && words.length < stats.shortestMessage.length) {
      stats.shortestMessage = { content, sender, length: words.length };
    }

    // Frecuencia de palabras
    words.forEach(word => {
      const normalizedWord = word.toLowerCase();
      if (!STOP_WORDS.has(normalizedWord) && normalizedWord.length > 3) {
        stats.wordFrequency[normalizedWord] = (stats.wordFrequency[normalizedWord] || 0) + 1;
      }
    });

    // Distribución temporal
    stats.messagesByHour[timestamp.getHours()]++;
    stats.messagesByDay[timestamp.getDay()]++;

    // Mensajes consecutivos
    if (sender === lastSender) {
      stats.consecutiveMessagesByParticipant[sender] = (stats.consecutiveMessagesByParticipant[sender] || 0) + 1;
    }

    // Tiempo de respuesta
    if (lastMessageTime && sender !== lastSender) {
      const responseTime = timestamp - lastMessageTime;
      if (!stats.responseTimeByParticipant[sender]) {
        stats.responseTimeByParticipant[sender] = { total: 0, count: 0 };
      }
      stats.responseTimeByParticipant[sender].total += responseTime;
      stats.responseTimeByParticipant[sender].count++;
    }

    // Períodos de inactividad (más de 1 hora)
    if (lastMessageTime) {
      const timeDiff = timestamp - lastMessageTime;
      if (timeDiff > 3600000) { // 1 hora en milisegundos
        stats.inactivityPeriods.push({
          start: lastMessageTime,
          end: timestamp,
          duration: timeDiff
        });
      }
    }

    // Detección de mensajes multimedia
    if (content.includes('imagen omitida') || 
        content.includes('video omitido') || 
        content.includes('audio omitido') ||
        content.includes('documento omitido')) {
      stats.mediaMessages.total++;
      stats.mediaMessages.byParticipant[sender] = (stats.mediaMessages.byParticipant[sender] || 0) + 1;
    }

    // Actualizar para la siguiente iteración
    lastSender = sender;
    lastMessageTime = timestamp;
  });

  // Calcular tasas de participación
  Object.entries(stats.messagesByParticipant).forEach(([participant, count]) => {
    stats.participationRate[participant] = (count / stats.totalMessages) * 100;
  });

  // Calcular promedios finales
  Object.keys(stats.averageWordsByParticipant).forEach(participant => {
    const wordStats = stats.averageWordsByParticipant[participant];
    const charStats = stats.averageCharsByParticipant[participant];
    stats.averageWordsByParticipant[participant] = wordStats.total / wordStats.count;
    stats.averageCharsByParticipant[participant] = charStats.total / charStats.count;
  });

  // Calcular promedios de tiempo de respuesta
  Object.keys(stats.responseTimeByParticipant).forEach(participant => {
    const timeStats = stats.responseTimeByParticipant[participant];
    stats.responseTimeByParticipant[participant] = timeStats.total / timeStats.count;
  });

  // Ordenar palabras más frecuentes (top 20)
  stats.topWords = Object.entries(stats.wordFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20);

  return stats;
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default async function ConversationPage({ params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  
  const conversation = await Message.findOne({
    _id: params.id,
    userId: session.user.id
  });

  if (!conversation) {
    notFound();
  }

  const stats = calculateStats(conversation.messages);

  return (
    <main className="min-h-screen p-8 pb-24 bg-gray-50">
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Volver
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{conversation.title}</h1>
        </div>

        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Mensajes Totales</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalMessages}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Participantes</h3>
            <p className="text-3xl font-bold text-blue-600">{conversation.participants.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Duración Total</h3>
            <p className="text-3xl font-bold text-blue-600">
              {formatDuration(stats.lastMessage - stats.firstMessage)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Contenido Multimedia</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.mediaMessages.total}</p>
          </div>
        </div>

        {/* Estadísticas por Participante */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-6">Estadísticas por Participante</h3>
          <div className="space-y-8">
            {Object.entries(stats.messagesByParticipant)
              .sort(([,a], [,b]) => b - a)
              .map(([participant, count]) => (
                <div key={participant} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-lg">{participant}</span>
                    <span className="text-gray-500">
                      {count} mensajes ({Math.round(stats.participationRate[participant])}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Promedio de palabras:</span>
                      <br />
                      <span className="font-medium">
                        {Math.round(stats.averageWordsByParticipant[participant])} palabras/mensaje
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tiempo promedio de respuesta:</span>
                      <br />
                      <span className="font-medium">
                        {formatDuration(stats.responseTimeByParticipant[participant] || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Mensajes multimedia:</span>
                      <br />
                      <span className="font-medium">
                        {stats.mediaMessages.byParticipant[participant] || 0} archivos
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(count / stats.totalMessages) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Actividad por Hora */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Actividad por Hora</h3>
            <div className="grid grid-cols-24 gap-1 h-40">
              {stats.messagesByHour.map((count, hour) => {
                const height = count ? (count / Math.max(...stats.messagesByHour)) * 100 : 0;
                return (
                  <div key={hour} className="flex flex-col items-center">
                    <div className="flex-1 w-full relative">
                      <div
                        className="absolute bottom-0 w-full bg-blue-600 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-xs mt-1">{hour}h</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actividad por Día */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Actividad por Día</h3>
            <div className="grid grid-cols-7 gap-1 h-40">
              {stats.messagesByDay.map((count, day) => {
                const height = count ? (count / Math.max(...stats.messagesByDay)) * 100 : 0;
                return (
                  <div key={day} className="flex flex-col items-center">
                    <div className="flex-1 w-full relative">
                      <div
                        className="absolute bottom-0 w-full bg-blue-600 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-xs mt-1">{DAYS[day].slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Palabras más Frecuentes y Mensajes Destacados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Palabras más Frecuentes</h3>
            <div className="flex flex-wrap gap-2">
              {stats.topWords.map(([word, count]) => (
                <span
                  key={word}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  style={{
                    fontSize: `${Math.max(0.8, Math.min(1.5, count / (stats.totalMessages * 0.1)))}em`
                  }}
                >
                  {word} ({count})
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Mensajes Destacados</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Mensaje más largo</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">{stats.longestMessage.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Por {stats.longestMessage.sender} ({stats.longestMessage.length} palabras)
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Mensaje más corto</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">{stats.shortestMessage.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Por {stats.shortestMessage.sender} ({stats.shortestMessage.length} palabras)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Períodos de Inactividad */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Períodos de Inactividad más Largos</h3>
          <div className="space-y-2">
            {stats.inactivityPeriods
              .sort((a, b) => b.duration - a.duration)
              .slice(0, 5)
              .map((period, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>
                    {new Date(period.start).toLocaleDateString()} {new Date(period.start).toLocaleTimeString()}
                    {' → '}
                    {new Date(period.end).toLocaleDateString()} {new Date(period.end).toLocaleTimeString()}
                  </span>
                  <span className="font-medium">{formatDuration(period.duration)}</span>
                </div>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
} 