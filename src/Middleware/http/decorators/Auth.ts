// my eslint-rules don't play nice with decorators, ouh well...

import { VerifyOptions } from 'jsonwebtoken';
import { jwtAuth } from '../Auth';
import { Middleware } from './Middleware';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const JwtAuth = (options?: VerifyOptions) => Middleware(jwtAuth(options));
