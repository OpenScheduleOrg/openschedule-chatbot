import { Horario } from "./interfaces";

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function CPFormat(cpf: string) {
  if (cpf.match(/^\d{11}$/)) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(
      6,
      9
    )}-${cpf.slice(9, 11)}`;
  }
  return cpf;
}

export function timeStringToS(time_str: string): number {
  const [hh, mm, ss] = time_str.split(":");

  return Number(hh) * 3600 + Number(mm) * 60 + Number(ss);
}

export function secondsToHorario(s: number): {
  his: number;
  hours: number;
  minutes: number;
  hhmm: string;
} {
  const s_to_minutes = s / 60;
  const minutes = s_to_minutes % 60;
  const hours = (s_to_minutes - minutes) / 60;

  const hhmm =
    (hours < 10 ? "0" : "") +
    String(hours) +
    ":" +
    (minutes < 10 ? "0" : "") +
    String(minutes);

  return { his: s, hours, minutes, hhmm };
}

export function sortHorarios(a: Horario, b: Horario): number {
  if (a.dia_semana < b.dia_semana) return -1;
  if (a.dia_semana > b.dia_semana) return 1;
  return 0;
}
