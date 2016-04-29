const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {getRefs} = ScopeUtils;
const $ = require("jquery");

const compileJSX = function (input) {
    return Babel.transform(input, {
        presets: ["es2015"],
        plugins: [
            "transform-es5-property-mutators",
            "transform-react-jsx",
            "transform-es3-member-expression-literals",
            "transform-es3-property-literals"
        ]
    }).code.replace(/([^0-9a-zA-Z])(React)(\.createElement\s*\()/g, '$1Scope$3');
};


const tabStyle = 'border-bottom: none !important;border-radius: 3px 3px 0 0;padding: 6px 8px;font-size: 12px;font-weight: bold;color: #c2c0bc;background-color: #f1ede4;display: inline-block;cursor: pointer;';

const Editor = Scope.createClass({
    afterMount: function ($component) {

        const refs = getRefs($component);

        const codeMirror = window.CodeMirror(refs.editor[0], {
            value: this.props.sourceCode || '',
            mode: "javascript",
            lineNumbers: true,
            lineWrapping: false,
            smartIndent: false, // javascript mode does bad things with jsx indents
            matchBrackets: true,
            showCursorWhenSelecting: false,
            theme: 'scope-light'
        });
        const codeMirrorCompile = window.CodeMirror(refs.compile[0], {
            value: '',
            mode: "javascript",
            lineNumbers: true,
            readOnly: 'nocursor',
            lineWrapping: false,
            smartIndent: false, // javascript mode does bad things with jsx indents
            matchBrackets: true,
            showCursorWhenSelecting: false,
            theme: 'scope-light'
        });

        var compileEditor = function () {
            const _sourceCode = codeMirror.doc.getValue();
            const mountNode = refs.mountNode[0];
            try {
                let compiledCode = compileJSX(_sourceCode);
                $(mountNode).empty();
                codeMirrorCompile.doc.setValue(compiledCode);

                const wrapperCode = '(function (mountNode) {' + compiledCode + '})';
                (eval(wrapperCode))(mountNode);
            } catch (e) {
                $(mountNode).text(e);
                console.log(e);
            }
        };

        codeMirror.on("change", function () {
            compileEditor();
        });

        compileEditor();
    },
    code: function ($this, event) {
        ScopeUtils.stopPropagation(event);
        getRefs($this).tabView.css({
            'margin-left': '0'
        });

    },
    compiledCode: function ($this, event) {
        ScopeUtils.stopPropagation(event);
        getRefs($this).tabView.css({
            'margin-left': '-100%'
        });
    },
    render: function () {
        return (
            <div>
                <div style="overflow: hidden;width: 50%;float: left;">
                    <div>
                        <span onClick={this.code} style={tabStyle}>code</span>
                        <span onClick={this.compiledCode} style={tabStyle}>compiled code</span>
                    </div>
                    <div style="width: 200%;" ref="tabView">
                        <div style="width: 50%;float: left;">
                            <div class="highlight">
                                <div ref="editor"></div>
                            </div>
                        </div>
                        <div style="width: 50%;float: right;">
                            <div class="highlight">
                                <div ref="compile"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="width: 50%;float: right;">
                    <div ref="mountNode"></div>
                </div>
                <div style="clear: both;"></div>
            </div>
        );
    }
});

module.exports = Editor;