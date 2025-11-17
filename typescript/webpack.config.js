const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
    entry: path.resolve(appDirectory, "website/pages/app.ts"), //path to the main .ts file
    output: {
        filename: "js/game.js", //name for the javascript file that is created/compiled in memory
		clean: true,
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
	devServer: {
		host: "0.0.0.0",
		port: 8080,
		static: path.resolve(appDirectory, "webstite/pages"),
		hot: true,
		devMiddleware: {
			publicPath: "/",
		}
	},
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
	plugins: [
		new HtmlWebpackPlugin({
			inject: true,
			template: path.resolve(appDirectory, "website/pages/index.html"),
		})
	],
    mode: "development",
};