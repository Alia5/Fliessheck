/* eslint-disable @typescript-eslint/naming-convention */
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.(j|t)s', '**/*.spec.(j|t)s'],
    transform: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }]
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    collectCoverage: true,
    coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/test/'],
    automock: false,
    transformIgnorePatterns: ['/(?!axios)/']
};
