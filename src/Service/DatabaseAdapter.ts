import { ContextLogger } from '../util/logger';

export abstract class DatabaseAdapter<DatasourceType = unknown> {
    protected logger: ContextLogger;
    public constructor(protected dataSource: DatasourceType) {
        this.logger = new ContextLogger(this.constructor.name);
    }
}
