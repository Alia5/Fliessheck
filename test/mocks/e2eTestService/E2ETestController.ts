import { Controller } from '../../../src/Service/Controller';

export class E2ETestController extends Controller {
    public get(p: unknown) {
        this.logger.debug('get', p);
        return p;
    }

    public onMeh(p: unknown) {
        this.logger.debug('onMeh', p);
    }
}
