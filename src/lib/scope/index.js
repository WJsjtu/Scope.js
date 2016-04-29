(function ($, window) {
    const SCOPE_EVENT_NAMESPACE = ".scope";

    const SCOPE_DATA_KEY = "scopeDataKey";

    function isElement(obj) {

        if (window.HTMLElement || window.Element) {
            //Using W3 DOM2 (works for FF, Opera and Chrome
            const ElementClass = window.HTMLElement ? window.HTMLElement : window.Element;
            return obj instanceof ElementClass;
        } else {
            //Browsers not supporting W3 DOM2 don"t have HTMLElement and
            //an exception is thrown and we end up here. Testing some
            //properties that all elements have. (works on IE7)
            return (typeof obj === "object") &&
                (obj.nodeType === 1) && (typeof obj.style === "object") &&
                (typeof obj.ownerDocument === "object");
        }
    }

    const escapeHtml = function (html) {
        return html.replace(/[<>&"]/g, function (c) {
            return {"<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;"}[c];
        });
    };

    const selfCloseTags = "br hr img map area base input".split(" ");

    function SComponent(context) {
        if (typeof context.render != "function") {
            throw new TypeError("Render function not defined!");
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

    function SReference($ele, element, context, refs, $component, hideRef) {
        const me = this;
        me.$ele = $ele;
        if ($component && !hideRef) {
            me.refs = $component.refs;
        }

        me.updateProps = function () {
            $ele.attr(element.props);
        };

        me.update = function () {

            const callbacks = {
                list: []
            };

            const _update = function (_element, _refs, _context) {

                if (selfCloseTags.indexOf(_element.tagName) == -1) {
                    const tempRefs = {};
                    const $children = renderChildren(_element.children, _context, tempRefs, callbacks, true);
                    $ele.empty();
                    $children.forEach(function ($child) {
                        if (typeof $child == "string") {
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


            if (typeof element.tagName == "string") {
                _update(element, refs, context);
                for (let i = callbacks.list.length - 1; i >= 0; i--) {
                    callbacks.list[i]();
                }
            } else if (element.tagName instanceof SComponent) {
                _update($component.element, $component.refs, $component.context);
                for (let i = callbacks.list.length - 1; i >= 0; i--) {
                    callbacks.list[i]();
                }
                if (typeof $component.context.afterUpdate == "function") {
                    $component.context.afterUpdate.call($component.context, $component);
                }
            }
        };
    }


    const renderChildren = function (children, context, refs, callbacks, isUpdate) {
        const result = [];

        children.forEach(function (childElement) {

            //this is possible since a function element may return null
            if (!childElement) {
                return false;
            }

            //当数据源是函数时,在指定的环境中动态生成元素节点
            if (typeof childElement == "function") {
                childElement = childElement.call(context);
            }

            //If is array call the function itself recursively
            if (Array.isArray(childElement)) {
                Array.prototype.push.apply(result, renderChildren(childElement, context, refs, callbacks, isUpdate));
                return true;
            }

            //a text node could be a string or even number or boolean
            if (typeof childElement != "object") {
                result.push("" + childElement);
                return true;
            }

            //if not instance of `SElement`
            if (!(childElement instanceof SElement)) {
                //console.log("A function element returns non-element object!");
                return false;
            }

            //basic html element
            if (typeof childElement.tagName == "string") {

                const $child = $(document.createElement(childElement.tagName));


                //record the related info in jQuery Object data
                const scopeData = {
                    element: childElement,
                    context: context,
                    refs: refs
                };

                //add updateProps function
                scopeData.updateProps = function () {
                    childElement.props && $child.attr(childElement.props);
                };

                //add props
                scopeData.updateProps();

                //store the data
                $child.data(SCOPE_DATA_KEY, scopeData);

                //bind events
                bindEvents($child);

                //add self to the refs if needed
                if (childElement.ref) {
                    refs[childElement.ref] = $child;
                }

                const _renderChildren = function (_callbacks, _isUpdate) {
                    if (selfCloseTags.indexOf(childElement.tagName) == -1) {
                        //append children to the root element
                        const $childChildren = renderChildren(childElement.children, context, refs, _callbacks, _isUpdate);
                        //append children to current element
                        $childChildren.forEach(function ($childChild) {
                            if (typeof $childChild == "string") {
                                $child.text($child.text() + $childChild);
                            } else {
                                $child.append($childChild);
                            }
                        });
                    }
                };
                _renderChildren(callbacks, isUpdate);

                scopeData.update = function () {
                    //TODO: unbind events and remove dataSet of unused jQuery Object
                    $child.empty();
                    const _callbacks = {
                        list: []
                    };
                    _renderChildren(_callbacks, true);
                    for (let i = _callbacks.list.length - 1; i >= 0; i--) {
                        _callbacks.list[i]();
                    }
                    _callbacks.list = [];
                };

                result.push($child);

            }
            //if an element is a component
            else if (childElement.tagName instanceof SComponent) {
                const $component = renderComponent(childElement, context, refs, callbacks, isUpdate);
                if (childElement.ref) {
                    refs[childElement.ref] = $component;
                }
                result.push($component);
            } else {
                //console.log("An unknown element type!");
                return false;
            }
        });


        //array of jQuery Object
        return result;
    };

    const bindEvents = function ($element) {
        const {element, context} = $element.data(SCOPE_DATA_KEY);
        Object.keys(element.events).forEach(function (eventName) {
            const eventHandler = element.events[eventName];

            //the normal way of define a event handler
            if (typeof eventHandler == "function") {
                $element.on(eventName + SCOPE_EVENT_NAMESPACE, function (event) {
                    //pass $element to the handler since the context is no longer the default context set by jQuery
                    //which means you can not get $element by $(this) anymore
                    eventHandler.call(context, $element, event);
                });
            }

            //IF eventHandler is an object in form of {selector(string): handler(function)}
            else if (typeof eventHandler == "object") {
                Object.keys(eventHandler).forEach(function (selector) {
                    $element.on(eventName + SCOPE_EVENT_NAMESPACE, selector, function (event) {
                        eventHandler[selector].call(context, $(this), event);
                    });
                });
            }
        });
    };

    const renderComponent = function (rootElement, rootContext, rootRefs, callbacks, isUpdate) {

        //copy the context
        const context = $.extend({}, rootElement.tagName.context, {
            props: $.extend({}, rootElement.props)
        });

        //function props should be automatically bind with the context
        Object.keys(context.props).forEach(function (key) {
            if (typeof context.props[key] == "function") {
                context.props[key] = context.props[key].bind(rootContext);
            }
        });

        //call beforeMount to initialize the context
        if (typeof context.beforeMount == "function") {
            context.beforeMount.call(context);
        }

        //build inner elements by calling render function
        const element = context.render.call(context);

        //the render function return unexpected result
        if (!element || !(element instanceof SElement)) {
            return null;
        }

        //the inner ref for the component
        const refs = {};

        //the root element is a basic HTML tag
        if (typeof element.tagName == "string") {
            //create the jQuery Object for the component root
            const $this = $(document.createElement(element.tagName));

            //record the related info in jQuery Object data
            const scopeData = {
                element: element,
                context: context,
                refs: refs,
                component: {
                    context: rootContext,
                    element: rootElement,
                    refs: rootRefs
                }
            };

            //add updateProps function
            scopeData.updateProps = function () {
                element.props && $this.attr(element.props);
            };

            //add the props for the root element
            scopeData.updateProps();

            //---------now the root element is created ------------

            //record the related info in jQuery Object data
            $this.data(SCOPE_DATA_KEY, scopeData);


            const _renderChildren = function (_callbacks, _isUpdate) {
                //get children elements
                const $children = renderChildren(element.children, context, refs, _callbacks, _isUpdate);

                //append children to the root element
                $children.forEach(function ($child) {
                    if (typeof $child == "string") {
                        $this.text($this.text() + $child);
                    } else {
                        $this.append($child);
                    }
                });
            };

            _renderChildren(callbacks, isUpdate);

            scopeData.update = function () {
                //TODO: unbind events and remove dataSet of unused jQuery Object
                $this.empty();
                const _callbacks = {
                    list: []
                };
                _renderChildren(_callbacks, true);
                for (let i = _callbacks.list.length - 1; i >= 0; i--) {
                    _callbacks.list[i]();
                }
                _callbacks.list = [];

                //since only children components' `afterUpdate` function will be recorded in `_callbacks.list`
                //you'll have to call the `afterUpdate` for this component
                if (typeof context.afterUpdate == "function") {
                    context.afterUpdate.call(context, $this);
                }

            };

            //bind the event for the root element, meanwhile children elements' events are bound in `renderChildren`
            bindEvents($this);


            if (callbacks && Array.isArray(callbacks.list)) {

                //record the `afterMount` functions in `callbacks`.`list` if not update
                if (typeof context.afterMount == "function" && !isUpdate) {
                    callbacks.list.push(context.afterMount.bind(context, $this));
                }

                //record the `afterUpdate` functions in `callbacks`.`list` if update
                if (typeof context.afterUpdate == "function" && isUpdate) {
                    callbacks.list.push(context.afterUpdate.bind(context, $this));
                }

            }

            //If the root element has a reference, add it to the refs.
            if (element.ref) {
                refs[element.ref] = $this;
            }

            return $this;
        }
        //the root element is just a component, ╮(╯_╰)╭ but why do you write some components like this?!
        else if (element.tagName instanceof SComponent) {

        } else {
            return null;
        }
    };

    const Scope = {
        createClass: function (context) {
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
                        const _key = "" + key;
                        const value = propObject[key];
                        if (_key == "ref") {
                            ref = escapeHtml("" + value);
                        } else if (_key.startsWith("on")) {
                            if (value && (typeof value == "function" || typeof value == "object")) {
                                events[_key.replace(/^on/, "").toLowerCase()] = value;
                            }
                        } else {
                            props[_key] = value;
                        }
                    });
                } else if (tagName instanceof SComponent) {
                    Object.keys(propObject).forEach(function (key) {
                        const _key = "" + key;
                        const value = propObject[key];
                        if (_key == "ref") {
                            ref = escapeHtml("" + value);
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
                throw new TypeError("Render function should return element!");
            }

            if (!dom instanceof $ && !isElement(dom)) {
                throw new TypeError("Render function should receive a DOM!");
            }

            if (isElement(dom)) {
                dom = $(dom);
            }

            //generate a container for afterMount callbacks
            const callbacks = {
                list: []
            };

            const _rootElement = (rootElement.tagName instanceof SComponent) ?
                rootElement : (function () {
                const _component = Scope.createClass({
                    render: (typeof context == "object") ? (function () {
                        return rootElement;
                    }).bind(context) : function () {
                        return rootElement;
                    }
                });
                return <_component />;
            })();

            const $component = renderComponent(_rootElement, context, {}, callbacks, false);
            dom.empty().append($component);
            for (let i = callbacks.list.length - 1; i >= 0; i--) {
                callbacks.list[i]();
            }

            //clear list
            callbacks.list = [];
            return $component;
        }
    };

    Scope.utils = {
        getTarget: function (event) {
            event = event || window.event;
            return event.target ? event.target : event.srcElement;
        },
        preventDefault: function (event) {
            event = event || window.event;
            event.preventDefault ? event.preventDefault() : event.returnValue = false;
        },
        stopPropagation: function (event) {
            event = event || window.event;
            event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
        },
        getRefs: function ($element) {
            if (!($element instanceof $)) {
                return {};
            }
            const data = $element.data(SCOPE_DATA_KEY);
            return data.refs ? data.refs : {};
        },
        update: function ($element) {
            if ($element instanceof $) {
                const data = $element.data(SCOPE_DATA_KEY);
                if (typeof data.update == "function") {
                    data.update(true);
                }
            }
        },
        updateProps: function ($element) {
            if ($element instanceof $) {
                const data = $element.data(SCOPE_DATA_KEY);
                if (typeof data.updateProps == "function") {
                    data.updateProps();
                }
            }
        },
        execute: function () {
            const args = Array.prototype.slice.call(arguments, 0);
            const firstTwo = args.splice(0, 2);
            const $element = firstTwo[0];
            const funcName = "" + firstTwo[1];
            if (($element instanceof $) && funcName) {
                const data = $element.data(SCOPE_DATA_KEY);
                if ((typeof data.context == "object") && (typeof data.context[funcName] == "function")) {
                    data.context[funcName].apply(data.context, args);
                }
            }

        }
    };

    window.Scope = Scope;
})(window.jQuery, window);

