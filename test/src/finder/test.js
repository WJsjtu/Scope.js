!function(){var e=Scope.createElement;!function(e){function o(n){if(t[n])return t[n].exports;var l=t[n]={exports:{},id:n,loaded:!1};return e[n].call(l.exports,l,l.exports,o),l.loaded=!0,l.exports}var t={};return o.m=e,o.c=t,o.p="",o(0)}([function(o,t,n){var l=n(1),i=n(2),r=i.NAMESPACE,c=r.toUpperCase().replace(/-$/g,"");window[c].getComponents(["finder"],function(o){$(function(){var t=function(e,o){console.log(e)};l.render(e(o,{cid:"2",request:{url:"http://localhost/public/mp.php/user/explorer",method:"post",dataType:"json",timeout:3e3},height:"400",staticPath:"./icons/",activePath:"server/default/photo",multiple:!0,disableHistory:!0,onRequestError:t,onFileSelect:function(e){console.log("onFileSelect",e)},onFileDelete:function(e){console.log("onFileDelete",e)},onFileUpload:function(e,o){console.log("onFileUpload",e,o)}}),document.getElementById("container"),this)})})},function(e,o){e.exports=Scope},function(e,o){e.exports={NAMESPACE:"civil-",VERSION:"1.0.1"}}])}();