import { simpleRateLimit, SimpleRateLimitOptions } from '../SimpleRateLimit';
import { Middleware } from './Middleware';


export const SimpleRateLimit = (options?: SimpleRateLimitOptions) => Middleware(simpleRateLimit(options));
