import path from 'path'
import HtmlWebPackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'

import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const configBuild = {
    entry: {
        main: './src/index.ts',
    },
    resolve: {
        extensions: ['.ts'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js',
        assetModuleFilename: 'assets/[name][ext]',
        clean: true,
        hashFunction: 'sha256',
    },
    mode: 'production',
    target: 'web',
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({}), new CssMinimizerPlugin()],
    },
    performance: {
        hints: false,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname, 'src')],
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            minimize: true,
                        },
                    },
                ],
            },
            {
                // Store as files
                test: /\.(png|jpg)$/,
                type: 'asset/resource',
            },
            {
                // Loads vector and fonts in a base64 encoded URI
                test: /\.(svg|woff|woff2|eot|ttf)$/,
                type: 'asset/inline',
            },
            {
                // SASS/SCSS to CSS
                test: /\.s?css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: './src/views/index.ejs',
            filename: './index.html',
            inject: false,
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
        new CopyPlugin({
            patterns: [
                { from: 'src/assets/data', to: 'data/' },
                { from: 'src/assets/pages', to: './' },
            ],
        }),
    ],
}

export default configBuild
