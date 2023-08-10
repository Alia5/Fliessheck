import { ServiceConfig } from '../../../src/Service/ServiceConfig';
import { E2ETestController } from './E2ETestController';
import { E2ETestHttpAdapter } from './E2ETestHttpAdapter';

const config: ServiceConfig<E2ETestController> = {
    controller: E2ETestController,
    httpAdapter: {
        adapter: E2ETestHttpAdapter,
        path: 'e2eTest'
    }
};

export default config;
