import { createLogger, format, transports, Logger } from 'winston';
const { combine, timestamp, printf, json } = format;

declare global {
  var log: Logger
}

const consoleFormat = printf(({ level, message, timestamp, app }) => {
  let text = "";
  if (app)
    text = `[${app}] `;
  if(typeof(message) == 'string')
    return text + `${timestamp} ${level}: ${message}`;
  return text + `${timestamp} ${level}: ${JSON.stringify(message, undefined, 2)}`;
});

const logger = createLogger({
  format: combine(timestamp(), json()),
  transports: [
    new transports.Console({
      format: combine(
        timestamp(),
        consoleFormat
      )
    }),

    new transports.File({ filename: 'all.log', dirname: "logs", level: 'info' }),
    new transports.File({ filename: 'errors.log', dirname: "logs", level: 'error' })
  ]
});

global.log = logger;

