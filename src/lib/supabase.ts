import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Hospede {
  hospede_id: number;
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  data_cadastro: string;
  ultima_reserva: string;
}

export interface Reserva {
  reserva_id: number;
  hospede_id: number;
  data_checkin: string;
  data_checkout: string;
  status_reserva: number;
}

export interface Consumo {
  item_id: number;
  reserva_id: number;
  data_consumo: string;
  descricao_item: string;
  departamento: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  folio_id: number;
}

export interface ReservaOcupante {
  id: number;
  created_at: string;
  reserva_id: number;
  hospede_id: number;
  eh_titular: boolean;
}

export interface ReservaQuarto {
    id: number;
    reserva_id: number;
    tipo_quarto: string;
    plano_tarifario: string;
    valor_diarias: number;
    created_at: string;
}
