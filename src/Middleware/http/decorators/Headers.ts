import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';
import { readHeaders, writeHeaders } from '../Headers';
import { Middleware } from './Middleware';


export const ReadHeaders = (handler: (headers: IncomingHttpHeaders) => void|Promise<void>) =>
    Middleware(readHeaders(handler));


export const WriteHeaders = (headers: OutgoingHttpHeaders) =>
    Middleware(writeHeaders(headers));
