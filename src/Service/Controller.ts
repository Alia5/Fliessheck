import { ContextLogger } from '../util/logger';

export abstract class Controller<EventAdapter = undefined, DatabaseAdapter = undefined> {
    protected logger: ContextLogger;
    public constructor(protected eventAdapter: EventAdapter, protected databaseAdapter: DatabaseAdapter) {
        this.logger = new ContextLogger(this.constructor.name);
    }
}
