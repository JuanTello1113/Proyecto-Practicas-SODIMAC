import React, { useContext, useRef, useState } from 'react';
import { FiClock } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo_home from '../../assets/logos/Logo_home.png';
import { AuthContext } from '../../context/AuthContext';
import ErroresArchivoAlert from '../Alerts/ErroresArchivoAlert';
import ExitoArchivoAlert from '../Alerts/ExitoArchivoAlert';
import NumeroSolicitudesAlert from '../Alerts/NumeroSolicitudes';

const Masivo: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext debe estar dentro de un AuthProvider');
  }

  const { user } = authContext;

  const [isLoading, setIsLoading] = useState(false);

  const [archivoSubido, setArchivoSubido] = useState<{
    nombreArchivo: string;
    tituloNovedad: string;
    idCaso: number;
  } | null>(null);

  const [erroresArchivo, setErroresArchivo] = useState<string[] | null>(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      setSelectedFile(file);
    } else {
      alert('Por favor sube un archivo .xlsx válido.');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.xlsx')) {
      setSelectedFile(file);
      // Reseteamos el input para que permita subir el mismo archivo si se quiere volver a seleccionar
      e.target.value = '';
    } else {
      alert('Por favor sube un archivo .xlsx válido.');
    }
  };

  const titulo = state?.titulo || 'Título por defecto';
  console.log('Título que llega desde el estado:', titulo);

  const descargarPlantilla = () => {
    setMostrarAlerta(true);
  };

  const ConfirmarCantidad = async (cantidad: number) => {
    setMostrarAlerta(true);
    try {
      const response = await fetch(
        `http://localhost:3000/archivo-adjunto/descargar-plantilla?titulo=${encodeURIComponent(titulo)}&cantidad=${cantidad}`,
        {
          method: 'GET',
          credentials: 'include', //IMPORTANTE
        },
      );

      if (!response.ok) throw new Error('No se pudo descargar la plantilla');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Plantilla_${titulo}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error al descargar la plantilla; ', err);
      alert('Hubo un problema al descargar la plantilla');
    }
  };

  const subirArchivo = async () => {
    if (!selectedFile) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile!);
    formData.append('titulo', titulo); //Para Backend
    formData.append('tipo', titulo); //Para Microservicio

    if (user) {
      formData.append('nombreUsuario', user.nombre);
      formData.append('nombreTienda', user.nombreTienda);
    }

    try {
      const response = await fetch(
        'http://localhost:3000/archivo-adjunto/subir-archivo',
        {
          method: 'POST',
          credentials: 'include', //cookies
          body: formData,
        },
      );

      const data = await response.json();

      //VALIDACIÓN FALLIDA DESDE EL BACKEND
      if (!response.ok || data.errores) {
        const errores = data.errores || ['Error al subir archivo.'];
        setErroresArchivo(errores);
        return;
      }

      //VALIDACIÓN EXITOSA
      console.log('Respuesta del servidor:', data);

      setArchivoSubido({
        nombreArchivo: selectedFile.name,
        tituloNovedad: titulo,
        idCaso: data.novedadId, // <- del backend
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('❌ Error al subir archivo:', error);
      alert('Hubo un problema al subir el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 max-w-4xl mx-auto">
      {/* Pasos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {/* Paso 1 */}
        <div className="border rounded p-4 shadow border-black">
          <div className="w-8 h-8 rounded-full bg-[#4669AF] mx-auto flex items-center justify-center font-bold text-sm">
            1
          </div>
          <p className="font-semibold mt-2">Descarga la plantilla</p>
          <p className="text-sm text-gray-600 mt-1">
            Descarga la plantilla con el formato requerido por Nómina
          </p>
          <button
            onClick={descargarPlantilla}
            className="mt-2 bg-gray-800 text-white px-4 py-1 rounded hover:opacity-90"
          >
            Descargar Plantilla
          </button>
        </div>

        {/* Paso 2 */}
        <div className="border rounded p-4 shadow border-black">
          <div className="w-8 h-8 rounded-full bg-[#4669AF] mx-auto flex items-center justify-center font-bold text-sm">
            2
          </div>
          <p className="font-semibold mt-2">Llenar información</p>
          <p className="text-sm text-gray-600 mt-1">
            Completa la información requerida para <strong>{titulo}</strong> de
            acuerdo al formato del archivo.
          </p>
        </div>

        {/* Paso 3 */}
        <div className="border rounded p-4 shadow border-black">
          <div className="w-8 h-8 rounded-full bg-[#4669AF] mx-auto flex items-center justify-center font-bold text-sm">
            3
          </div>
          <p className="font-semibold mt-2">Subir Archivo</p>
          <p className="text-sm text-gray-600 mt-1">
            Cargar archivo completo con tus solicitudes a procesar
          </p>
          <button
            className={`mt-2 text-white px-4 py-1 rounded ${
              selectedFile
                ? 'bg-gray-800 hover:opacity-90'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!selectedFile}
            onClick={subirArchivo}
          >
            Subir Archivo
          </button>
        </div>
      </div>

      {/* Zona de arrastrar y soltar archivo */}
      <div
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        className="border border-dashed border-black p-4 rounded text-center"
      >
        <p
          className="font-semibold text-black hover:text-blue-600 hover:underline cursor-pointer"
          onClick={triggerFileSelect}
        >
          Arrastra y suelta tu archivo aquí
        </p>

        {/* Mensaje dinámico */}
        {selectedFile ? (
          <p className="text-green-600 font-medium mt-2">
            Archivo seleccionado: {selectedFile.name}
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-2">
            Recuerda que debe ser .xlsx con nuestro formato para poder revisar
            de manera correcta tu solicitud
          </p>
        )}

        {/* Input oculto */}
        <input
          type="file"
          id="archivo"
          accept=".xlsx"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Subir archivo Excel"
        />
      </div>

      {/* Botón regresar */}
      <div className="flex justify-end p-2 mt-[-15px]">
        <button
          className="bg-[#4669AF] text-white px-8 py-1 rounded-lg hover:opacity-90"
          onClick={() => navigate('/dashboard-jefe')}
        >
          Regresar
        </button>
      </div>

      {mostrarAlerta && (
        <NumeroSolicitudesAlert
          onSubmit={ConfirmarCantidad}
          onClose={() => setMostrarAlerta(false)}
        />
      )}

      {erroresArchivo && (
        <ErroresArchivoAlert
          errores={erroresArchivo}
          onClose={() => setErroresArchivo(null)}
        />
      )}

      {archivoSubido && (
        <ExitoArchivoAlert
          nombreArchivo={archivoSubido.nombreArchivo}
          tituloNovedad={archivoSubido.tituloNovedad}
          idCaso={archivoSubido.idCaso}
          onClose={() => setArchivoSubido(null)}
        />
      )}

      {isLoading && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-90 flex flex-col items-center justify-center transition-opacity duration-300">
          <img
            src={Logo_home}
            alt="Validando archivo"
            className="h-20 w-auto animate-bounce mb-4"
          />
          <p className="text-xl text-[#4669AF] font-semibold text-center flex items-center justify-center gap-2">
            Validando archivo
            <br />
            <FiClock className="animate-spin-slow text-2xl" />
          </p>
        </div>
      )}
    </div>
  );
};

export default Masivo;
