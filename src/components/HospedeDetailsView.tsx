import { useState, useEffect } from 'react';
import { supabase, Hospede, Reserva } from '../lib/supabase';
import { User, Calendar, AlertCircle } from 'lucide-react';

interface HospedeDetailsViewProps {
  hospedeId: number;
}

export default function HospedeDetailsView({ hospedeId }: HospedeDetailsViewProps) {
  const [hospede, setHospede] = useState<Hospede | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [hospedeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hospedeRes, reservasRes] = await Promise.all([
        supabase.from('hospedes').select('*').eq('hospede_id', hospedeId).single(),
        supabase.from('reservas').select('*').eq('hospede_id', hospedeId).order('data_checkin', { ascending: false })
      ]);

      if (hospedeRes.error) throw hospedeRes.error;
      if (reservasRes.error) throw reservasRes.error;

      setHospede(hospedeRes.data);
      setReservas(reservasRes.data || []);
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

  if (!hospede) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Hóspede não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">{hospede.nome}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">CPF</div>
            <div className="font-semibold text-gray-800">{hospede.cpf}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Email</div>
            <div className="font-semibold text-gray-800">{hospede.email}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Telefone</div>
            <div className="font-semibold text-gray-800">{hospede.telefone}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">CEP</div>
            <div className="font-semibold text-gray-800">{hospede.cep}</div>
          </div>
          <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Endereço</div>
            <div className="font-semibold text-gray-800">
              {hospede.rua}, {hospede.numero} {hospede.complemento && `- ${hospede.complemento}`}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Bairro</div>
            <div className="font-semibold text-gray-800">{hospede.bairro}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Cidade/Estado</div>
            <div className="font-semibold text-gray-800">{hospede.cidade}/{hospede.estado}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">País</div>
            <div className="font-semibold text-gray-800">{hospede.pais}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Cadastro</div>
            <div className="font-semibold text-gray-800">{formatDate(hospede.data_cadastro)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Reservas ({reservas.length})
        </h3>

        {reservas.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Nenhuma reserva encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservas.map((reserva) => (
              <div key={reserva.reserva_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-800">Reserva #{reserva.reserva_id}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reserva.status_reserva)}`}>
                    {getStatusText(reserva.status_reserva)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {formatDate(reserva.data_checkin)} até {formatDate(reserva.data_checkout)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-600">Quarto:</span> <span className="font-medium">{reserva.tipo_quarto}</span></div>
                  <div><span className="text-gray-600">Plano:</span> <span className="font-medium">{reserva.plano_tarifario}</span></div>
                  <div className="col-span-2"><span className="text-gray-600">Diárias:</span> <span className="font-medium text-green-600">{formatCurrency(reserva.valor_diarias)}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
