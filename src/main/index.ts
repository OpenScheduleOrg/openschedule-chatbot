import { SessionManager } from "@/core";
import Whatsapp from "@/infra/apps/whatsapp";
import { ContextManager, NotificationJob } from "@/presentation";
import config from "@/main/config";
import {
  clienteService,
  clinicaService,
  notificationService,
} from "@/main/factories/services";
import { buildConversations } from "./factories";

import "@/common/prototype";

async function main(): Promise<void> {
  const clinica = await clinicaService.loadById(config.CLINICAID);

  const app = new Whatsapp();
  const session = new SessionManager(clinica);

  const { newUserConversation, welcomeBackConversation } = buildConversations(
    app.send,
    clinica
  );

  const context = new ContextManager(
    app,
    session,
    clienteService,
    newUserConversation,
    welcomeBackConversation
  );

  const notificationJob = new NotificationJob(app, notificationService);
  context.connect();
  await setInterval(notificationJob.run, 5000);
}

main();
