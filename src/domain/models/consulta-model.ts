export type ConsultaModel = {
  id: string;
  clinica_id: string;
  cliente_id: string;
  marcada: Date;
  duracao: number;
  descricao: string;
  realizada: boolean;
  clinica_nome: string;
  cliente_nome: string;
  clinica_tipo: string;
};
