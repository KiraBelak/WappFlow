'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePortalAccess = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard`,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Error al acceder al portal:', error);
      toast.error('Error al acceder al portal de facturación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Gestionar suscripción</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-6">
          Accede al portal de facturación de Stripe para:
        </p>
        
        <ul className="list-disc list-inside mb-8 space-y-2 text-gray-600">
          <li>Ver el historial de facturación</li>
          <li>Actualizar el método de pago</li>
          <li>Cambiar o cancelar tu suscripción</li>
          <li>Descargar facturas</li>
        </ul>

        <button
          onClick={handlePortalAccess}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 
            ${loading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-[#25D366] hover:bg-[#128C7E] text-white'
            }`}
        >
          {loading ? 'Cargando...' : 'Acceder al portal de facturación'}
        </button>
      </div>
    </div>
  );
} 