!function(){var e=Scope.createElement;webpackJsonp([1],[,,,,,function(n,t,i){"use strict";var o=i(6),r=o.utils,a=r.getScope,s=r.isObject,l=r.isFunction,c=i(3),p=c.NAMESPACE;i(7),n.exports=function(n,t){var i=function(e){return e=parseInt(e),!isNaN(e)&&e},c=20,u=function(){var e={},n=/(\/)?(\?|#)([^\/]+)(\/)?$/gi.exec(History.getPageUrl());if(n&&n.length>=4){var t=n[3];t.split("&").forEach(function(n){n=n.split("="),2==n.length&&(e[n[0]]=decodeURIComponent(n[1]))})}return e};return o.createClass({cid:1,pagination:{page:1,total:1,size:15},table:{labels:[],onSort:null,height:null},data:{page:1,total:1,size:20,data:[]},query:{word:"",page:1,size:c},requestState:{finished:!0,xhr:null},request:function(e,n,t){var i=this,o=i.requestState,r=i.refs,s=i.refs.error,c=r.pagination,p=r.loading,u=r.table,d=a(u).refs.body;n||(p.css({width:"100%",height:d.outerHeight(),position:"relative"}).html($('<div>\n                    <i class="fa fa-spinner fa-pulse fa-fw"></i>\n                    <span>&nbsp;正在加载数据...</span>\n                </div>')).show(),s.text("").hide(),u.hide()),!o.finished&&o.xhr&&(o.xhr.abort(),o.xhr=null,o.finished=!0);var f=$.ajax($.extend({},i.props.request,{data:e}));return o.xhr=f,o.finished=!1,f.then(function(n){l(i.props.filter)&&(n=i.props.filter(n)),i.data=n,i.query=e,i.pagination.total!=n.total&&(i.pagination.total=n.total,a(c).updateTotal(n.total)),i.pagination.page!=e.page&&(i.pagination.page=e.page,a(c).updatePage(e.page)),a(u).updateTable(),u.show()},function(e){"abort"==e.statusText||t||s.css({width:"100%",height:d.outerHeight(),position:"relative",left:0}).text("数据加载失败!").show()}).always(function(){o.finished=!0,p.hide()})},beforeMount:function(){var e=this,n=this.pagination;e.cid=e.props.cid,s(e.props.pagination)&&(e.pagination=e.props.pagination,n.size=Math.abs(i(n.size)||15)),s(e.props.table)&&(e.table=$.extend({},e.props.table))},afterMount:function(){var e=this,n=u(),t=e.refs.content;e.refs.error.hide(),e.refs.loading.css({width:t.outerWidth(),height:t.outerHeight(),left:0,top:0}).show(),t.css("visibility","visible").hide();var i=function(){History.Adapter.bind(window,"statechange",function(){var n=History.getState().data;n.cid==e.cid&&e.request(n.query||e.query)})},o=function(n){History.replaceState({cid:e.cid,query:n},null,null),e.request(n,!0,!0).then(function(){t.show(),e.refs.input.val(n.word),i()},function(){e.refs.error.css({width:"100%",left:0,top:0}).show()})};if(n["cid_"+e.cid])try{var r=JSON.parse(decodeURI(n["cid_"+e.cid]));o(r)}catch(a){o(e.query)}else o(e.query)},beforeUpdate:function(){this.beforeMount()},afterUpdate:function(){History.pushState({},null,null),this.afterMount()},onSort:function(e,n,t){var i=this;l(i.table.onSort)&&(i.data.data.sort(i.table.onSort(e,n)),a(i.refs.table).updateTable(),t())},onPageSelect:function(e){var n=this,t=u(),o={word:n.query.word||"",page:Math.abs(i(e)||1),size:c};t["cid_"+n.cid]=encodeURI(JSON.stringify(o));try{History.pushState({cid:n.cid,query:o},null,"?"+$.param(t))}catch(r){console.log(r),a(n.refs.pagination).updatePage(n.query.page)}},onSubmit:function(e){r.stopPropagation(e);var n=this,t=u(),i={word:n.refs.input.val()||"",page:1,size:c};t["cid_"+n.cid]=encodeURI(JSON.stringify(i));try{History.pushState({cid:n.cid,query:i},null,"?"+$.param(t))}catch(o){console.log(o),a(n.refs.pagination).updatePage(n.query.page)}},onFocus:function(e,n){r.stopPropagation(e),n.addClass("focused")},onBlur:function(e,n){r.stopPropagation(e),n.removeClass("focused")},onRefresh:function(e,n){r.stopPropagation(n),r.preventDefault(n),e.call(this)},onTop:function(){r.stopPropagation(event),r.preventDefault(event),a(this.refs.table).refs.table.scrollTop(0)},render:function(){var i=this;return e("div",{"class":p+"page"},e("div",{ref:"content","class":"content"},e("div",{"class":"pagination"},e(n,{ref:"pagination",total:i.pagination.total,size:i.pagination.size,page:i.pagination.page,onPageSelect:i.onPageSelect.bind(i)})),e("div",{"class":"search"},e("span",{"class":"tool",onClick:i.onTop},"返回列表顶部"),e("span",{"class":"tool",onClick:i.onRefresh.bind(i,function(){i.request(i.query),a(i.refs.table).refs.table.scrollTop(0)})},"刷 新"),e("span",{"class":"submit",ref:"submit",onClick:i.onSubmit},"搜 索"),e("div",{"class":"input"},e("input",{type:"text",ref:"input",placeholder:"输入搜索关键字",onFocus:i.onFocus,onBlur:i.onBlur})),e("div",{style:"clear: both;"})),e("div",{"class":"table"},e(t.Table,{ref:"table",labels:i.table.labels,onSort:i.onSort.bind(i),height:i.table.height},function(){return l(i.props.dataRender)?i.props.dataRender(i.data):[]}))),e("div",{ref:"loading","class":"loading"},e("div",null,e("i",{"class":"fa fa-spinner fa-pulse fa-fw"}," "),e("span",null," 正在初始化列表..."))),e("div",{ref:"error","class":"error"},"列表初始化失败, 请",e("a",{"class":"refresh",onClick:i.onRefresh.bind(i,function(){i.afterMount()})},"刷新"),"重试。"))}})}},function(e,n){e.exports=Scope},function(e,n,t){var i=t(8);"string"==typeof i&&(i=[[e.id,i,""]]);t(10)(i,{});i.locals&&(e.exports=i.locals)},function(e,n,t){n=e.exports=t(9)(),n.push([e.id,"div.civil-page .content {\n  visibility: hidden;\n  position: relative;\n}\ndiv.civil-page .content .pagination {\n  margin: 10px 0;\n}\ndiv.civil-page .content .search {\n  margin: 10px 0;\n}\ndiv.civil-page .content .search .tool {\n  font-size: 12px;\n  line-height: 12px;\n  border: 1px solid transparent;\n  float: left;\n  color: #4795d8;\n  cursor: pointer;\n  margin: 0 5px;\n  margin-top: 15px;\n  text-decoration: none;\n}\ndiv.civil-page .content .search .tool:hover {\n  text-decoration: underline;\n}\ndiv.civil-page .content .search .input {\n  float: right;\n  display: inline-block;\n  *zoom: 1;\n  *display: inline;\n  font-size: 12px;\n  line-height: 1.42857;\n}\ndiv.civil-page .content .search .input input {\n  padding: 5px 10px;\n  text-align: left;\n  width: 300px;\n  vertical-align: middle;\n  border: 1px solid #D4D4D4;\n  cursor: text;\n  background: none transparent;\n  box-shadow: none;\n  font-family: inherit;\n  font-size: inherit;\n  margin: 0;\n  outline: none;\n  display: inline-block;\n  *zoom: 1;\n  *display: inline;\n  -webkit-appearance: none;\n}\ndiv.civil-page .content .search .input input.focused {\n  border-color: #2DB7F5;\n}\ndiv.civil-page .content .search .submit {\n  float: right;\n  display: inline-block;\n  *zoom: 1;\n  *display: inline;\n  color: #ffffff;\n  margin: 0 10px;\n  padding: 5px 10px;\n  text-align: center;\n  font-size: 12px;\n  line-height: 1.42857;\n  border: 1px solid #428bca;\n  background-color: #428bca;\n  cursor: pointer;\n}\ndiv.civil-page .content .search .submit:hover {\n  border: 1px solid #4795d8;\n  background-color: #4795d8;\n}\ndiv.civil-page .loading,\ndiv.civil-page .error {\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 999;\n  background-color: #ffffff;\n  color: #444444;\n  text-align: center;\n  padding: 20px;\n}\ndiv.civil-page .error .refresh {\n  color: #4795d8;\n  cursor: pointer;\n  text-decoration: none;\n}\ndiv.civil-page .error .refresh:hover {\n  text-decoration: underline;\n}\n",""])},function(e,n){"use strict";e.exports=function(){var e=[];return e.toString=function(){for(var e=[],n=0;n<this.length;n++){var t=this[n];t[2]?e.push("@media "+t[2]+"{"+t[1]+"}"):e.push(t[1])}return e.join("")},e.i=function(n,t){"string"==typeof n&&(n=[[null,n,""]]);for(var i={},o=0;o<this.length;o++){var r=this[o][0];"number"==typeof r&&(i[r]=!0)}for(o=0;o<n.length;o++){var a=n[o];"number"==typeof a[0]&&i[a[0]]||(t&&!a[2]?a[2]=t:t&&(a[2]="("+a[2]+") and ("+t+")"),e.push(a))}},e}},function(e,n,t){function i(e,n){for(var t=0;t<e.length;t++){var i=e[t],o=f[i.id];if(o){o.refs++;for(var r=0;r<o.parts.length;r++)o.parts[r](i.parts[r]);for(;r<i.parts.length;r++)o.parts.push(c(i.parts[r],n))}else{for(var a=[],r=0;r<i.parts.length;r++)a.push(c(i.parts[r],n));f[i.id]={id:i.id,refs:1,parts:a}}}}function o(e){for(var n=[],t={},i=0;i<e.length;i++){var o=e[i],r=o[0],a=o[1],s=o[2],l=o[3],c={css:a,media:s,sourceMap:l};t[r]?t[r].parts.push(c):n.push(t[r]={id:r,parts:[c]})}return n}function r(e,n){var t=v(),i=x[x.length-1];if("top"===e.insertAt)i?i.nextSibling?t.insertBefore(n,i.nextSibling):t.appendChild(n):t.insertBefore(n,t.firstChild),x.push(n);else{if("bottom"!==e.insertAt)throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");t.appendChild(n)}}function a(e){e.parentNode.removeChild(e);var n=x.indexOf(e);n>=0&&x.splice(n,1)}function s(e){var n=document.createElement("style");return n.type="text/css",r(e,n),n}function l(e){var n=document.createElement("link");return n.rel="stylesheet",r(e,n),n}function c(e,n){var t,i,o;if(n.singleton){var r=y++;t=b||(b=s(n)),i=p.bind(null,t,r,!1),o=p.bind(null,t,r,!0)}else e.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(t=l(n),i=d.bind(null,t),o=function(){a(t),t.href&&URL.revokeObjectURL(t.href)}):(t=s(n),i=u.bind(null,t),o=function(){a(t)});return i(e),function(n){if(n){if(n.css===e.css&&n.media===e.media&&n.sourceMap===e.sourceMap)return;i(e=n)}else o()}}function p(e,n,t,i){var o=t?"":i.css;if(e.styleSheet)e.styleSheet.cssText=m(n,o);else{var r=document.createTextNode(o),a=e.childNodes;a[n]&&e.removeChild(a[n]),a.length?e.insertBefore(r,a[n]):e.appendChild(r)}}function u(e,n){var t=n.css,i=n.media;if(i&&e.setAttribute("media",i),e.styleSheet)e.styleSheet.cssText=t;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(t))}}function d(e,n){var t=n.css,i=n.sourceMap;i&&(t+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(i))))+" */");var o=new Blob([t],{type:"text/css"}),r=e.href;e.href=URL.createObjectURL(o),r&&URL.revokeObjectURL(r)}var f={},h=function(e){var n;return function(){return"undefined"==typeof n&&(n=e.apply(this,arguments)),n}},g=h(function(){return/msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase())}),v=h(function(){return document.head||document.getElementsByTagName("head")[0]}),b=null,y=0,x=[];e.exports=function(e,n){n=n||{},"undefined"==typeof n.singleton&&(n.singleton=g()),"undefined"==typeof n.insertAt&&(n.insertAt="bottom");var t=o(e);return i(t,n),function(e){for(var r=[],a=0;a<t.length;a++){var s=t[a],l=f[s.id];l.refs--,r.push(l)}if(e){var c=o(e);i(c,n)}for(var a=0;a<r.length;a++){var l=r[a];if(0===l.refs){for(var p=0;p<l.parts.length;p++)l.parts[p]();delete f[l.id]}}}};var m=function(){var e=[];return function(n,t){return e[n]=t,e.filter(Boolean).join("\n")}}()}])}();