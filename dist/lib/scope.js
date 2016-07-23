!function(e){function n(r){if(t[r])return t[r].exports;var o=t[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,n),o.loaded=!0,o.exports}var t={};return n.m=e,n.c=t,n.p="",n(0)}([function(e,n,t){"use strict";var r=t(1),o=r.SC,i=r.SE,c=r.JC,a=r.JE,l=t(2),s=l.isElement,f=l.isObject,u=l.isFunction,p=t(4),d={createElement:t(8),createClass:function(e){return new c(e)},render:function(e,n,r){if(!(e instanceof a))throw new TypeError("Scope.render type error!");if(!(n instanceof p||s(n)))throw new TypeError("Scope.render should mount element on a DOM or a jQuery Object!");s(n)&&(n=p(n));var l=function(e){if(e instanceof o){var n=e.context;f(n)&&u(n.afterMount)&&n.afterMount.call(n)}},v=t(5),m=t(6),E=t(7);if(e.tagName instanceof c){var h=new o(new i(null,e));return v.c(null,h,!1),m.c(h)?(n.empty().append(h.sElementTree.$ele),E(h,l),h):null}var y=new o(new i(null,function(){var n=d.createClass({render:f(r)?function(){return e}.bind(r):function(){return e}});return __Scope_createElement__(n,null)}()));return v.c(null,y,!1),m.c(y)?(n.empty().append(y.sElementTree.$ele),E(y,l),y):null},utils:t(2),version:"4.0.7"};window.Scope=e.exports=d},function(e,n,t){"use strict";function r(e){this.context=e}function o(e,n,t,r,o){var i=this;i.tagName=e,i.props=n,i.children=t,i.event=r,i.ref=o}function i(e,n){var t=this,r=e["class"].tagName;t["class"]=r;var o=t.context=$.extend(!0,{},r.context);o.props=$.extend(!1,{},e["class"].props),o.props.children=e["class"].children,n?l(o.beforeUpdate)&&o.beforeMount.call(o):l(o.beforeMount)&&o.beforeMount.call(o),l(o.render)?t.jElementTree=o.render.call(o):t.jElementTree=null,t.sElementTree=null,t.children=[],t.parent=null,t.refs={},t.sElement=e}function c(e,n){var t=this;t["class"]=n,t.sComponent=e,t.children=[],t.event=[],t.$ele=null}var a=t(2),l=a.isFunction;e.exports={JC:r,JE:o,SC:i,SE:c}},function(e,n,t){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e},o=function(e){return"[object Function]"===Object.prototype.toString.call(e)},i=function(e){return"string"==typeof e},c=function(e){return"object"===("undefined"==typeof e?"undefined":r(e))},a=function(e){if(window.HTMLElement||window.Element){var n=window.HTMLElement?window.HTMLElement:window.Element;return e instanceof n}return c(e)&&1===e.nodeType&&c(e.style)&&c(e.ownerDocument)},l=function(e){return e.replace(/[<>&"]/g,function(e){return{"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[e]})},s={SCOPE_DATA_KEY:"scopeDataKey",SCOPE_CLOSE_TAG:"br hr img map area base input".split(" "),isFunction:o,isString:i,isObject:c,isElement:a,escapeHtml:l,getTarget:function(e){return e=e||window.event,e.target?e.target:e.srcElement},preventDefault:function(e){e=e||window.event,e.preventDefault?e.preventDefault():e.returnValue=!1},stopPropagation:function(e){e=e||window.event,e.stopPropagation?e.stopPropagation():e.cancelBubble=!0},getScope:function(e){if(e instanceof $){var n=e.data(s.SCOPE_DATA_KEY);if(n&&n.sComponent)return n.sComponent.context}return null},update:function(e){if(e instanceof $){var n=e.data(s.SCOPE_DATA_KEY);n&&t(3)(n)}return!1}};e.exports=s},function(e,n,t){"use strict";var r=t(1),o=r.SE,i=r.SC,c=r.JE,a=t(2),l=a.isString,s=a.isObject,f=a.isFunction,u=t(4),p=function v(e,n){u.isArray(e.children)&&e.children.forEach(function(e){if(e instanceof o){v(e,!0);var n=e["class"];n instanceof c&&l(n.ref)&&e.sComponent instanceof i&&delete e.sComponent.refs[n.ref]}else if(e instanceof i){v(e.sElementTree,!0);var t=e.sElement;l(t["class"].ref)&&e.parent instanceof i&&delete e.parent.refs[t["class"].ref]}}),e.children=[],n&&e.$ele instanceof u&&(u.isArray(e.event)&&e.event.forEach(function(n){var t=n[0],r=n[1],o=n[2];null==r?e.$ele.off(t,o):e.$ele.off(t,r,o)}),e.event=[],e.$ele.remove(),e.$ele=null)},d=function(e){if(!(e instanceof o))return console.log("Scope: invalid ScopeElement arg for update",e),!1;var n=e.$ele;if(!(n instanceof u))return console.log("Scope: invalid jQuery instance of a ScopeElement",e),!1;var r=t(5),c=t(6),a=t(7);p(e,!1);var l=function(e){if(e instanceof i){var n=e.context;s(n)&&f(n.afterUpdate)&&n.afterUpdate.call(n)}};if(e.sComponent.sElementTree===e){var d=e.sComponent;r.e(d.sElementTree,!0),c.c(d,!0)&&a(d,l)}else{var v=function(e){this.children=[],this.check=function(n){n.parent===e&&this.children.push(n)}};r.e(e,!0);var m=new v(e.sComponent);c.e(e,!0,m)&&m.children.forEach(function(e){a(e,l)})}};e.exports=d},function(e,n){e.exports=jQuery},function(e,n,t){"use strict";var r=t(2),o=r.isFunction,i=r.isString,c=r.isObject,a=t(1),l=a.SE,s=a.SC,f=a.JE,u=a.JC,p=function(e,n,t){n.parent=e,e instanceof s&&($.isArray(e.children)||(e.children=[]),e.children.push(n));var r=new l(n,n.jElementTree);n.sElementTree=r,d(r,t)},d=function v(e,n){var t=e.sComponent,r=e["class"];if(null!=r){var a=t.context,d=function E(e){var n=[];e.forEach(function(e){if("undefined"==typeof e||null===e)return!1;for(;o(e);)e=e.call(a);return $.isArray(e)?(Array.prototype.push.apply(n,e),!0):c(e)?e instanceof f&&(!!(i(e.tagName)||e.tagName instanceof u)&&void n.push(e)):(n.push(""+e),!0)});for(var t=!1,r=n.length-1;r>=0;r--){if(o(n[r])){t=!0;break}c(n[r])||i(n[r])||(n[r]=""+n[r])}return t?E(n):n},m=d(r.children);e.children=m.map(function(e){return new l(t,e)}),function(){for(var r=e.children.length-1;r>=0;r--){var o=e.children[r],a=o["class"];if(c(a))if(a.tagName instanceof u){var l=new s(o,n);e.children[r]=l,p(t,l)}else i(a.tagName)&&v(o)}}()}};e.exports={c:p,e:d}},function(e,n,t){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e},o=t(1),i=o.SC,c=o.SE,a=o.JE,l=t(2),s=l.isString,f=l.isObject,u=l.isFunction,p=l.SCOPE_CLOSE_TAG,d=l.SCOPE_DATA_KEY,v=function(e,n,t){if(!(e instanceof i))return console.log("Scope: invalid ScopeComponent arg for render",e),!1;var r=e.context;r.refs=e.refs;var o=e.sElement,c=e.sElementTree;return t&&t.check(e),!!m(c,n,t)&&(s(o["class"].ref)&&e.parent instanceof i&&(e.parent.refs[o["class"].ref]=c.$ele),r.$ele=c.$ele,!0)},m=function E(e,n,t){if(!(e instanceof c))return console.log("Scope: invalid ScopeElement arg for render",e),!1;var o=e.sComponent,l=e["class"],m=o.context;if(!(l instanceof a))return s(l)?(e.$ele=$(document.createTextNode(l)),!0):(console.log("Scope: unknown element type for render",l),!1);var h=function(){var r=l.tagName;if(!s(r))return console.log("Scope: invalid element tag for render",r),{v:!1};n||(e.$ele=$(document.createElement(r)).attr(l.props).data(d,e));var a=e.$ele;return o&&s(l.ref)&&(o.refs[l.ref]=a),function(){for(var n in l.event)l.event.hasOwnProperty(n)&&!function(){var t=l.event[n];if(u(t)){var r=function(e){t.call(m,e,a,a)};a.on(n,r),e.event.push([n,null,r])}else if(f(t)){var o=function(r){if(t.hasOwnProperty(r)){if(!u(t[r]))return console.log("Scope: invalid event handler",t[r]),"continue";var o=function(e){t[r].call(m,e,$(this),a)};a.on(n,r,o),e.event.push([n,r,o])}};for(var i in t){o(i)}}else console.log("Scope: unknown event type",t)}()}(),p.indexOf(r)===-1&&e.children.forEach(function(e){if(e instanceof c)E(e,!1,t),a.append(e.$ele);else if(e instanceof i){if(!v(e,!1,t))return!1;a.append(e.sElementTree.$ele)}}),{v:!0}}();return"object"===("undefined"==typeof h?"undefined":r(h))?h.v:void 0};e.exports={c:v,e:m}},function(e,n){"use strict";var t=function r(e,n){e.children.forEach(function(e){r(e,n)}),n(e)};e.exports=t},function(e,n,t){"use strict";var r=t(2),o=r.isString,i=r.isFunction,c=r.isObject,a=r.escapeHtml,l=t(1),s=l.JC,f=l.JE;e.exports=function(){var e=Array.prototype.slice.call(arguments,0),n=e.splice(0,2),t=n[0],r=n[1],l=e,u={},p={},d=null;if(null!==r&&(o(t)||t instanceof s))for(var v in r)if(r.hasOwnProperty(v)){var m=r[v];"ref"===v?d=a(""+m):v.match(/^on/)&&o(t)?m&&(i(m)||c(m))&&(p[v.replace(/^on/,"").toLowerCase()]=m):u[v]=m}return new f(t,u,l,p,d)}}]);