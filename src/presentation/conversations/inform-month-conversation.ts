import { addMonths } from "date-fns";

import { Month } from "@/common/constants";
import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/domain/models/user-sesssion";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class InformMonthConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly informDayConversation: IConversation
  ) {}

  private createMonthButton(date: Date) {
    let sufix = "";
    const now = new Date();

    if (now.getMonth() == date.getMonth()) sufix = "(atual)";
    else if (now.getFullYear() != date.getFullYear())
      sufix = "(" + date.getFullYear() + ")";

    return {
      buttonId: (date.getMonth() + 1).toString(),
      buttonText: { displayText: Month[date.getMonth() + 1] + " " + sufix },
      type: 1,
    };
  }

  async ask(
    session: UserSession,
    { complement } = { complement: undefined }
  ): Promise<void> {
    if (complement) await this.send(session.id, { text: complement });

    const now = new Date();

    const buttons = [
      this.createMonthButton(now),
      this.createMonthButton(addMonths(now, 1)),
      this.createMonthButton(addMonths(now, 2)),
    ];

    await this.send(session.id, {
      text: Messages.INFORMMONTH,
      buttons: buttons,
    });

    session.conversation = this;
  }

  private month_to_number = {
    janeiro: "1",
    fevereiro: "2",
    ["março"]: "3",
    abril: "4",
    maio: "5",
    junho: "6",
    julho: "7",
    agosto: "8",
    setembro: "9",
    outubro: "10",
    novembro: "11",
    dezembro: "12",
  };

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);

    clean_text = this.month_to_number[clean_text] || clean_text;
    const month = Number(clean_text);

    if (isNaN(month) || month < 1 || month > 12)
      return await this.ask(session, { complement: Messages.INVALIDMONTH });

    session.data = { month };

    await this.informDayConversation.ask(session);
  }
}
