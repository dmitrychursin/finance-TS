const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");


module.exports = {
	entry: './src/app.ts',
	mode: "development",
	devtool: 'inline-source-map',
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},

	devServer: {
		static: '.dist',
		compress: true,
		port: 9000,
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./index.html"
		}),
		new CopyPlugin({
			patterns: [
				{ from: "templates", to: "templates" },
				{ from: "styles", to: "styles" },
				{ from: "static/fonts", to: "fonts" },
				{ from: "static/images", to: "images" },

			],
		}),
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.(scss)$/,
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader'
					},
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: () => [
									require('autoprefixer')
								]
							}
						}
					},
					{
						loader: 'sass-loader'
					}
				]
			}
		],
	}


	// module: {
	//     rules: [
	//         {
	//             test: /\.js$/,
	//             exclude: /node_modules/,
	//             use: {
	//                 loader: 'babel-loader',
	//                 options: {
	//                     presets: ['@babel/preset-env']
	//                 }
	//             }
	//         }
	//     ]
	// }

};