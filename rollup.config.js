/* eslint-disable @typescript-eslint/no-unsafe-call */
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default [
    {
        input: 'src/index.ts',
        plugins: [
            typescript(),
            commonjs(),
            json(),
            resolve({
                preferBuiltins: true,
                browser: false
            })
        ],
        output: [
            {
                dir: 'dist.cjs',
                format: 'cjs',
                name: 'fliessheck',
                sourcemap: true
            }
        ]
    },
    {
        input: 'src/index.ts',
        plugins: [
            typescript(),
            commonjs(),
            json(),
            resolve({
                preferBuiltins: true,
                browser: false
            })
        ],
        output: [
            {
                dir: 'dist',
                format: 'es',
                name: 'fliessheck',
                sourcemap: true
            }
        ]
    }
];
