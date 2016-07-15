var path = require('path'),
    fs = require("fs"),
    logger = require('./command/log'),
    optimize = require("./optimize"),
    webpackTask = require('./command/webpack');


const srcDir = path.join(__dirname, '../test', 'src');
const distDir = path.join(__dirname, '../test', 'src');

module.exports = function (testName) {

    console.log(testName);

    var taskLogger = logger('test:' + testName, 'test/src/' + testName + '/index.js');
    var srcFile = path.join(srcDir, testName, 'index.js');
    var distFile = path.join(distDir, testName, 'test.js');

    console.log(srcFile, distFile);

    taskLogger.start();
    if (!fs.existsSync(path.join(srcDir, testName, 'index.js'))) {
        taskLogger.error('test:' + testName + ' not found!');
        return false;
    }

    webpackTask(srcFile, distFile, false, {}).then(function () {
        optimize(distFile);
        taskLogger.finish();
    }, function (errMsg) {
        taskLogger.error(errMsg);
    });

};