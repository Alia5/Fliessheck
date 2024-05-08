// my eslint-rules don't play nice with decorators, ouh well...

import { VerifyOptions } from 'jsonwebtoken';
import { jwtAuth } from '../Auth';
import { Middleware } from './Middleware';


export const JwtAuth = (options?: VerifyOptions) => Middleware(jwtAuth(options));
