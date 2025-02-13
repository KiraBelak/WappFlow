'use client';

import { motion } from 'framer-motion';
import { ChartBarIcon, ClockIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';

const features = [
  {
    title: "Análisis Detallado",
    description: "Obtén insights profundos sobre tus conversaciones con análisis de patrones y tendencias.",
    icon: ChartBarIcon,
    gradient: "from-[#25D366] to-[#128C7E]"
  },
  {
    title: "Estadísticas en Tiempo Real", 
    description: "Visualiza los datos de tu chat instantáneamente con gráficos interactivos y dinámicos.",
    icon: ClockIcon,
    gradient: "from-[#34B7F1] to-[#0088CC]"
  },
  {
    title: "Métricas por Participante",
    description: "Analiza la participación individual y descubre los patrones de comunicación del grupo.",
    icon: UserGroupIcon,
    gradient: "from-[#FF6B6B] to-[#EE5253]"
  },
  {
    title: "Insights Inteligentes",
    description: "Descubre tendencias ocultas y patrones de comunicación con nuestro análisis avanzado.",
    icon: SparklesIcon,
    gradient: "from-[#A17FE0] to-[#7B59D0]"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export default function Features() {
  return (
    <section id="features" className="py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold text-[#25D366] tracking-wider uppercase mb-4 block">
            Características principales
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Todo lo que necesitas para{' '}
            <span className="bg-gradient-to-r from-[#25D366] to-[#128C7E] bg-clip-text text-transparent">
              analizar tus conversaciones
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre el poder de nuestras herramientas de análisis diseñadas para maximizar tu comprensión
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              className="relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              variants={itemVariants}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <motion.div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6`}
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <feature.icon className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${feature.gradient}" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}