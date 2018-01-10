import { Logger } from 'meteor/ostrio:logger';
import { LoggerConsole } from 'meteor/ostrio:loggerconsole';

function startLogger() {
    // Initialize and enable Logger and LoggerConsole with default settings:
    const logger = new Logger();
    (new LoggerConsole(logger)).enable();
}

function catchServerErrors() {
    process.on('uncaughtException', function (err) {
        logger.error("Server Crashed!", err);
        console.error(err.stack);
        process.exit(7);
    });
}

startLogger();