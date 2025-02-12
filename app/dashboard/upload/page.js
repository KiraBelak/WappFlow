'use client';

import { useRef, FormEvent, useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export default function UploadPage() {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setIsLoading(true);
    
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setStatus('Por favor selecciona un archivo primero.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        setStatus(`Error: ${errorData.error || 'No se pudo subir el archivo'}`);
        return;
      }

      const data = await res.json();
      setStatus(`¡Archivo subido con éxito!`);
      setFileName('');

    } catch (error) {
      console.error('Error al subir archivo', error);
      setStatus('Hubo un error al subir el archivo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      fileInputRef.current.files = e.dataTransfer.files;
      setFileName(file.name);
    } else {
      setStatus('Por favor, sube solo archivos .txt');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setStatus(null);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-2 text-gray-800 text-center">
          Analiza tu chat de WhatsApp
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Sube tu archivo de chat exportado y obtén estadísticas detalladas
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${fileName ? 'bg-green-50 border-green-300' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".txt"
              id="file-upload"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            <label htmlFor="file-upload" className="cursor-pointer">
              <ArrowUpTrayIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              {fileName ? (
                <>
                  <p className="text-sm text-gray-600">Archivo seleccionado:</p>
                  <p className="font-medium text-gray-800">{fileName}</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-gray-800 mb-1">
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-500">Solo archivos .txt</p>
                </>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={!fileName || isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all
              ${isLoading ? 
                'bg-gray-300 cursor-not-allowed' : 
                'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'} 
              text-white shadow-lg hover:shadow-xl
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Subiendo...' : 'Analizar Chat'}
          </button>

          {status && (
            <div className={`p-4 rounded-lg text-center ${
              status.includes('Error') ? 
                'bg-red-100 text-red-700' : 
                'bg-green-100 text-green-700'
            }`}>
              {status}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
