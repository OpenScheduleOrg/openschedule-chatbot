import { SessionManager } from "@/core";
import { Whatsapp, Telegram } from "@/infra/apps";
import { ContextManager } from "@/presentation";
import config from "@/main/config";
import { clinicService, patientService } from "@/main/factories/services";
import { buildConversations } from "./factories";

import "@/common/prototype";
import { ClinicModel } from "@/domain/models";

async function main(): Promise<void> {
  const clinic = await clinicService.getById(config.CLINIC_ID);

  const apps = [];

  if (config.WHATSAPP_ENABLED)
    apps.push(whatsapp(clinic));

  if (config.TELEGRAM_TOKEN)
    apps.push(telegram(clinic));

  await Promise.all(apps);
}

async function whatsapp(clinic: ClinicModel) {
  const app = new Whatsapp();
  const session = new SessionManager(clinic);

  const { newUserConversation, welcomeBackConversation } = buildConversations(app.send, clinic);

  const context = new ContextManager(app, session, patientService, newUserConversation, welcomeBackConversation);

  await context.connect();
}

async function telegram(clinic: ClinicModel) {
  const app = new Telegram(config.TELEGRAM_TOKEN);
  const session = new SessionManager(clinic);

  const { newUserConversation, welcomeBackConversation } = buildConversations(app.send, clinic);

  const context = new ContextManager(app, session, patientService, newUserConversation, welcomeBackConversation);

  await context.connect();
}

main();
