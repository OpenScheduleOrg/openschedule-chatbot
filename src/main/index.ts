import { SessionManager } from "@/core";
import Whatsapp from "@/infra/apps/whatsapp";
import { ContextManager } from "@/presentation";
import config from "./config";
import { clienteService, clinicaService } from "./services";

async function main(): Promise<void> {
  const clinica = await clinicaService.loadById(config.CLINICAID);

  const app = new Whatsapp();
  const session = new SessionManager(clinica);

  const context = new ContextManager(app, session, clienteService, null, null);
  await context.connect();
}

main();
