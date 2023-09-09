import { RequestHandler } from 'express';
import { verifyJwt } from '../../util';
import { UnauthorizedError } from '../../Error';
import { VerifyOptions } from 'jsonwebtoken';

export const jwtAuth = (options?: VerifyOptions): RequestHandler =>
    (req, res, next) => {
        const token = req.headers.authorization?.split(' ').pop();
        if (!token) {
            const err = new UnauthorizedError();
            res.status(err.code).send(err);
        } else {
            try {
                verifyJwt(token, options);
                next();
            } catch (e) {
                // eslint-disable-next-line
                const err = new UnauthorizedError(e ? `${e}` : undefined);
                res.status(err.code).send(err);
            }
        }
    };
