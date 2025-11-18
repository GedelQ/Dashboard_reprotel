import { useState, useEffect } from 'react';
import { supabase, Reserva } from '../lib/supabase';
import { Calendar } from 'lucide-react';

interface ReservaSelectorProps {
  hospedeId: number;
  selectedReservaId: number | null;
  onSelectReserva: (reservaId: number) => void;
}

export default function ReservaSelector({
  hospedeId,
  selectedReservaId,
  onSelectReserva
}: ReservaSelectorProps) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservas();
  }, [hospedeId]);

  const loadReservas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('hospede_id', hospedeId)
        .order('data_checkin', { ascending: false });

      if (error) throw error;
      setReservas(data || []);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusText = (status: number) => {
    const statuses: { [key: number]: string } = {
      0: 'Cancelada',
      1: 'Confirmada',
      2: 'Check-in',
      3: 'Check-out'
    };
    return statuses[status] || 'Desconhecido';
  };

  const getStatusColor = (status: number) => {
    const colors: { [key: number]: string } = {
      0: 'bg-red-100 text-red-800 border-red-300',
      1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      2: 'bg-green-100 text-green-800 border-green-300',
      3: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (reservas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Reservas
        </h3>
        <p className="text-gray-500 text-center py-4">Nenhuma reserva encontrada</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Reservas ({reservas.length})
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {reservas.map((reserva) => (
          <button
            key={reserva.reserva_id}
            onClick={() => onSelectReserva(reserva.reserva_id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedReservaId === reserva.reserva_id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-800">Reserva #{reserva.reserva_id}</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(reserva.status_reserva)}`}>
                {getStatusText(reserva.status_reserva)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {formatDate(reserva.data_checkin)} até {formatDate(reserva.data_checkout)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {reserva.tipo_quarto} • {reserva.plano_tarifario}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
