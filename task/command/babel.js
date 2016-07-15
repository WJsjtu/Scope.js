var fs = require("fs"),
    uglifyJS = require('uglify-js'),
    babel = require("babel-core");

module.exports = function (srcFile, distFile, compress) {
    return new Promise(function (resolve, reject) {
        babel.transformFile(srcFile, {}, function (err, result) {
            if (err) {
                reject(err);
            } else {
                var content = compress ? uglifyJS.minify(result.code, {
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
                }).code : result;
                fs.writeFileSync(distFile, content, {
                    encoding: 'utf8'
                });
                resolve();
            }
        });
    });
};