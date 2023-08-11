import { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import { Server as SocketIO, Socket } from 'socket.io';
import { EventEmitter } from 'events';
import { Logger } from './logger';
import { RequireKeys } from './types/util';
import { trimDoubles, capitalize, hasField } from './utils';
import { HttpError, InternalServerError, NotImplementedError } from '../Error/HttpErrors';
import { Controller } from '../Service/Controller';
import { EventAdapter, RegisteredEventNames } from '../Service/EventAdapter';
import { IHttpAdapter, ADAPTER_METHOD_CONFIG } from '../Service/HttpAdapter';
import { ServiceConfig } from '../Service/ServiceConfig';
import { OutgoingHttpHeaders } from 'http';

const socketOnConnectCallbacks: ((socket: Socket) => void|Promise<void>)[] = [];
const socketOnDisconnectCallbacks: ((socket: Socket) => void|Promise<void>)[] = [];


export const registerSocketConnectionCallbacks = (callbacks: {
    onConnect?: (socket: Socket) => void|Promise<void>;
    onDisconnect?: (socket: Socket) => void|Promise<void>;
}) => {
    if (callbacks.onConnect) {
        socketOnConnectCallbacks.push(callbacks.onConnect);
    }
    if (callbacks.onDisconnect) {
        socketOnDisconnectCallbacks.push(callbacks.onDisconnect);
    }
};

const initHttpAdapter = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    httpAdapterConf: RequireKeys<ServiceConfig<Controller<any, any>>, 'httpAdapter'>['httpAdapter'],
    controller: Controller,
    expressApp: Express
): void => {
    const httpAdapter = new httpAdapterConf.adapter(controller) as {
        [K in keyof IHttpAdapter]: (...args: unknown[]) => Promise<unknown>
    };
    const availableMethods = Object.entries(ADAPTER_METHOD_CONFIG)
        .filter(([adapterMethod]) =>
            !!httpAdapter[adapterMethod as keyof typeof ADAPTER_METHOD_CONFIG]
        );
    const notImplementedMethods = Object.entries(ADAPTER_METHOD_CONFIG)
        .filter(([adapterMethod]) =>
            !httpAdapter[adapterMethod as keyof typeof ADAPTER_METHOD_CONFIG]
        );
    httpAdapterConf.middlewares?.forEach((middleware) => {
        expressApp.use(trimDoubles(`/${httpAdapterConf.path}/*` || '', '/'), middleware);
    });
    availableMethods.forEach(
        ([adapterMethod, expressOpts]) =>
        {
            const path = trimDoubles(`/${httpAdapterConf.path}/${expressOpts.EXTRA_PATH || ''}`, '/');
            // eslint-disable-next-line
            Reflect.get(httpAdapterConf.adapter, 'middlewares')?.[adapterMethod]
                ?.forEach((middleware: RequestHandler) => {
                    expressApp[expressOpts.METHOD](path, middleware);
                });

            expressApp[expressOpts.METHOD](
                path,
                (req, res, next) => {
                    const args: unknown[] = [
                        // TODO: create mapping if ExtraPath gets made configurable
                        expressOpts.EXTRA_PATH ? req.params.id : undefined,
                        req.query,
                        expressOpts.METHOD === 'post' || expressOpts.METHOD === 'put' ? req.body : undefined,
                        {
                            get: (key?: string) => key ? req.headers[key.toLowerCase()] : req.headers,
                            set: (headers: OutgoingHttpHeaders) => {
                                Object.entries(headers).forEach(([k, v]) =>
                                    v ? res.setHeader(k, v): undefined
                                );
                            }
                        }
                    ].filter((arg) => arg !== undefined);

                    // allow non-null-assertion; check is made by filter above.
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const adapterFunc = httpAdapter[adapterMethod as keyof typeof ADAPTER_METHOD_CONFIG]!.bind(httpAdapter);
                    if ((adapterFunc as unknown as Record<string, unknown>).then) {
                        adapterFunc(...args)
                            .then((adapterRes) => {
                                res.status(expressOpts.STATUS).send(adapterRes);
                            })
                            .catch((adapterErr: Error|HttpError) => {
                                next(adapterErr);
                            });
                    } else {
                        void (async () => {
                            try {
                                const adapterRes = adapterFunc(...args);
                                if ((adapterRes as unknown as Record<string, unknown>).then) {
                                    res.status(expressOpts.STATUS).send(await adapterRes);
                                } else {
                                    res.status(expressOpts.STATUS).send(adapterRes);
                                }
                            } catch (e) {
                                Logger.Error(httpAdapter.constructor.name,
                                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                    (e as Error)?.stack ? (e as Error).stack : e);
                                next(e);
                            }
                        })();
                    }
                }
            );
        }
    );
    notImplementedMethods.forEach(([, expressOpts]) => {
        expressApp[expressOpts.METHOD](
            trimDoubles(`/${httpAdapterConf.path}/${expressOpts.EXTRA_PATH || ''}`, '/'),
            (req, res) => {
                const err = new NotImplementedError();
                res.status(err.code).send(err);
            }
        );
    });
};

// eslint-disable-next-line @typescript-eslint/ban-types
const initSocketIO = (adapters: EventAdapter<unknown, {}>[], io: SocketIO): void => {
    const allReceivingEvents = adapters.flatMap(
        (adapter) => (adapter.getReceivingEvents() as RegisteredEventNames[])
            .flatMap((eventName) => eventName)
    );

    const receiver = (
        socket: Socket|undefined,
        eventName: typeof allReceivingEvents[number]
    ) =>
        (...args: unknown[]) => {
            adapters.filter((adapter) =>
            // eslint-disable-next-line
                !!(adapter as any)[`on${capitalize(eventName as string)}`]
            ).map(async (adapter) => {
                try {
                    // eslint-disable-next-line
                    await (adapter as any)[`on${capitalize(eventName as string)}`]?.(socket?.id, ...args as never[]); // disabling type checking is the only option...??? fuck that.
                } catch (e) {
                    Logger.Error(adapter.constructor.name, hasField(e, 'stack') ? e.stack : e);
                    if (e instanceof HttpError) {
                        socket?.emit('error', eventName, e);
                    } else {
                        const err = new InternalServerError(e?.toString());
                        socket?.emit('error', eventName, err);
                    }
                }
            });
        };

    io.on('connection', (socket) => {
        Logger.Debug('SocketIO', 'Socket connected', socket.id, JSON.stringify(socket.handshake.query));
        socketOnConnectCallbacks.forEach((callback) => void callback(socket));
        allReceivingEvents.forEach((eventName) => {
            socket.on(eventName as string, receiver(socket, eventName));
        });
        socket.on('disconnect', (reason) => {
            Logger.Debug('SocketIO', 'Socket disconnected', socket.id, reason);
            socketOnDisconnectCallbacks.forEach((callback) => void callback(socket));
        });
    });
    allReceivingEvents.forEach((eventName) => {

        adapters.forEach((adapter) => {
            (adapter as unknown as {localEmitter?: EventEmitter}).localEmitter
                ?.on(eventName as string, (senderClass: string, ...args: unknown[]) => {
                    // protect against receiving self-emitted events
                    if (adapter.constructor.name !== senderClass) {
                        receiver(undefined, eventName)(...args);
                    }
                });
        });

        io.on(eventName as string, receiver(undefined, eventName));
    });
};

export const initServices = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    services: ServiceConfig<Controller<any, any>>[],
    expressApp: Express,
    io?: SocketIO,
    dbDataSource?: unknown
) => {
    Logger.Debug('ServiceInit', `Initializing ${services.length} services`);
    // eslint-disable-next-line @typescript-eslint/ban-types
    const eventAdapters: EventAdapter<unknown, {}>[] = [];
    services.forEach((serviceConf) => {
        const servicePath = serviceConf.httpAdapter?.path;
        Logger.Info(
            'ServiceInit',
            `Loading ${serviceConf.controller.name} ${servicePath ? `on /${servicePath}` : ''}...`
        );
        const eventAdapter = serviceConf.eventAdapter ? new serviceConf.eventAdapter.adapter() : undefined;
        const databaseAdapter = serviceConf.databaseAdapter ? new serviceConf.databaseAdapter(dbDataSource) : undefined;
        const controller = new serviceConf.controller(eventAdapter, databaseAdapter);
        if (eventAdapter) {
            if (!io) {
                Logger.Fatal('ServiceInit', 'Cannot use EventAdapters without SocketIO');
                return;
            }
            serviceConf.eventAdapter?.middlewares?.forEach((middleware) => {
                io.use(middleware);
            });
            Object.assign(eventAdapter, {
                controller,
                socketIo: io,
                localEmitter: serviceConf.eventAdapter?.disableLocalEmission ? undefined : new EventEmitter()
            });
            eventAdapters.push(eventAdapter);
        }
        if (serviceConf.httpAdapter) {
            initHttpAdapter(serviceConf.httpAdapter, controller as Controller, expressApp);
        }
    });
    if (io) {
        initSocketIO(eventAdapters, io);
    }
    // error handler always needs 4 params
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    expressApp.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
        if (err instanceof HttpError) {
            res.status(err.code).send(err);
        } else {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            const error = new InternalServerError(err ? `${err}` : undefined);
            res.status(error.code).send(error);
        }
    });
};

