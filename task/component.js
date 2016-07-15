var path = require('path'),
    fs = require("fs"),
    optimize = require("./optimize"),
    logger = require('./command/log'),
    webpack = require('webpack');

const srcDir = path.join(__dirname, '../src', 'component');
const distDir = path.join(__dirname, '../dist', 'component');

module.exports = function () {

    var buildComponents = function (files, taskLogger) {
        var comps = [];
        files.forEach(function (file) {
            var fullPath = path.join(srcDir, file);
            var stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                var tempEntry = path.join(fullPath, "entry.js");
                var templateEntryFile = path.join(__dirname, 'tmpl', 'entry.js');
                if (fs.existsSync(tempEntry) && fs.statSync(tempEntry).isFile()) {

                } else {
                    comps.push({
                        name: file,
                        path: tempEntry
                    });
                    fs.createReadStream(templateEntryFile).pipe(fs.createWriteStream(tempEntry));
                }
            }
        });

        var indexPath = path.join(srcDir, "index.js");

        var removeTempEntries = function () {
            comps.forEach(function (comp) {
                if (fs.existsSync(comp.path)) {
                    fs.unlinkSync(comp.path);
                }
            });
        };

        webpack({
            entry: indexPath,
            output: {
                path: distDir,
                filename: "component.js",
                chunkFilename: "[chunkhash].js",
                publicPath: "./../../../dist/component/"
            },
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
            },
            plugins: [
                new webpack.DefinePlugin({
                    "process.env": {
                        NODE_ENV: JSON.stringify('production')
                    }
                })
            ]
        }, function (err, stats) {
            if (err) {
                removeTempEntries();
                taskLogger.error(err);
            } else if (stats.compilation.errors.length) {
                var messages = [];
                stats.compilation.errors.forEach(function (e) {
                    messages.push(e.message);
                });
                removeTempEntries();
                taskLogger.error(messages.join('\n'));
            } else {
                var optimizeLogger = logger('component: optimize');
                optimizeLogger.start();
                fs.readdir(distDir, function (err, _files) {
                    if (err) {
                        optimizeLogger.error(err);
                    } else {
                        _files.forEach(function (_file) {
                            var _fullPath = path.join(distDir, _file);
                            var _stats = fs.statSync(_fullPath);
                            if (_stats.isFile()) {
                                optimize(_fullPath);
                            }
                        });
                    }
                    removeTempEntries();
                    optimizeLogger.finish();
                });
                taskLogger.finish();
            }
        });
    };

    var cleanLogger = logger('component: clean');
    cleanLogger.start();
    require("./command/rmdir")(distDir).then(function () {
        fs.mkdirSync(distDir);
        cleanLogger.finish();

        var taskLogger = logger('component: build');
        taskLogger.start();
        fs.readdir(srcDir, function (err, files) {
            if (err) {
                taskLogger.error(err);
            } else {
                buildComponents(files, taskLogger);
            }
        });
    });
};