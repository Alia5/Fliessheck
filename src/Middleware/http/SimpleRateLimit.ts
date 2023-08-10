import { Request, RequestHandler } from 'express';
import { TooManyRequestsError } from '../../Error/HttpErrors';
import { Logger } from '../../util/logger';


export interface SimpleRateLimitOptions {
    max: number;
    clearAfterSeconds: number;
    condition?: ((req: Request, count: number, lastRequest: Date) => string|undefined|Promise<string|undefined>);
}

type IpMap = {
    [K in string]: {
        count: number;
        lastRequest: Date;
        timeout: NodeJS.Timeout;
    }
};
const cleanUpFn = (config: SimpleRateLimitOptions, ipMap: IpMap) => () => {
    Object.entries(ipMap).forEach(([ip, { lastRequest }]) => {
        if (Date.now() - lastRequest.getTime() > config.clearAfterSeconds * 1000) {
            delete ipMap[ip];
        }
    });
};

export const simpleRateLimit = (
    config: SimpleRateLimitOptions = {
        max: 50,
        clearAfterSeconds: 3
    }
): RequestHandler => {
    const ipMap: IpMap = {};
    return (req, res, next) => {
        const ip = req.ip;
        if (ipMap[ip] === undefined) {
            ipMap[ip] = {
                count: 0,
                lastRequest: new Date(),
                timeout: setTimeout(cleanUpFn(config, ipMap), config.clearAfterSeconds * 1000)
            };
        } else {
            clearTimeout(ipMap[ip].timeout);
            ipMap[ip] = {
                count: ipMap[ip].count+1,
                lastRequest: new Date(),
                timeout: setTimeout(cleanUpFn(config, ipMap), config.clearAfterSeconds * 1000)
            };
            if (config.condition) {
                void (async () => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const message = await config.condition!(req, ipMap[ip].count, ipMap[ip].lastRequest);
                    if (message !== undefined) {
                        const err = new TooManyRequestsError(message);
                        Logger.Error('SimpleRateLimit', 'TooManyRequests', message, err.stack);
                        throw err;
                    }
                })();
            } else if (ipMap[ip].count > config.max) {
                const err = new TooManyRequestsError();
                Logger.Error('SimpleRateLimit', 'TooManyRequests', err.stack);
                throw err;
            }

        }
        next();
    };
};
