var path = require('path'),
    webpack = require('webpack');

const webpackTask = function (options) {
    webpack(options, function (err, stats) {
        if (err) {
            console.error(err);
        } else if (stats.compilation.errors.length) {
            var messages = [];
            stats.compilation.errors.forEach(function (e) {
                messages.push(e.message);
            });
            console.error(messages.join('\n'));
        }
    });
};

const getOptions = function (srcFile, targetFile, plugins, external) {
    return {
        entry: path.join(__dirname, srcFile),
        output: {
            path: path.join(__dirname, 'build/'),
            filename: targetFile
        },
        externals: Object.assign(external, {
            'jquery': 'jQuery'
        }),
        plugins: plugins,
        module: {
            loaders: [{
                test: /\.js$/,
                loader: 'babel'
            }]
        }
    };
};

const uglifyPlugin = new webpack.optimize.UglifyJsPlugin({
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

(function uncompressedLib() {
    webpackTask(getOptions(
        'lib/Scope.js',
        'lib/scope.combined.js',
        [new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify('combined')
            }
        })],
        {}
    ));
    webpackTask(getOptions(
        'lib/Scope.js',
        'lib/scope.js',
        [new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify('uncombined')
            }
        })],
        {}
    ));
})();

(function compressedLib() {
    webpackTask(getOptions(
        'lib/Scope.js',
        'lib/scope.combined.min.js',
        [new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify('combined')
            }
        }), uglifyPlugin],
        {}
    ));
    webpackTask(getOptions(
        'lib/Scope.js',
        'lib/scope.min.js',
        [new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify('uncombined')
            }
        }), uglifyPlugin],
        {}
    ));
})();

var buildModules = function (srcFile) {

    webpackTask(getOptions(
        path.join('src', srcFile),
        srcFile,
        [new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify('development')
            }
        })],
        {
            'Scope': 'Scope'
        }
    ));

    webpackTask(getOptions(
        path.join('src', srcFile),
        srcFile.replace(/\.js$/g, '.min.js'),
        [new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify('production')
            }
        }), uglifyPlugin],
        {
            'Scope': 'Scope'
        }
    ));
};

buildModules('index.js');