import { APIResponse, Cliente, Consulta, Clinica } from ".";

/* 


*/
export type GetLoged = () => Promise<APIResponse>;

export type Login = (
  username: string,
  password: string,
  remember?: boolean
) => Promise<APIResponse>;

export type Logout = () => Promise<APIResponse>;

/* 


*/
export type CreateConsulta = (consulta: Consulta) => Promise<APIResponse>;

export type UpdateConsulta = (
  id: number,
  marcada: string | null,
  realizada: boolean | null,
  descricao: string | null
) => Promise<APIResponse>;

export type GetConsultas = (
  params: {
    clinica_id?: number;
    cliente_id?: number;
    date_start?: Date | String;
    date_end?: Date | String;
  },
  id?: number
) => Promise<APIResponse>;

export type DeleteConsulta = (id: number) => Promise<APIResponse>;

/* 


*/
export type CreateCliente = (cliente: Cliente) => Promise<APIResponse>;

export type UpdateCliente = (
  id: number,
  cliente: Cliente
) => Promise<APIResponse>;

export type GetClientes = (
  params: {
    telefone?: string;
    cpf?: string;
  },
  id?: number
) => Promise<APIResponse>;
/* 


*/
export type CreateClinica = (clinica: Clinica) => Promise<APIResponse>;

export type UpdateClinica = (
  id: number,
  clinica: Clinica
) => Promise<APIResponse>;

export type GetClinicas = (
  params: { nome?: string; telefone?: string },
  id?: number
) => Promise<APIResponse>;
/* 


*/
export type GetHorarios = (params: {
  clinica_id: number;
}) => Promise<APIResponse>;
