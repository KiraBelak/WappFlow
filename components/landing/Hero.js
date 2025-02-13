'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useSession, signIn } from 'next-auth/react';

export default function Hero() {
  const {status} = useSession();

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center bg-gradient-to-br from-[#25D366]/5 via-white to-[#128C7E]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-4"
          >
            <span className="inline-block px-4 py-1.5 bg-[#25D366]/10 text-[#128C7E] text-sm font-semibold rounded-full">
              ¡Nuevo! Análisis avanzado de conversaciones
            </span>
          </motion.div>

          <motion.h1 
            className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 md:mb-8 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Analiza tus chats de{' '}
            <span className="bg-gradient-to-r from-[#25D366] to-[#128C7E] bg-clip-text text-transparent">
              WhatsApp como experto
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Descubre patrones ocultos, tendencias significativas e insights valiosos 
            en tus conversaciones con nuestra herramienta de análisis inteligente.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:space-x-4 px-4"
          >
            {status !== 'unauthenticated' ? (
              <Link 
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20BC59] hover:to-[#0F7A6C] transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#25D366]/20"
              >
                <motion.span
                  className="flex items-center"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Dashboard
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </motion.span>
              </Link>
            ) : (
              <button 
                onClick={() => signIn()}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20BC59] hover:to-[#0F7A6C] transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#25D366]/20"
              >
                Iniciar sesión
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </button>
            )}
            <a 
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-gray-700 bg-white border-2 border-gray-200 hover:border-[#25D366] hover:text-[#25D366] transition-all duration-300"
            >
              Ver funcionalidades
            </a>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-1/3 -left-32 sm:left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-r from-[#25D366]/20 to-[#128C7E]/20 rounded-full blur-3xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 sm:bottom-0 sm:right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-l from-[#25D366]/20 to-[#128C7E]/20 rounded-full blur-3xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.4 }}
      />
    </section>
  );
}