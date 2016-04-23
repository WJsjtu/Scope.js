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

	if (true) {
	    __webpack_require__(2);
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

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	if (!RegExp.escape) {
	    RegExp.escape = function (s) {
	        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	    };
	}

	if (!String.prototype.endsWith) {
	    String.prototype.endsWith = function (searchString, position) {
	        var subjectString = this.toString();
	        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
	            position = subjectString.length;
	        }
	        position -= searchString.length;
	        var lastIndex = subjectString.indexOf(searchString, position);
	        return lastIndex !== -1 && lastIndex === position;
	    };
	}

	if (!String.prototype.startsWith) {
	    String.prototype.startsWith = function (searchString, position) {
	        position = position || 0;
	        return this.substr(position, searchString.length) === searchString;
	    };
	}

	if (!String.prototype.trim) {
	    String.prototype.trim = function () {
	        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	    };
	}

	if (!Function.prototype.bind) {
	    Function.prototype.bind = function (oThis) {
	        if (typeof this !== 'function') {
	            // closest thing possible to the ECMAScript 5
	            // internal IsCallable function
	            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
	        }

	        var aArgs = Array.prototype.slice.call(arguments, 1),
	            fToBind = this,
	            fNOP = function fNOP() {},
	            fBound = function fBound() {
	            return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
	        };

	        if (this.prototype) {
	            // Function.prototype doesn't have a prototype property
	            fNOP.prototype = this.prototype;
	        }
	        fBound.prototype = new fNOP();

	        return fBound;
	    };
	}

	// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
	if (!Object.keys) {
	    Object.keys = function () {
	        'use strict';

	        var hasOwnProperty = Object.prototype.hasOwnProperty,
	            hasDontEnumBug = !{ toString: null }.propertyIsEnumerable('toString'),
	            dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
	            dontEnumsLength = dontEnums.length;

	        return function (obj) {
	            if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' && (typeof obj !== 'function' || obj === null)) {
	                throw new TypeError('Object.keys called on non-object');
	            }

	            var result = [],
	                prop,
	                i;

	            for (prop in obj) {
	                if (hasOwnProperty.call(obj, prop)) {
	                    result.push(prop);
	                }
	            }

	            if (hasDontEnumBug) {
	                for (i = 0; i < dontEnumsLength; i++) {
	                    if (hasOwnProperty.call(obj, dontEnums[i])) {
	                        result.push(dontEnums[i]);
	                    }
	                }
	            }
	            return result;
	        };
	    }();
	}

	if (!Array.isArray) {
	    Array.isArray = function (arg) {
	        return Object.prototype.toString.call(arg) === '[object Array]';
	    };
	}

	// Production steps of ECMA-262, Edition 5, 15.4.4.18
	// Reference: http://es5.github.io/#x15.4.4.18
	if (!Array.prototype.forEach) {

	    Array.prototype.forEach = function (callback, thisArg) {

	        var T, k;

	        if (this == null) {
	            throw new TypeError(' this is null or not defined');
	        }

	        // 1. Let O be the result of calling toObject() passing the
	        // |this| value as the argument.
	        var O = Object(this);

	        // 2. Let lenValue be the result of calling the Get() internal
	        // method of O with the argument "length".
	        // 3. Let len be toUint32(lenValue).
	        var len = O.length >>> 0;

	        // 4. If isCallable(callback) is false, throw a TypeError exception. // See: http://es5.github.com/#x9.11
	        if (typeof callback !== "function") {
	            throw new TypeError(callback + ' is not a function');
	        }

	        // 5. If thisArg was supplied, let T be thisArg; else let
	        // T be undefined.
	        if (arguments.length > 1) {
	            T = thisArg;
	        }

	        // 6. Let k be 0
	        k = 0;

	        // 7. Repeat, while k < len
	        while (k < len) {

	            var kValue;

	            // a. Let Pk be ToString(k).
	            //    This is implicit for LHS operands of the in operator
	            // b. Let kPresent be the result of calling the HasProperty
	            //    internal method of O with argument Pk.
	            //    This step can be combined with c
	            // c. If kPresent is true, then
	            if (k in O) {

	                // i. Let kValue be the result of calling the Get internal
	                // method of O with argument Pk.
	                kValue = O[k];

	                // ii. Call the Call internal method of callback with T as
	                // the this value and argument list containing kValue, k, and O.
	                callback.call(T, kValue, k, O);
	            }
	            // d. Increase k by 1.
	            k++;
	        }
	        // 8. return undefined
	    };
	}

	// Production steps of ECMA-262, Edition 5, 15.4.4.14
	// Reference: http://es5.github.io/#x15.4.4.14
	if (!Array.prototype.indexOf) {
	    Array.prototype.indexOf = function (searchElement, fromIndex) {

	        var k;

	        // 1. Let o be the result of calling ToObject passing
	        //    the this value as the argument.
	        if (this == null) {
	            throw new TypeError('"this" is null or not defined');
	        }

	        var o = Object(this);

	        // 2. Let lenValue be the result of calling the Get
	        //    internal method of o with the argument "length".
	        // 3. Let len be ToUint32(lenValue).
	        var len = o.length >>> 0;

	        // 4. If len is 0, return -1.
	        if (len === 0) {
	            return -1;
	        }

	        // 5. If argument fromIndex was passed let n be
	        //    ToInteger(fromIndex); else let n be 0.
	        var n = +fromIndex || 0;

	        if (Math.abs(n) === Infinity) {
	            n = 0;
	        }

	        // 6. If n >= len, return -1.
	        if (n >= len) {
	            return -1;
	        }

	        // 7. If n >= 0, then Let k be n.
	        // 8. Else, n<0, Let k be len - abs(n).
	        //    If k is less than 0, then let k be 0.
	        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

	        // 9. Repeat, while k < len
	        while (k < len) {
	            // a. Let Pk be ToString(k).
	            //   This is implicit for LHS operands of the in operator
	            // b. Let kPresent be the result of calling the
	            //    HasProperty internal method of o with argument Pk.
	            //   This step can be combined with c
	            // c. If kPresent is true, then
	            //    i.  Let elementK be the result of calling the Get
	            //        internal method of o with the argument ToString(k).
	            //   ii.  Let same be the result of applying the
	            //        Strict Equality Comparison Algorithm to
	            //        searchElement and elementK.
	            //  iii.  If same is true, return k.
	            if (k in o && o[k] === searchElement) {
	                return k;
	            }
	            k++;
	        }
	        return -1;
	    };
	}

	// Production steps of ECMA-262, Edition 5, 15.4.4.15
	// Reference: http://es5.github.io/#x15.4.4.15
	if (!Array.prototype.lastIndexOf) {
	    Array.prototype.lastIndexOf = function (searchElement /*, fromIndex*/) {
	        'use strict';

	        if (this === void 0 || this === null) {
	            throw new TypeError();
	        }

	        var n,
	            k,
	            t = Object(this),
	            len = t.length >>> 0;
	        if (len === 0) {
	            return -1;
	        }

	        n = len - 1;
	        if (arguments.length > 1) {
	            n = Number(arguments[1]);
	            if (n != n) {
	                n = 0;
	            } else if (n != 0 && n != 1 / 0 && n != -(1 / 0)) {
	                n = (n > 0 || -1) * Math.floor(Math.abs(n));
	            }
	        }

	        for (k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n); k >= 0; k--) {
	            if (k in t && t[k] === searchElement) {
	                return k;
	            }
	        }
	        return -1;
	    };
	}

	// Production steps of ECMA-262, Edition 5, 15.4.4.19
	// Reference: http://es5.github.io/#x15.4.4.19
	if (!Array.prototype.map) {

	    Array.prototype.map = function (callback, thisArg) {

	        var T, A, k;

	        if (this == null) {
	            throw new TypeError(' this is null or not defined');
	        }

	        // 1. Let O be the result of calling ToObject passing the |this|
	        //    value as the argument.
	        var O = Object(this);

	        // 2. Let lenValue be the result of calling the Get internal
	        //    method of O with the argument "length".
	        // 3. Let len be ToUint32(lenValue).
	        var len = O.length >>> 0;

	        // 4. If IsCallable(callback) is false, throw a TypeError exception.
	        // See: http://es5.github.com/#x9.11
	        if (typeof callback !== 'function') {
	            throw new TypeError(callback + ' is not a function');
	        }

	        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
	        if (arguments.length > 1) {
	            T = thisArg;
	        }

	        // 6. Let A be a new array created as if by the expression new Array(len)
	        //    where Array is the standard built-in constructor with that name and
	        //    len is the value of len.
	        A = new Array(len);

	        // 7. Let k be 0
	        k = 0;

	        // 8. Repeat, while k < len
	        while (k < len) {

	            var kValue, mappedValue;

	            // a. Let Pk be ToString(k).
	            //   This is implicit for LHS operands of the in operator
	            // b. Let kPresent be the result of calling the HasProperty internal
	            //    method of O with argument Pk.
	            //   This step can be combined with c
	            // c. If kPresent is true, then
	            if (k in O) {

	                // i. Let kValue be the result of calling the Get internal
	                //    method of O with argument Pk.
	                kValue = O[k];

	                // ii. Let mappedValue be the result of calling the Call internal
	                //     method of callback with T as the this value and argument
	                //     list containing kValue, k, and O.
	                mappedValue = callback.call(T, kValue, k, O);

	                // iii. Call the DefineOwnProperty internal method of A with arguments
	                // Pk, Property Descriptor
	                // { Value: mappedValue,
	                //   Writable: true,
	                //   Enumerable: true,
	                //   Configurable: true },
	                // and false.

	                // In browsers that support Object.defineProperty, use the following:
	                // Object.defineProperty(A, k, {
	                //   value: mappedValue,
	                //   writable: true,
	                //   enumerable: true,
	                //   configurable: true
	                // });

	                // For best browser support, use the following:
	                A[k] = mappedValue;
	            }
	            // d. Increase k by 1.
	            k++;
	        }

	        // 9. return A
	        return A;
	    };
	}

	/**
	 * Shim for "fixing" IE's lack of support (IE < 9) for applying slice
	 * on host objects like NamedNodeMap, NodeList, and HTMLCollection
	 * (technically, since host objects have been implementation-dependent,
	 * at least before ES6, IE hasn't needed to work this way).
	 * Also works on strings, fixes IE < 9 to allow an explicit undefined
	 * for the 2nd argument (as in Firefox), and prevents errors when
	 * called on other DOM objects.
	 */
	(function () {
	    'use strict';

	    var _slice = Array.prototype.slice;

	    try {
	        // Can't be used with DOM elements in IE < 9
	        _slice.call(document.documentElement);
	    } catch (e) {
	        // Fails in IE < 9
	        // This will work for genuine arrays, array-like objects,
	        // NamedNodeMap (attributes, entities, notations),
	        // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
	        // and will not fail on other DOM objects (as do DOM elements in IE < 9)
	        Array.prototype.slice = function (begin, end) {
	            // IE < 9 gets unhappy with an undefined end argument
	            end = typeof end !== 'undefined' ? end : this.length;

	            // For native Array objects, we use the native slice function
	            if (Object.prototype.toString.call(this) === '[object Array]') {
	                return _slice.call(this, begin, end);
	            }

	            // For array like object we handle it ourselves.
	            var i,
	                cloned = [],
	                size,
	                len = this.length;

	            // Handle negative value for "begin"
	            var start = begin || 0;
	            start = start >= 0 ? start : Math.max(0, len + start);

	            // Handle negative value for "end"
	            var upTo = typeof end == 'number' ? Math.min(end, len) : len;
	            if (end < 0) {
	                upTo = len + end;
	            }

	            // Actual expected size of the slice
	            size = upTo - start;

	            if (size > 0) {
	                cloned = new Array(size);
	                if (this.charAt) {
	                    for (i = 0; i < size; i++) {
	                        cloned[i] = this.charAt(start + i);
	                    }
	                } else {
	                    for (i = 0; i < size; i++) {
	                        cloned[i] = this[start + i];
	                    }
	                }
	            }

	            return cloned;
	        };
	    }
	})();

/***/ }
/******/ ]);