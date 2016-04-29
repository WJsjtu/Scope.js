"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e};!function(e,t){function n(e){if(!i(e.render))throw new TypeError("Render function not defined!");this.context=e}function r(e,t,n,r,o){var a=this;a.tagName=e,a.props=t,a.children=n,a.events=r,a.ref=o}var o=".scope",a="scopeDataKey",i=function(e){return"function"==typeof e},f=function(e){return"string"==typeof e},u=function(e){return"object"===("undefined"==typeof e?"undefined":_typeof(e))},c=function(e){if(t.HTMLElement||t.Element){var n=t.HTMLElement?t.HTMLElement:t.Element;return e instanceof n}return u(e)&&1===e.nodeType&&u(e.style)&&u(e.ownerDocument)},p=function(e){return e.replace(/[<>&"]/g,function(e){return{"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[e]})},s="br hr img map area base input".split(" "),l=function m(t,o,c,p,l){var y=[];return t.forEach(function(t){if(!t)return!1;if(i(t)&&(t=t.call(o)),Array.isArray(t))return Array.prototype.push.apply(y,m(t,o,c,p,l)),!0;if(!u(t))return y.push(""+t),!0;if(!(t instanceof r))return!1;if(f(t.tagName))!function(){var n=e(document.createElement(t.tagName)),r={element:t,context:o,refs:c};r.updateProps=function(){t.props&&n.attr(t.props)},r.updateProps(),n.data(a,r),d(n),t.ref&&(c[t.ref]=n);var i=function(e,r){if(-1==s.indexOf(t.tagName)){var a=m(t.children,o,c,e,r);a.forEach(function(e){f(e)?n.text(n.text()+e):n.append(e)})}};i(p,l),r.update=function(){n.empty();var e={list:[]};i(e,!0);for(var t=e.list.length-1;t>=0;t--)e.list[t]();e.list=[]},y.push(n)}();else{if(!(t.tagName instanceof n))return!1;var h=v(t,o,c,p,l);t.ref&&(c[t.ref]=h),y.push(h)}}),y},d=function(t){var n=t.data(a),r=n.element,f=n.context;for(var c in r.events)r.events.hasOwnProperty(c)&&!function(){var n=r.events[c];if(i(n))t.on(c+o,function(e){n.call(f,t,e)});else if(u(n)){var a=function(r){n.hasOwnProperty(r)&&t.on(c+o,r,function(t){n[r].call(f,e(this),t)})};for(var p in n)a(p)}}()},v=function(t,o,u,c,p){var s=e.extend({},t.tagName.context,{props:e.extend({},t.props)});for(var v in s.props)s.props.hasOwnProperty(v)&&i(s.props[v])&&(s.props[v]=s.props[v].bind(o));i(s.beforeMount)&&s.beforeMount.call(s);var y=s.render.call(s);if(!(y&&y instanceof r))return null;var m={};if(f(y.tagName)){var h=function(){var n=e(document.createElement(y.tagName)),r={element:y,context:s,refs:m,component:{context:o,element:t,refs:u}};r.updateProps=function(){y.props&&n.attr(y.props)},r.updateProps(),n.data(a,r);var v=function(e,t){var r=l(y.children,s,m,e,t);r.forEach(function(e){f(e)?n.text(n.text()+e):n.append(e)})};return v(c,p),r.update=function(){n.empty();var e={list:[]};v(e,!0);for(var t=e.list.length-1;t>=0;t--)e.list[t]();e.list=[],i(s.afterUpdate)&&s.afterUpdate.call(s,n)},d(n),c&&Array.isArray(c.list)&&(i(s.afterMount)&&!p&&c.list.push(s.afterMount.bind(s,n)),i(s.afterUpdate)&&p&&c.list.push(s.afterUpdate.bind(s,n))),y.ref&&(m[y.ref]=n),{v:n}}();if("object"===("undefined"==typeof h?"undefined":_typeof(h)))return h.v}else if(!(y.tagName instanceof n))return null},y={createClass:function(e){return new n(e)},createElement:function(){var e=Array.prototype.slice.call(arguments,0),t=e.splice(0,2),o=t[0],a=t[1],c=e,s={},l={},d=null;if(a&&(f(o)||o instanceof n))for(var v in a)if(a.hasOwnProperty(v)){var y=""+v,m=a[v];"ref"==y?d=p(""+m):y.startsWith("on")&&f(o)?m&&(i(m)||u(m))&&(l[y.replace(/^on/,"").toLowerCase()]=m):s[y]=m}return new r(o,s,c,l,d)},render:function(t,o,a){if(!(t instanceof r))throw new TypeError("Render function should return element!");if(!o instanceof e&&!c(o))throw new TypeError("Render function should receive a DOM!");c(o)&&(o=e(o));var i={list:[]},f=t.tagName instanceof n?t:function(){var e=y.createClass({render:u(a)?function(){return t}.bind(a):function(){return t}});return y.createElement(e,null)}(),p=v(f,a,{},i,!1);o.empty().append(p);for(var s=i.list.length-1;s>=0;s--)i.list[s]();return i.list=[],p}};y.utils={getTarget:function(e){return e=e||t.event,e.target?e.target:e.srcElement},preventDefault:function(e){e=e||t.event,e.preventDefault?e.preventDefault():e.returnValue=!1},stopPropagation:function(e){e=e||t.event,e.stopPropagation?e.stopPropagation():e.cancelBubble=!0},getRefs:function(t){if(!(t instanceof e))return{};var n=t.data(a);return n.refs?n.refs:{}},update:function(t){if(t instanceof e){var n=t.data(a);i(n.update)&&n.update(!0)}},updateProps:function(t){if(t instanceof e){var n=t.data(a);i(n.updateProps)&&n.updateProps()}},execute:function(){var t=Array.prototype.slice.call(arguments,0),n=t.splice(0,2),r=n[0],o=""+n[1];if(r instanceof e&&o){var f=r.data(a);u(f.context)&&i(f.context[o])&&f.context[o].apply(f.context,t)}}},t.Scope=y}(jQuery,window);