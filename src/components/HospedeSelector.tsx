import { useState, useEffect } from 'react';
import { supabase, Hospede } from '../lib/supabase';
import { Search, User } from 'lucide-react';

interface HospedeSelectorProps {
  onSelectHospede: (hospedeId: number) => void;
  selectedHospedeId: number | null;
}

export default function HospedeSelector({ onSelectHospede, selectedHospedeId }: HospedeSelectorProps) {
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHospedes();
  }, []);

  const loadHospedes = async () => {
    try {
      const { data, error } = await supabase
        .from('hospedes')
        .select('*')
        .order('nome');

      if (error) throw error;
      setHospedes(data || []);
    } catch (error) {
      console.error('Erro ao carregar hóspedes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHospedes = hospedes.filter(hospede =>
    hospede.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospede.cpf.includes(searchTerm) ||
    hospede.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <User className="w-6 h-6" />
        Selecionar Hóspede
      </h2>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nome, CPF ou email..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredHospedes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum hóspede encontrado</p>
        ) : (
          filteredHospedes.map((hospede) => (
            <button
              key={hospede.hospede_id}
              onClick={() => onSelectHospede(hospede.hospede_id)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedHospedeId === hospede.hospede_id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold text-gray-800">{hospede.nome}</div>
              <div className="text-sm text-gray-600 mt-1">
                CPF: {hospede.cpf} • Email: {hospede.email}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
