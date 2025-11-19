import { useState, useEffect } from 'react';
import { supabase, Reserva, Hospede } from '../lib/supabase';
import { Calendar, Search } from 'lucide-react';

interface AllReservasSelectorProps {
  selectedReservaId: number | null;
  onSelectReserva: (reservaId: number) => void;
}

interface ReservaComHospede extends Reserva {
  hospede?: Hospede;
}

export default function AllReservasSelector({ selectedReservaId, onSelectReserva }: AllReservasSelectorProps) {
  const [reservas, setReservas] = useState<ReservaComHospede[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('*, hospedes(*)')
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
       1: 'Confirmada',
       2: 'Cancelada',
       3: 'Realizada',
       4: 'Bloqueio'
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

  const filteredReservas = reservas.filter(r => {
    const hospede = Array.isArray(r.hospedes) ? r.hospedes[0] : r.hospedes;
    const hospedeNome = hospede?.nome || '';
    const reservaId = r.reserva_id.toString();

    return (
      hospedeNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservaId.includes(searchTerm)
    );
  });

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Selecionar Reserva
      </h2>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por hóspede ou ID da reserva..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredReservas.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhuma reserva encontrada</p>
        ) : (
          filteredReservas.map((reserva) => {
            const hospede = Array.isArray(reserva.hospedes) ? reserva.hospedes[0] : reserva.hospedes;
            return (
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
                  <div className="font-semibold text-gray-800">
                    {hospede?.nome || 'Sem hóspede'} - Reserva #{reserva.reserva_id}
                  </div>
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
            );
          })
        )}
      </div>
    </div>
  );
}
