import { Server as SocketIO } from 'socket.io';
import { EventEmitter } from 'events';
import { ContextLogger } from '../util/logger';
import { MergeUnion } from '../util/types/util';

type EmittableEvents = {
    [K in symbol]: [...unknown[]]
};

export interface AdapterRegistration {
    [K: symbol]: EventAdapter;
}

export interface Rooms {
    [K: symbol]: typeof K;
}

export type RegisteredRooms = Exclude<Rooms[keyof Rooms], symbol>|string;

export type SocketId = string;
export type MaybeSocketId = SocketId|undefined;

type StripEmptyAdapter<A> = A extends EventAdapter<undefined> ? never : A;
export type EventsOfAdapter<A> = A extends EventAdapter<unknown, infer E> ? E extends undefined ? never : E : never;
export type RegisteredEvents = MergeUnion<EventsOfAdapter<StripEmptyAdapter<AdapterRegistration[keyof AdapterRegistration]>>>;

export type RegisteredEventNames = keyof RegisteredEvents;

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export type EventReceiver<T extends {[K in string]: [...any]}= {}> = Partial<MergeUnion<{
    [K in keyof RegisteredEvents|keyof T]: {
        [IK in `on${Capitalize<K extends string ? K : never>}`]: (
            socket: MaybeSocketId,
            ...args: [...( K extends keyof RegisteredEvents ? RegisteredEvents[K] : T[K])]
        ) => void
    }
}[keyof RegisteredEvents | keyof T]>>;

// my eslint-rules don't play nice with decorators, ouh well...
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Receive = <T extends RegisteredEventNames|string>(
    value: T
) => (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: (EventAdapter<unknown, {}>),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    propertyKey: `on${Capitalize<T>}`,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    descriptor: PropertyDescriptor
) => {
    Object.assign(target, { receiving: [...((target as unknown as { receiving?: string[] }).receiving||[]), value] });
};


export abstract class EventAdapter<
    Controller = unknown,
    Emittable extends EmittableEvents|undefined = undefined,
> {

    // stupid typescript workaround to correctly infer TypeParam
    // mark private so that no access can occur.
    #emittable!: Emittable;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected readonly controller!: Controller;
    private socketIo!: SocketIO|undefined;
    private localEmitter!: EventEmitter|undefined;

    private receiving: string[] = [];

    protected logger: ContextLogger;

    public constructor() {
        this.receiving = (
            (this.constructor.prototype as { receiving?: string[] })
                ?.receiving || []
        );
        this.logger = new ContextLogger(this.constructor.name);
    }
    public getReceivingEvents(): string[] {
        return [...this.receiving];
    }


    private emitInternal(
        roomOrSockets: MaybeSocketId|MaybeSocketId[]|RegisteredRooms|RegisteredRooms[]|undefined,
        event: string,
        ...data: unknown[]): void {
        if (!this.socketIo) {
            throw new Error('No SocketIo Server');
        }
        if (!roomOrSockets) {
            this.socketIo.emit(event, ...data);
            this.localEmitter?.emit(event, this.constructor.name, ...data);
        } else {
            this.socketIo.to(roomOrSockets as string).emit(event, ...data);
        }
    }

    public joinRoom(socketId: SocketId, room: RegisteredRooms): void {
        if (!this.socketIo) {
            throw new Error('No SocketIo Server');
        }
        this.socketIo.in(socketId).socketsJoin(room);
    }

    public leaveRoom(socketId: SocketId, room: RegisteredRooms): void {
        if (!this.socketIo) {
            throw new Error('No SocketIo Server');
        }
        this.socketIo.in(socketId).socketsLeave(room);
    }

    protected emit<
        E extends keyof Emittable,
    >(
        event: E,
        ...data: Emittable extends EmittableEvents ? Emittable[E] : never
    ): void {
        this.emitInternal(undefined, event.toString(), ...data);
    }

    protected emitTo<
        E extends keyof Emittable,
    >(
        roomOrSockets: MaybeSocketId|MaybeSocketId[]|RegisteredRooms|RegisteredRooms[],
        event: E,
        ...data: Emittable extends EmittableEvents ? Emittable[E] : never
    ): void {
        this.emitInternal(roomOrSockets, event.toString(), ...data);
    }

}
