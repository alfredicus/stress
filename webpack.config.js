const path = require('path');
const webpack = require('webpack');
const pkg = require('./package.json');
const ROOT = path.resolve(__dirname, 'src');
const DESTINATION = path.resolve(__dirname, 'dist');

module.exports = {
    context: ROOT,
    mode: "development",
    entry: {
        'main': './index.ts'
    },
    output: {
        path: DESTINATION,
        libraryTarget: 'umd',
        umdNamedDefine: true,
        library: pkg.name,
        filename: pkg.name + ".js",
        globalObject: `(typeof self !== 'undefined' ? self : this)`,
        devtoolModuleFilenameTemplate: (info) => {
            return `file:///${info.absoluteResourcePath.replace(/\\/g, '/')}`;
        }
    },
    resolve: {
        extensions: ['.ts', 'tsx', '.js'],
        modules: [
            ROOT,
            'node_modules'
        ]
    },
    externals: [{
        '@youwol/dataframe': "@youwol/dataframe",
        '@youwol/math': "@youwol/math"
    }],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    { loader: 'ts-loader' },
                ],
                exclude: /node_modules/,
            }
        ],
    },
    devtool: 'source-map'
};