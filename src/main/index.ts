import { SessionManager } from "@/core";
import Whatsapp from "@/infra/apps/whatsapp";
import { ContextManager } from "@/presentation";
import config from "@/main/config";
import { clinicService, patientService } from "@/main/factories/services";
import { buildConversations } from "./factories";

import "@/common/prototype";

async function main(): Promise<void> {
  const clinic = await clinicService.getById(config.CLINIC_ID);

  const app = new Whatsapp();
  const session = new SessionManager(clinic);

  const { newUserConversation, welcomeBackConversation } = buildConversations(
    app.send,
    clinic
  );

  const context = new ContextManager(
    app,
    session,
    patientService,
    newUserConversation,
    welcomeBackConversation
  );

  context.connect();
}

main();
