import { TypeConvesations } from "@/domain/interfaces";
import {
  NewUserConversation,
  OptionsConversation,
} from "@/presentation/conversations";
import { TypeSend } from "@/presentation/interfaces";

export const buildConversations = (send: TypeSend): TypeConvesations => {
  const optionsConversation = new OptionsConversation(send, {});

  const newUserConversation = new NewUserConversation(
    send,
    undefined,
    optionsConversation,
    optionsConversation,
    {}
  );

  return { newUserConversation };
};
