import { ImATeapotError } from '../../../src/Error';
import { HttpAdapter, ID, QueryParams } from '../../../src/Service/HttpAdapter';
import { E2ETestController } from './E2ETestController';
import { Middleware } from '../../../src/Middleware/http/decorators/Middleware';
import { JwtAuth } from '../../../src/Middleware/http/decorators/Auth';

export class E2ETestHttpAdapter extends HttpAdapter<E2ETestController, unknown> {
    public override find(query: QueryParams) {
        return this.controller.get(query);
    }

    @Middleware((req, res, next) => {
        throw new ImATeapotError();
    })
    public override get(id: string, query: QueryParams) {
        this.logger.debug('get', id, query);
        return {};
    }

    @JwtAuth({
        algorithms: ['HS256']
    })
    public override delete(id: ID, query: QueryParams): unknown {
        this.logger.debug('delete', id, query);
        return {};
    }

}
