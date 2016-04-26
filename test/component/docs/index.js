const Editor = require('./../../../src/component/docs/index');

$(function () {
    Scope.render(<Editor sourceCode={require('./tmpl/hello.tmpl')}/>, document.getElementById('helloDemo'));
    Scope.render(<Editor sourceCode={require('./tmpl/list.tmpl')}/>, document.getElementById('listDemo'));
});