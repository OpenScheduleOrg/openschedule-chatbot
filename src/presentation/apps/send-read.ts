import { MessageTemplate } from "./content-send";
import { MessageInfo } from "./message-info";

export type TypeSend = (id: string, content: MessageTemplate) => Promise<void>;
export type TypeRead = (id: string, content: MessageInfo) => Promise<void>;
