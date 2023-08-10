import * as log4js from 'log4js';

const getLogLayout = (color: boolean): log4js.Layout => ({
    type: 'pattern',
    pattern: `${color ? '%[' : ''}[%d] [%p] %x{additional} ${color ? '%]' : ''}- %m`,
    tokens: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        additional: (logEvent: log4js.LoggingEvent & { additional?: string }) => {
            if (logEvent.additional) {
                return logEvent.additional;
            }
            const resArray: unknown[] = [];
            while ((logEvent.data?.[0] as unknown[])?.toString().startsWith('[')) {
                resArray.push(logEvent.data?.shift() ?? '');
            }
            Object.assign(logEvent, {
                additional: resArray.join(' ').trim()
            });
            return logEvent.additional;
        }
    }
});

log4js.configure({
    appenders: {
        console: {
            type: 'console',
            layout: getLogLayout(true)
        },
        file: {
            type: 'file',
            filename: './logs/TODO.log',  // TODO
            layout: getLogLayout(false)
        }
    },
    categories: { default: { appenders: ['console', 'file'], level: log4js.levels.ALL.levelStr } }
});

const logger = log4js.getLogger();
logger.level = log4js.levels.ALL;

export type Level = log4js.Level;

export class Logger {

    public static Debug(context: string, ...args: unknown[]): void {
        this.Log(log4js.levels.DEBUG, context, ...args);
    }
    public static Trace(context: string, ...args: unknown[]): void {
        this.Log(log4js.levels.TRACE, context, ...args);
    }

    public static Info(context: string, ...args: unknown[]): void {
        this.Log(log4js.levels.INFO, context, ...args);
    }

    public static Warn(context: string, ...args: unknown[]): void {
        this.Log(log4js.levels.WARN, context, ...args);
    }

    public static Error(context: string, ...args: unknown[]): void {
        this.Log(log4js.levels.ERROR, context, ...args);
    }

    public static Fatal(context: string, ...args: unknown[]): void {
        this.Log(log4js.levels.FATAL, context, ...args);
        process.exit(1);
    }

    public static Log(level: log4js.Level, context: string, ...args: unknown[]): void {
        logger.log(level, `[${context}]`, /* this.getCaller(),*/ ...args);
    }

    // private static getCaller(): string {
    //     const stackArray = new Error().stack?.split('\n');
    //     const func = stackArray?.[4]?.split('at ')[1]?.split(' (')[0];
    //     const caller = `${func || ''}`;
    //     return `[${caller || ''}]`;
    // }
}

export class ContextLogger {
    public constructor(private context: string) {
    }

    public debug( ...args: unknown[]): void {
        this.log(log4js.levels.DEBUG, this.context, ...args);
    }
    public trace( ...args: unknown[]): void {
        this.log(log4js.levels.TRACE, this.context, ...args);
    }

    public info( ...args: unknown[]): void {
        this.log(log4js.levels.INFO, this.context, ...args);
    }

    public warn( ...args: unknown[]): void {
        this.log(log4js.levels.WARN, this.context, ...args);
    }

    public error( ...args: unknown[]): void {
        this.log(log4js.levels.ERROR, this.context, ...args);
    }

    public fatal( ...args: unknown[]): void {
        this.log(log4js.levels.FATAL, this.context, ...args);
        process.exit(1);
    }
    public log(level: log4js.Level, ...args: unknown[]): void {
        logger.log(level, `[${this.context}]`, /* this.getCaller(),*/ ...args);
    }

}
