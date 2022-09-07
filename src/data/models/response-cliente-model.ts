export type ResponseClienteModel = {
  data: {
    cliente: {
      id: string;
      nome: string;
      sobrenome: string;
      cpf: string;
      telefone: string;
    };
  };
};
