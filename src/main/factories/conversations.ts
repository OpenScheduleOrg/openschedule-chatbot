import { TypeConvesations } from "@/domain/interfaces";
import { NewUserConversation } from "@/presentation/conversations/new-user-conversation";
import { TypeSend } from "@/presentation/interfaces";

export const buildConversations = (send: TypeSend): TypeConvesations => {
  const newUserConversation = new NewUserConversation(
    send,
    undefined,
    undefined,
    undefined,
    {}
  );
  return { newUserConversation };
};
