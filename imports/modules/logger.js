import { Logger } from 'meteor/ostrio:logger';
import { LoggerConsole } from 'meteor/ostrio:loggerconsole';

// Initialize and enable Logger and LoggerConsole with default settings:
const logger = new Logger();
(new LoggerConsole(logger)).enable();

export default logger;