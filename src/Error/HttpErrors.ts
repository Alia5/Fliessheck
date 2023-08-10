import { StatusCodes as HttpStatusCode } from 'http-status-codes';
import { toSpaced } from '../util/utils';

export class HttpError extends Error {
    public constructor(public code: HttpStatusCode, message?: string) {
        super(message);
        this.name = this.constructor.name;
        // only required if target < ES2015
        // Object.setPrototypeOf(this, new.target.prototype);
    }

    public toJSON(): object {
        return {
            ...{
                code: this.code,
                name: this.name
            },
            ...(
                this.message
                    ? { message: this.message }
                    : { message: toSpaced(this.name.replace(/Error$/g, '')) }
            )
        };
    }

}

export class InternalServerError extends HttpError {
    public constructor(message?: string) {
        super(HttpStatusCode.INTERNAL_SERVER_ERROR, message);
    }
}

export class NotFoundError extends HttpError {
    public constructor(message?: string) {
        super(HttpStatusCode.NOT_FOUND, message);
    }
}
export class BadRequestError extends HttpError {
    public constructor(message?: string) {
        super(HttpStatusCode.BAD_REQUEST, message);
    }
}

export class UnauthorizedError extends HttpError {
    public constructor(message?: string) {
        super(HttpStatusCode.UNAUTHORIZED, message);
    }
}

export class ForbiddenError extends HttpError {
    public constructor(message?: string) {
        super(HttpStatusCode.FORBIDDEN, message);
    }
}

export class ConflictError extends HttpError {
    public constructor(message?: string) {
        super(HttpStatusCode.CONFLICT, message);
    }
}

export class ImATeapotError extends HttpError {
    public constructor(message?: string) {
        super(HttpStatusCode.IM_A_TEAPOT, message);
    }
}

export class UnprocessableEntityError extends HttpError {
    public constructor(message?: string) {
        super(HttpStatusCode.UNPROCESSABLE_ENTITY, message);
    }
}

export class TooManyRequestsError extends HttpError {
    public constructor(message?: string) {
        super(HttpStatusCode.TOO_MANY_REQUESTS, message);
    }
}

export class LockedError extends HttpError {
    public constructor(message?: string) {
        super(HttpStatusCode.LOCKED, message);
    }
}

export class ServiceUnavailableError extends HttpError {
    public constructor(message?: string) {
        super(HttpStatusCode.SERVICE_UNAVAILABLE, message);
    }
}

export class NotImplementedError extends HttpError {
    public constructor(message?: string) {
        super(HttpStatusCode.NOT_IMPLEMENTED, message);
    }
}


export class GatewayTimeoutError extends HttpError {
    public constructor(message?: string) {
        super(HttpStatusCode.GATEWAY_TIMEOUT, message);
    }
}

export class UnsupportedMediaTypeError extends HttpError {
    public constructor(message?: string) {
        super(HttpStatusCode.UNSUPPORTED_MEDIA_TYPE, message);
    }
}
