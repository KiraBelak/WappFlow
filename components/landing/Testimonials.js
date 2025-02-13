'use client';

import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

const testimonials = [
  {
    quote: "WappFlow me ayudó a descubrir patrones en mi comunicación con mi pareja que no había notado antes. Ahora entendemos mejor nuestros horarios y momentos de conexión.",
    author: "Laura Sánchez",
    role: "Usuaria Personal",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    rating: 5
  },
  {
    quote: "Gracias a los análisis, identificamos que teníamos más desacuerdos los lunes por el estrés laboral. Ajustamos nuestra forma de comunicarnos y mejoró mucho la relación.",
    author: "Daniel Torres",
    role: "Usuario Personal", 
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    rating: 5
  },
  {
    quote: "Los insights sobre nuestros temas de conversación más frecuentes nos ayudaron a balancear mejor nuestras charlas. Una herramienta que fortalece relaciones.",
    author: "Elena Ramírez",
    role: "Usuaria Personal",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    rating: 5
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
    <section id="testimonials" className="py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm font-semibold text-[#25D366] tracking-wider uppercase mb-4 block">
            Testimonios
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Lo que dicen nuestros{' '}
            <span className="bg-gradient-to-r from-[#25D366] to-[#128C7E] bg-clip-text text-transparent">
              usuarios
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre cómo WappFlow está ayudando a equipos a mejorar su comunicación
          </p>
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
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>
              <motion.p 
                className="text-gray-700 text-lg mb-6 leading-relaxed"
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
                <div className="relative">
                  <motion.img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="h-14 w-14 rounded-full mr-4 object-cover ring-4 ring-[#25D366]/10"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-[#25D366] rounded-full border-4 border-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-[#25D366] text-sm font-medium">{testimonial.role}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}