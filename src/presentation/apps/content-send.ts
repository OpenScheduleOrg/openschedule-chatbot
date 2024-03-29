type MessageButton = {
  buttonId: string;
  buttonText: { displayText: string };
  type: number;
};

export type MessageTemplate = {
  text?: string;
  location?: {
    degreesLatitude: number;
    degreesLongitude: number;
    address: string;
  };
  buttons?: MessageButton[];
  footer?: string;
  title?: string;
  buttonText?: string;
  sections?: any[];
};
