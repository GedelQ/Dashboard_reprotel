import { useState, useEffect } from 'react';
import { supabase, Consumo } from '../lib/supabase';
import { ShoppingCart, Package } from 'lucide-react';

interface ConsumoDetailsProps {
  reservaId: number;
}

export default function ConsumoDetails({ reservaId }: ConsumoDetailsProps) {
  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [reservaId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: consumosData, error: consumosError } = await supabase
        .from('consumos')
        .select('*')
        .eq('reserva_id', reservaId)
        .order('data_consumo', { ascending: false });

      if (consumosError) throw consumosError;
      setConsumos(consumosData || []);
    } catch (error) {
      console.error('Erro ao carregar consumos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalConsumo = consumos.reduce((sum, c) => sum + c.valor_total, 0);

  const consumosByDepartamento = consumos.reduce((acc, consumo) => {
    if (!acc[consumo.departamento]) {
      acc[consumo.departamento] = {
        total: 0,
        quantidade: 0
      };
    }
    acc[consumo.departamento].total += consumo.valor_total;
    acc[consumo.departamento].quantidade += 1;
    return acc;
  }, {} as { [key: string]: { total: number; quantidade: number } });

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <ShoppingCart className="w-6 h-6" />
        Consumos da Reserva
      </h2>

      {consumos.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Nenhum consumo registrado</p>
            </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700 font-medium">Total de Itens</div>
              <div className="text-2xl font-bold text-blue-900">{consumos.length}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-700 font-medium">Valor Total</div>
              <div className="text-2xl font-bold text-green-900">{formatCurrency(totalConsumo)}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="text-sm text-orange-700 font-medium">Departamentos</div>
              <div className="text-2xl font-bold text-orange-900">{Object.keys(consumosByDepartamento).length}</div>
            </div>
          </div>

          {Object.keys(consumosByDepartamento).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Por Departamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(consumosByDepartamento).map(([dept, data]) => (
                  <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-800">{dept}</div>
                      <div className="text-sm text-gray-600">{data.quantidade} itens</div>
                    </div>
                    <div className="text-lg font-bold text-gray-900">{formatCurrency(data.total)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Detalhes dos Consumos</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Departamento</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Qtd</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Valor Unit.</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {consumos.map((consumo) => (
                    <tr key={consumo.item_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDate(consumo.data_consumo)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{consumo.descricao_item}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{consumo.departamento}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">{consumo.quantidade}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">{formatCurrency(consumo.valor_unitario)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-semibold text-right">{formatCurrency(consumo.valor_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
