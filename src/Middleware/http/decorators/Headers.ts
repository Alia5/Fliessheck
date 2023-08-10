import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';
import { readHeaders, writeHeaders } from '../Headers';
import { Middleware } from './Middleware';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ReadHeaders = (handler: (headers: IncomingHttpHeaders) => void|Promise<void>) =>
    Middleware(readHeaders(handler));

// eslint-disable-next-line @typescript-eslint/naming-convention
export const WriteHeaders = (headers: OutgoingHttpHeaders) =>
    Middleware(writeHeaders(headers));
