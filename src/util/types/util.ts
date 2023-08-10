// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T extends abstract new (...args: any) => any> = new (...args: ConstructorParameters<T>) => T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbstractClassName<T extends abstract new (...args: any) => any> =
abstract new (...args: ConstructorParameters<T>) => InstanceType<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassName<T> = new (...args: any[]) => T;

export interface Dict {
    [key: string]: Dict|string|number|boolean|undefined|unknown|ArrayLike<Dict|string|number|boolean|undefined|unknown>;
}

export type RequireKeys<T, K extends keyof T> = T[K] extends undefined
    ? never
    : { [Key in K]-?: T[Key] } & T;

export type KeysOfType<O, T> = {
    [K in keyof O]: O[K] extends T ? K : never;
}[keyof O];

export type Length<T> = T extends { length: infer L } ? L : never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Push<T extends unknown[], U> = T extends [...infer R] ? [...T, U] : never;

export type Filter<T extends unknown[], U> = T extends []
    ? []
    : T extends [infer F, ...infer R]
        ? F extends U
            ? Filter<R, U>
            : [F, ...Filter<R, U>]
        : never;

export type TupleIncludes<T extends unknown[], U> = Length<Filter<T, U>> extends Length<T>
    ? false
    : true;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type StringIncludes<S extends string, D extends string> = S extends `${infer T}${D}${infer U}` ? true : false;

export type Includes<T extends unknown[]|string, U> = T extends unknown[]
    ? TupleIncludes<T, U>
    : T extends string
        ? U extends string
            ? StringIncludes<T, U>
            : never
        : never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type StartsWith<T extends string, U extends string> = T extends `${U}${infer V}` ? true : false;

export type StripPropsFromClass<T> = {
    [K in KeysOfType<T, (...p: unknown[]) => unknown>]: T[K]
};

export type OneOf<T, Strict extends boolean = true> = {
    [OuterKey in keyof T]: Strict extends false
        ? { [K in OuterKey]: T[K] }
        : { [InnerKey in OuterKey|keyof T]?: InnerKey extends OuterKey ? T[OuterKey] : never } & { [TheKey in OuterKey]: T[OuterKey] }
}[keyof T];

// Does this use a Bug in Typescript?
export type Keys<T> = T extends object ? keyof T : never;
export type MergeUnion<T> = {
    [K in Keys<T>]: T extends object
        ? K extends keyof T
            ? T[K]
            : never
        : never
};

