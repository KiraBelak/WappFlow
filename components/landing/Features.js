'use client';

import { motion } from 'framer-motion';
import { ChartBarIcon, ClockIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';

const features = [
  {
    title: "Análisis Detallado",
    description: "Obtén insights profundos sobre tus conversaciones con análisis de patrones y tendencias.",
    icon: ChartBarIcon
  },
  {
    title: "Estadísticas en Tiempo Real",
    description: "Visualiza los datos de tu chat instantáneamente con gráficos interactivos y dinámicos.",
    icon: ClockIcon
  },
  {
    title: "Métricas por Participante",
    description: "Analiza la participación individual y descubre los patrones de comunicación del grupo.",
    icon: UserGroupIcon
  },
  {
    title: "Insights Inteligentes",
    description: "Descubre tendencias ocultas y patrones de comunicación con nuestro análisis avanzado.",
    icon: SparklesIcon
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900">
            Todo lo que necesitas para analizar tus conversaciones
          </h2>
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
              className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <feature.icon className="h-12 w-12 text-[#25D366] mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 