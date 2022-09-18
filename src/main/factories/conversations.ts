import { TypeConvesations } from "@/domain/interfaces";
import { ClinicaModel } from "@/domain/models";
import {
  AboutClinicConversation,
  InformCpfConversation,
  InformDayConversation,
  InformMonthConversation,
  InformNameConversation,
  NewUserConversation,
  OptionsConversation,
  WelcomeBackConversation,
} from "@/presentation/conversations";
import { TypeSend } from "@/presentation/interfaces";
import { clienteService, horarioService } from "./services";

export const buildConversations = (
  send: TypeSend,
  clinica: ClinicaModel
): TypeConvesations => {
  const optionsConversation = new OptionsConversation(send);

  const aboutClinicConversation = new AboutClinicConversation(
    send,
    clinica,
    optionsConversation
  );

  const welcomeBackConversation = new WelcomeBackConversation(
    send,
    optionsConversation
  );

  const informCpfConversation = new InformCpfConversation(
    send,
    clienteService,
    undefined
  );
  const informNameConversation = new InformNameConversation(
    send,
    informCpfConversation
  );

  const newUserConversation = new NewUserConversation(
    send,
    informNameConversation,
    optionsConversation,
    optionsConversation
  );

  const informDayConversation = new InformDayConversation(
    send,
    clinica,
    horarioService,
    undefined
  );
  const informMonthConversation = new InformMonthConversation(
    send,
    informDayConversation
  );

  optionsConversation.aboutClinicConversation = aboutClinicConversation;
  optionsConversation.informMounthConversation = informMonthConversation;

  return { newUserConversation, welcomeBackConversation };
};
