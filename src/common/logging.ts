import { createLogger, format, transports, Logger } from 'winston';
import { stringify } from "flatted"
const { combine, timestamp, printf, json } = format;

declare global {
  var log: Logger
}

const consoleFormat = printf(({ level, message, timestamp, ...meta}) => {
  let text = "";
  if (meta)
    text = ` ${stringify(meta)}`;
  if(typeof(message) == 'string')
    return `${timestamp} ${level}: ${message}` + text;
  return `${timestamp} ${level}: ${stringify(message)}` + text;
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

