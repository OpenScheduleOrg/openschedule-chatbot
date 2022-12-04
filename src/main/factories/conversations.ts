import { manyIndexes } from "@/common/helpers";
import { TypeConvesations } from "@/domain/interfaces";
import { ClinicModel } from "@/domain/models";
import {
  AboutClinicConversation,
  AppointmentConversation,
  AppointmentsConversation,
  CancelConversation,
  ConfirmConversation,
  InformCpfConversation,
  InformDayConversation,
  InformMonthConversation,
  InformNameConversation,
  InformScheduleConversation,
  NewUserConversation,
  OptionsConversation,
  WelcomeBackConversation,
  YouAreWelcomeConversation,
} from "@/presentation/conversations";
import { TypeSend } from "@/presentation/interfaces";
import { consultaService, horarioService, patientService } from "./services";

export const buildConversations = (
  send: TypeSend,
  clinic: ClinicModel
): TypeConvesations => {
  const optionsConversation = new OptionsConversation(send);

  const aboutClinicConversation = new AboutClinicConversation(
    send,
    clinic,
    optionsConversation
  );

  const welcomeBackConversation = new WelcomeBackConversation(
    send,
    optionsConversation
  );

  const informCpfConversation = new InformCpfConversation(
    send,
    patientService,
    optionsConversation
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

  const youAreWelcomeConversation = new YouAreWelcomeConversation(
    optionsConversation
  );

  const informScheduleConversation = new InformScheduleConversation(
    send,
    clinic,
    horarioService,
    consultaService,
    youAreWelcomeConversation
  );

  const informDayConversation = new InformDayConversation(
    send,
    clinic,
    horarioService,
    informScheduleConversation
  );

  const informMonthConversation = new InformMonthConversation(
    send,
    informDayConversation,
    newUserConversation
  );

  const newAppointmentConversation = new ConfirmConversation(
    send,
    informMonthConversation,
    optionsConversation,
    optionsConversation
  );

  const cancelConversation = new CancelConversation(
    send,
    consultaService,
    youAreWelcomeConversation
  );

  const appointmentConversation = new AppointmentConversation(
    send,
    informMonthConversation,
    cancelConversation
  );

  const appointmentsConversation = new AppointmentsConversation(
    send,
    clinic,
    consultaService,
    newAppointmentConversation,
    appointmentConversation,
    newUserConversation,
    optionsConversation
  );

  optionsConversation.informMounthConversation = informMonthConversation;
  optionsConversation.appointmentsConversation = appointmentsConversation;
  optionsConversation.aboutClinicConversation = aboutClinicConversation;

  const new_user_listeners = {};
  manyIndexes(
    ["sobre", "clinica", "consultorio", "endereço", "endereco"],
    aboutClinicConversation,
    new_user_listeners
  );
  newUserConversation.conversations = new_user_listeners;
  informNameConversation.conversations = new_user_listeners;
  informCpfConversation.conversations = new_user_listeners;

  const global_listeners = {};
  manyIndexes(["cancelar", "menu"], optionsConversation, global_listeners);
  manyIndexes(
    ["marcar", "marcar consulta"],
    informMonthConversation,
    global_listeners
  );
  manyIndexes(
    ["consultas", "minhas consultas"],
    appointmentsConversation,
    global_listeners
  );
  manyIndexes(
    ["sobre", "clinica", "consultorio", "endereço", "endereco"],
    aboutClinicConversation,
    global_listeners
  );

  optionsConversation.conversations = global_listeners;

  welcomeBackConversation.conversations = global_listeners;
  appointmentConversation.conversations = global_listeners;
  informMonthConversation.conversations = global_listeners;
  appointmentsConversation.conversations = global_listeners;
  aboutClinicConversation.conversations = global_listeners;

  informDayConversation.conversations = global_listeners;
  informScheduleConversation.conversations = global_listeners;
  youAreWelcomeConversation.conversations = global_listeners;
  newAppointmentConversation.conversations = global_listeners;

  const cancel_listeners = { ...global_listeners };
  delete cancel_listeners["cancelar"];
  cancelConversation.conversations = cancel_listeners;

  return { newUserConversation, welcomeBackConversation };
};
