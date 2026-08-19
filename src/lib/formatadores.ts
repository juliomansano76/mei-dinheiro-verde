// ============================================================
// FORMATADORES — funções auxiliares para o app
// ============================================================
// Centraliza a formatação de valores em Real (R$), datas
// no padrão brasileiro (DD/MM/AAAA), e outras utilidades.
//
// CONCEITO: Intl.NumberFormat / Intl.DateTimeFormat
// O JavaScript tem APIs nativas para formatar números e
// datas de acordo com a região (locale). Para o Brasil,
// usamos "pt-BR". Isso garante que:
// - 1500.50 vira "R$ 1.500,50" (e não "$1,500.50")
// - 2026-08-19 vira "19/08/2026" (e não "08/19/2026")
// ============================================================

// Formata número como moeda brasileira
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

// Formata data ISO para o padrão brasileiro
export function formatarData(dataISO: string): string {
  const data = new Date(dataISO + 'T12:00:00'); // T12 evita fuso horário
  return new Intl.DateTimeFormat('pt-BR').format(data);
}

// Formata data como "Hoje", "Ontem" ou "DD/MM"
export function formatarDataRelativa(dataISO: string): string {
  const data = new Date(dataISO + 'T12:00:00');
  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);

  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);

  if (data.toDateString() === hoje.toDateString()) return 'Hoje';
  if (data.toDateString() === ontem.toDateString()) return 'Ontem';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(data);
}

// Retorna a data de hoje no formato ISO (YYYY-MM-DD)
export function hojeISO(): string {
  const hoje = new Date();
  return hoje.toISOString().split('T')[0];
}

// Retorna o nome do mês por extenso
export function nomeMes(mesReferencia: string): string {
  const [ano, mes] = mesReferencia.split('-').map(Number);
  const data = new Date(ano, mes - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(data);
}

// Formata CNPJ: 00.000.000/0001-00
export function formatarCNPJ(cnpj: string): string {
  const numeros = cnpj.replace(/\D/g, '').slice(0, 14);
  return numeros
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

// Remove formatação de moeda e retorna número
// "1.500,50" → 1500.50
// "R$ 1.500,50" → 1500.50
export function parseMoeda(valor: string): number {
  const limpo = valor
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const numero = parseFloat(limpo);
  return isNaN(numero) ? 0 : numero;
}
