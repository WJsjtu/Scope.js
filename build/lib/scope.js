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

	var $ = __webpack_require__(1);

	if (false) {
	    require('./polyfill');
	}

	var eventNamespace = '.scope';

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

	var escapeHtml = function escapeHtml(html) {
	    return html.replace(/[<>&"]/g, function (c) {
	        return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c];
	    });
	};

	var selfCloseTags = 'br hr img map area base input'.split(' ');

	function SComponent(context) {
	    if (typeof context.render != 'function') {
	        throw new TypeError('Render function not defined!');
	    }
	    this.context = context;
	}

	function SElement(tagName, props, children, events, ref) {
	    var me = this;
	    me.tagName = tagName;
	    me.props = props;
	    me.children = children;
	    me.events = events;
	    me.ref = ref;
	}

	function SReference($ele, element, context, refs, $component) {
	    var me = this;
	    me.$ele = $ele;
	    if ($component) {
	        me.refs = $component.refs;
	    }

	    me.update = function (updateProps) {

	        var _update = function _update(_element, _refs, _context) {
	            if (selfCloseTags.indexOf(_element.tagName) == -1) {
	                (function () {
	                    var tempRefs = {};
	                    var $children = renderChildren(_element.children, _context, tempRefs);
	                    $ele.empty();
	                    $children.forEach(function ($child) {
	                        if (typeof $child == 'string') {
	                            $ele.text($ele.text() + $child);
	                        } else {
	                            $ele.append($child);
	                        }
	                    });
	                    Object.keys(_refs).forEach(function (refName) {
	                        if (tempRefs[refName]) {
	                            _refs[refName] = tempRefs[refName];
	                        } else {
	                            tempRefs[refName] = _refs[refName];
	                        }
	                    });
	                })();
	            }
	        };

	        if (typeof element.tagName == 'string') {
	            _update(element, refs, context);
	        } else if (element.tagName instanceof SComponent && $component) {
	            _update($component.element, $component.refs, $component.context);
	        }
	        if (updateProps) {
	            $ele.attr(element.props);
	        }
	    };

	    if (element.tagName instanceof SComponent && $component) {
	        me.render = function (updateProps) {
	            var _context = $.extend({}, $component.context, {
	                props: element.props
	            });
	            var _element = _context.render.bind(_context)();
	            var tempRefs = {};

	            elementBindEvents(_element, $ele, _context, tempRefs);

	            var $children = renderChildren(_element.children, _context, tempRefs);

	            me.refs = tempRefs;
	            $component.refs = tempRefs;
	            $component.element = _element;
	            $component.context = _context;

	            $ele.empty();
	            $children.forEach(function ($child) {
	                if (typeof $child == 'string') {
	                    $ele.text($ele.text() + $child);
	                } else {
	                    $ele.append($child);
	                }
	            });

	            if (updateProps) {
	                $ele.attr(element.props);
	            }
	        };
	    }
	}

	function SEvent(refs, owner, $ele) {
	    var me = this;
	    me.refs = refs;
	    me.owner = owner;
	    me.$ele = $ele;
	}

	var SEventPrototype = SEvent.prototype;
	SEventPrototype.getTarget = function (event) {
	    event = event || window.event;
	    return event.target ? event.target : event.srcElement;
	};
	SEventPrototype.preventDefault = function (event) {
	    event = event || window.event;
	    event.preventDefault ? event.preventDefault() : event.returnValue = false;
	};
	SEventPrototype.stopPropagation = function (event) {
	    event = event || window.event;
	    event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
	};

	var elementBindEvents = function elementBindEvents(element, $this, context, refs) {
	    Object.keys(element.events).forEach(function (eventName) {
	        var eventHandler = element.events[eventName];
	        var owner = new SReference($this, element, context, refs);
	        if (typeof eventHandler == 'function') {
	            $this.on(eventName + eventNamespace, function (event) {
	                eventHandler.bind(context)(new SEvent(refs, owner, $this), event);
	            });
	        } else if ((typeof eventHandler === 'undefined' ? 'undefined' : _typeof(eventHandler)) == 'object') {
	            Object.keys(eventHandler).forEach(function (selector) {
	                $this.on(eventName + eventNamespace, selector, function (event) {
	                    eventHandler[selector].bind(context)(new SEvent(refs, owner, $(this)), event);
	                });
	            });
	        }
	    });
	};

	var renderChildren = function renderChildren(children, context, refs) {
	    var result = [];

	    children.forEach(function (childElement) {
	        //这是可能的, 当函数作为变量的时候却返回空值
	        if (!childElement) {
	            return false;
	        }
	        //当数据源是函数时,在指定的环境中动态生成元素节点
	        if (typeof childElement == 'function') {
	            childElement = childElement.bind(context)();
	        }

	        //如果数据源是一个元素数组,那么递归渲染
	        if (Array.isArray(childElement)) {
	            Array.prototype.push.apply(result, renderChildren(childElement, context, refs));
	            return true;
	        }

	        //这在内容为纯文本的节点是可能的
	        if ((typeof childElement === 'undefined' ? 'undefined' : _typeof(childElement)) != 'object') {
	            result.push('' + childElement);
	            return true;
	        }

	        //如果一个数据源是非法的提出错误
	        if (!(childElement instanceof SElement)) {
	            console.log('A function element returns non-element object!');
	            return false;
	        }

	        //基础HTML元素
	        if (typeof childElement.tagName == 'string') {
	            (function () {

	                var $child = $(document.createElement(childElement.tagName));
	                childElement.props && $child.attr(childElement.props);

	                elementBindEvents(childElement, $child, context, refs);

	                if (childElement.ref) {
	                    refs[childElement.ref] = new SReference($child, childElement, context, refs);
	                }

	                if (selfCloseTags.indexOf(childElement.tagName) == -1) {
	                    var $childChildren = renderChildren(childElement.children, context, refs);

	                    $childChildren.forEach(function ($childChild) {
	                        if (typeof $childChild == 'string') {
	                            $child.text($child.text() + $childChild);
	                        } else {
	                            $child.append($childChild);
	                        }
	                    });
	                }

	                result.push($child);
	            })();
	        } //处理组件嵌套
	        else if (childElement.tagName instanceof SComponent) {
	                var $component = renderComponent(childElement.tagName, childElement.props);
	                if (childElement.ref) {
	                    refs[childElement.ref] = new SReference($component.$ele, childElement, context, refs, $component);
	                }
	                result.push($component.$ele);
	            } else {
	                console.log('An unknown element type!');
	                return false;
	            }
	    });

	    return result;
	};

	var renderComponent = function renderComponent(component, props) {
	    var context = $.extend({}, component.context, {
	        props: props
	    });
	    var element = context.render.bind(context)();

	    if (element == null) {
	        return null;
	    }
	    if (!(element instanceof SElement)) {
	        console.log('The render function should return a single element!');
	        return null;
	    }

	    var refs = {};

	    var $this = $(document.createElement(element.tagName));
	    element.props && $this.attr(element.props);

	    elementBindEvents(element, $this, context, refs);

	    var $children = renderChildren(element.children, context, refs);

	    $children.forEach(function ($child) {
	        if (typeof $child == 'string') {
	            $this.text($this.text() + $child);
	        } else {
	            $this.append($child);
	        }
	    });

	    return {
	        $ele: $this,
	        refs: refs,
	        element: element,
	        context: context
	    };
	};

	var Scope = {
	    createClass: function createClass(context) {
	        if (typeof context.render != 'function') {
	            throw new TypeError('Render function not defined!');
	        }
	        return new SComponent(context);
	    },
	    createElement: function createElement() {
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
	                    ref = escapeHtml('' + value);
	                } else if (_key.startsWith('on')) {
	                    if (value && (typeof value == 'function' || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object')) {
	                        events[_key.replace(/^on/, '').toLowerCase()] = value;
	                    }
	                } else {
	                    props[_key] = value;
	                }
	            });
	        }

	        return new SElement(tagName, props, children, events, ref);
	    },
	    render: function render(rootElement, dom, context) {
	        if (!(rootElement instanceof SElement)) {
	            throw new TypeError('Render function should return element!');
	        }

	        if (!dom instanceof window.jQuery && !isElement(dom)) {
	            throw new TypeError('Render function should receive a DOM!');
	        }

	        if (isElement(dom)) {
	            dom = $(dom);
	        }

	        if (rootElement.tagName instanceof SComponent) {
	            var $component = renderComponent(rootElement.tagName, rootElement.props);
	            dom.empty().append($component.$ele);
	            return new SReference($component.$ele, rootElement, $component.refs);
	        } else {
	            var tempComponent = void 0;
	            if (context) {
	                tempComponent = Scope.createClass($.extend({}, context, {
	                    render: function render() {
	                        return rootElement;
	                    }
	                }));
	            } else {
	                tempComponent = Scope.createClass({
	                    render: function render() {
	                        return rootElement;
	                    }
	                });
	            }
	            var _$component = renderComponent(tempComponent, rootElement.props);
	            dom.empty().append(_$component.$ele);
	            return new SReference(_$component.$ele, rootElement, _$component.refs);
	        }
	    }
	};

	window.Scope = Scope;
	module.exports = Scope;

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = jQuery;

/***/ }
/******/ ]);