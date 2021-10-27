export interface Cliente {
    nome: string;
    id: number;
    consultas?: [Consulta];
}

export interface DataResponse {
    data: string;
    horarios: [{ hora: string; id: number }];
    weekday: number;
}

export interface Consulta {
    id: number;
    data?: string;
    hora: string;
    clinica?: string;
}
export interface Consultas {
    [data: string]: Consulta[];
}

export interface Clinica {
    id: number;
    nome: string;
    tipo: string;
    fone_contato: string;
    endereco: { text: string; coord: { lat: string; long: string } };
}

export interface Response {
    msg?: string;
    cliente?: Cliente;
    consulta?: Consulta;
    clinica?: Clinica;
    consultas?: Consultas;
}

export interface Chat {
    [jid: string]: {
        id: number | undefined;
        nome: string | undefined;
        session: {
            listener: Tlistener;
            data: {
                nome?: string;
                cpf?: string;
                horarios?: [{ id: number; hora: string }];
                data?: Date;
                consultas?: Consultas;
            };
        };
    };
}

export type Tlistener = (jid: string, text: string) => void;
