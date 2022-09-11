import { TypeRead, TypeSend } from "@/presentation/interfaces";

export interface IContextManager {
  read: TypeRead;
  connect(): Promise<void>;
}
