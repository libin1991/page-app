const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const baseConfig = {
    entry: {
        main: './src/index.js'
    },
    output: {
        filename: './js/[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader"
            }
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'page app',
            template: './src/index.html',
            inject: 'body'
        }),
        new CopyWebpackPlugin([{
            from: './src/assets/',
            to: './assets/'
        }])
    ]
};

module.exports = (env, argv) => {
    let {
        module: {
            rules
        },
        plugins
    } = baseConfig
    let config = null
    // dev config
    if (argv.mode === 'development') {
        config = {

            devtool: 'cheap-module-eval-source-map',

            devServer: {
                contentBase: path.resolve(__dirname, './dist'),
                host: 'localhost',
                port: 8080,
                open: true,
                // inline: true,
                // proxy: default proxy url
                // quiet: true
                clientLogLevel: "none",
            },

            module: {
                rules: [
                    ...rules,
                    {
                        test: /\.css$/,
                        use: ['style-loader', 'css-loader']
                    }
                ]
            },

            plugins: [
                ...plugins
            ]
        }
    } else if (argv.mode === 'production') {
        // production config
        config = {
            devtool: '#source-map',

            module: {
                rules: [{
                        test: /\.css$/,
                        use: [{
                                loader: MiniCssExtractPlugin.loader,
                            },
                            "css-loader"
                        ]
                    },
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: {
                            loader: "babel-loader"
                        }
                    }
                ]
            },

            plugins: [
                new CleanWebpackPlugin(["dist"], {
                    root: __dirname
                }),
                ...plugins,
                new MiniCssExtractPlugin({
                    filename: "/css/[name].css",
                    chunkFilename: "/css/[id].css"
                })
            ],

            optimization: {
                splitChunks: {
                    chunks: "all",
                    minSize: 30000,
                    minChunks: 1,
                    maxAsyncRequests: 5,
                    maxInitialRequests: 3,
                    automaticNameDelimiter: '.',
                    name: true,
                    cacheGroups: {
                        vendors: {
                            test: /[\\/]node_modules[\\/]/,
                            priority: -10
                        },
                        default: {
                            minChunks: 2,
                            priority: -20,
                            reuseExistingChunk: true
                        }
                    }
                },
                minimizer: [
                    new UglifyJsPlugin({
                        cache: true,
                        parallel: true,
                        sourceMap: true // set to true if you want JS source maps
                    }),
                    new OptimizeCSSAssetsPlugin({})
                ]
            },
        }
    }

    config = Object.assign({}, baseConfig, config);

    return config;
};