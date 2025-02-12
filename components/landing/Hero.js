'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#25D366]/10 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Analiza tus chats de WhatsApp
            <br />
            <motion.span 
              className="text-[#25D366]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              como nunca antes
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Descubre patrones, tendencias y insights valiosos en tus conversaciones
            con nuestra herramienta de análisis inteligente.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link 
              href="/dashboard/upload"
              className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-lg text-white bg-[#25D366] hover:bg-[#20BC59] transition-colors shadow-lg hover:shadow-xl"
            >
              <motion.span
                className="flex items-center"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                Comienza ahora
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-1/2 left-0 w-72 h-72 bg-[#25D366]/10 rounded-full blur-3xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-[#25D366]/10 rounded-full blur-3xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
      />
    </section>
  );
} 