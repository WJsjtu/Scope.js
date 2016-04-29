(function ($, window) {
    const SCOPE_EVENT_NAMESPACE = ".scope";

    const SCOPE_DATA_KEY = "scopeDataKey";

    const isFunction = function (obj) {
        return (typeof obj === "function");
    };

    const isString = function (obj) {
        return (typeof obj === "string");
    };

    const isObject = function (obj) {
        return (typeof obj === "object");
    };

    const isElement = function (obj) {

        if (window.HTMLElement || window.Element) {
            //Using W3 DOM2 (works for FF, Opera and Chrome
            const ElementClass = window.HTMLElement ? window.HTMLElement : window.Element;
            return obj instanceof ElementClass;
        } else {
            //Browsers not supporting W3 DOM2 don"t have HTMLElement and
            //an exception is thrown and we end up here. Testing some
            //properties that all elements have. (works on IE7)
            return isObject(obj) && (obj.nodeType === 1) && isObject(obj.style) && isObject(obj.ownerDocument);
        }
    };

    const escapeHtml = function (html) {
        return html.replace(/[<>&"]/g, function (c) {
            return {"<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;"}[c];
        });
    };

    const selfCloseTags = "br hr img map area base input".split(" ");

    function SComponent(context) {
        if (!isFunction(context.render)) {
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

    const renderChildren = function (children, context, refs, callbacks, isUpdate) {
        const result = [];

        children.forEach(function (childElement) {

            //this is possible since a function element may return null
            if (!childElement) {
                return false;
            }

            //当数据源是函数时,在指定的环境中动态生成元素节点
            if (isFunction(childElement)) {
                childElement = childElement.call(context);
            }

            //If is array call the function itself recursively
            if (Array.isArray(childElement)) {
                Array.prototype.push.apply(result, renderChildren(childElement, context, refs, callbacks, isUpdate));
                return true;
            }

            //a text node could be a string or even number or boolean
            if (!isObject(childElement)) {
                result.push("" + childElement);
                return true;
            }

            //if not instance of `SElement`
            if (!(childElement instanceof SElement)) {
                //console.log("A function element returns non-element object!");
                return false;
            }

            //basic html element
            if (isString(childElement.tagName)) {

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
                            if (isString($childChild)) {
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
        for (let eventName in element.events) {
            if (element.events.hasOwnProperty(eventName)) {
                const eventHandler = element.events[eventName];

                //the normal way of define a event handler
                if (isFunction(eventHandler)) {
                    $element.on(eventName + SCOPE_EVENT_NAMESPACE, function (event) {
                        //pass $element to the handler since the context is no longer the default context set by jQuery
                        //which means you can not get $element by $(this) anymore
                        eventHandler.call(context, $element, event);
                    });
                }

                //IF eventHandler is an object in form of {selector(string): handler(function)}
                else if (isObject(eventHandler)) {
                    for (let selector in eventHandler) {
                        if (eventHandler.hasOwnProperty(selector)) {
                            $element.on(eventName + SCOPE_EVENT_NAMESPACE, selector, function (event) {
                                eventHandler[selector].call(context, $(this), event);
                            });
                        }
                    }
                }
            }
        }
    };

    const renderComponent = function (rootElement, rootContext, rootRefs, callbacks, isUpdate) {

        //copy the context
        const context = $.extend({}, rootElement.tagName.context, {
            props: $.extend({}, rootElement.props)
        });

        //function props should be automatically bind with the context
        for (let key in context.props) {
            if (context.props.hasOwnProperty(key) && isFunction(context.props[key])) {
                context.props[key] = context.props[key].bind(rootContext);
            }
        }

        //call beforeMount to initialize the context
        if (isFunction(context.beforeMount)) {
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
        if (isString(element.tagName)) {
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
                    if (isString($child)) {
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
                if (isFunction(context.afterUpdate)) {
                    context.afterUpdate.call(context, $this);
                }

            };

            //bind the event for the root element, meanwhile children elements' events are bound in `renderChildren`
            bindEvents($this);


            if (callbacks && Array.isArray(callbacks.list)) {

                //record the `afterMount` functions in `callbacks`.`list` if not update
                if (isFunction(context.afterMount) && !isUpdate) {
                    callbacks.list.push(context.afterMount.bind(context, $this));
                }

                //record the `afterUpdate` functions in `callbacks`.`list` if update
                if (isFunction(context.afterUpdate) && isUpdate) {
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

            if (propObject && (isString(tagName) || (tagName instanceof SComponent))) {
                for (let key in propObject) {
                    if (propObject.hasOwnProperty(key)) {
                        const _key = "" + key;
                        const value = propObject[key];
                        if (_key == "ref") {
                            ref = escapeHtml("" + value);
                        } else if (_key.startsWith("on") && isString(tagName)) {
                            if (value && (isFunction(value) || isObject(value))) {
                                events[_key.replace(/^on/, "").toLowerCase()] = value;
                            }
                        } else {
                            props[_key] = value;
                        }
                    }
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
                    render: isObject(context) ? (function () {
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
                if (isFunction(data.update)) {
                    data.update(true);
                }
            }
        },
        updateProps: function ($element) {
            if ($element instanceof $) {
                const data = $element.data(SCOPE_DATA_KEY);
                if (isFunction(data.updateProps)) {
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
                if (isObject(data.context) && isFunction(data.context[funcName])) {
                    data.context[funcName].apply(data.context, args);
                }
            }

        }
    };

    window.Scope = Scope;
})(jQuery, window);

