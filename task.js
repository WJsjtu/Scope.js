var argsFiles = process.argv.splice(2);

var componentMode = {
    daypicker: 'webpack'
};

var libMode = {
    scope: 'babel',
    polyfill: 'babel',
    history: 'babel',
    json: 'babel'
};


var compTask = require('./task/component');
var libTask = require('./task/lib');

if (argsFiles.length) {
    if (argsFiles[0] == 'component' && argsFiles[1]) {
        (function () {
            var compName = argsFiles[1], externals = argsFiles[2];
            compTask(compName, componentMode[compName] ? componentMode[compName] : 'webpack', externals);
        })();

    } else if (argsFiles[0] == 'lib' && argsFiles[1]) {
        (function () {
            var libName = argsFiles[1], externals = argsFiles[2];
            libTask(libName, libMode[libName] ? libMode[libName] : 'webpack', externals);
        })();
    }
}