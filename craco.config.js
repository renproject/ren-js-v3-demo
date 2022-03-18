const webpack = require("webpack");

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            return {
                ...webpackConfig,
                resolve: {
                    ...webpackConfig.resolve,
                    fallback: {
                        "@solana/web3.js": require.resolve("@solana/web3.js"),
                        stream: require.resolve("stream-browserify"),
                        buffer: require.resolve("buffer"),
                    },
                },
                module: {
                    ...webpackConfig.module,
                    rules: [
                        ...webpackConfig.module.rules,
                        {
                            test: /\.mjsx?$/,
                            include: /node_modules/,
                            type: "javascript/auto",
                        },
                    ],
                },
                // @terra-money/terra.proto throwns a large number of soruce map
                // errors.
                ignoreWarnings: [/Failed to parse source map/],
                plugins: [
                    ...webpackConfig.plugins,
                    new webpack.ProvidePlugin({
                        Buffer: ["buffer", "Buffer"],
                    }),
                ],
            };
        },
    },
    style: {
        postcssOptions: {
            plugins: [require("tailwindcss"), require("autoprefixer")],
        },
    },
};
