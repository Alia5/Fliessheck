import { Controller } from '../../src/Service/Controller';


export class MockController extends Controller {

    public get() {
        return {
            test: '1337'
        };
    }

}
