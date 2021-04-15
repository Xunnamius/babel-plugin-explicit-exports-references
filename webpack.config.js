// This webpack config is only used for compiling the scripts under
// external-scripts/ and helping transpile src/ => dist/ as dual CJS2+ES2015

const nodeExternals = require('webpack-node-externals');

module.exports = {
    name: 'main',
    mode: 'production',
    target: 'node',
    node: false,

    entry: `${__dirname}/src/index.ts`,

    output: {
        filename: 'index.js',
        path: `${__dirname}/dist`,
        libraryTarget: 'commonjs2',
    },

    externals: [nodeExternals()],

    stats: {
        orphanModules: true,
        providedExports: true,
        usedExports: true,
    },

    resolve: { extensions: ['.ts', '.wasm', '.mjs', '.cjs', '.js', '.json'] },
    module: { rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }] },
    optimization: { usedExports: true },
    ignoreWarnings: [/critical dependency:/i],
};
