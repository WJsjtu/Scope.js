!function(e){function t(r){if(n[r])return n[r].exports;var a=n[r]={exports:{},id:r,loaded:!1};return e[r].call(a.exports,a,a.exports,t),a.loaded=!0,a.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";var r=n(2);getComponents(["pagination","table"],function(e,t){var a=n(3)(e,t.Table),i=t.Row,o=t.Cell;$(function(){var e=[{text:"uid",width:"30%"},{text:"timestamp",width:"20%"},{text:"rand",width:"20%"},{text:"text",width:"30%"}],t=function(e){var t=e.data;return Array.isArray(t)?t.map(function(e){return r.createElement(i,null,r.createElement(o,null,e.uid),r.createElement(o,null,e.timestamp),r.createElement(o,null,e.rand),r.createElement(o,null,e.text))}):[]},n=function(e,t){var n=["uid","timestamp","rand","text"];return function(r,a){return r[n[e]]<a[n[e]]?-1*t:r[n[e]]>a[n[e]]?1*t:0}};r.render(r.createElement(a,{cid:"1",request:{url:"http://localhost/public/mp.php/user/test",method:"post",dataType:"json",timeout:3e3},filter:function(e){return e.data},pagination:{page:1,total:1,size:15},table:{labels:e,height:400,onSort:n},dataRender:t}),document.getElementById("container"))})})},,function(e,t){e.exports=Scope},function(e,t,n){"use strict";var r=n(2),a=r.utils,i=a.getScope,o=a.isObject,s=a.isFunction;n(4),e.exports=function(e,t){var n=function(e){return e=parseInt(e),!isNaN(e)&&e},l=20,c=function(){var e={},t=/(\/)?(\?|#)([^\/]+)(\/)?$/gi.exec(History.getPageUrl());if(t&&t.length>=4){var n=t[3];n.split("&").forEach(function(t){t=t.split("="),2==t.length&&(e[t[0]]=decodeURIComponent(t[1]))})}return e},u=r.createClass({cid:"page-table",pagination:{page:1,total:1,size:15},table:{labels:[],onSort:null,height:null},data:{page:1,total:1,size:20,data:[]},query:{word:"",page:1,size:l},requestState:{finished:!0,xhr:null},request:function(e){var t=this,n=t.requestState;t.refs.loading.show(),!n.finished&&n.xhr&&(n.xhr.abort(),n.xhr=null,n.finished=!0);var r=$.ajax($.extend({},t.props.request,{data:e}));return n.xhr=r,n.finished=!1,r.then(function(n){s(t.props.filter)&&(n=t.props.filter(n)),t.data=n,t.query=e;var r=t.refs.pagination;t.pagination.total!=n.total&&(t.pagination.total=n.total,i(r).updateTotal(n.total)),t.pagination.page!=e.page&&(t.pagination.page=e.page,i(r).updatePage(e.page)),r.show(),t.refs.table.show(),t.refs.loading.show(),t.refs.error.text("").hide(),i(t.refs.table).updateTable()},function(e){"abort"!=e.statusText&&(t.refs.table.hide(),t.refs.loading.hide(),t.refs.error.text("数据加载失败!").show())}).always(function(){n.finished=!0,t.refs.loading.hide()})},beforeMount:function(){var e=this,t=this.pagination;e.cid=e.props.cid,o(e.props.pagination)&&(e.pagination=e.props.pagination,t.size=Math.abs(n(t.size)||15)),o(e.props.table)&&(e.table=$.extend({},e.props.table))},afterMount:function(){var e=this,t=c(),n=function(){History.Adapter.bind(window,"statechange",function(){var t=History.getState().data;t.cid==e.cid&&e.request(t.query||e.query)})},r=function(t){History.replaceState({cid:e.cid,query:t},null,null),e.request(t).then(function(){e.refs.content.show(),e.refs.input.val(t.word)}).always(function(){n()})};if(e.refs.content.hide().css("visibility","visible"),t["cid_"+e.cid])try{var a=JSON.parse(decodeURI(t["cid_"+e.cid]));r(a)}catch(i){r(e.query)}else r(e.query)},beforeUpdate:function(){this.beforeMount()},afterUpdate:function(){History.pushState({},null,null),this.afterMount()},onSort:function(e,t,n){var r=this;s(r.table.onSort)&&(r.data.data.sort(r.table.onSort(e,t)),i(r.refs.table).updateTable(),n())},onPageSelect:function(e){var t=this,r=c(),a={word:t.query.word||"",page:Math.abs(n(e)||1),size:l};r["cid_"+t.cid]=encodeURI(JSON.stringify(a));try{History.pushState({cid:t.cid,query:a},null,"?"+$.param(r))}catch(o){console.log(o),i(t.refs.pagination).updatePage(t.query.page)}},onSubmit:function(e){a.stopPropagation(e);var t=this,n=c(),r={word:t.refs.input.val()||"",page:1,size:l};n["cid_"+t.cid]=encodeURI(JSON.stringify(r));try{History.pushState({cid:t.cid,query:r},null,"?"+$.param(n))}catch(o){console.log(o),i(t.refs.pagination).updatePage(t.query.page)}},onFocus:function(e,t){a.stopPropagation(e),t.addClass("focused")},onBlur:function(e,t){a.stopPropagation(e),t.removeClass("focused")},render:function(){var n=this;return r.createElement("div",{"class":"page-table"},r.createElement("div",{ref:"content","class":"content"},r.createElement("div",{"class":"pagination"},r.createElement(e,{ref:"pagination",total:n.pagination.total,size:n.pagination.size,page:n.pagination.page,onPageSelect:n.onPageSelect.bind(n)})),r.createElement("div",{"class":"search"},r.createElement("div",{"class":"input"},r.createElement("input",{type:"text",ref:"input",placeholder:"输入搜索关键字",onFocus:n.onFocus,onBlur:n.onBlur})),r.createElement("span",{"class":"submit",ref:"submit",onClick:n.onSubmit},"搜 索")),r.createElement("div",{"class":"table"},r.createElement(t,{labels:n.table.labels,onSort:n.onSort.bind(n),height:n.table.height,ref:"table"},function(){return s(n.props.dataRender)?n.props.dataRender(n.data):[]}))),r.createElement("div",{ref:"loading","class":"loading"},"Loading"),r.createElement("div",{ref:"error","class":"error"}))}});return u}},function(e,t,n){var r=n(5);"string"==typeof r&&(r=[[e.id,r,""]]);n(7)(r,{});r.locals&&(e.exports=r.locals)},function(e,t,n){t=e.exports=n(6)(),t.push([e.id,".page-table .content{visibility:hidden;position:relative}.page-table .content .pagination{margin:10px 0}.page-table .content .search{margin:10px 0;text-align:right}.page-table .content .search .input{display:inline-block;*zoom:1;*display:inline;font-size:12px;line-height:1.42857}.page-table .content .search .input input{padding:5px 10px;text-align:left;width:300px;vertical-align:middle;border:1px solid #d4d4d4;cursor:text;background:none transparent;box-shadow:none;font-family:inherit;font-size:inherit;margin:0;outline:none;display:inline-block;*zoom:1;*display:inline;-webkit-appearance:none}.page-table .content .search .input input.focused{border-color:#2db7f5}.page-table .content .search .submit{display:inline-block;*zoom:1;*display:inline;color:#fff;margin:0 10px;padding:5px 10px;text-align:center;font-size:12px;line-height:1.42857;border:1px solid #428bca;background-color:#428bca;cursor:pointer}.page-table .content .search .submit:hover{border:1px solid #4795d8;background-color:#4795d8}.page-table .content .loading{display:none;position:absolute;top:0;left:0;z-index:999;background-color:#fff;color:#444}",""])},function(e,t){"use strict";e.exports=function(){var e=[];return e.toString=function(){for(var e=[],t=0;t<this.length;t++){var n=this[t];n[2]?e.push("@media "+n[2]+"{"+n[1]+"}"):e.push(n[1])}return e.join("")},e.i=function(t,n){"string"==typeof t&&(t=[[null,t,""]]);for(var r={},a=0;a<this.length;a++){var i=this[a][0];"number"==typeof i&&(r[i]=!0)}for(a=0;a<t.length;a++){var o=t[a];"number"==typeof o[0]&&r[o[0]]||(n&&!o[2]?o[2]=n:n&&(o[2]="("+o[2]+") and ("+n+")"),e.push(o))}},e}},function(e,t,n){function r(e,t){for(var n=0;n<e.length;n++){var r=e[n],a=f[r.id];if(a){a.refs++;for(var i=0;i<a.parts.length;i++)a.parts[i](r.parts[i]);for(;i<r.parts.length;i++)a.parts.push(c(r.parts[i],t))}else{for(var o=[],i=0;i<r.parts.length;i++)o.push(c(r.parts[i],t));f[r.id]={id:r.id,refs:1,parts:o}}}}function a(e){for(var t=[],n={},r=0;r<e.length;r++){var a=e[r],i=a[0],o=a[1],s=a[2],l=a[3],c={css:o,media:s,sourceMap:l};n[i]?n[i].parts.push(c):t.push(n[i]={id:i,parts:[c]})}return t}function i(e,t){var n=b(),r=y[y.length-1];if("top"===e.insertAt)r?r.nextSibling?n.insertBefore(t,r.nextSibling):n.appendChild(t):n.insertBefore(t,n.firstChild),y.push(t);else{if("bottom"!==e.insertAt)throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");n.appendChild(t)}}function o(e){e.parentNode.removeChild(e);var t=y.indexOf(e);t>=0&&y.splice(t,1)}function s(e){var t=document.createElement("style");return t.type="text/css",i(e,t),t}function l(e){var t=document.createElement("link");return t.rel="stylesheet",i(e,t),t}function c(e,t){var n,r,a;if(t.singleton){var i=m++;n=v||(v=s(t)),r=u.bind(null,n,i,!1),a=u.bind(null,n,i,!0)}else e.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(n=l(t),r=d.bind(null,n),a=function(){o(n),n.href&&URL.revokeObjectURL(n.href)}):(n=s(t),r=p.bind(null,n),a=function(){o(n)});return r(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;r(e=t)}else a()}}function u(e,t,n,r){var a=n?"":r.css;if(e.styleSheet)e.styleSheet.cssText=x(t,a);else{var i=document.createTextNode(a),o=e.childNodes;o[t]&&e.removeChild(o[t]),o.length?e.insertBefore(i,o[t]):e.appendChild(i)}}function p(e,t){var n=t.css,r=t.media;if(r&&e.setAttribute("media",r),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}function d(e,t){var n=t.css,r=t.sourceMap;r&&(n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(r))))+" */");var a=new Blob([n],{type:"text/css"}),i=e.href;e.href=URL.createObjectURL(a),i&&URL.revokeObjectURL(i)}var f={},h=function(e){var t;return function(){return"undefined"==typeof t&&(t=e.apply(this,arguments)),t}},g=h(function(){return/msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase())}),b=h(function(){return document.head||document.getElementsByTagName("head")[0]}),v=null,m=0,y=[];e.exports=function(e,t){t=t||{},"undefined"==typeof t.singleton&&(t.singleton=g()),"undefined"==typeof t.insertAt&&(t.insertAt="bottom");var n=a(e);return r(n,t),function(e){for(var i=[],o=0;o<n.length;o++){var s=n[o],l=f[s.id];l.refs--,i.push(l)}if(e){var c=a(e);r(c,t)}for(var o=0;o<i.length;o++){var l=i[o];if(0===l.refs){for(var u=0;u<l.parts.length;u++)l.parts[u]();delete f[l.id]}}}};var x=function(){var e=[];return function(t,n){return e[t]=n,e.filter(Boolean).join("\n")}}()}]);