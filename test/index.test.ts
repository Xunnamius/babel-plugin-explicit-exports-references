import pluginTester from 'babel-plugin-tester'
import plugin from '../src/index'
import { join as makePath } from 'path'

const babelOptions = {
    parserOpts: { strictMode: true },
    plugins: [
        '@babel/plugin-proposal-export-default-from',
        '@babel/plugin-proposal-function-bind',
        '@babel/plugin-transform-typescript',
    ],
    presets: [
        ['@babel/preset-env', {
            // ? https://github.com/babel/babel-loader/issues/521#issuecomment-441466991
            modules: false,
            // ? https://nodejs.org/en/about/releases
            targets: { node: '10.13.0' }
        }],
        ['@babel/preset-typescript', { allowDeclareFields: true }],
    ]
};

pluginTester({
    plugin,
    babelOptions,
    fixtures: makePath(__dirname, '__fixtures__'),
});
