import { MessageTemplate } from "../models/content-send";
import { MessageInfo } from "../models/message-info";

export type TypeSend = (id: string, content: MessageTemplate) => Promise<void>;
export type TypeRead = (id: string, content: MessageInfo) => Promise<void>;
