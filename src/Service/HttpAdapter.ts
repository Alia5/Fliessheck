import { Express, RequestHandler } from 'express';
import { ContextLogger } from '../util';
import { OutgoingHttpHeaders } from 'http';
import { HttpStatusCode } from '../Middleware/http/status-codes';

export type ID = string | number;


export interface QueryParams {
    [key: string]: undefined | string | string[] | QueryParams | QueryParams[];
}
export interface URLParams { [key: string]: string|undefined }

export interface RequestParams {
    query: QueryParams;
    url: URLParams;
}

export type MaybePromiseLike<T> = T|PromiseLike<T>;
export type IHttpAdapterReturn<DataType> = MaybePromiseLike<DataType | DataType[]>;

export interface HeaderAccessor {
    get: (key?: string) => string|undefined;
    set: (headers: OutgoingHttpHeaders) => void;
}

export interface IHttpAdapter<DataType = undefined> {
    find?(params: RequestParams, header: HeaderAccessor): IHttpAdapterReturn<DataType>;
    get?(id: ID, params: RequestParams, header: HeaderAccessor): IHttpAdapterReturn<DataType>;
    create?(params: RequestParams, data: DataType | DataType[] | undefined, header: HeaderAccessor): IHttpAdapterReturn<DataType>;
    update?(id: ID, params: RequestParams, data: DataType | DataType[] | undefined, header: HeaderAccessor): IHttpAdapterReturn<DataType>;
    delete?(id: ID, params: RequestParams, header: HeaderAccessor): IHttpAdapterReturn<DataType>;
}

export abstract class HttpAdapter<Controller, DataType> implements IHttpAdapter<DataType> {
    private static Middlewares: {
        [K in keyof Required<IHttpAdapter>]?: RequestHandler[];
    } = {};
    protected logger: ContextLogger;
    public constructor(protected controller: Controller) {
        this.logger = new ContextLogger(this.constructor.name);
    }

    public find?(params: RequestParams, header: HeaderAccessor): IHttpAdapterReturn<DataType>;
    public get?(id: ID, params: RequestParams, header: HeaderAccessor): IHttpAdapterReturn<DataType>;
    public create?(
        params: RequestParams,
        data: DataType | DataType[] | undefined,
        header: HeaderAccessor
    ): IHttpAdapterReturn<DataType>;
    public update?(
        id: ID,
        params: RequestParams,
        data: DataType | DataType[] | undefined,
        header: HeaderAccessor
    ): IHttpAdapterReturn<DataType>;
    public delete?(id: ID, params: RequestParams, header: HeaderAccessor): IHttpAdapterReturn<DataType>;
}


export const ADAPTER_METHOD_CONFIG: { readonly [K in keyof Required<IHttpAdapter>]: {
    readonly METHOD: keyof Pick<Express, 'get' | 'post' | 'put' | 'delete'>;
    readonly EXTRA_PATH?: '/:id'; // TODO: MAYBE: make configurable
    readonly STATUS: HttpStatusCode;
} } = {
    find: {
        METHOD: 'get',
        STATUS: HttpStatusCode.OK
    },
    get: {
        METHOD: 'get',
        EXTRA_PATH: '/:id',
        STATUS: HttpStatusCode.OK
    },
    create: {
        METHOD: 'post',
        STATUS: HttpStatusCode.CREATED
    },
    update: {
        METHOD: 'put',
        EXTRA_PATH: '/:id',
        STATUS: HttpStatusCode.OK
    },
    delete: {
        METHOD: 'delete',
        EXTRA_PATH: '/:id',
        STATUS: HttpStatusCode.OK
    }
} as const;
