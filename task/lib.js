var path = require('path'),
    fs = require("fs"),
    logger = require('./logger'),
    babelTask = require('./babel'),
    webpackTask = require('./webpack');

const srcDir = path.join(__dirname, '../src', 'lib');
const distDir = path.join(__dirname, '../dist', 'lib');

module.exports = function (libName, mode, externals) {
    externals = externals || {};
    mode = mode || 'webpack';

    var taskLogger = logger('lib:' + libName, 'src/lib/' + libName + '/index.js');
    var srcFile = path.join(srcDir, libName, 'index.js');
    var distFile = path.join(distDir, libName + '.js');

    taskLogger.start();
    if (!fs.existsSync(path.join(srcDir, libName, 'index.js'))) {
        taskLogger.error('Lib:' + libName + ' not found!');
        return false;
    }

    if (mode == 'webpack') {
        webpackTask(srcFile, distFile, true, externals).then(function () {
            taskLogger.finish();
        }, function (errMsg) {
            taskLogger.error(errMsg);
        });
    } else if (mode == 'babel') {
        babelTask(srcFile, distFile, true).then(function () {
            taskLogger.finish();
        }, function (errMsg) {
            taskLogger.error(errMsg);
        });
    } else {
        taskLogger.error('Lib:' + libName + ' has unknown mode:' + mode + '!');
        return false;
    }
};