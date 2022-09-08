import { format } from "date-fns";

import "@/common/prototype";
import { sortConsultas, tenDigits } from "@/common/helpers";
import { Month, Weekday } from "@/common/constants";

import Messages from "@/presentation/messages";

import {
  Chat,
  Tlistener,
  IBot,
  SimpleListener,
  GlobalListeners,
} from "@/presentation/bot-types";

import { ClinicaModel, ConsultaModel } from "@/domain/models";
import {
  IClienteService,
  IConsultaService,
  IHorarioService,
} from "@/domain/services";
import { AnyMessageContent } from "@adiwajshing/baileys";

process.env.TZ = "America/Fortaleza";

export default class Bot implements IBot {
  chats: Chat;
  send: (jid: string, content: AnyMessageContent) => Promise<void>;
  base_listeners: GlobalListeners;

  constructor(
    private readonly clinica: ClinicaModel,
    private readonly consultaService: IConsultaService,
    private readonly clienteService: IClienteService,
    private readonly horarioService: IHorarioService
  ) {
    this.chats = {};
    this.base_listeners = {};
    this.base_listeners["cancelar"] =
      this.base_listeners["não"] =
      this.base_listeners["n"] =
      this.base_listeners["ñ"] =
      this.base_listeners["0"] =
        this.cancelOperation;
  }

  async send_consultas(jid: string, c: ConsultaModel[]) {
    let current_date: Date,
      res_text: string,
      horarios: string,
      day_consultas: ConsultaModel[];

    const consultas = c.reduce((p, c) => {
      const marcada = c.marcada as Date;
      if (!p[marcada.toLocaleDateString()]) {
        p[marcada.toLocaleDateString()] = [];
      }

      p[marcada.toLocaleDateString()].push(c);
      return p;
    }, {} as { [x: string]: ConsultaModel[] });

    this.chats[jid]["session"]["data"]["consultas"] = consultas;

    if (c.length > 1) {
      await this.send(jid, { text: Messages.SHOWCONSULTAS });
    }

    for (const date_str in consultas) {
      day_consultas = consultas[date_str];
      current_date = day_consultas[0].marcada as Date;

      horarios = `*${current_date.getHHMM()}*`;

      for (let i = 1; i < day_consultas.length; i++) {
        current_date = day_consultas[i].marcada as Date;
        if (i === day_consultas.length - 1) {
          horarios += " e outra as " + `*${current_date.getHHMM()}*`;
        } else {
          horarios += ", " + `*${current_date.getHHMM()}*`;
        }
      }
      if (day_consultas.length === 2) {
        horarios += " ambas";
      }
      if (day_consultas.length > 2) {
        horarios += " todas";
      }

      res_text =
        date_str +
        " - " +
        Messages.SHOWCONSULTA.format(
          Weekday[current_date.getDay()],
          String(current_date.getDate()),
          Month[current_date.getMonth()],
          horarios,
          this.clinica.nome
        );

      await this.send(jid, { text: res_text });
    }
  }

  async send_consultas_enumerate(jid: string, consultas: ConsultaModel[]) {
    let res_text = "";

    this.chats[jid]["session"]["data"]["consultas"] = consultas;

    for (let i = 0; i < consultas.length; i++) {
      res_text =
        res_text +
        Messages.LINEARCONSULTA.format(
          String(i + 1),
          consultas[i].marcada.toLocaleDateString(),
          consultas[i].marcada.getHHMM()
        ) +
        "\n\n";
    }
    res_text = res_text + "0 - Para cancelar essa operação.";

    await this.send(jid, { text: res_text });
  }

  l_menu: Tlistener = async (jid, text) => {
    const test_text = text.toLocaleLowerCase("pt-BR");
    let res_text: string;
    const today = new Date();
    const cliente_id = this.chats[jid]["id"];
    const clinica_id = this.clinica.id;

    if (
      test_text == "1" ||
      test_text.match(/((marcar|nova)\s*consulta)|(marcar$)/i)
    ) {
      if (cliente_id) {
        this.chats[jid]["session"]["default"] = this.l_day;

        res_text = Messages.DIACONSULTA.format(
          String(today.monthDays()),
          Weekday[today.getDay()],
          String(today.getDate()),
          Month[today.getMonth()]
        );
        await this.send(jid, { text: Messages.INTERRUPT });
        await this.send(jid, { text: res_text });
      } else {
        this.chats[jid]["session"]["default"] = this.l_name;
        res_text = `${Messages.NEWCLIENT}\n${Messages.NAME}`;
        await this.send(jid, { text: Messages.INTERRUPT });
        await this.send(jid, { text: res_text });
      }
    } else if (
      test_text == "2" ||
      test_text.match(/((minhas?|ver)\s*consultas?)|(^consultas?)/i)
    ) {
      if (cliente_id) {
        const consultas = await this.consultaService.loadAll({
          clinica_id,
          cliente_id,
          date_start: new Date(),
        });
        if (consultas.length) {
          consultas.sort(sortConsultas);
          this.chats[jid]["session"]["default"] = this.l_default;
          await this.send_consultas(jid, consultas);
          delete this.chats[jid]["session"]["data"][
            "consultas"
          ]; /*ver depois */
          return;
        }
      }
      this.chats[jid]["session"]["default"] = this.sn_consulta;
      await this.send(jid, { text: Messages.NOCONSULTA });
    } else if (
      test_text == "3" ||
      test_text.match(/(reagendar\s*consultas?)|(reagendar)/i)
    ) {
      if (cliente_id) {
        const consultas = await this.consultaService.loadAll({
          clinica_id,
          cliente_id,
          date_start: new Date(),
        });

        if (consultas.length) {
          consultas.sort(sortConsultas);
          this.chats[jid]["session"]["default"] = this.l_reagendar;
          await this.send_consultas_enumerate(jid, consultas);
          await this.send(jid, { text: Messages.REAGEDARCONSULTA });
          return;
        }
      }
      this.chats[jid]["session"]["default"] = this.sn_consulta;
      await this.send(jid, { text: Messages.NOCONSULTA });
    } else if (
      test_text == "4" ||
      test_text.match(/(cancelar\s*consultas?)|(cancelar)/i)
    ) {
      if (cliente_id) {
        const consultas = await this.consultaService.loadAll({
          clinica_id,
          cliente_id,
          date_start: new Date(),
        });
        if (consultas.length) {
          consultas.sort(sortConsultas);
          this.chats[jid]["session"]["default"] = this.l_cancelar;
          await this.send(jid, { text: Messages.INTERRUPT });
          await this.send_consultas(jid, consultas);
          await this.send(jid, { text: Messages.CANCELAR });
          return;
        }
      }
      this.chats[jid]["session"]["default"] = this.sn_consulta;
      await this.send(jid, { text: Messages.NOCONSULTA });
    } else if (
      test_text == "5" ||
      test_text.match(
        /(sobre\s*(cl(í|i)nica|consult(ó|o)rio))|(sobre)|(cl(í|i)nica)|(consult(ó|o)rio)/i
      )
    ) {
      this.chats[jid]["session"]["default"] = this.l_default;
      res_text = Messages.ABOUT.format(
        this.clinica.nome,
        this.clinica.tipo,
        this.clinica.telefone,
        this.clinica.endereco
      );
      await this.send(jid, { text: res_text });
      await this.send(jid, {
        location: {
          degreesLatitude: Number(this.clinica.latitude),
          degreesLongitude: Number(this.clinica.logintude),
          address: this.clinica.endereco,
        },
      });
    } else {
      await this.send(jid, { text: Messages.INVALIDMENU });
    }
  };

  sn_consulta: Tlistener = async (jid, text) => {
    text = text.toLocaleLowerCase("pt-BR");
    let res_text;

    if (text == "sim" || text == "s" || text == "si" || text == "1") {
      if (this.chats[jid]["id"]) {
        let today = new Date();

        res_text = Messages.DIACONSULTA.format(
          String(today.monthDays()),
          Weekday[today.getDay()],
          String(today.getDate()),
          Month[today.getMonth()]
        );

        this.chats[jid]["session"]["default"] = this.l_day;
        await this.send(jid, { text: res_text });
      } else {
        this.chats[jid]["session"]["default"] = this.l_name;
        res_text = `${Messages.NEWCLIENT}\n${Messages.NAME}`;
        await this.send(jid, { text: Messages.INTERRUPT });
        await this.send(jid, res_text);
      }
    } else {
      this.chats[jid]["session"]["default"] = this.l_menu;
      let res_text = Messages.MENU.format(
        "Bom, aqui estão algumas opções para acesso rápido:"
      );
      await this.send(jid, { text: res_text });
    }
  };

  l_default: Tlistener = async (jid, text) => {
    this.chats[jid]["session"]["default"] = this.l_menu;

    let res_text = Messages.MENU.format(
      "De nada! Mas não entendo muita coisa, aqui estão algumas opções com o que consigo fazer:"
    );
    await this.send(jid, { text: res_text });
  };

  l_name: Tlistener = async (jid, text) => {
    let test_text = text.toLocaleLowerCase("pt-BR");
    text = text.replace(/\s\s+/g, " ");

    if (test_text.length <= 3) {
      await this.send(jid, { text: Messages.INVALIDNAME });
    } else {
      const nome_completo = text.split(/\s+/);
      const nome = nome_completo[0];
      const sobrenome = nome_completo.slice(1).join(" ");
      this.chats[jid]["session"]["default"] = this.l_cpf;
      this.chats[jid]["session"]["data"]["nome"] = nome;
      this.chats[jid]["session"]["data"]["sobrenome"] = sobrenome;
      await this.send(jid, { text: Messages.CPF });
    }
  };

  l_cpf: Tlistener = async (jid, text) => {
    let test_text = text.toLocaleLowerCase("pt-BR");
    let fone = tenDigits(jid);

    let res_text: string;

    if (!test_text.match(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) {
      await this.send(jid, { text: Messages.INVALIDCPF });
    } else {
      const new_cliente = {
        nome: this.chats[jid]["session"]["data"]["nome"],
        sobrenome: this.chats[jid]["session"]["data"]["sobrenome"],
        cpf: text,
        telefone: fone,
      };

      const cliente = await this.clienteService.create(new_cliente);

      this.chats[jid].id = cliente.id;
      this.chats[jid].nome = cliente.nome;
      this.chats[jid].sobrenome = cliente.sobrenome;
      this.chats[jid]["session"]["default"] = this.l_day;
      delete this.chats[jid]["session"]["data"]["nome"];

      let today = new Date();

      res_text = Messages.DIACONSULTA.format(
        String(today.monthDays()),
        Weekday[today.getDay()],
        String(today.getDate()),
        Month[today.getMonth()]
      );

      await this.send(jid, { text: res_text });
    }
  };

  l_day: Tlistener = async (jid, text) => {
    function msg_horarios(horarios: Date[], selected_date: Date): string {
      let res_text =
        Messages.HORARIOS.format(
          Weekday[selected_date.getDay()],
          String(selected_date.getDate()),
          Month[selected_date.getMonth()]
        ) + "\n";
      for (let i = 0; i < horarios.length; i++) {
        res_text =
          res_text +
          `\n${i + 1} - ${format(
            horarios[i],
            "\u200Ekk\u200E:\u200E\u200Emm"
          )}`;
      }
      res_text =
        res_text + "\n0 - escolher outro dia\n\n" + Messages.HORACONSULTA;

      return res_text;
    }

    let test_text = text.toLocaleLowerCase("pt-BR");
    let day = Number(text);

    let today = new Date();
    let mouth_size = today.monthDays();

    let res_text: string;

    if (!day || day < 1 || day > mouth_size) {
      let res_text = Messages.INVALIDDAY.format(String(mouth_size));
      await this.send(jid, { text: res_text });
    } else {
      if (day < today.getDate()) today.setMonth(today.getMonth() + 1);
      const clinica_id = this.clinica.id;
      const date_start = new Date(today.getFullYear(), today.getMonth(), day);
      const date_end = new Date(
        today.getFullYear(),
        today.getMonth(),
        day,
        23,
        59,
        59
      );

      const horarios = await this.horarioService.availables({
        consulta_dia: date_start,
        clinica_id,
      });

      if (horarios.length > 0) {
        res_text = msg_horarios(horarios, date_start);

        this.chats[jid]["session"]["default"] = this.l_horario;
        this.chats[jid]["session"]["data"]["horarios"] = horarios;
        await this.send(jid, { text: res_text });
      } else {
        res_text = Messages.NOHORARIOS.format(
          Weekday[date_start.getDay()],
          String(date_start.getDate()),
          Month[date_start.getMonth()]
        );
        await this.send(jid, { text: res_text });
        await this.send(jid, { text: Messages.NEWDAY });
      }
    }
  };

  l_horario: Tlistener = async (jid, text) => {
    let index = Number(text);
    let horarios = this.chats[jid]["session"]["data"]["horarios"];
    let res_text: string;
    const consulta = this.chats[jid]["session"]["data"]["consulta"];

    if (index == NaN && text.match(/^([0-1]\d|2[0-3]):[0-5]\d$/)) {
      index = 1;
      for (let hora of horarios) {
        if (text == format(hora, "kk:mm")) {
          break;
        }
        index++;
      }
    }

    if (text === "0") {
      this.chats[jid]["session"]["default"] = this.l_day;
      delete this.chats[jid]["session"]["data"]["horarios"];
      await this.send(jid, { text: Messages.NEWDAY });
    } else if (index < 1 || index > horarios.length || !index) {
      await this.send(jid, { text: Messages.INVALIDHORA });
    } else if (consulta) {
      const marcada = horarios[index - 1];
      await this.consultaService.update(consulta.id, {
        marcada: marcada,
      });

      this.chats[jid]["session"]["default"] = this.l_default;

      res_text = Messages.CONSULTAREAGENDADA.format(
        Weekday[marcada.getDay()],
        String(marcada.getDate()),
        Month[marcada.getMonth()],
        marcada.toLocaleTimeString("pt-BR", {}).slice(0, 5),
        this.clinica.nome
      );

      await this.send(jid, { text: res_text });
      delete this.chats[jid]["session"]["data"]["horarios"];
      delete this.chats[jid]["session"]["data"]["consultas"];
      delete this.chats[jid]["session"]["data"]["consulta"];
    } else {
      const marcada = horarios[index - 1];
      const cliente_id = this.chats[jid]["id"];
      const clinica_id = this.clinica.id;
      const new_consulta = {
        clinica_id,
        cliente_id,
        marcada,
      };

      const consulta = await this.consultaService.create(new_consulta);

      this.chats[jid]["session"]["default"] = this.l_default;

      res_text = Messages.NOVACONSULTA.format(
        Weekday[marcada.getDay()],
        String(marcada.getDate()),
        Month[marcada.getMonth()],
        marcada.toLocaleTimeString("pt-BR", {}).slice(0, 5),
        this.clinica.nome
      );

      await this.send(jid, { text: res_text });

      delete this.chats[jid]["session"]["data"]["horarios"];
    }
  };

  l_reagendar: Tlistener = async (jid, text) => {
    let consultas = this.chats[jid]["session"]["data"]["consultas"];
    let res_text: string;
    const today = new Date();
    const indx = Number(text);

    if (indx && indx > 0 && indx <= consultas.length) {
      this.chats[jid].session.data.consulta = consultas[indx - 1];
      this.chats[jid]["session"]["default"] = this.l_day;
      res_text = Messages.DIACONSULTAREAGENDAR.format(
        String(today.monthDays()),
        Weekday[today.getDay()],
        String(today.getDate()),
        Month[today.getMonth()]
      );
      await this.send(jid, { text: res_text });
    } else {
      await this.send(jid, { text: "Informe uma entrada válida:" });
    }
  };

  l_cancelar: Tlistener = async (jid, text) => {
    let test_text = text.toLocaleLowerCase("pt-BR");

    let consultas = this.chats[jid]["session"]["data"]["consultas"];
    let res_text: string;

    if (consultas[text]) {
      const new_consulta = consultas[text][0];
      await this.consultaService.delete(new_consulta.id);

      this.chats[jid]["session"]["default"] = this.l_default;
      const marcada = new_consulta.marcada as Date;
      res_text = Messages.CONSULTACANCELADA.format(
        Weekday[marcada.getDay()],
        String(marcada.getUTCDate()),
        Month[marcada.getUTCMonth()]
      );
      delete this.chats[jid]["session"]["data"]["consultas"];
      await this.send(jid, { text: res_text });
    } else {
      await this.send(jid, { text: Messages.NODATACONSULTA.format(text) });
    }
  };

  cancelOperation: SimpleListener = async (jid: string) => {
    this.chats[jid]["session"]["default"] = this.l_menu;
    let res_text = Messages.MENU.format(
      "Tudo bem, aqui estão algumas opções para acesso rápido:"
    );
    await this.send(jid, { text: res_text });
  };

  read = async (jid, text) => {
    try {
      text = text.trim();
      if (jid in this.chats) {
        const simple_lst = this.chats[jid]["session"]["listeners"][text];
        if (simple_lst) await simple_lst(jid);
        else await this.chats[jid]["session"]["default"](jid, text);
      } else {
        const fone_number = tenDigits(jid);
        const cliente = await this.clienteService.loadByPhone(fone_number);

        if (cliente) {
          this.newChat(jid, cliente, this.l_menu);

          let nome = cliente["nome"].split(/\s+/)[0];
          let res_text = Messages.MENU.format(
            "Tudo bem? Bom aqui tenho algumas opções para você achar o que procurar:"
          );

          await this.send(jid, { text: Messages.WELCOMEBACK.format(nome) });
          await this.send(jid, { text: res_text });
        } else {
          this.newChat(jid, cliente, this.sn_consulta);
          await this.send(jid, { text: Messages.SNCONSULTA });
        }
      }
    } catch (e) {
      await this.send(jid, { text: Messages.TECHNICALPROBLEMS });
      console.error(e);
    }
  };

  newChat(jid, cliente, listener) {
    this.chats[jid] = {
      id: cliente && cliente.id,
      nome: cliente && cliente.nome,
      sobrenome: cliente && cliente.sobrenome,
      session: { default: listener, data: {}, listeners: this.base_listeners },
    };
    console.log(this.chats[jid].session.listeners);
  }
}
