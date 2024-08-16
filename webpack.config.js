const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/index.tsx',
    devtool: 'source-map',
    ignoreWarnings: [
        /Critical dependency: the request of a dependency is an expression/
    ],
    plugins: [
        new CopyPlugin({
            patterns: [
                "public"
            ],
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build'),
        clean: true
    },
    performance: {
        maxEntrypointSize: 5120000,
        maxAssetSize: 5120000
    }
};
