import { TypeRead, TypeSend } from "@/presentation/session";

export interface IContextManager {
  read: TypeRead;
  connect(): Promise<void>;
}
