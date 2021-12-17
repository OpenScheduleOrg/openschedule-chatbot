export enum Month {
  "Janeiro" = 0,
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
}

export enum Weekday {
  "Domingo" = 0,
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
}

export const Message = {
  WELCOME: "Bem vindo(a) a *ConsuChat*!",
  SNCONSULTA: "Deseja marcar uma consulta?(Sim, Não)",
  WELCOMEBACK: "Seja bem-vindo(a) de volta *{0}*.",
  MENU: "{0}\n\n1 -  🆕Marcar consulta\n2 -  🗓️Minhas consultas\n3 -  📆Reagendar consulta\n4 -  ❌Cancelar consulta \n5 -  🏥Sobre Clínica\n\nDigite o número refente ao que busca:",
  INVALIDMENU: "Desculpa não entendi essa mensagem.",
  NOCONSULTA:
    "Você não possui consulta marcada, gostaria de marcar uma consulta?(Sim, Não)",
  INTERRUPT:
    "Esse procedimento pode ser interropido respondendo com não ou cancelar.",
  NEWCLIENT:
    "Antes de marcar a consulta precisamos de algumas informações sua.",
  NAME: "Por favor nos informe seu nome:",
  INVALIDNAME: "Informe um nome real:",
  CPF: "Para finalizarmos seu cadastro, informe seu CPF:",
  INVALIDCPF: "O CPF não é válido, informe um CPF válido:",
  DIACONSULTA:
    "Qual a dia que você deseja marcar a consulta?(1 - {0})\n\nTenha em mente que hoje é {1} dia {2} de {3}, os dias anteriores a hoje serão considerados para o próximo mês.",
  DIACONSULTAREAGENDAR:
    "Para qual a dia que você deseja remarcar sua consulta?(1 - {0})\n\nTenha em mente que hoje é {1} dia {2} de {3}, os dias anteriores a hoje serão considerados para o próximo mês.",
  INVALIDDAY: "Por favor informe um dia válido, no intervalo de 1 a {0}:",
  NOHORARIOS: "Infelizmente não temos horários livres para {0} dia {1} de {2}.",
  NEWDAY: "Por favor, diga outro dia para que possamos agendar sua consulta:",
  HORARIOS: "Os horários abaixo estão disponíveis para {0} dia {1} de {2}:",
  HORACONSULTA: "Insira o número referente ao horário desejado:",
  INVALIDHORA:
    "Essa entrada não é válida, informe uma valor coerente com o mostrado acima:",
  NOVACONSULTA:
    "✔Sua consulta foi marcada para 🗓 {0}, {1} de {2} as 🕜 {3}.\n\nO consultório *{4}* lhe aguarda.",
  CONSULTAREAGENDADA:
    "✔Sua consulta foi reagendada para 🗓 {0}, {1} de {2} as 🕜 {3}.\n\nO consultório *{4}* lhe aguarda.",
  TECHNICALPROBLEMS:
    "Desculpa estamos com problemas técnicos, por favor nos contact mais tarde.",
  SHOWCONSULTA:
    "Você possui uma consulta marcada para {0}, *{1}* de *{2}* as {3} no consultório {4}.",
  SHOWCONSULTAS: "Você possui as seguintes consultas marcadas:",
  ABOUT:
    "O consultório *{0}* é inigualável quando se trata de {1}." +
    "\n\nTelefone para contato: {2}" +
    "\nAtendimento: Segunda a sexta(07:30 - 11:30 e 14:00 - 17:00)" +
    "\nEndereço: {3}",
  CANCELAR:
    "Informe a data da consulta que você deseja cancelar no formato DD/MM/AAAA:",
  NODATACONSULTA:
    "Você não possui nenhuma consulta marcada para data {0}.\n\nInforme a data de uma consulta marcada:",
  CONSULTACANCELADA:
    "Sua consulta marcada para {0} dia {1} de {2} foi cancelada.",
  LINEARCONSULTA: "{0} - {1} *{2}*",
  REAGEDARCONSULTA:
    "Informe o número referente ao horário que deseja reagendar:",
};
