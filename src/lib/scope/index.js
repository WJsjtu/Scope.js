(function ($, window) {
    const eventNamespace = '.scope';

    function isElement(obj) {

        if (window.HTMLElement || window.Element) {
            //Using W3 DOM2 (works for FF, Opera and Chrome
            const ElementClass = window.HTMLElement ? window.HTMLElement : window.Element;
            return obj instanceof ElementClass;
        } else {
            //Browsers not supporting W3 DOM2 don't have HTMLElement and
            //an exception is thrown and we end up here. Testing some
            //properties that all elements have. (works on IE7)
            return (typeof obj === "object") &&
                (obj.nodeType === 1) && (typeof obj.style === "object") &&
                (typeof obj.ownerDocument === "object");
        }
    }

    const escapeHtml = function (html) {
        return html.replace(/[<>&"]/g, function (c) {
            return {'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;'}[c];
        });
    };

    const selfCloseTags = 'br hr img map area base input'.split(' ');

    function SComponent(context) {
        if (typeof context.render != 'function') {
            throw new TypeError('Render function not defined!');
        }
        this.context = context;
    }

    function SElement(tagName, props, children, events, ref) {
        const me = this;
        me.tagName = tagName;
        me.props = props;
        me.children = children;
        me.events = events;
        me.ref = ref;
    }

    function SReference($ele, element, context, refs, $component) {
        const me = this;
        me.$ele = $ele;
        if ($component) {
            me.refs = $component.refs;
        }

        me.updateProps = function () {
            $ele.attr(element.props);
        };

        me.update = function () {

            const _update = function (_element, _refs, _context) {
                if (selfCloseTags.indexOf(_element.tagName) == -1) {
                    const tempRefs = {};
                    const $children = renderChildren(_element.children, _context, tempRefs);

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
                }
            };


            if (typeof element.tagName == 'string') {
                _update(element, refs, context);
            } else if (element.tagName instanceof SComponent && $component) {
                _update($component.element, $component.refs, $component.context);
            }
        };

        if (element.tagName instanceof SComponent && $component) {
            me.render = function () {


                const _context = $.extend({}, $component.context, {
                    props: element.props
                });
                const _element = _context.render.bind(_context)();
                const tempRefs = {};

                elementBindEvents(_element, $ele, _context, tempRefs);

                const $children = renderChildren(_element.children, _context, tempRefs);

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
            };
        }
    }

    function SEvent(refs, owner, $ele) {
        const me = this;
        me.refs = refs;
        me.owner = owner;
        me.$ele = $ele;
    }

    const SEventPrototype = SEvent.prototype;
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


    const elementBindEvents = function (element, $this, context, refs) {
        Object.keys(element.events).forEach(function (eventName) {
            const eventHandler = element.events[eventName];
            const owner = new SReference($this, element, context, refs);
            if (typeof eventHandler == 'function') {
                $this.on(eventName + eventNamespace, function (event) {
                    eventHandler.bind(context)(new SEvent(refs, owner, $this), event);
                });
            }
            else if (typeof eventHandler == 'object') {
                Object.keys(eventHandler).forEach(function (selector) {
                    $this.on(eventName + eventNamespace, selector, function (event) {
                        eventHandler[selector].bind(context)(new SEvent(refs, owner, $(this)), event);
                    });
                });
            }
        });
    };


    const renderChildren = function (children, context, refs) {
        const result = [];

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
            if (typeof childElement != 'object') {
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

                const $child = $(document.createElement(childElement.tagName));
                childElement.props && $child.attr(childElement.props);

                elementBindEvents(childElement, $child, context, refs);

                if (childElement.ref) {
                    refs[childElement.ref] = new SReference($child, childElement, context, refs);
                }

                if (selfCloseTags.indexOf(childElement.tagName) == -1) {
                    const $childChildren = renderChildren(childElement.children, context, refs);

                    $childChildren.forEach(function ($childChild) {
                        if (typeof $childChild == 'string') {
                            $child.text($child.text() + $childChild);
                        } else {
                            $child.append($childChild);
                        }
                    });
                }

                result.push($child);

            }//处理组件嵌套
            else if (childElement.tagName instanceof SComponent) {
                const $component = renderComponent(childElement.tagName, childElement.props);
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

    const renderComponent = function (component, props) {
        const context = $.extend({}, component.context, {
            props: props
        });
        const element = context.render.bind(context)();

        if (element == null) {
            return null;
        }
        if (!(element instanceof SElement)) {
            console.log('The render function should return a single element!');
            return null;
        }

        const refs = {};

        const $this = $(document.createElement(element.tagName));
        element.props && $this.attr(element.props);

        elementBindEvents(element, $this, context, refs);

        const $children = renderChildren(element.children, context, refs);

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

    const Scope = {
        createClass: function (context) {
            if (typeof context.render != 'function') {
                throw new TypeError('Render function not defined!');
            }
            return new SComponent(context);
        },
        createElement: function () {
            const args = Array.prototype.slice.call(arguments, 0);
            const firstTwo = args.splice(0, 2);
            const tagName = firstTwo[0];
            const propObject = firstTwo[1];
            const children = args;

            let props = {}, events = {}, ref = null;

            if (propObject) {
                if (typeof tagName == "string") {
                    Object.keys(propObject).forEach(function (key) {
                        const _key = '' + key;
                        const value = propObject[key];
                        if (_key == 'ref') {
                            ref = escapeHtml('' + value);
                        } else if (_key.startsWith('on')) {
                            if (value && (typeof value == 'function' || typeof value == 'object')) {
                                events[_key.replace(/^on/, '').toLowerCase()] = value;
                            }
                        } else {
                            props[_key] = value;
                        }
                    });
                } else if (tagName instanceof SComponent) {
                    Object.keys(propObject).forEach(function (key) {
                        const _key = '' + key;
                        const value = propObject[key];
                        if (_key == 'ref') {
                            ref = escapeHtml('' + value);
                        } else {
                            props[_key] = value;
                        }
                    });
                }
            }

            return new SElement(tagName, props, children, events, ref);
        },
        render: function (rootElement, dom, context) {
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
                const $component = renderComponent(rootElement.tagName, rootElement.props);
                dom.empty().append($component.$ele);
                return new SReference($component.$ele, rootElement, $component.refs);
            } else {
                let tempComponent;
                if (typeof context == 'object') {
                    tempComponent = Scope.createClass({
                        render: (function () {
                            return rootElement;
                        }).bind(context)
                    });
                } else {
                    tempComponent = Scope.createClass({
                        render: function () {
                            return rootElement;
                        }
                    });
                }
                const $component = renderComponent(tempComponent, rootElement.props);
                dom.empty().append($component.$ele);
                return new SReference($component.$ele, rootElement, $component.refs);
            }
        }
    };

    window.Scope = Scope;
})(jQuery, window);

