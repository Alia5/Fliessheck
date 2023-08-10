import {
    Secret,
    sign as jwtSign,
    verify as jwtVerify,
    decode as jwtDecode,
    SignOptions,
    VerifyOptions,
    Jwt,
    DecodeOptions
} from 'jsonwebtoken';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const randomSecret = (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    () => [...new Array(16)]
        .reduce(
            (acc: string) => acc += alphabet.charAt(Math.floor(Math.random() * alphabet.length)),
            '')
)();

const opts: {
    encodeSecret: Secret;
    decodeSecret: Secret;
    options?: SignOptions & VerifyOptions;
} = {
    encodeSecret: randomSecret,
    decodeSecret: randomSecret
};

export const setJwtSecrets = (encodeSecret: Secret, decodeSecret?: Secret): void => {
    opts.encodeSecret = encodeSecret;
    opts.decodeSecret = decodeSecret ?? encodeSecret;
};

export const setJwtOptions = (options: SignOptions & VerifyOptions): void => {
    opts.options = options;
};

export const signJwt = (payload: string|Record<string|number|symbol, unknown>|object|Buffer, options?: SignOptions): string =>
    jwtSign(payload, opts.encodeSecret, options ?? opts.options);
export const verifyJwt = <T>(token: string, options?: VerifyOptions): T extends undefined ? string|object|Jwt : Jwt['payload'] & T =>
    jwtVerify(token, opts.decodeSecret, options ?? opts.options) as T extends undefined ? string|object|Jwt : Jwt['payload'] & T;
export const decodeJwt = <T>(token: string, options?: DecodeOptions): T extends undefined ? Jwt|null : Jwt['payload'] & T =>
    jwtDecode(token, { ...(options ?? opts.options), complete: true }) as T extends undefined ? Jwt|null : Jwt['payload'] & T;
