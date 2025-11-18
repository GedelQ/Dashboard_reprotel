import { useState } from 'react';
import HospedeSelector from './components/HospedeSelector';
import AllReservasSelector from './components/AllReservasSelector';
import HospedeDetailsView from './components/HospedeDetailsView';
import ReservaWithConsumoView from './components/ReservaWithConsumoView';
import { Hotel, User, Calendar } from 'lucide-react';

type ViewMode = 'hospede' | 'reserva';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('hospede');
  const [selectedHospedeId, setSelectedHospedeId] = useState<number | null>(null);
  const [selectedReservaId, setSelectedReservaId] = useState<number | null>(null);

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedHospedeId(null);
    setSelectedReservaId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Hotel className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Dashboard de Hóspedes</h1>
          </div>
          <p className="text-gray-600 mb-4">Sistema de gestão de reservas e consumos</p>

          <div className="flex gap-3">
            <button
              onClick={() => handleModeChange('hospede')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'hospede'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
              }`}
            >
              <User className="w-5 h-5" />
              Visualizar por Hóspede
            </button>
            <button
              onClick={() => handleModeChange('reserva')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'reserva'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Visualizar por Reserva
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {viewMode === 'hospede' ? (
              <HospedeSelector
                onSelectHospede={setSelectedHospedeId}
                selectedHospedeId={selectedHospedeId}
              />
            ) : (
              <AllReservasSelector
                selectedReservaId={selectedReservaId}
                onSelectReserva={setSelectedReservaId}
              />
            )}
          </div>

          <div className="lg:col-span-2">
            {viewMode === 'hospede' ? (
              selectedHospedeId ? (
                <HospedeDetailsView hospedeId={selectedHospedeId} />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center p-12 bg-white rounded-lg shadow-md">
                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">Selecione um Hóspede</h2>
                    <p className="text-gray-500">Escolha um hóspede na lista ao lado para visualizar seus dados</p>
                  </div>
                </div>
              )
            ) : selectedReservaId ? (
              <ReservaWithConsumoView reservaId={selectedReservaId} />
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center p-12 bg-white rounded-lg shadow-md">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-600 mb-2">Selecione uma Reserva</h2>
                  <p className="text-gray-500">Escolha uma reserva na lista ao lado para visualizar detalhes e consumos</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
