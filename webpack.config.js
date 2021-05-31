const path = require("path")
const HtmlWebPackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const {
    AssetAttributesPlugin
} = require('@chipzhang/webpack-asset-attributes-plugin');

const assetAttributesPlugin = new AssetAttributesPlugin({
    scriptAttribs: {
        defer: true
    },
    styleAttribs: {
        defer: true
    },
})

module.exports = {
    entry: {
        main: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js'
    },
    mode: 'production',
    target: 'web',
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({}),
            new CssMinimizerPlugin()
        ]
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.html$/,
                use: [{
                    loader: "html-loader",
                    options: {
                        minimize: true
                    }
                }]
            },
            {
                // Loads images and fonts into CSS and JavaScript files in a base64 encoded URI
                test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf)$/,
                use: [{
                    loader: "url-loader"
                }]
            },
            {
                // SASS/SCSS to CSS
                test: /\.(sc|c)ss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            },
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/html/index.html",
            filename: "./index.html"
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
        assetAttributesPlugin
    ]
}