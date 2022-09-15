import { TypeConvesations } from "@/domain/interfaces";
import {
  InformCpfConversation,
  InformNameConversation,
  NewUserConversation,
  OptionsConversation,
  WelcomeBackConversation,
} from "@/presentation/conversations";
import { TypeSend } from "@/presentation/interfaces";
import { clienteService } from "./services";

export const buildConversations = (send: TypeSend): TypeConvesations => {
  const optionsConversation = new OptionsConversation(send, {});
  const welcomeBackConversation = new WelcomeBackConversation(
    send,
    optionsConversation,
    {}
  );

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

  return { newUserConversation, welcomeBackConversation };
};
