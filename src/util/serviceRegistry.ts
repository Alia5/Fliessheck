import { Controller } from 'src/Service';
import { ClassName } from './types/util';

export class ServiceRegistry {

    private static Services: Record<string, Controller> = {};

    public static Get<T extends Controller>(controllerClass: ClassName<T>): InstanceType<ClassName<T>>|undefined {
        return this.Services[controllerClass.constructor.name] as InstanceType<ClassName<T>>;
    }

}
