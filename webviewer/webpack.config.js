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
            mobile: true
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
            }
        }
    }

};
