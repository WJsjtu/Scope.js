var fs = require("fs"),
    uglifyJS = require('uglify-js');

module.exports = function (_distFile) {
    var content = fs.readFileSync(_distFile, 'utf-8');
    content = content.replace(/([\{][\n\t\r\s]*)"use strict";/g, "$1");
    content = `(function(){\n\tvar __Scope_createElement__ = Scope.createElement;\n\n` + content + `\n\n})();`;
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