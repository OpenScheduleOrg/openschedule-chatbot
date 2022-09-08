import Bot from "@/presentation/bot";
import Whatsapp from "@/infra/protocols/whatsapp";
import {
  clienteService,
  clinicaService,
  consultaService,
  horarioService,
} from "@/main/services";

async function main(): Promise<void> {
  const clinica = await clinicaService.loadById("1");
  const bot = new Bot(clinica, consultaService, clienteService, horarioService);

  const whatsapp = new Whatsapp(bot);

  await whatsapp.connect();
}

main().catch((err) => console.error(err));
