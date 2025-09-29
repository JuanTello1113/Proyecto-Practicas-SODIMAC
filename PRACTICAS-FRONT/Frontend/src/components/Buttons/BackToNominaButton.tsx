import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const DASHBOARD_NOMINA_PATH = '/dashboard-nomina';

type Props = {
  to?: string;
  className?: string;
};

const BackToNominaButton: React.FC<Props> = ({
  to = DASHBOARD_NOMINA_PATH,
  className = '',
}) => {
  const navigate = useNavigate();

  return (
    <button
      aria-label="Volver al Dashboard de Nómina"
      onClick={() => navigate(to)}
      className={`fixed top-3 left-3 z-[1000] w-10 h-10 rounded-full 
                 bg-white/95 border border-gray-200 shadow-md
                 hover:bg-white hover:shadow-lg active:scale-95
                 flex items-center justify-center text-black transition-all ${className}`}
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
};

export default BackToNominaButton;