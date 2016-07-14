!function(){var e=Scope.createElement;!function(e){function t(i){if(n[i])return n[i].exports;var a=n[i]={exports:{},id:i,loaded:!1};return e[i].call(a.exports,a,a.exports,t),a.loaded=!0,a.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(t,n,i){"use strict";var a=i(2),r=a.utils,o=r.getScope,s=r.isObject,l=r.isFunction;i(3);var u=window.COMPONENTS,p=u.Pagination,c=u.Table,d=function(e){return e=parseInt(e),!isNaN(e)&&e},f=20,h=function(){var e={},t=/(\/)?(\?|#)([^\/]+)(\/)?$/gi.exec(History.getPageUrl());if(t&&t.length>=4){var n=t[3];n.split("&").forEach(function(t){t=t.split("="),2==t.length&&(e[t[0]]=decodeURIComponent(t[1]))})}return e},g=a.createClass({cid:"page-table",pagination:{page:1,total:1,size:15},table:{labels:[],onSort:null,height:null},data:{page:1,total:1,size:20,data:[]},query:{word:"",page:1,size:f},requestState:{finished:!0,xhr:null},request:function(e){var t=this,n=t.requestState;t.refs.loading.show(),!n.finished&&n.xhr&&(n.xhr.abort(),n.xhr=null,n.finished=!0);var i=$.ajax($.extend({},t.props.request,{data:e}));return n.xhr=i,n.finished=!1,i.then(function(n){l(t.props.filter)&&(n=t.props.filter(n)),t.data=n,t.query=e;var i=t.refs.pagination;t.pagination.total!=n.total&&(t.pagination.total=n.total,o(i).updateTotal(n.total)),t.pagination.page!=e.page&&(t.pagination.page=e.page,o(i).updatePage(e.page)),i.show(),t.refs.table.show(),t.refs.loading.show(),t.refs.error.text("").hide(),o(t.refs.table).updateTable()},function(e){"abort"!=e.statusText&&(t.refs.table.hide(),t.refs.loading.hide(),t.refs.error.text("数据加载失败!").show())}).always(function(){n.finished=!0,t.refs.loading.hide()})},beforeMount:function(){var e=this,t=this.pagination;e.cid=e.props.cid,s(e.props.pagination)&&(e.pagination=e.props.pagination,t.size=Math.abs(d(t.size)||15)),s(e.props.table)&&(e.table=$.extend({},e.props.table))},afterMount:function(){var e=this,t=h(),n=function(){History.Adapter.bind(window,"statechange",function(){var t=History.getState().data;t.cid==e.cid&&e.request(t.query||e.query)})},i=function(t){History.replaceState({cid:e.cid,query:t},null,null),e.request(t).then(function(){e.refs.content.show(),e.refs.input.val(t.word)}).always(function(){n()})};if(e.refs.content.hide().css("visibility","visible"),t["cid_"+e.cid])try{var a=JSON.parse(decodeURI(t["cid_"+e.cid]));i(a)}catch(r){i(e.query)}else i(e.query)},beforeUpdate:function(){this.beforeMount()},afterUpdate:function(){History.pushState({},null,null),this.afterMount()},onSort:function(e,t,n){var i=this;l(i.table.onSort)&&(i.data.data.sort(i.table.onSort(e,t)),o(i.refs.table).updateTable(),n())},onPageSelect:function(e){var t=this,n=h(),i={word:t.query.word||"",page:Math.abs(d(e)||1),size:f};n["cid_"+t.cid]=encodeURI(JSON.stringify(i));try{History.pushState({cid:t.cid,query:i},null,"?"+$.param(n))}catch(a){console.log(a),o(t.refs.pagination).updatePage(t.query.page)}},onSubmit:function(e){r.stopPropagation(e);var t=this,n=h(),i={word:t.refs.input.val()||"",page:1,size:f};n["cid_"+t.cid]=encodeURI(JSON.stringify(i));try{History.pushState({cid:t.cid,query:i},null,"?"+$.param(n))}catch(a){console.log(a),o(t.refs.pagination).updatePage(t.query.page)}},onFocus:function(e,t){r.stopPropagation(e),t.addClass("focused")},onBlur:function(e,t){r.stopPropagation(e),t.removeClass("focused")},render:function(){var t=this;return e("div",{"class":"page-table"},e("div",{ref:"content","class":"content"},e("div",{"class":"pagination"},e(p,{ref:"pagination",total:t.pagination.total,size:t.pagination.size,page:t.pagination.page,onPageSelect:t.onPageSelect.bind(t)})),e("div",{"class":"search"},e("div",{"class":"input"},e("input",{type:"text",ref:"input",placeholder:"输入搜索关键字",onFocus:t.onFocus,onBlur:t.onBlur})),e("span",{"class":"submit",ref:"submit",onClick:t.onSubmit},"搜 索")),e("div",{"class":"table"},e(c.Table,{labels:t.table.labels,onSort:t.onSort.bind(t),height:t.table.height,ref:"table"},function(){return l(t.props.dataRender)?t.props.dataRender(t.data):[]}))),e("div",{ref:"loading","class":"loading"},"Loading"),e("div",{ref:"error","class":"error"}))}});$(function(){var t=[{text:"uid",width:"30%"},{text:"timestamp",width:"20%"},{text:"rand",width:"20%"},{text:"text",width:"30%"}],n=function(t){var n=t.data;return Array.isArray(n)?n.map(function(t){return e(c.Row,null,e(c.Cell,null,t.uid),e(c.Cell,null,t.timestamp),e(c.Cell,null,t.rand),e(c.Cell,null,t.text))}):[]},i=function(e,t){var n=["uid","timestamp","rand","text"];return function(i,a){return i[n[e]]<a[n[e]]?-1*t:i[n[e]]>a[n[e]]?1*t:0}};a.render(e(g,{cid:"1",request:{url:"http://localhost/public/mp.php/user/test",method:"post",dataType:"json",timeout:3e3},filter:function(e){return e.data},pagination:{page:1,total:1,size:15},table:{labels:t,height:400,onSort:i},dataRender:n}),document.getElementById("container"))})},,function(e,t){e.exports=Scope},function(e,t,n){var i=n(4);"string"==typeof i&&(i=[[e.id,i,""]]);n(6)(i,{});i.locals&&(e.exports=i.locals)},function(e,t,n){t=e.exports=n(5)(),t.push([e.id,".page-table .content {\n  visibility: hidden;\n  position: relative;\n}\n.page-table .content .pagination {\n  margin: 10px 0;\n}\n.page-table .content .search {\n  margin: 10px 0;\n  text-align: right;\n}\n.page-table .content .search .input {\n  display: inline-block;\n  *zoom: 1;\n  *display: inline;\n  font-size: 12px;\n  line-height: 1.42857;\n}\n.page-table .content .search .input input {\n  padding: 5px 10px;\n  text-align: left;\n  width: 300px;\n  vertical-align: middle;\n  border: 1px solid #D4D4D4;\n  cursor: text;\n  background: none transparent;\n  box-shadow: none;\n  font-family: inherit;\n  font-size: inherit;\n  margin: 0;\n  outline: none;\n  display: inline-block;\n  *zoom: 1;\n  *display: inline;\n  -webkit-appearance: none;\n}\n.page-table .content .search .input input.focused {\n  border-color: #2DB7F5;\n}\n.page-table .content .search .submit {\n  display: inline-block;\n  *zoom: 1;\n  *display: inline;\n  color: #ffffff;\n  margin: 0 10px;\n  padding: 5px 10px;\n  text-align: center;\n  font-size: 12px;\n  line-height: 1.42857;\n  border: 1px solid #428bca;\n  background-color: #428bca;\n  cursor: pointer;\n}\n.page-table .content .search .submit:hover {\n  border: 1px solid #4795d8;\n  background-color: #4795d8;\n}\n.page-table .content .loading {\n  display: none;\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 999;\n  background-color: #ffffff;\n  color: #444444;\n}\n",""])},function(e,t){"use strict";e.exports=function(){var e=[];return e.toString=function(){for(var e=[],t=0;t<this.length;t++){var n=this[t];n[2]?e.push("@media "+n[2]+"{"+n[1]+"}"):e.push(n[1])}return e.join("")},e.i=function(t,n){"string"==typeof t&&(t=[[null,t,""]]);for(var i={},a=0;a<this.length;a++){var r=this[a][0];"number"==typeof r&&(i[r]=!0)}for(a=0;a<t.length;a++){var o=t[a];"number"==typeof o[0]&&i[o[0]]||(n&&!o[2]?o[2]=n:n&&(o[2]="("+o[2]+") and ("+n+")"),e.push(o))}},e}},function(e,t,n){function i(e,t){for(var n=0;n<e.length;n++){var i=e[n],a=f[i.id];if(a){a.refs++;for(var r=0;r<a.parts.length;r++)a.parts[r](i.parts[r]);for(;r<i.parts.length;r++)a.parts.push(u(i.parts[r],t))}else{for(var o=[],r=0;r<i.parts.length;r++)o.push(u(i.parts[r],t));f[i.id]={id:i.id,refs:1,parts:o}}}}function a(e){for(var t=[],n={},i=0;i<e.length;i++){var a=e[i],r=a[0],o=a[1],s=a[2],l=a[3],u={css:o,media:s,sourceMap:l};n[r]?n[r].parts.push(u):t.push(n[r]={id:r,parts:[u]})}return t}function r(e,t){var n=b(),i=m[m.length-1];if("top"===e.insertAt)i?i.nextSibling?n.insertBefore(t,i.nextSibling):n.appendChild(t):n.insertBefore(t,n.firstChild),m.push(t);else{if("bottom"!==e.insertAt)throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");n.appendChild(t)}}function o(e){e.parentNode.removeChild(e);var t=m.indexOf(e);t>=0&&m.splice(t,1)}function s(e){var t=document.createElement("style");return t.type="text/css",r(e,t),t}function l(e){var t=document.createElement("link");return t.rel="stylesheet",r(e,t),t}function u(e,t){var n,i,a;if(t.singleton){var r=y++;n=v||(v=s(t)),i=p.bind(null,n,r,!1),a=p.bind(null,n,r,!0)}else e.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(n=l(t),i=d.bind(null,n),a=function(){o(n),n.href&&URL.revokeObjectURL(n.href)}):(n=s(t),i=c.bind(null,n),a=function(){o(n)});return i(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;i(e=t)}else a()}}function p(e,t,n,i){var a=n?"":i.css;if(e.styleSheet)e.styleSheet.cssText=x(t,a);else{var r=document.createTextNode(a),o=e.childNodes;o[t]&&e.removeChild(o[t]),o.length?e.insertBefore(r,o[t]):e.appendChild(r)}}function c(e,t){var n=t.css,i=t.media;if(i&&e.setAttribute("media",i),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}function d(e,t){var n=t.css,i=t.sourceMap;i&&(n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(i))))+" */");var a=new Blob([n],{type:"text/css"}),r=e.href;e.href=URL.createObjectURL(a),r&&URL.revokeObjectURL(r)}var f={},h=function(e){var t;return function(){return"undefined"==typeof t&&(t=e.apply(this,arguments)),t}},g=h(function(){return/msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase())}),b=h(function(){return document.head||document.getElementsByTagName("head")[0]}),v=null,y=0,m=[];e.exports=function(e,t){t=t||{},"undefined"==typeof t.singleton&&(t.singleton=g()),"undefined"==typeof t.insertAt&&(t.insertAt="bottom");var n=a(e);return i(n,t),function(e){for(var r=[],o=0;o<n.length;o++){var s=n[o],l=f[s.id];l.refs--,r.push(l)}if(e){var u=a(e);i(u,t)}for(var o=0;o<r.length;o++){var l=r[o];if(0===l.refs){for(var p=0;p<l.parts.length;p++)l.parts[p]();delete f[l.id]}}}};var x=function(){var e=[];return function(t,n){return e[t]=n,e.filter(Boolean).join("\n")}}()}])}();