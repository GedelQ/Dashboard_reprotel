import { useEffect, useState } from 'react';
import { supabase, Hospede } from '../lib/supabase';
import { User } from 'lucide-react';

interface ReservaOcupantesProps {
  reservaId: number;
  hospedePrincipalId: number;
}

const ReservaOcupantes = ({ reservaId, hospedePrincipalId }: ReservaOcupantesProps) => {
  const [ocupantes, setOcupantes] = useState<Hospede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOcupantes = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: ocupantesData, error: ocupantesError } = await supabase
          .from('reserva_ocupantes')
          .select('hospede_id, eh_titular')
          .eq('reserva_id', reservaId);

        if (ocupantesError) {
          throw ocupantesError;
        }

        if (ocupantesData) {
          const hospedeIds = ocupantesData.map((o) => o.hospede_id);
          const { data: hospedesData, error: hospedesError } = await supabase
            .from('hospedes')
            .select('*')
            .in('hospede_id', hospedeIds);

          if (hospedesError) {
            throw hospedesError;
          }

          const sortedOcupantes = hospedesData.sort((a, b) => {
            const aIsPrincipal = a.hospede_id === hospedePrincipalId;
            const bIsPrincipal = b.hospede_id === hospedePrincipalId;
            if (aIsPrincipal) return -1;
            if (bIsPrincipal) return 1;
            return 0;
          });

          setOcupantes(sortedOcupantes || []);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (reservaId) {
      fetchOcupantes();
    }
  }, [reservaId, hospedePrincipalId]);

  if (loading) {
    return <div>Carregando ocupantes...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-6 h-6" />
            Ocupantes
        </h2>
      {ocupantes.length > 0 ? (
        <ul>
          {ocupantes.map((hospede) => (
            <li key={hospede.hospede_id} 
                className={`mb-2 p-3 rounded-lg flex justify-between items-center ${hospede.hospede_id === hospedePrincipalId ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'}`}>
              <div>
                <p className={`font-semibold ${hospede.hospede_id === hospedePrincipalId ? 'text-blue-800' : 'text-gray-800'}`}>{hospede.nome}</p>
                <p className={`text-sm ${hospede.hospede_id === hospedePrincipalId ? 'text-blue-600' : 'text-gray-600'}`}>{hospede.email}</p>
              </div>
              {hospede.hospede_id === hospedePrincipalId && (
                <span className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-full">Responsável</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum ocupante encontrado para esta reserva.</p>
      )}
    </div>
  );
};

export default ReservaOcupantes;
