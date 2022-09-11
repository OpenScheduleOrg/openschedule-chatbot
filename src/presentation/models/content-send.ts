export type ContentSend = {
  text?: string;
  location?: {
    degreesLatitude: number;
    degreesLongitude: number;
    address: string;
  };
};
