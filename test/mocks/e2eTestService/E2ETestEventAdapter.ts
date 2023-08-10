import { EventAdapter, MaybeSocketId, Receive } from '../../../src/Service/EventAdapter';
import { E2ETestController } from './E2ETestController';

declare module '../../../src/Service/EventAdapter' {
    interface AdapterRegistration {
        e2eTestEventAdapter: E2ETestEventAdapter;
    }
}

export class E2ETestEventAdapter extends EventAdapter<E2ETestController, {
    meh: unknown;
}> {
    public emitMeh(p: unknown) {
        this.emit('meh', p);
    }

    @Receive('meh')
    public onMeh(socketId: MaybeSocketId, p: unknown) {
        this.logger.debug('meh', p);
        this.controller.onMeh(p);
    }

}
