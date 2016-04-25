var path = require('path'),
    fs = require("fs"),
    logger = require('./logger'),
    uglifyJS = require('uglify-js'),
    babelTask = require('./babel'),
    webpackTask = require('./webpack');

const srcDir = path.join(__dirname, '../src', 'component');
const distDir = path.join(__dirname, '../dist', 'component');
const testDir = path.join(__dirname, '../test', 'component');

module.exports = function (compName, mode, externals) {
    externals = externals || {};
    mode = mode || 'webpack';

    var taskLogger = logger('component:' + compName, 'src/component/' + compName + '/index.js');

    var srcFile = path.join(srcDir, compName, 'index.js');
    var distFile = path.join(distDir, compName + '.js');

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

    var test = function () {
        var testFile = path.join(testDir, compName, 'index.js');
        if (fs.existsSync(testFile)) {
            var testTaskLogger = logger('test:' + compName, 'test/component/' + compName + '/index.js');
            testTaskLogger.start();
            webpackTask(testFile, testFile.replace(/index\.js$/g, 'test.js'), false, externals).then(function () {
                testTaskLogger.finish();
                optimize(testFile.replace(/index\.js$/g, 'test.js'));
            }, function (errMsg) {
                testTaskLogger.error(errMsg);
            });
        }
    };

    taskLogger.start();
    if (!fs.existsSync(srcFile)) {
        taskLogger.error('Component:' + compName + ' not found!');
        return false;
    }

    if (mode == 'webpack') {
        webpackTask(srcFile, distFile, false, externals).then(function () {
            optimize(distFile);
            taskLogger.finish();
            test();
        }, function (errMsg) {
            taskLogger.error(errMsg);
        });
    } else if (mode == 'babel') {
        babelTask(srcFile, distFile, false).then(function () {
            optimize(distFile);
            taskLogger.finish();
            test();
        }, function (errMsg) {
            taskLogger.error(errMsg);
        });
    } else {
        taskLogger.error('Component:' + compName + ' has unknown mode:' + mode + '!');
        return false;
    }
};