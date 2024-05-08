
import { initServices } from '../../src/util/serviceInit';
import { Logger } from '../../src/util/logger';
import { default as cors } from 'cors';
import { default as express } from 'express';
import * as http from 'http';
import { Server as SocketIO } from 'socket.io';
import e2eTestServiceConfig from '../mocks/e2eTestService';
import { UnauthorizedError, NotFoundError, NotImplementedError } from '../../src/Error/HttpErrors';
import axios, { AxiosError } from 'axios';

// eslint-disable-next-line
type DefaultEventsMap = {};

const init = () => {

    const port = 3300;
    const expressApp = express();

    const httpServer = http.createServer(expressApp);
    const socketIo = new SocketIO<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>(httpServer, {
        serveClient: false,
        allowUpgrades: true,
        transports: ['websocket']
        // path: '/ws'
    });
    expressApp.use(cors());
    expressApp.use(express.urlencoded({ extended: false }));
    expressApp.use(express.json());

    initServices([e2eTestServiceConfig], expressApp, socketIo);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    expressApp.use((req, res, next) => {
        const err = new NotFoundError();
        res.status(err.code).send(err.toJSON());
    });
    httpServer.listen(port, () => {
        Logger.Info('HTTPserver', `Server listening on port ${port}`);
    });

    return httpServer;
};

let server: http.Server;
beforeAll( () => {
    server = init();
});

afterAll( () => {
    server.close();
});

test('httpAdapter should be avail on :3300/e2eTest', async () => {
    expect(server.listening).toBeTruthy();
    const requestPromise = axios.get('http://localhost:3300/e2eTest');
    await expect(requestPromise).resolves.toBeTruthy();
});

test('httpAdapter should return query params', async () => {
    const res = await axios.get('http://localhost:3300/e2eTest?foo=bar');
    expect(res.data).toEqual({ foo: 'bar' });
});

test('unknown path should yield 404', async () => {
    try {
        await expect(axios.get('http://localhost:3300/foo')).rejects.toThrow();
    } catch (err) {
        const error = err as AxiosError;
        expect(error.response?.status).toBe(404);
        expect({ ...(error.response?.data ?? {}) }).toStrictEqual(new NotFoundError().toJSON());
    }

});

test('correct path with not implemented method should yield NotImplemented', async () => {
    try {
        await axios.post('http://localhost:3300/e2eTest');
    } catch (err) {
        const error = err as AxiosError;
        expect(error.response?.status).toBe(new NotImplementedError().code);
        expect(error.response?.data).toEqual(new NotImplementedError().toJSON());
    }
});

test('should return I\'m a teapot on get /teapot', async () => {
    try {
        await axios.get('http://localhost:3300/e2eTest/teapot');
        fail('should throw');
    } catch (err) {
        const error = err as AxiosError;
        expect(error.response?.status).toBe(418);
        // eslint-disable-next-line
        expect((error.response?.data as any)?.message).toEqual('Im A Teapot');
    }
});

test('should return unauthorized on delete', async () => {
    try {
        await axios.delete('http://localhost:3300/e2eTest/teapot');
    } catch (err) {
        const error = err as AxiosError;
        expect(error.response?.status).toBe(401);
        expect(error.response?.data).toEqual(new UnauthorizedError().toJSON());
    }
});


