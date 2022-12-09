import { manyIndexes } from "@/common/helpers";
import { TypeConvesations } from "@/domain/interfaces";
import { ClinicModel } from "@/domain/models";
import {
  AboutClinicConversation,
  AppointmentConversation,
  AppointmentsConversation,
  CancelConversation,
  ConfirmAppointmentConversation,
  ConfirmConversation,
  InformCpfConversation,
  InformDayConversation,
  InformNameConversation,
  InformScheduleConversation,
  InformSpecialtyConversation,
  NewUserConversation,
  OptionsConversation,
  WelcomeBackConversation,
  YouAreWelcomeConversation,
} from "@/presentation/conversations";
import { TypeSend } from "@/presentation/interfaces";
import {
  appointmentService,
  calendarService,
  patientService,
} from "./services";

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

  const confirmAppointmentConversation = new ConfirmAppointmentConversation(
    send,
    appointmentService,
    youAreWelcomeConversation
  );

  const informScheduleConversation = new InformScheduleConversation(
    send,
    clinic,
    calendarService,
    confirmAppointmentConversation
  );

  const informDayConversation = new InformDayConversation(
    send,
    clinic,
    calendarService,
    informScheduleConversation
  );

  const informSpecialtyConversation = new InformSpecialtyConversation(
    send,
    clinic,
    calendarService,
    informDayConversation,
    optionsConversation
  );

  const newAppointmentConversation = new ConfirmConversation(
    send,
    informSpecialtyConversation,
    optionsConversation,
    optionsConversation
  );

  const cancelConversation = new CancelConversation(
    send,
    appointmentService,
    youAreWelcomeConversation
  );

  const appointmentConversation = new AppointmentConversation(
    send,
    informDayConversation,
    cancelConversation
  );

  const appointmentsConversation = new AppointmentsConversation(
    send,
    clinic,
    appointmentService,
    newAppointmentConversation,
    appointmentConversation,
    newUserConversation
  );

  optionsConversation.newAppointmentEntry = informSpecialtyConversation;
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
  appointmentsConversation.conversations = global_listeners;
  aboutClinicConversation.conversations = global_listeners;

  informSpecialtyConversation.conversations = global_listeners;
  informDayConversation.conversations = global_listeners;
  informScheduleConversation.conversations = global_listeners;
  youAreWelcomeConversation.conversations = global_listeners;
  newAppointmentConversation.conversations = global_listeners;
  confirmAppointmentConversation.conversations = global_listeners;

  const cancel_listeners = { ...global_listeners };
  delete cancel_listeners["cancelar"];
  cancelConversation.conversations = cancel_listeners;

  return { newUserConversation, welcomeBackConversation };
};
