var path = require('path'),
    fs = require("fs"),
    uglifyJS = require('uglify-js'),
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
                comps.push({
                    name: file,
                    path: tempEntry
                });
                fs.createReadStream(path.join(__dirname, 'tmpl', 'entry.js')).pipe(fs.createWriteStream(tempEntry));
            }
        });

        var indexPath = path.join(srcDir, "index.js");

        var removeTempEntries = function () {
            comps.forEach(function (comp) {
                if (fs.existsSync(comp.path)) {
                    fs.unlinkSync(comp.path);
                }
            });
            if (fs.existsSync(indexPath)) {
                fs.unlinkSync(indexPath);
            }
        };


        var indexString = 'window.getComponents = function (comps, callback) {\n' +
            '\tvar compEntries = {};\n' +
            comps.map(function (comp) {
                return '\tcompEntries["' + comp.name + '"] = require(`' + comp.path + '`);'
            }).join("\n") +
            '\tif (Array.isArray(comps)) {\n' +
            '\t\t$.when.apply(this, comps.map(function (comp) {\n' +
            '\t\t\treturn $.Deferred(compEntries[comp]);\n' +
            '\t\t})).done(callback);\n' +
            '\t}\n' +
            '};';

        fs.writeFileSync(indexPath, indexString, {
            encoding: 'utf8'
        });

        webpack({
            entry: indexPath,
            output: {
                path: distDir,
                filename: "component.js",
                chunkFilename: "[hash]-[chunkhash].js",
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
                var optimize = function (_distFile) {
                    var content = fs.readFileSync(_distFile, 'utf-8');
                    const replaceWord = 'ScopeCreateElement';
                    content = content.replace(/(Scope\.createElement)(\s*\()/g, replaceWord + '$2');
                    content = `(function(){\n\tvar ScopeCreateElement = Scope.createElement;\n\n` + content + `\n\n})();`;
                    var compressedContent = uglifyJS.minify(content, {
                        fromString: true,
                        compress: {
                            dead_code: true,
                            drop_debugger: true,
                            unused: true,
                            if_return: true,
                            warnings: false,
                            join_vars: true
                        },
                        mangle: {
                            eval: true
                        }
                    }).code;
                    fs.writeFileSync(_distFile, compressedContent, {
                        encoding: 'utf8'
                    });
                };

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