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
    <div className="min-h-screen bg-gray-50">
      {/* Header con título y metadata */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 text-gray-500 mb-2">
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center gap-2 text-sm hover:text-gray-900 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Volver al dashboard
                </Link>
                <span>•</span>
                <time className="text-sm">
                  {new Date(stats.firstMessage).toLocaleDateString()} - {new Date(stats.lastMessage).toLocaleDateString()}
                </time>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{conversation.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {conversation.participants.slice(0, 3).map((participant, i) => (
                  <div 
                    key={participant}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium ring-2 ring-white"
                  >
                    {participant[0].toUpperCase()}
                  </div>
                ))}
                {conversation.participants.length > 3 && (
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-sm font-medium ring-2 ring-white">
                    +{conversation.participants.length - 3}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {conversation.participants.length} participantes
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                title: "Mensajes Totales",
                value: stats.totalMessages,
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                )
              },
              {
                title: "Duración Total",
                value: formatDuration(stats.lastMessage - stats.firstMessage),
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: "Contenido Multimedia",
                value: stats.mediaMessages.total,
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                )
              },
              {
                title: "Palabras Únicas",
                value: stats.topWords.length,
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                )
              }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gráficos de actividad */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Actividad por Hora */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Actividad por Hora</h3>
                <div className="text-sm text-gray-500">
                  Hora más activa: {stats.messagesByHour.indexOf(Math.max(...stats.messagesByHour))}:00
                </div>
              </div>
              <div className="relative">
                <div className="grid grid-cols-24 gap-1 h-48 mb-6">
                  {stats.messagesByHour.map((count, hour) => {
                    const height = count ? (count / Math.max(...stats.messagesByHour)) * 100 : 0;
                    return (
                      <div key={hour} className="flex flex-col items-center group">
                        <div className="flex-1 w-full relative">
                          <div
                            className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-200 group-hover:from-blue-700 group-hover:to-blue-500"
                            style={{ height: `${height}%` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                              {count} mensajes a las {hour}:00
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Eje X con horas */}
                <div className="grid grid-cols-24 gap-1 mt-2">
                  {stats.messagesByHour.map((_, hour) => (
                    <div key={hour} className="flex justify-center">
                      <span className="text-xs text-gray-500 -rotate-45 origin-top-left transform translate-x-3">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actividad por Día */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Actividad por Día</h3>
              <div className="grid grid-cols-7 gap-2 h-48">
                {stats.messagesByDay.map((count, day) => {
                  const height = count ? (count / Math.max(...stats.messagesByDay)) * 100 : 0;
                  const maxCount = Math.max(...stats.messagesByDay);
                  return (
                    <div key={day} className="flex flex-col items-center group">
                      <div className="flex-1 w-full relative">
                        <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-200 group-hover:from-blue-700 group-hover:to-blue-500"
                          style={{ height: `${height}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                            {count} mensajes
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-center">
                        <span className="text-xs font-medium text-gray-900">{DAYS[day].slice(0, 3)}</span>
                        <span className="block text-xs text-gray-500">{Math.round((count/maxCount) * 100)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Estadísticas por Participante */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Estadísticas por Participante</h3>
            <div className="space-y-8">
              {Object.entries(stats.messagesByParticipant)
                .sort(([,a], [,b]) => b - a)
                .map(([participant, count]) => (
                  <div key={participant} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                          {participant[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{participant}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {count} mensajes ({Math.round(stats.participationRate[participant])}%)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          label: "Promedio de palabras",
                          value: `${Math.round(stats.averageWordsByParticipant[participant])} palabras/mensaje`
                        },
                        {
                          label: "Tiempo de respuesta",
                          value: formatDuration(stats.responseTimeByParticipant[participant] || 0)
                        },
                        {
                          label: "Contenido multimedia",
                          value: `${stats.mediaMessages.byParticipant[participant] || 0} archivos`
                        }
                      ].map((stat, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500">{stat.label}</p>
                          <p className="text-sm font-medium text-gray-900">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded"
                          style={{ width: `${(count / stats.totalMessages) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Palabras Frecuentes y Mensajes Destacados */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Palabras más Frecuentes</h3>
              <div className="flex flex-wrap gap-2">
                {stats.topWords.map(([word, count], index) => {
                  const size = Math.max(0.8, Math.min(1.5, count / (stats.totalMessages * 0.1)));
                  const opacity = 1 - (index / stats.topWords.length * 0.6);
                  return (
                    <span
                      key={word}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full"
                      style={{
                        fontSize: `${size}em`,
                        opacity
                      }}
                    >
                      {word} ({count})
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Mensajes Destacados</h3>
              <div className="space-y-6">
                {[
                  {
                    title: "Mensaje más largo",
                    content: stats.longestMessage.content,
                    sender: stats.longestMessage.sender,
                    meta: `${stats.longestMessage.length} palabras`
                  },
                  {
                    title: "Mensaje más corto",
                    content: stats.shortestMessage.content,
                    sender: stats.shortestMessage.sender,
                    meta: `${stats.shortestMessage.length} palabras`
                  }
                ].map((message, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="font-medium text-gray-700">{message.title}</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900">{message.content}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <span>{message.sender}</span>
                        <span>•</span>
                        <span>{message.meta}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Períodos de Inactividad */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Períodos de Inactividad más Largos</h3>
            <div className="space-y-4">
              {stats.inactivityPeriods
                .sort((a, b) => b.duration - a.duration)
                .slice(0, 5)
                .map((period, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Desde</div>
                      <div className="font-medium">
                        {new Date(period.start).toLocaleDateString()}{' '}
                        {new Date(period.start).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="hidden sm:block text-gray-300">→</div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Hasta</div>
                      <div className="font-medium">
                        {new Date(period.end).toLocaleDateString()}{' '}
                        {new Date(period.end).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 text-blue-600 font-medium">
                      {formatDuration(period.duration)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 