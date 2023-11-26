import "@/common/prototype";
import "@/common/logging";

import { SessionManager } from "@/domain/session";
import { Whatsapp, Telegram } from "@/infra/apps";
import { ContextManager } from "@/presentation";
import config from "@/main/config";
import { clinicService, patientService } from "@/main/factories/services";
import { buildConversations } from "./factories";

import { ClinicModel } from "@/domain/models";
import { LocalAppDataStorage } from "@/infra/app-data-storage";


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
  const logger = log.child({ app: "whatsapp" })
  const app = new Whatsapp(logger);
  const session = new SessionManager(clinic, logger);

  const { newUserConversation, welcomeBackConversation } = buildConversations(app.send, clinic);

  const context = new ContextManager(app, session, patientService, newUserConversation, welcomeBackConversation, logger);

  await context.connect();
}

async function telegram(clinic: ClinicModel) {
  const appDataStorage = new LocalAppDataStorage();
  const logger = log.child({ app: "telegram" });

  const app = new Telegram(config.TELEGRAM_TOKEN, appDataStorage, logger);
  const session = new SessionManager(clinic, logger);

  const { newUserConversation, welcomeBackConversation } = buildConversations(app.send, clinic);

  const context = new ContextManager(app, session, patientService, newUserConversation, welcomeBackConversation, logger);

  await context.connect();
}

main();
