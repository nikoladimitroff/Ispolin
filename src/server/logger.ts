import fs = require("fs");
import bunyan = require("bunyan");

class LoggerImpl {
    public logger: bunyan.Logger;
    constructor() {
        this.logger = bunyan.createLogger({ name: "Ispolin" });
        let stream = fs.WriteStream("Ispolin.log");
        this.logger.addStream(stream);
    }

    public trace(format: string, ...params: any[]): void {
        this.logger.trace(format, params);
    }
    public debug(format: string, ...params: any[]): void {
        this.logger.debug(format, params);
    }
    public info(format: string, ...params: any[]): void {
        this.logger.info(format, params);
    }
    public warn(format: string, ...params: any[]): void {
        this.logger.warn(format, params);
    }
    public error(format: string, ...params: any[]): void {
        this.logger.error(format, params);
    }
    public fatal(format: string, ...params: any[]): void {
        this.fatal(format, params);
    }
}

/* tslint:disable */
export var Logger = new LoggerImpl();
/* tslint:enable */
