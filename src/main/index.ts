import { SessionManager } from "@/core";
import Whatsapp from "@/infra/apps/whatsapp";
import { ContextManager } from "@/presentation";
import config from "@/main/config";
import { clienteService, clinicaService } from "@/main/factories/services";
import { buildConversations } from "./factories";

async function main(): Promise<void> {
  const clinica = await clinicaService.loadById(config.CLINICAID);

  const app = new Whatsapp();
  const session = new SessionManager(clinica);

  const { newUserConversation } = buildConversations(app.send);

  const context = new ContextManager(
    app,
    session,
    clienteService,
    newUserConversation,
    null
  );
  await context.connect();
}

main();
