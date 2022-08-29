import Bot from "./bot";
import Whatsapp from "./whatsapp";
import { getHorarios } from "./services/horario";
import { getClinicas } from "./services/clinica";

async function main(): Promise<void> {
  const res = await getClinicas({}, 1);
  const clinica = res?.data?.clinica;
  if (!clinica) throw "Clinica não existe impossível de continuar.";
  const horarios = (await getHorarios({ clinica_id: clinica.id })).data
    .horarios;

  const bot = new Bot(clinica, horarios);

  const whatsapp = new Whatsapp(bot);

  await whatsapp.connect();
}

main().catch((err) => console.error(err));
