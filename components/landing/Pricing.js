'use client';

import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Manantial',
    price: 'Gratis',
    description: 'Para usuarios que quieren probar la plataforma',
    features: [
      'Análisis de 1 conversación',
      'Estadísticas básicas',
      'Exportación en PDF',
    ],
    priceId: null, // Plan gratuito
    cta: 'Comenzar gratis',
  },
  {
    name: 'Río',
    price: '$149',
    period: '/mes',
    description: 'Para profesionales que necesitan más funcionalidades',
    features: [
      'Análisis de 15 conversaciones',
      'Estadísticas avanzadas',
      'Análisis de sentimientos',
      'Exportación en múltiples formatos',
      'Soporte prioritario',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    cta: 'Comenzar Río',
    popular: true,
  },
  {
    name: 'Oceano',
    price: '$399',
    period: '/mes',
    description: 'Para empresas que necesitan todas las funcionalidades',
    features: [
      'Todo lo incluido en Pro',
      'Análisis de 100 conversaciones',
      'API de acceso',
      'Preguntar sobre conversaciones',
      'Integración con CRM',
      'Soporte 24/7',
      'Personalización avanzada',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    cta: 'Comenzar Oceano',
  },
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
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handlePlanClick = async (plan) => {
    setLoading(true);
    try {
      if (!session) {
        toast.error("Debes iniciar sesión para suscribirte");
        signIn('google');

        // router.push("/login");
        return;
      }

      // Si es el plan gratuito, redirigir al dashboard
      if (!plan.priceId) {
        router.push("/dashboard");
        return;
      }

      // Crear sesión de checkout
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Redirigir a Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Error al procesar la suscripción:", error);
      toast.error("Error al procesar la suscripción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm font-semibold text-[#25D366] tracking-wider uppercase mb-4 block">
            Planes y Precios
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Elige el plan perfecto para{' '}
            <span className="bg-gradient-to-r from-[#25D366] to-[#128C7E] bg-clip-text text-transparent">
              tus necesidades
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Planes flexibles que crecen contigo. Comienza gratis y mejora cuando lo necesites.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative p-8 bg-white rounded-2xl ${
                plan.popular ? 'ring-4 ring-[#25D366] shadow-xl scale-105' : 'border border-gray-200 shadow-lg'
              }`}
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              {plan.popular && (
                <span className="absolute top-0 right-8 -translate-y-1/2 bg-[#25D366] text-white px-3 py-1 rounded-full text-sm font-medium">
                  Más popular
                </span>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#25D366] mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                onClick={() => handlePlanClick(plan)}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  loading ? 'opacity-50 cursor-not-allowed' :
                  plan.popular
                    ? 'bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white hover:shadow-lg hover:shadow-[#25D366]/20'
                    : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                }`}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? 'Procesando...' : plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-600">
            ¿Necesitas un plan personalizado?{' '}
            <a href="#contact" className="text-[#25D366] font-medium hover:text-[#128C7E]">
              Contáctanos
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
} 