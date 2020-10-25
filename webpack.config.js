const pkgJson = require("./package.json");
const path = require("path");
const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const clone = (...args) => Object.assign({}, ...args);
const env = process.env;
const runAnalyzer = !!env.ANALYZE;

const uglifyJsOptions = {
  screwIE8: true,
  stats: true,
  compress: {
    warnings: false,
  },
  mangle: {
    toplevel: true,
    eval: true,
  },
  sourceMap: true,
};

const baseConfig = {
  entry: "./src/pilot.js",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [path.resolve(__dirname, "node_modules")],
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};

function getPluginsForConfig(type) {
  const defineConstants = getConstantsForConfig(type);

  const plugins = [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin(defineConstants),
  ];

  if (runAnalyzer && !minify) {
    plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        reportFilename: `bundle-analyzer-report.${type}.html`,
      })
    );
  } else {
    // https://github.com/webpack-contrib/webpack-bundle-analyzer/issues/115
    plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
  }

  return plugins;
}

function getConstantsForConfig(type) {
  // By default the "main" dists (hls.js & hls.min.js) are full-featured.
  return {
    __VERSION__: JSON.stringify(pkgJson.version),
  };
}

const multiConfig = [
  {
    name: "debug",
    mode: "development",
    output: {
      filename: "pilot.js",
      chunkFilename: "[name].js",
      sourceMapFilename: "pilot.js.map",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/dist/",
      library: "Pilot",
      libraryTarget: "umd",
      libraryExport: "default",
    },
    optimization: {
      minimize: false,
    },
    plugins: getPluginsForConfig("main"),
    devtool: "source-map",
  },
  {
    name: "dist",
    mode: "production",
    output: {
      filename: "pilot.min.js",
      chunkFilename: "[name].js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/dist/",
      library: "Pilot",
      libraryTarget: "umd",
      libraryExport: "default",
    },
    optimization: {
      minimize: true,
    },
    plugins: getPluginsForConfig("main"),
  },
].map((config) => clone(baseConfig, config));

// multiConfig.push(demoConfig);

// webpack matches the --env arguments to a string; for example, --env.debug.min translates to { debug: true, min: true }
module.exports = () => {
  return multiConfig;
};
