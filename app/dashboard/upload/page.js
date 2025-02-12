'use client';

import { useRef, FormEvent, useState } from 'react';

export default function UploadPage() {
  // Referencia para el input de archivo
  const fileInputRef = useRef(null);
  
  // Estado para mostrar mensajes de éxito/error
  const [status, setStatus] = useState(null);

  // Manejar el submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    
    // Verificar si hay archivo
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setStatus('Por favor selecciona un archivo primero.');
      return;
    }

    // Crear un objeto FormData y agregar el archivo
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Petición POST a la ruta de API
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        // Manejo de error por mala respuesta del servidor
        const errorData = await res.json();
        setStatus(`Error: ${errorData.error || 'No se pudo subir el archivo'}`);
        return;
      }

      // Respuesta exitosa, podemos leer los datos
      const data = await res.json();
      setStatus(`Archivo subido con éxito: ${data.message}`);
      
      // Opcional: si quieres mostrar un preview de texto
      // setStatus(`Archivo subido. Vista previa: ${data.preview}`);

    } catch (error) {
      console.error('Error al subir archivo', error);
      setStatus('Hubo un error al subir el archivo.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Subir chat de WhatsApp</h1>
      
      <form 
        onSubmit={handleSubmit} 
        className="space-y-4 p-4 border rounded bg-white shadow-sm"
      >
        <div>
          <label 
            htmlFor="file-upload" 
            className="block mb-2 font-medium text-gray-700"
          >
            Selecciona tu archivo .txt
          </label>
          <input
            type="file"
            accept=".txt"
            id="file-upload"
            ref={fileInputRef}
            className="block w-full border border-gray-300 p-2 rounded focus:outline-none"
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        >
          Subir
        </button>

        {status && (
          <p className="mt-2 text-sm text-red-600">
            {status}
          </p>
        )}
      </form>
    </main>
  );
}
