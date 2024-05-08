import { RequestHandler } from 'express';
import { HttpAdapter, IHttpAdapter } from '../../../Service/HttpAdapter';

// my eslint-rules don't play nice with decorators, ouh well...

export const Middleware = (middleware: RequestHandler) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    (target: HttpAdapter<any, any>, propertyKey: keyof Required<IHttpAdapter>, descriptor: PropertyDescriptor): void => {
        const middlewares = Reflect.get(target.constructor, 'Middlewares') as {
            [K in keyof Required<IHttpAdapter>]?: RequestHandler[];
        } ?? {};

        if (!middlewares[propertyKey]) {
            middlewares[propertyKey] = [];
        }
        // stupid typescript... loook at the block above!

        middlewares[propertyKey]!.push(middleware);

        Object.assign(target.constructor, { middlewares });
    };
