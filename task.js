var argsFiles = process.argv.splice(2);

var libMode = {
    scope: 'webpack',
    polyfill: 'babel'
};

var libTask = require('./task/lib');

if (argsFiles.length) {
    if (argsFiles[0] == 'lib' && argsFiles[1]) {
        (function () {
            var libName = argsFiles[1], externals = argsFiles[2];
            libTask(libName, libMode[libName] ? libMode[libName] : 'webpack', externals);
        })();
    } else if (argsFiles[0] == 'component') {
        require('./task/component')();
    } else if (argsFiles[0] == 'test' && argsFiles[1]) {
        require('./task/test')(argsFiles[1]);
    }
}