import { simpleRateLimit, SimpleRateLimitOptions } from '../SimpleRateLimit';
import { Middleware } from './Middleware';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SimpleRateLimit = (options?: SimpleRateLimitOptions) => Middleware(simpleRateLimit(options));
