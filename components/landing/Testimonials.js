'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "WappFlow me ayudó a entender mejor la dinámica de comunicación en mi equipo de trabajo.",
    author: "María González",
    role: "Project Manager",
    image: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    quote: "Una herramienta increíble para analizar la efectividad de la comunicación en grupos.",
    author: "Carlos Ruiz",
    role: "Team Lead",
    image: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    quote: "Los insights que obtuve me ayudaron a mejorar significativamente nuestra comunicación.",
    author: "Ana Martínez",
    role: "Community Manager",
    image: "https://randomuser.me/api/portraits/women/2.jpg"
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
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5
    }
  }
};

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900">
            Lo que dicen nuestros usuarios
          </h2>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.author}
              className="bg-white p-6 rounded-xl shadow-md"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03,
                transition: { duration: 0.2 }
              }}
            >
              <motion.p 
                className="text-gray-600 mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                &quot;{testimonial.quote}&quot;
              </motion.p>
              <motion.div 
                className="flex items-center"
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="h-12 w-12 rounded-full mr-4"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                />
                <div>
                  <p className="font-medium text-gray-900">{testimonial.author}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 