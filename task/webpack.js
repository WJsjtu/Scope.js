var path = require('path'),
    webpack = require('webpack');

var definePlugin = new webpack.DefinePlugin({
    "process.env": {
        NODE_ENV: JSON.stringify('production')
    }
});

var compressPlugin = new webpack.optimize.UglifyJsPlugin({
    compress: {
        dead_code: true,
        drop_debugger: true,
        unused: true,
        if_return: true,
        warnings: false,
        join_vars: true
    },
    output: {
        comments: false
    }
});

var defaultOptions = {
    externals: {
        'jquery': 'jQuery',
        'Scope': 'Scope'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel'
        }, {
            test: /\.(less|css)$/, loader: 'style-loader!css-loader!less-loader'
        }, {
            test: /\.(tmpl|txt)$/, loader: 'raw-loader'
        }]
    }
};

module.exports = function (srcFile, distFile, compress, externals) {
    var options = Object.assign({}, defaultOptions, {
        entry: srcFile,
        output: {
            path: path.dirname(distFile),
            filename: path.basename(distFile)
        },
        externals: Object.assign({}, defaultOptions.externals, externals),
        plugins: compress ? [definePlugin, compressPlugin] : [definePlugin]
    });

    return new Promise(function (resolve, reject) {
        webpack(options, function (err, stats) {
            if (err) {
                reject(err);
            } else if (stats.compilation.errors.length) {
                var messages = [];
                stats.compilation.errors.forEach(function (e) {
                    messages.push(e.message);
                });
                reject(messages.join('\n'));
            } else {
                resolve();
            }
        });
    });
};