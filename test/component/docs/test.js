!function(){var e=Scope.createElement;!function(e){function n(o){if(t[o])return t[o].exports;var r=t[o]={exports:{},id:o,loaded:!1};return e[o].call(r.exports,r,r.exports,n),r.loaded=!0,r.exports}var t={};return n.m=e,n.c=t,n.p="",n(0)}([function(n,t,o){"use strict";var r=o(1);$(function(){Scope.render(e(r,{sourceCode:o(4)}),document.getElementById("helloDemo")),Scope.render(e(r,{sourceCode:o(5)}),document.getElementById("listDemo"))})},function(n,t,o){"use strict";var r=o(2),i=o(3),l=function(e){return Babel.transform(e,{presets:["es2015"],plugins:["transform-es5-property-mutators","transform-react-jsx","transform-es3-member-expression-literals","transform-es3-property-literals"]}).code.replace(/([^0-9a-zA-Z])(React)(\.createElement\s*\()/g,"$1Scope$3")},s="border-bottom: none !important;border-radius: 3px 3px 0 0;padding: 6px 8px;font-size: 12px;font-weight: bold;color: #c2c0bc;background-color: #f1ede4;display: inline-block;cursor: pointer;",a=r.createClass({afterMount:function c(e){var n=window.CodeMirror(e.refs.editor.$ele[0],{value:this.props.sourceCode||"",mode:"javascript",lineNumbers:!0,lineWrapping:!1,smartIndent:!1,matchBrackets:!0,showCursorWhenSelecting:!1,theme:"scope-light"}),t=window.CodeMirror(e.refs.compile.$ele[0],{value:"",mode:"javascript",lineNumbers:!0,readOnly:"nocursor",lineWrapping:!1,smartIndent:!1,matchBrackets:!0,showCursorWhenSelecting:!1,theme:"scope-light"}),o=function r(){var o=n.doc.getValue(),r=e.refs.mountNode.$ele[0];try{var s=l(o);i(r).empty(),t.doc.setValue(s);var a="(function (mountNode) {"+s+"})",c=eval(a);c(r)}catch(d){i(r).text(d),console.log(d)}};n.on("change",function(){o()}),o()},code:function(e,n){e.stopPropagation(n),e.refs.tabView.$ele.css({"margin-left":"0"})},compiledCode:function(e,n){e.stopPropagation(n),e.refs.tabView.$ele.css({"margin-left":"-100%"})},render:function(){return e("div",null,e("div",{style:"overflow: hidden;width: 50%;float: left;"},e("div",null,e("span",{onClick:this.code,style:s},"code"),e("span",{onClick:this.compiledCode,style:s},"compiled code")),e("div",{style:"width: 200%;",ref:"tabView"},e("div",{style:"width: 50%;float: left;"},e("div",{"class":"highlight"},e("div",{ref:"editor"}))),e("div",{style:"width: 50%;float: right;"},e("div",{"class":"highlight"},e("div",{ref:"compile"}))))),e("div",{style:"width: 50%;float: right;"},e("div",{ref:"mountNode"})),e("div",{style:"clear: both;"}))}});n.exports=a},function(e,n){e.exports=Scope},function(e,n){e.exports=jQuery},function(e,n){e.exports='var HelloMessage = Scope.createClass({\n    render: function() {\n        return <div>Hello {this.props.name}</div>;\n    }\n});\nScope.render(<HelloMessage name="John" />, mountNode);'},function(e,n){e.exports="const List = Scope.createClass({\n    data: [],\n    getRandom: function () {\n        this.data = [];\n        for (let i = 0; i < 20; i++) {\n            this.data.push(Math.random());\n        }\n    },\n    generate: function ($handler, event) {\n        $handler.stopPropagation(event);\n        this.getRandom();\n        $handler.refs.ul2.update();\n    },\n    onActive: {\n        'li': function ($handler, event) {\n            $handler.stopPropagation(event);\n            $handler.owner.$ele.find('li.active').removeClass('active');\n            $handler.$ele.addClass('active');\n        }\n    },\n    getList: function () {\n        return this.data.map(function (ele) {\n            return <li onClick={function(){\n                console.log(ele);\n            }}>{ele}</li>;\n        });\n    },\n    render: function () {\n        const me = this;\n        me.getRandom();\n        return (\n            <div>\n                <a onClick={me.generate}>{me.props.label || 'update right list'}</a>\n                <div>\n                    <ul ref=\"ul1\" style=\"display:inline-block;list-style:none;*zoom:1;*display:inline;\"\n                        onClick={me.onActive}>\n                        {me.getList()}\n                    </ul>\n                    <ul ref=\"ul2\" style=\"display:inline-block;list-style:none;*zoom:1;*display:inline;\"\n                        onClick={me.onActive}>\n                        {me.getList}\n                    </ul>\n                </div>\n            </div>\n        );\n    }\n});\n\nScope.render(<List />, mountNode);"}])}();