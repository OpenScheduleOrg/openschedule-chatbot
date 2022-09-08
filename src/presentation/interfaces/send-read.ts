import { ContentSend, MessageInfo } from "../../domain/models";

export type TypeSend = (id: string, content: ContentSend) => Promise<void>;
export type TypeRead = (id: string, content: MessageInfo) => Promise<void>;
