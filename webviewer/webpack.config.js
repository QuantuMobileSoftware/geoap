const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./src/index.js",

    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist")
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: require("html-webpack-template"),
            title: "Webviewer • SIP",
            hash: true,
            mobile: true,
            links: [
                {
                    href: "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css",
                    rel: "stylesheet",
                    integrity: "sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==",
                    crossorigin: ""
                }
            ],
            scripts: [
                {
                    src: "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js",
                    integrity: "sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==",
                    crossorigin: ""
                }
            ]
        })
    ],

    devtool: "inline-source-map",

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            },
            {
                test: /\.css$/,
                use: [{ loader: "style-loader" }, { loader: "css-loader" }]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    "file-loader"
                ]
            }
        ]
    },

    devServer: {
        historyApiFallback: true,
        port: 3000,
        proxy: {
            "/api": {
                target: "http://webserver:9000",
                secure: false
            },
            "/results": {
                target: "http://webserver:9000",
                secure: false
            },
            "/tiles": {
                target: "http://webserver:9000",
                secure: false
            }
        }
    }

};
