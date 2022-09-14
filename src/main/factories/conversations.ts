import { TypeConvesations } from "@/domain/interfaces";
import {
  InformCpfConversation,
  InformNameConversation,
  NewUserConversation,
  OptionsConversation,
} from "@/presentation/conversations";
import { TypeSend } from "@/presentation/interfaces";
import { clienteService } from "./services";

export const buildConversations = (send: TypeSend): TypeConvesations => {
  const optionsConversation = new OptionsConversation(send, {});

  const informCpfConversation = new InformCpfConversation(
    send,
    clienteService,
    undefined,
    {}
  );

  const informNameConversation = new InformNameConversation(
    send,
    informCpfConversation,
    {}
  );

  const newUserConversation = new NewUserConversation(
    send,
    informNameConversation,
    optionsConversation,
    optionsConversation,
    {}
  );

  return { newUserConversation, optionsConversation };
};
