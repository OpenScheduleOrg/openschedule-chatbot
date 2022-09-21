export type ResponseNotificationModel = {
  data: {
    notifications: {
      [phone: string]: string[];
    };
  };
};
