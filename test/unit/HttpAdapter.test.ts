/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/naming-convention */
import { QueryParams, HttpAdapter, IHttpAdapterReturn } from '../../src/Service/HttpAdapter';
import { ContextLogger } from '../../src/util/logger';
import { MockController } from '../mocks/MockController';
import { Controller } from '../../src/Service/Controller';


jest.mock('../../src/util/logger', () => ({
    ContextLogger: jest.fn().mockImplementation(() => ({
        debug: jest.fn(),
        trace: jest.fn()
    }))
}));

jest.mock('../mocks/MockController', () => ({
    MockController: jest.fn().mockImplementation(() => ({
        get: jest.fn()
    }))
}));


class EmptyHttpAdapter extends HttpAdapter<Controller, never> {
}

class MockHttpAdapter extends HttpAdapter<MockController, unknown> {

    public override find(query: QueryParams): IHttpAdapterReturn<unknown> {
        this.logger.debug('find', query);
        return query;
    }

    public override get(id: string, query: QueryParams): IHttpAdapterReturn<unknown> {
        this.logger.debug('find', id, query);
        this.controller.get();
        return { ...query, id };
    }

    public override create(query: QueryParams, data: unknown): IHttpAdapterReturn<unknown> {
        this.logger.debug('create', query, data);
        return { ...query, data };
    }

    public override update(id: string, query: QueryParams, data: unknown): IHttpAdapterReturn<unknown> {
        this.logger.debug('update', id, query, data);
        return { ...query, id, data };
    }

    public override delete(id: string, query: QueryParams): IHttpAdapterReturn<unknown> {
        this.logger.debug('delete', id, query);
        return { ...query, id };
    }

}

describe('EmptyHttpAdapter', () => {

    test('should be instantiable', () => {
        expect(() => new EmptyHttpAdapter({} as Controller)).not.toThrow();
    });

    test('should construct ContextLogger with className', () => {
        new EmptyHttpAdapter({} as Controller);
        expect(ContextLogger).toHaveBeenCalledWith('EmptyHttpAdapter');
    });

    test('should only have controller and logger', () => {
        const adapter = new EmptyHttpAdapter({} as Controller);
        expect(adapter).toHaveProperty('controller');
        expect(adapter).toHaveProperty('logger');
        expect(Object.keys(adapter)).toHaveLength(2);
    });

});

describe('MockHttpAdapter', () => {

    test('should be instantiable', () => {
        expect(() => new MockHttpAdapter(
            new MockController(undefined, undefined)
        )).not.toThrow();
    });

    test('should construct ContextLogger with className', () => {
        new MockHttpAdapter(new MockController(undefined, undefined));
        expect(ContextLogger).toHaveBeenCalledWith('MockHttpAdapter');
    });


    const adapter = new MockHttpAdapter(
        new MockController(undefined, undefined)
    );
    test('should log query with ContextLogger on find', () => {
        const query = { test: '1337' };
        adapter.find(query);
        expect((Reflect.get(adapter, 'logger') as ContextLogger).debug).toHaveBeenCalledWith('find', query);
    });

    test('should call MockController.get on get', () => {
        const query = { test: '1337' };
        const id = '1337';
        adapter.get(id, query);
        expect((Reflect.get(adapter, 'controller') as MockController).get).toHaveBeenCalled();
    });

});
