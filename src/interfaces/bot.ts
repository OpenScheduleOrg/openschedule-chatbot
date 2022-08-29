export interface IBot {
  read: (jid: string, content: any) => Promise<void>;
  send: (jid: string, content: any) => Promise<void>;
}
