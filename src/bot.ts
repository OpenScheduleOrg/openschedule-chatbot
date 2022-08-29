import "./prototype";
import { secondsToHorario, sortConsultas, tenDigits } from "./helpers";
import { Month, Weekday, Message } from "./constants";

import { createCliente, getClientes } from "./services/cliente";
import {
  createConsulta,
  updateConsulta,
  getConsultas,
  deleteConsulta,
} from "./services/consulta";

import {
  Chat,
  Tlistener,
  Clinica,
  Horario,
  Consulta,
  Cliente,
  IBot,
} from "./interfaces";

process.env.TZ = "America/Fortaleza";

export default class Bot implements IBot {
  chats: Chat;
  clinica: Clinica;
  horarios: Horario[];
  send: (jid: string, content: any) => Promise<void>;

  constructor(clinica: Clinica, horarios: Horario[]) {
    this.clinica = clinica;
    this.horarios = horarios;
    this.chats = {};
  }

  async send_consultas(jid: string, c: Consulta[]) {
    let current_date: Date,
      res_text: string,
      horarios: string,
      day_consultas: Consulta[];

    const consultas = c.reduce((p, c) => {
      const marcada = c.marcada as Date;
      if (!p[marcada.toLocaleDateString()]) {
        p[marcada.toLocaleDateString()] = [];
      }

      p[marcada.toLocaleDateString()].push(c);
      return p;
    }, {} as { [x: string]: Consulta[] });

    this.chats[jid]["session"]["data"]["consultas"] = consultas;

    if (c.length > 1) {
      await this.send(jid, { text: Message.SHOWCONSULTAS });
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
        Message.SHOWCONSULTA.format(
          Weekday[current_date.getDay()],
          String(current_date.getDate()),
          Month[current_date.getMonth()],
          horarios,
          this.clinica.nome
        );

      await this.send(jid, { text: res_text });
    }
  }

  async send_consultas_enumerate(jid: string, consultas: Consulta[]) {
    let res_text = "";

    this.chats[jid]["session"]["data"]["consultas"] = consultas;

    for (let i = 0; i < consultas.length; i++) {
      res_text =
        res_text +
        Message.LINEARCONSULTA.format(
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
        this.chats[jid]["session"]["listener"] = this.l_day;

        res_text = Message.DIACONSULTA.format(
          String(today.monthDays()),
          Weekday[today.getDay()],
          String(today.getDate()),
          Month[today.getMonth()]
        );
        await this.send(jid, { text: Message.INTERRUPT });
        await this.send(jid, { text: res_text });
      } else {
        this.chats[jid]["session"]["listener"] = this.l_name;
        res_text = `${Message.NEWCLIENT}\n${Message.NAME}`;
        await this.send(jid, { text: Message.INTERRUPT });
        await this.send(jid, { text: res_text });
      }
    } else if (
      test_text == "2" ||
      test_text.match(/((minhas?|ver)\s*consultas?)|(^consultas?)/i)
    ) {
      if (cliente_id) {
        const res = await getConsultas({
          clinica_id,
          cliente_id,
          date_start: new Date(),
        });
        if (res) {
          const consultas = res.data.consultas;

          if (consultas.length) {
            consultas.sort(sortConsultas);
            this.chats[jid]["session"]["listener"] = this.l_default;
            await this.send_consultas(jid, consultas);
            delete this.chats[jid]["session"]["data"][
              "consultas"
            ]; /*ver depois */
            return;
          }
        }
      }
      this.chats[jid]["session"]["listener"] = this.sn_consulta;
      await this.send(jid, { text: Message.NOCONSULTA });
    } else if (
      test_text == "3" ||
      test_text.match(/(reagendar\s*consultas?)|(reagendar)/i)
    ) {
      if (cliente_id) {
        const res = await getConsultas({
          clinica_id,
          cliente_id,
          date_start: new Date(),
        });
        if (res) {
          const consultas = res.data.consultas;

          if (consultas.length) {
            consultas.sort(sortConsultas);
            this.chats[jid]["session"]["listener"] = this.l_reagendar;
            await this.send_consultas_enumerate(jid, consultas);
            await this.send(jid, { text: Message.REAGEDARCONSULTA });
            return;
          }
        }
      }
      this.chats[jid]["session"]["listener"] = this.sn_consulta;
      await this.send(jid, { text: Message.NOCONSULTA });
    } else if (
      test_text == "4" ||
      test_text.match(/(cancelar\s*consultas?)|(cancelar)/i)
    ) {
      if (cliente_id) {
        const res = await getConsultas({
          clinica_id,
          cliente_id,
          date_start: new Date(),
        });
        if (res) {
          const consultas = res.data.consultas;
          if (consultas.length) {
            consultas.sort(sortConsultas);
            this.chats[jid]["session"]["listener"] = this.l_cancelar;
            await this.send(jid, { text: Message.INTERRUPT });
            await this.send_consultas(jid, consultas);
            await this.send(jid, { text: Message.CANCELAR });
            return;
          }
        }
      }
      this.chats[jid]["session"]["listener"] = this.sn_consulta;
      await this.send(jid, { text: Message.NOCONSULTA });
    } else if (
      test_text == "5" ||
      test_text.match(
        /(sobre\s*(cl(í|i)nica|consult(ó|o)rio))|(sobre)|(cl(í|i)nica)|(consult(ó|o)rio)/i
      )
    ) {
      this.chats[jid]["session"]["listener"] = this.l_default;
      res_text = Message.ABOUT.format(
        this.clinica.nome,
        this.clinica.tipo,
        this.clinica.telefone,
        this.clinica.endereco
      );
      await this.send(jid, { text: res_text.toLocaleUpperCase("pt-BR") });
      await this.send(jid, {
        location: {
          degreesLatitude: Number(this.clinica.latitude),
          degreesLongitude: Number(this.clinica.logintude),
          address: this.clinica.endereco,
        },
      });
    } else {
      await this.send(jid, { text: Message.INVALIDMENU });
    }
  };

  sn_consulta: Tlistener = async (jid, text) => {
    text = text.toLocaleLowerCase("pt-BR");
    let res_text;

    if (text == "sim" || text == "s" || text == "si" || text == "1") {
      if (this.chats[jid]["id"]) {
        let today = new Date();

        res_text = Message.DIACONSULTA.format(
          String(today.monthDays()),
          Weekday[today.getDay()],
          String(today.getDate()),
          Month[today.getMonth()]
        );

        await this.send(jid, res_text);
      } else {
        this.chats[jid]["session"]["listener"] = this.l_name;
        res_text = `${Message.NEWCLIENT}\n${Message.NAME}`;
        await this.send(jid, { text: Message.INTERRUPT });
        await this.send(jid, res_text);
      }
    } else {
      this.chats[jid]["session"]["listener"] = this.l_menu;
      let res_text = Message.MENU.format(
        "Bom, aqui estão algumas opções para acesso rápido:"
      );
      await this.send(jid, { text: res_text });
    }
  };

  l_default: Tlistener = async (jid, text) => {
    this.chats[jid]["session"]["listener"] = this.l_menu;

    let res_text = Message.MENU.format(
      "De nada! Mas não entendo muita coisa, aqui estão algumas opções com o que consigo fazer:"
    );
    await this.send(jid, { text: res_text });
  };

  l_name: Tlistener = async (jid, text) => {
    let test_text = text.toLocaleLowerCase("pt-BR");
    text = text.replace(/\s\s+/g, " ");
    let res_text: string;
    if (
      test_text == "0" ||
      test_text == "cancelar" ||
      test_text == "não" ||
      test_text == "n" ||
      test_text == "ñ" ||
      this.chats[jid].id
    ) {
      this.chats[jid]["session"]["listener"] = this.l_menu;
      res_text = Message.MENU.format(
        "Tudo bem, aqui estão algumas opções para acesso rápido:"
      );
      await this.send(jid, { text: res_text });
    } else if (test_text.length <= 3) {
      await this.send(jid, { text: Message.INVALIDNAME });
    } else {
      const nome_completo = text.split(/\s+/);
      const nome = nome_completo[0];
      const sobrenome = nome_completo.slice(1).join(" ");
      this.chats[jid]["session"]["listener"] = this.l_cpf;
      this.chats[jid]["session"]["data"]["nome"] = nome;
      this.chats[jid]["session"]["data"]["sobrenome"] = sobrenome;
      await this.send(jid, { text: Message.CPF });
    }
  };

  l_cpf: Tlistener = async (jid, text) => {
    let test_text = text.toLocaleLowerCase("pt-BR");
    let fone = tenDigits(jid);

    let res_text: string;

    if (
      test_text == "0" ||
      test_text == "cancelar" ||
      test_text == "não" ||
      test_text == "n" ||
      test_text == "ñ"
    ) {
      this.chats[jid]["session"]["listener"] = this.l_menu;
      delete this.chats[jid]["session"]["data"]["nome"];
      let res_text = Message.MENU.format(
        "Tudo bem, aqui estão algumas opções para acesso rápido:"
      );
      await this.send(jid, { text: res_text });
    } else if (!test_text.match(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) {
      await this.send(jid, { text: Message.INVALIDCPF });
    } else {
      const cliente = {
        nome: this.chats[jid]["session"]["data"]["nome"],
        sobrenome: this.chats[jid]["session"]["data"]["sobrenome"],
        cpf: text,
        telefone: fone,
      };

      const res = await createCliente(cliente);
      console.log(res);

      if (res.data.cliente) {
        const cliente = res.data.cliente;
        this.chats[jid].id = cliente.id;
        this.chats[jid].nome = cliente.nome;
        this.chats[jid].sobrenome = cliente.sobrenome;
        this.chats[jid]["session"]["listener"] = this.l_day;
        delete this.chats[jid]["session"]["data"]["nome"];

        let today = new Date();

        res_text = Message.DIACONSULTA.format(
          String(today.monthDays()),
          Weekday[today.getDay()],
          String(today.getDate()),
          Month[today.getMonth()]
        );

        await this.send(jid, { text: res_text });
      } else {
        this.APIProblem(jid);
      }
    }
  };

  l_day: Tlistener = async (jid, text) => {
    function msg_horarios(
      horarios: { hhmm: string }[],
      selected_date: Date
    ): string {
      let res_text =
        Message.HORARIOS.format(
          Weekday[selected_date.getDay()],
          String(selected_date.getDate()),
          Month[selected_date.getMonth()]
        ) + "\n";
      for (let i = 0; i < horarios.length; i++) {
        res_text =
          res_text +
          `\n${i + 1} - \u200E${horarios[i].hhmm.slice(
            0,
            4
          )}\u200E\u200E${horarios[i].hhmm.slice(4, 5)}`;
      }
      res_text =
        res_text + "\n0 - escolher outro dia\n\n" + Message.HORACONSULTA;

      return res_text;
    }

    let test_text = text.toLocaleLowerCase("pt-BR");
    let day = Number(text);

    let today = new Date();
    let mouth_size = today.monthDays();

    let res_text: string;

    if (
      test_text == "0" ||
      test_text == "cancelar" ||
      test_text == "não" ||
      test_text == "n" ||
      test_text == "ñ"
    ) {
      this.chats[jid]["session"]["listener"] = this.l_menu;
      let res_text = Message.MENU.format(
        "Tudo bem, aqui estão algumas opções para acesso rápido:"
      );
      await this.send(jid, { text: res_text });
    } else if (!day || day < 1 || day > mouth_size) {
      let res_text = Message.INVALIDDAY.format(String(mouth_size));
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

      const res = await getConsultas({ clinica_id, date_start, date_end });
      if (res) {
        const consultas = res.data.consultas;
        const horarios = this.getFreeHorarios(consultas, date_start);

        if (horarios.length > 0) {
          res_text = msg_horarios(horarios, date_start);

          this.chats[jid]["session"]["listener"] = this.l_horario;
          this.chats[jid]["session"]["data"]["horarios"] = horarios;
          await this.send(jid, { text: res_text });
        } else {
          res_text = Message.NOHORARIOS.format(
            Weekday[date_start.getDay()],
            String(date_start.getDate()),
            Month[date_start.getMonth()]
          );
          await this.send(jid, { text: res_text });
          await this.send(jid, { text: Message.NEWDAY });
        }
      } else {
        this.APIProblem(jid);
      }
    }
  };

  l_horario: Tlistener = async (jid, text) => {
    let test_text = text.toLocaleLowerCase("pt-BR");
    let index = Number(text);
    let horarios = this.chats[jid]["session"]["data"]["horarios"];
    let res_text: string;
    const consulta = this.chats[jid]["session"]["data"]["consulta"];

    if (index == NaN && text.match(/^([0-1]\d|2[0-3]):[0-5]\d$/)) {
      index = 1;
      for (let hora of horarios) {
        if (text == hora.hhmm) {
          break;
        }
        index++;
      }
    }
    if (
      test_text == "cancelar" ||
      test_text == "não" ||
      test_text == "n" ||
      test_text == "ñ"
    ) {
      this.chats[jid]["session"]["listener"] = this.l_menu;
      delete this.chats[jid]["session"]["data"]["horarios"];

      let res_text = Message.MENU.format(
        "Tudo bem, aqui estão algumas opções para acesso rápido:"
      );
      await this.send(jid, { text: res_text });
    } else if (text === "0") {
      this.chats[jid]["session"]["listener"] = this.l_day;
      delete this.chats[jid]["session"]["data"]["horarios"];
      await this.send(jid, { text: Message.NEWDAY });
    } else if (index < 1 || index > horarios.length || !index) {
      await this.send(jid, { text: Message.INVALIDHORA });
    } else if (consulta) {
      const marcada = horarios[index - 1]["marcada"];
      const res = await updateConsulta(consulta.id, marcada);

      if (res.data && res.data.consulta) {
        const consulta = res.data.consulta;
        const marcada = new Date(consulta.marcada);

        this.chats[jid]["session"]["listener"] = this.l_default;

        res_text = Message.CONSULTAREAGENDADA.format(
          Weekday[marcada.getDay()],
          String(marcada.getDate()),
          Month[marcada.getMonth()],
          marcada.toLocaleTimeString("pt-BR", {}).slice(0, 5),
          this.clinica.nome
        );

        await this.send(jid, { text: res_text });
      } else {
        this.APIProblem(jid);
      }
      delete this.chats[jid]["session"]["data"]["horarios"];
      delete this.chats[jid]["session"]["data"]["consultas"];
      delete this.chats[jid]["session"]["data"]["consulta"];
    } else {
      const marcada = horarios[index - 1]["marcada"];
      const cliente_id = this.chats[jid]["id"];
      const clinica_id = this.clinica.id;
      const consulta = {
        clinica_id,
        cliente_id,
        marcada,
      };

      const res = await createConsulta(consulta);

      if (res.data && res.data.consulta) {
        const consulta = res.data.consulta;
        const marcada = new Date(consulta.marcada);

        this.chats[jid]["session"]["listener"] = this.l_default;

        res_text = Message.NOVACONSULTA.format(
          Weekday[marcada.getDay()],
          String(marcada.getDate()),
          Month[marcada.getMonth()],
          marcada.toLocaleTimeString("pt-BR", {}).slice(0, 5),
          this.clinica.nome
        );

        await this.send(jid, { text: res_text });
      } else {
        this.APIProblem(jid);
      }
      delete this.chats[jid]["session"]["data"]["horarios"];
    }
  };

  l_reagendar: Tlistener = async (jid, text) => {
    let test_text = text.toLocaleLowerCase("pt-BR");

    let consultas = this.chats[jid]["session"]["data"]["consultas"];
    let res_text: string;
    const today = new Date();
    const indx = Number(text);
    if (
      test_text == "0" ||
      test_text == "cancelar" ||
      test_text == "não" ||
      test_text == "n" ||
      test_text == "ñ"
    ) {
      this.chats[jid]["session"]["listener"] = this.l_menu;
      let res_text = Message.MENU.format(
        "Tudo bem, aqui estão algumas opções para acesso rápido:"
      );
      await this.send(jid, { text: res_text });
    } else if (indx && indx > 0 && indx <= consultas.length) {
      this.chats[jid].session.data.consulta = consultas[indx - 1];
      this.chats[jid]["session"]["listener"] = this.l_day;
      res_text = Message.DIACONSULTAREAGENDAR.format(
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

    if (
      test_text == "0" ||
      test_text == "cancelar" ||
      test_text == "não" ||
      test_text == "n" ||
      test_text == "ñ"
    ) {
      this.chats[jid]["session"]["listener"] = this.l_menu;
      let res_text = Message.MENU.format(
        "Tudo bem, aqui estão algumas opções para acesso rápido:"
      );
      await this.send(jid, { text: res_text });
    } else if (consultas[text]) {
      const consulta = consultas[text][0];
      const res = await deleteConsulta(consulta.id);

      if (res) {
        this.chats[jid]["session"]["listener"] = this.l_default;
        const marcada = consulta.marcada as Date;
        res_text = Message.CONSULTACANCELADA.format(
          Weekday[marcada.getDay()],
          String(marcada.getUTCDate()),
          Month[marcada.getUTCMonth()]
        );
        delete this.chats[jid]["session"]["data"]["consultas"];
        await this.send(jid, { text: res_text });
      } else {
        this.APIProblem(jid);
      }
    } else {
      await this.send(jid, { text: Message.NODATACONSULTA.format(text) });
    }
  };

  getFreeHorarios(
    day_consultas: Consulta[],
    selected_date: Date
  ): { hhmm: string; marcada: Date }[] {
    console.log(selected_date);
    const horario = this.horarios.find(
      (d) => selected_date.getDay() === d.dia_semana
    );

    const free_horarios: {
      hhmm: string;
      marcada: Date;
    }[] = [];

    if (!horario) return free_horarios;

    const intervalo = horario.intervalo as number;
    let consulta: Consulta | undefined;

    for (
      let h = horario.am_inicio as number;
      h < horario.pm_fim;
      h += intervalo
    ) {
      if (
        horario.am_fim &&
        horario.pm_inicio &&
        h >= horario.am_fim &&
        h <= horario.pm_inicio
      )
        h = horario.pm_inicio as number;
      else {
        consulta =
          day_consultas &&
          day_consultas.find(
            (c) => h >= c.his && c.his < h + intervalo && c.his + c.duracao > h
          );
        if (consulta) continue;
        else {
          const { hhmm, his } = secondsToHorario(h);
          const marcada = selected_date.addSeconds(h);
          free_horarios.push({ hhmm, marcada });
        }
      }
    }

    return free_horarios;
  }

  async APIProblem(jid) {
    delete this.chats[jid];
    await this.send(jid, { text: Message.TECHNICALPROBLEMS });
  }

  async read(jid, text) {
    text = text.trim();

    if (jid in this.chats) {
      this.chats[jid]["session"]["listener"](jid, text);
    } else {
      let fone_number = tenDigits(jid);
      let res = await getClientes({ telefone: fone_number });

      if (res) {
        let cliente: Cliente =
          res.data && (res.data.cliente || res.data.clientes[0]);

        if (cliente) {
          this.newChat(jid, cliente, this.l_menu);

          let nome = cliente["nome"].split(/\s+/)[0];
          let res_text = Message.MENU.format(
            "Tudo bem? Bom aqui tenho algumas opções para você achar o que procurar:"
          );

          await this.send(jid, { text: Message.WELCOMEBACK.format(nome) });
          await this.send(jid, { text: res_text });
        } else {
          this.newChat(jid, cliente, this.sn_consulta);
          await this.send(jid, { text: Message.SNCONSULTA });
        }
      } else {
        await this.send(jid, { text: Message.TECHNICALPROBLEMS });
      }
    }
  }

  newChat(jid, cliente, listener) {
    this.chats[jid] = {
      id: cliente && cliente.id,
      nome: cliente && cliente.nome,
      sobrenome: cliente && cliente.sobrenome,
      session: { listener: listener, data: {} },
    };
  }
}
