!function(e){function t(o){if(n[o])return n[o].exports;var r=n[o]={exports:{},id:o,loaded:!1};return e[o].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";var o=n(1);$(function(){Scope.render(Scope.createElement(o,{sourceCode:n(4)}),document.getElementById("helloDemo")),Scope.render(Scope.createElement(o,{sourceCode:n(5)}),document.getElementById("listDemo"))})},function(module,exports,__webpack_require__){"use strict";var Scope=__webpack_require__(2),ScopeUtils=Scope.utils,$=__webpack_require__(3),compileJSX=function(e){return Babel.transform(e,{presets:["es2015"],plugins:["transform-es5-property-mutators","transform-react-jsx","transform-es3-member-expression-literals","transform-es3-property-literals"]}).code.replace(/([^0-9a-zA-Z])(React)(\.createElement\s*\()/g,"$1Scope$3")},tabStyle="border-bottom: none !important;border-radius: 3px 3px 0 0;padding: 6px 8px;font-size: 12px;font-weight: bold;color: #c2c0bc;background-color: #f1ede4;display: inline-block;cursor: pointer;",Editor=Scope.createClass({afterMount:function afterMount(){var refs=this.refs,codeMirror=window.CodeMirror(refs.editor[0],{value:this.props.sourceCode||"",mode:"javascript",lineNumbers:!0,lineWrapping:!1,smartIndent:!1,matchBrackets:!0,showCursorWhenSelecting:!1,theme:"scope-light"}),codeMirrorCompile=window.CodeMirror(refs.compile[0],{value:"",mode:"javascript",lineNumbers:!0,readOnly:"nocursor",lineWrapping:!1,smartIndent:!1,matchBrackets:!0,showCursorWhenSelecting:!1,theme:"scope-light"}),compileEditor=function compileEditor(){var _sourceCode=codeMirror.doc.getValue(),mountNode=refs.mountNode[0];try{var compiledCode=compileJSX(_sourceCode);$(mountNode).empty(),codeMirrorCompile.doc.setValue(compiledCode);var wrapperCode="(function (mountNode) {"+compiledCode+"})";eval(wrapperCode)(mountNode)}catch(e){$(mountNode).text(e),console.log(e)}};codeMirror.on("change",function(){compileEditor()}),compileEditor()},code:function(e,t){ScopeUtils.stopPropagation(e),this.refs.tabView.css({"margin-left":"0"})},compiledCode:function(e,t){ScopeUtils.stopPropagation(e),this.refs.tabView.css({"margin-left":"-100%"})},render:function(){return Scope.createElement("div",null,Scope.createElement("div",{style:"overflow: hidden;width: 50%;float: left;"},Scope.createElement("div",null,Scope.createElement("span",{onClick:this.code,style:tabStyle},"code"),Scope.createElement("span",{onClick:this.compiledCode,style:tabStyle},"compiled code")),Scope.createElement("div",{style:"width: 200%;",ref:"tabView"},Scope.createElement("div",{style:"width: 50%;float: left;"},Scope.createElement("div",{"class":"highlight"},Scope.createElement("div",{ref:"editor"}))),Scope.createElement("div",{style:"width: 50%;float: right;"},Scope.createElement("div",{"class":"highlight"},Scope.createElement("div",{ref:"compile"}))))),Scope.createElement("div",{style:"width: 50%;float: right;"},Scope.createElement("div",{ref:"mountNode"})),Scope.createElement("div",{style:"clear: both;"}))}});module.exports=Editor},function(e,t){e.exports=Scope},function(e,t){e.exports=jQuery},function(e,t){e.exports='var HelloMessage = Scope.createClass({\n    render: function() {\n        return <div>Hello {this.props.name}</div>;\n    }\n});\nScope.render(<HelloMessage name="John" />, mountNode);'},function(e,t){e.exports="const List = Scope.createClass({\n    data: [],\n    beforeMount: function () {\n        console.log('beforeMount');\n    },\n    afterMount: function () {\n        console.log('afterMount');\n    },\n    beforeUpdate: function () {\n        console.log('beforeUpdate');\n    },\n    afterUpdate: function () {\n        console.log('afterUpdate');\n    },\n    getRandom: function () {\n        console.log('getRandom');\n        this.data = [];\n        for (let i = 0; i < 10; i++) {\n            this.data.push(Math.random());\n        }\n    },\n    generate: function (event, $this) {\n        Scope.utils.stopPropagation(event);\n        this.getRandom();\n        Scope.utils.update(this.refs.ul2);\n    },\n    onActive: {\n        'li': function (event, $this, $owner) {\n            Scope.utils.stopPropagation(event);\n            $owner.find('li.active').removeClass('active');\n            $this.addClass('active');\n        }\n    },\n    getList: function () {\n        return this.data.map(function (ele) {\n            return <li onClick={function(){\n                console.log(ele);\n            }}>{ele}</li>;\n        });\n    },\n    render: function () {\n        const me = this;\n        me.getRandom();\n        return (\n            <div>\n                <a onClick={me.generate}>{me.props.label || 'update right list'}</a>\n                <div>\n                    <ul ref=\"ul1\" style=\"display:inline-block;list-style:none;*zoom:1;*display:inline;\"\n                        onClick={me.onActive}>\n                        {me.getList()}\n                    </ul>\n                    <ul ref=\"ul2\" style=\"display:inline-block;list-style:none;*zoom:1;*display:inline;\"\n                        onClick={me.onActive}>\n                        {me.getList}\n                    </ul>\n                </div>\n            </div>\n        );\n    }\n});\n\nconst Wrapper = Scope.createClass({\n    updateList: function (event, $this) {\n        Scope.utils.stopPropagation(event);\n        Scope.utils.update(this.refs.list);\n    },\n    render: function () {\n        return (\n            <div>\n                <a onClick={this.updateList}>Update List Component</a>\n                <List ref=\"list\"/>\n                {this.props.children}\n            </div>\n        );\n    }\n});\n\nScope.render(<Wrapper />, mountNode);"}]);