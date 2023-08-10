import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';
import { RequestHandler } from 'express';


export const readHeaders = (handler: (headers: IncomingHttpHeaders) => void|Promise<void>): RequestHandler => (req, res, next) => {
    void (async () => {
        try {
            await handler(req.headers);
            next();
        } catch (e) {
            next(e);
        }
    })();
};

export const writeHeaders = (headers: OutgoingHttpHeaders): RequestHandler =>
    (req, res, next) => {
        Object.entries(headers)
            .forEach(([k, v]) => v ? res.setHeader(k, v) : undefined);
        next();
    };
