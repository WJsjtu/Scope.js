/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	if (false) {
	    require('./polyfill');
	}

	function isElement(obj) {

	    if (window.HTMLElement || window.Element) {
	        //Using W3 DOM2 (works for FF, Opera and Chrome
	        var ElementClass = window.HTMLElement ? window.HTMLElement : window.Element;
	        return obj instanceof ElementClass;
	    } else {
	        //Browsers not supporting W3 DOM2 don't have HTMLElement and
	        //an exception is thrown and we end up here. Testing some
	        //properties that all elements have. (works on IE7)
	        return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === "object" && obj.nodeType === 1 && _typeof(obj.style) === "object" && _typeof(obj.ownerDocument) === "object";
	    }
	}

	var html2Escape = function html2Escape(sHtml) {
	    return sHtml.replace(/[<>&"]/g, function (c) {
	        return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c];
	    });
	};

	var selfCloseTags = 'br hr img map area base input'.split(' ');

	var Scope = {};

	var attrString = 'data-scopeid';

	var getPropString = function getPropString(props) {
	    var propString = '';
	    Object.keys(props).forEach(function (key) {
	        var value = props[key];
	        propString += ' ' + key + '="' + ('' + html2Escape(typeof value == 'function' ? value() : value)) + '"';
	    });
	    return propString;
	};

	function ScopeTree(rootID, context) {
	    var me = this;
	    me.rootID = rootID;
	    me.refs = {};
	    me.events = {};
	    me.context = context;
	    me.children = [];
	}

	ScopeTree.prototype.createChild = function (_rootID, _context) {
	    var result = new ScopeTree(_rootID, _context);
	    this.children.push(result);
	    return result;
	};

	function NodeData(tagName, props, children, events, ref) {
	    var me = this;
	    me.tagName = tagName;
	    me.props = props;
	    me.children = children;
	    me.events = events;
	    ref && (me.ref = ref);
	}

	Scope.createElement = function () {
	    var args = Array.prototype.slice.call(arguments, 0);
	    var firstTwo = args.splice(0, 2);
	    var tagName = firstTwo[0];
	    var propObject = firstTwo[1];
	    var children = args;

	    var props = {},
	        events = {},
	        ref = null;

	    if (propObject) {
	        Object.keys(propObject).forEach(function (key) {
	            var _key = '' + key;
	            var value = propObject[key];
	            if (_key == 'ref') {
	                ref = '' + value;
	            } else if (_key.startsWith('on')) {
	                if (typeof value == 'function' || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object') {
	                    events[_key.replace(/^on/, '').toLowerCase()] = value;
	                }
	            } else {
	                props[_key] = value;
	            }
	        });
	    }

	    return new NodeData(tagName, props, children, events, ref);
	};

	var renderHTML = function renderHTML(data, currentId, scopeTree, isRoot) {

	    //这是可能的, 当函数作为变量的时候却返回空值
	    if (!data) {
	        return null;
	    }

	    //当数据源是函数时,在指定的环境中动态生成元素节点
	    if (typeof data == 'function') {
	        data = data.bind(scopeTree.context)();
	    }

	    //如果数据源是一个元素数组,那么递归渲染
	    if (Array.isArray(data)) {
	        var _ret = function () {
	            var resultArray = [];
	            data.forEach(function (dataItem, index) {
	                var resultRenderedData = renderHTML(dataItem, currentId + '.' + index, scopeTree);
	                if (resultRenderedData != null) {
	                    resultArray.push(resultRenderedData);
	                }
	            });
	            return {
	                v: resultArray.join('')
	            };
	        }();

	        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	    }

	    //这在内容为纯文本的节点是可能的
	    if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) != 'object') {
	        return '' + data;
	    }

	    //如果一个数据源是非法的提出错误
	    if (!(data instanceof NodeData)) {
	        console.log('A function element returns null!');
	        return null;
	    }

	    //基础HTML元素
	    if (typeof data.tagName == 'string') {

	        //处理 ref 指针的 Map 存储 ref
	        if (data.ref) {
	            data.ref = html2Escape(data.ref);
	            scopeTree.refs[currentId] = data;
	        }

	        //处理事件的 Map
	        var hasEvent = Object.keys(data.events).length;
	        if (hasEvent) {
	            scopeTree.events[currentId] = data;
	        }

	        //计算属性值
	        var propString = getPropString(data.props);

	        if (selfCloseTags.indexOf(data.tagName) != -1) {
	            return '<' + data.tagName + propString + (' ' + attrString + '="' + currentId + '"') + '/>';
	        } else {
	            var _ret2 = function () {
	                var childrenHtml = [];
	                data.children.forEach(function (child, index) {
	                    var childHtml = renderHTML(child, currentId + '.' + index, scopeTree);
	                    if (childHtml != null) {
	                        childrenHtml.push(childHtml);
	                    }
	                });
	                return {
	                    v: '<' + data.tagName + propString + (' ' + attrString + '="' + currentId + '"') + '>' + childrenHtml.join('') + '</' + data.tagName + '>'
	                };
	            }();

	            if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
	        }
	    }
	    //处理组件嵌套
	    else if (data.tagName instanceof Component) {

	            //处理 ref 指针的 Map 存储 ref
	            if (data.ref) {
	                data.ref = html2Escape(data.ref);
	                scopeTree.refs[currentId] = data;
	            }

	            //处理事件的 Map
	            var _hasEvent = Object.keys(data.events).length;
	            if (_hasEvent) {
	                scopeTree.events[currentId] = data;
	            }

	            var tagContext = data.tagName.context;

	            tagContext = $.extend({}, tagContext, {
	                props: data.props || {}
	            });

	            var rootData = tagContext.render();

	            if (!(rootData instanceof NodeData)) {
	                throw new TypeError('Render function should return element!');
	            }

	            return renderHTML(rootData, currentId, isRoot ? scopeTree : scopeTree.createChild(currentId, tagContext));
	        } else {
	            console.log('An unknown type of element!');
	            return null;
	        }
	};

	function ElementReference(id, $element, updateFunc, refs) {
	    var me = this;
	    me.id = id;
	    me.$ele = $element;
	    me.refs = refs;
	    me.update = function () {
	        updateFunc();
	        return me;
	    };
	}

	var getUpdateFunc = function getUpdateFunc(data, currentId, scopeTree, $element) {

	    return function (propsUpdate) {

	        if (selfCloseTags.indexOf(data.tagName) == -1) {
	            (function () {

	                var resultArray = [];

	                data.children.forEach(function (dataItem, index) {
	                    var resultRenderedData = renderHTML(dataItem, currentId + '.' + index, scopeTree);

	                    if (resultRenderedData != null) {
	                        resultArray.push(resultRenderedData);
	                    }
	                });

	                var childHtml = resultArray.join('');
	                $element.html(childHtml);

	                registerScope(scopeTree, $element);
	            })();
	        }
	        if (propsUpdate) {
	            $element.attr(data.props);
	        }
	    };
	};

	var registerScope = function registerScope(scopeTree, $wrapper) {
	    var refRecord = {};
	    Object.keys(scopeTree.refs).forEach(function (id) {
	        var data = scopeTree.refs[id],
	            $element = $wrapper.find('[' + attrString + '="' + id + '"]');

	        var updateFunc = getUpdateFunc(data, id, scopeTree, $element);

	        refRecord[data.ref] = new ElementReference(id, $element, updateFunc, refRecord);
	    });

	    Object.keys(scopeTree.events).forEach(function (id) {
	        var data = scopeTree.events[id],
	            context = scopeTree.context,
	            $element = $wrapper.find('[' + attrString + '="' + id + '"]');

	        var updateFunc = getUpdateFunc(data, id, scopeTree, $element);

	        var elementRef = new ElementReference(id, $element, updateFunc, refRecord);

	        Object.keys(data.events).forEach(function (eventName) {
	            var eventHandler = data.events[eventName];

	            //处理自身的事件
	            if (typeof eventHandler == 'function') {
	                $element.on(eventName, function (event) {
	                    eventHandler.bind(context)(new EventHandler(elementRef, $element, refRecord), event);
	                });
	            }
	            //处理 on 函数
	            else if ((typeof eventHandler === 'undefined' ? 'undefined' : _typeof(eventHandler)) == 'object') {
	                    Object.keys(eventHandler).forEach(function (selector) {
	                        $element.on(eventName, selector, function (event) {
	                            eventHandler[selector].bind(context)(new EventHandler(elementRef, $(this), refRecord), event);
	                        });
	                    });
	                }
	        });
	    });

	    scopeTree.children.forEach(function (childScopeTree) {
	        var _$wrapper = $wrapper.find('[' + attrString + '="' + childScopeTree.rootID + '"]');
	        var _refRecord = registerScope(childScopeTree, _$wrapper);
	        var hasRootData = scopeTree.refs[childScopeTree.rootID];
	        if (hasRootData) {
	            refRecord[hasRootData.ref].refs = _refRecord;
	        }
	    });
	    return refRecord;
	};

	function EventHandler(ownerRef, $this, refs) {
	    var me = this;
	    me.refs = refs;
	    me.ownerRef = ownerRef;
	    me.$this = $this;
	}

	var EventHandlerPrototype = EventHandler.prototype;
	EventHandlerPrototype.getTarget = function (event) {
	    event = event || window.event;
	    return event.target ? event.target : event.srcElement;
	};
	EventHandlerPrototype.preventDefault = function (event) {
	    event = event || window.event;
	    event.preventDefault ? event.preventDefault() : event.returnValue = false;
	};
	EventHandlerPrototype.stopPropagation = function (event) {
	    event = event || window.event;
	    event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
	};

	function Component(context) {
	    this.context = context;
	}

	Scope.render = function (rootData, dom, context) {
	    if (!(rootData instanceof NodeData)) {
	        throw new TypeError('Render function should return element!');
	    }

	    if (!dom instanceof window.jQuery && !isElement(dom)) {
	        throw new TypeError('Render function should receive a DOM!');
	    }

	    if (isElement(dom)) {
	        dom = $(dom);
	    }

	    var scopeTree = new ScopeTree('0', context);

	    var innerHTML = renderHTML(rootData, '0', scopeTree, true);

	    if (innerHTML != null) {
	        dom.html(innerHTML);
	        var $this = dom.children();
	        var refRecord = registerScope(scopeTree, $this);
	        return new ElementReference('0', $this, getUpdateFunc(rootData, '0', scopeTree, $this), refRecord);
	    } else {
	        return null;
	    }
	};

	Scope.createClass = function (context) {
	    if (typeof context.render != 'function') {
	        throw new TypeError('Render function not defined!');
	    }
	    return new Component(context);
	};

	window.Scope = Scope;
	module.exports = Scope;

/***/ }
/******/ ]);