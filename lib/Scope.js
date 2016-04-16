if (process.env.NODE_ENV === 'combined') {
    require('./polyfill');
}

const html2Escape = function (sHtml) {
    return sHtml.replace(/[<>&"]/g, function (c) {
        return {'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;'}[c];
    });
};

const selfCloseTags = 'br hr img map area base input'.split(' ');

const Scope = {};

const attrString = 'data-scopeid';

const getPropString = function (props) {
    let propString = '';
    Object.keys(props).forEach(function (key) {
        const value = props[key];
        propString += ` ${key}="${('' + html2Escape(typeof value == 'function' ? value() : value))}"`;
    });
    return propString;
};

function ScopeTree(rootID, context) {
    const me = this;
    me.rootID = rootID;
    me.refs = {};
    me.events = {};
    me.context = context;
    me.children = [];
}

ScopeTree.prototype.createChild = function (_rootID, _context) {
    const result = new ScopeTree(_rootID, _context);
    this.children.push(result);
    return result;
};

function NodeData(tagName, props, children, events, ref) {
    const me = this;
    me.tagName = tagName;
    me.props = props;
    me.children = children;
    me.events = events;
    ref && (me.ref = ref);
}

Scope.createElement = function () {
    const args = Array.prototype.slice.call(arguments, 0);
    const firstTwo = args.splice(0, 2);
    const tagName = firstTwo[0];
    const propObject = firstTwo[1];
    const children = args;

    let props = {}, events = {}, ref = null;

    if (propObject) {
        Object.keys(propObject).forEach(function (key) {
            const _key = '' + key;
            const value = propObject[key];
            if (_key == 'ref') {
                ref = '' + value;
            } else if (_key.startsWith('on')) {
                if (typeof value == 'function' || typeof value == 'object') {
                    events[_key.replace(/^on/, '').toLowerCase()] = value;
                }
            } else {
                props[_key] = value;
            }
        });
    }

    return new NodeData(tagName, props, children, events, ref);
};

const renderHTML = function (data, currentId, scopeTree, isRoot) {

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
        const resultArray = [];
        data.forEach(function (dataItem, index) {
            const resultRenderedData = renderHTML(
                dataItem,
                currentId + '.' + index,
                scopeTree
            );
            if (resultRenderedData != null) {
                resultArray.push(resultRenderedData);
            }
        });
        return resultArray.join('');
    }

    //这在内容为纯文本的节点是可能的
    if (typeof data != 'object') {
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
        const hasEvent = Object.keys(data.events).length;
        if (hasEvent) {
            scopeTree.events[currentId] = data;
        }

        //计算属性值
        const propString = getPropString(data.props);

        if (selfCloseTags.indexOf(data.tagName) != -1) {
            return `<${data.tagName}${propString}${` ${attrString}="${currentId}"`}/>`;
        } else {
            const childrenHtml = [];
            data.children.forEach(function (child, index) {
                const childHtml = renderHTML(
                    child,
                    currentId + '.' + index,
                    scopeTree
                );
                if (childHtml != null) {
                    childrenHtml.push(childHtml);
                }
            });
            return `<${data.tagName}${propString}${` ${attrString}="${currentId}"`}>${childrenHtml.join('')}</${data.tagName}>`;
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
        const hasEvent = Object.keys(data.events).length;
        if (hasEvent) {
            scopeTree.events[currentId] = data;
        }

        let tagContext = data.tagName.context;

        tagContext = $.extend({}, tagContext, {
            props: data.props || {}
        });

        const rootData = tagContext.render();

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
    const me = this;
    me.id = id;
    me.$ele = $element;
    me.refs = refs;
    me.update = function () {
        updateFunc();
        return me;
    };
}

const getUpdateFunc = function (data, currentId, scopeTree, $element) {

    return function (propsUpdate) {

        if (selfCloseTags.indexOf(data.tagName) == -1) {

            const resultArray = [];

            data.children.forEach(function (dataItem, index) {
                const resultRenderedData = renderHTML(
                    dataItem,
                    currentId + '.' + index,
                    scopeTree
                );

                if (resultRenderedData != null) {
                    resultArray.push(resultRenderedData);
                }
            });

            const childHtml = resultArray.join('');
            $element.html(childHtml);

            registerScope(scopeTree, $element);
        }
        if (propsUpdate) {
            $element.attr(data.props);
        }
    };
};

const registerScope = function (scopeTree, $wrapper) {
    const refRecord = {};
    Object.keys(scopeTree.refs).forEach(function (id) {
        const data = scopeTree.refs[id],
            $element = $wrapper.find(`[${attrString}="${id}"]`);

        const updateFunc = getUpdateFunc(data, id, scopeTree, $element);

        refRecord[data.ref] = new ElementReference(id, $element, updateFunc, refRecord);
    });

    Object.keys(scopeTree.events).forEach(function (id) {
        const data = scopeTree.events[id],
            context = scopeTree.context,
            $element = $wrapper.find(`[${attrString}="${id}"]`);

        const updateFunc = getUpdateFunc(data, id, scopeTree, $element);

        const elementRef = new ElementReference(id, $element, updateFunc, refRecord);

        Object.keys(data.events).forEach(function (eventName) {
            const eventHandler = data.events[eventName];

            //处理自身的事件
            if (typeof eventHandler == 'function') {
                $element.on(eventName, function (event) {
                    eventHandler.bind(context)(new EventHandler(
                        elementRef,
                        $element,
                        refRecord
                    ), event);
                });
            }
            //处理 on 函数
            else if (typeof eventHandler == 'object') {
                Object.keys(eventHandler).forEach(function (selector) {
                    $element.on(eventName, selector, function (event) {
                        eventHandler[selector].bind(context)(new EventHandler(
                            elementRef,
                            $(this),
                            refRecord
                        ), event);
                    });
                });
            }
        });
    });

    scopeTree.children.forEach(function (childScopeTree) {
        const _$wrapper = $wrapper.find(`[${attrString}="${childScopeTree.rootID}"]`);
        const _refRecord = registerScope(childScopeTree, _$wrapper);
        const hasRootData = scopeTree.refs[childScopeTree.rootID];
        if (hasRootData) {
            refRecord[hasRootData.ref].refs = _refRecord;
        }
    });
    return refRecord;
};

function EventHandler(ownerRef, $this, refs) {
    const me = this;
    me.refs = refs;
    me.ownerRef = ownerRef;
    me.$this = $this;
}

const EventHandlerPrototype = EventHandler.prototype;
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

    if (!dom instanceof $ && !dom instanceof HTMLElement) {
        throw new TypeError('Render function should receive a DOM!');
    }

    if (dom instanceof HTMLElement) {
        dom = $(dom);
    }

    const scopeTree = new ScopeTree('0', context);

    const innerHTML = renderHTML(rootData, '0', scopeTree, true);

    if (innerHTML != null) {
        dom.html(innerHTML);
        const $this = dom.children();
        const refRecord = registerScope(scopeTree, $this);
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