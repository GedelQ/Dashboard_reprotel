import { useState, useEffect } from 'react';
import { supabase, Reserva, Hospede } from '../lib/supabase';
import { Calendar, DoorOpen, CreditCard, AlertCircle, User } from 'lucide-react';

interface ReservaDetailsProps {
  reservaId: number;
}

export default function ReservaDetails({ reservaId }: ReservaDetailsProps) {
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [hospede, setHospede] = useState<Hospede | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [reservaId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: reservaData, error: reservaError } = await supabase
        .from('reservas')
        .select('*')
        .eq('reserva_id', reservaId)
        .single();

      if (reservaError) throw reservaError;

      setReserva(reservaData);

      if (reservaData) {
        const { data: hospedeData, error: hospedeError } = await supabase
          .from('hospedes')
          .select('*')
          .eq('hospede_id', reservaData.hospede_id)
          .single();

        if (hospedeError) throw hospedeError;
        setHospede(hospedeData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
      0: 'bg-red-100 text-red-800',
      1: 'bg-yellow-100 text-yellow-800',
      2: 'bg-green-100 text-green-800',
      3: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!reserva || !hospede) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Reserva não encontrada</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-2xl font-bold text-gray-800">Reserva #{reserva.reserva_id}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reserva.status_reserva)}`}>
            {getStatusText(reserva.status_reserva)}
          </span>
        </div>

        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-3">
          <User className="w-5 h-5 text-gray-600" />
          <div>
            <div className="text-sm text-gray-600">Hóspede</div>
            <div className="font-semibold text-gray-800">{hospede.nome}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
          <div>CPF: {hospede.cpf}</div>
          <div>Email: {hospede.email}</div>
          <div>Telefone: {hospede.telefone}</div>
          <div>Cidade: {hospede.cidade}/{hospede.estado}</div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Detalhes da Reserva</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <DoorOpen className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="text-sm text-gray-600">Tipo de Quarto</div>
              <div className="font-semibold text-gray-800">{reserva.tipo_quarto}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <CreditCard className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <div className="text-sm text-gray-600">Plano Tarifário</div>
              <div className="font-semibold text-gray-800">{reserva.plano_tarifario}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="text-sm text-gray-600">Check-in</div>
              <div className="font-semibold text-gray-800">{formatDate(reserva.data_checkin)}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <div className="text-sm text-gray-600">Check-out</div>
              <div className="font-semibold text-gray-800">{formatDate(reserva.data_checkout)}</div>
            </div>
          </div>
          <div className="md:col-span-2 flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CreditCard className="w-5 h-5 text-green-700 mt-0.5" />
            <div>
              <div className="text-sm text-green-700">Valor das Diárias</div>
              <div className="text-xl font-bold text-green-800">{formatCurrency(reserva.valor_diarias)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
