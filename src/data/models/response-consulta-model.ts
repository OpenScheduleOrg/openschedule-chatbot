type ConsultaModel = {
  id: string;
  clinica_id: string;
  cliente_id: string;
  marcada: string;
  duracao: number;
  descricao: string;
  realizada: boolean;
  clinica_nome: string;
  cliente_nome: string;
  clinica_tipo: string;
};

export type ResponseConsultaModel = {
  data: {
    consulta: ConsultaModel;
  };
};

export type ResponseConsultasModel = {
  data: {
    consultas: ConsultaModel[];
  };
};
