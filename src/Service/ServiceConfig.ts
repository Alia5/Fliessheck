import { ClassName } from '../util/types/util';
import { RequestHandler } from 'express';
import { Socket } from 'socket.io';
import { Controller } from './Controller';
import { DatabaseAdapter } from './DatabaseAdapter';
import { EventAdapter } from './EventAdapter';
import { HttpAdapter } from './HttpAdapter';


/**
 * @description Configuration for a service.
 * @typeParam T Controller class.
 */
export declare interface ServiceConfig<
    // eslint-disable-next-line @typescript-eslint/ban-types
    T extends Controller<EventAdapter<unknown, {}>|undefined, DatabaseAdapter|undefined>
> {
    controller: ClassName<T>;
    httpAdapter?: {
        adapter: ClassName<HttpAdapter<T, unknown>>;
        path: string;
        middlewares?: RequestHandler[];
    };
    eventAdapter?: {
        // eslint-disable-next-line @typescript-eslint/ban-types
        adapter: ClassName<EventAdapter<unknown, {}>>;
        disableLocalEmission?: boolean;
        middlewares?: ((socket: Socket, next: (err?: Error & { data?: unknown }) => void) => void)[];
    };
    databaseAdapter?: ClassName<DatabaseAdapter<unknown>>;
}
