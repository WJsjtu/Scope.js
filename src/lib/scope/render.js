const {SC, SE} = require("./class");
const {isString, isObject, isFunction, SCOPE_CLOSE_TAG, SCOPE_DATA_KEY} = require("./utils");

const renderComponent = function (sComponent) {

    //expose refs
    let context = sComponent.context;
    context.refs = sComponent.refs;

    const sElement = sComponent.sElement;
    const rootSElement = sComponent.sElementTree;

    renderElement(rootSElement);

    if (isString(sElement.class.ref) && (sComponent.parent instanceof SC)) {
        sComponent.parent.refs[sElement.class.ref] = rootSElement.$ele;
    }

    context.$ele = rootSElement.$ele;

};

const renderElement = function (sElement) {
    const sComponent = sElement.sComponent;
    const jElement = sElement.class;
    const context = sComponent.context;

    if (isObject(jElement)) {
        const tagName = jElement.tagName;
        const $ele = sElement.$ele = $(document.createElement(tagName))
            .attr(jElement.props)
            .data(SCOPE_DATA_KEY, sElement);

        if (sComponent && isString(jElement.ref)) {
            sComponent.refs[jElement.ref] = $ele;
        }

        (function () {
            for (let eventName in jElement.event) {
                if (jElement.event.hasOwnProperty(eventName)) {
                    const eventHandler = jElement.event[eventName];

                    //the normal way of define a event handler
                    if (isFunction(eventHandler)) {

                        const singleFunc = function (event) {
                            //pass $element to the handler since the context is no longer the default context set by jQuery
                            //which means you can not get $element by $(this) anymore
                            eventHandler.call(context, event, $ele, $ele);
                        };

                        $ele.on(eventName, singleFunc);
                        sElement.event.push([eventName, null, singleFunc]);
                    }

                    //IF eventHandler is an object in form of {selector(string): handler(function)}
                    else if (isObject(eventHandler)) {
                        for (let selector in eventHandler) {
                            if (eventHandler.hasOwnProperty(selector)) {

                                const selectorFunc = function (event) {
                                    eventHandler[selector].call(context, event, $(this), $ele);
                                };

                                $ele.on(eventName, selector, selectorFunc);
                                sElement.event.push([eventName, selector, selectorFunc]);
                            }
                        }
                    }
                }
            }
        })();


        if (SCOPE_CLOSE_TAG.indexOf(tagName) === -1) {
            sElement.children.forEach(function (childSElement) {
                if (childSElement instanceof SE) {
                    renderElement(childSElement);
                    $ele.append(childSElement.$ele);
                } else if (childSElement instanceof SC) {
                    renderComponent(childSElement);
                    $ele.append(childSElement.sElementTree.$ele);
                }
            });
        }
    } else if (isString(jElement)) {
        sElement.$ele = $(document.createTextNode(jElement));
    }
};

module.exports = {
    c: renderComponent,
    e: renderElement
};