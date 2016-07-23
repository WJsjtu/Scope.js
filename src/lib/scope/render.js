const {SC, SE, JE} = require("./class");
const {isString, isObject, isFunction, SCOPE_CLOSE_TAG, SCOPE_DATA_KEY} = require("./utils");

const renderComponent = function (sComponent, useOldElement, recorder) {

    if (!(sComponent instanceof SC)) {
        console.log("Scope: invalid ScopeComponent arg for render", sComponent);
        return false;
    }

    //expose refs
    let context = sComponent.context;
    context.refs = sComponent.refs;

    const sElement = sComponent.sElement;
    const rootSElement = sComponent.sElementTree;

    if (recorder) {
        recorder.check(sComponent);
    }

    if (renderElement(rootSElement, useOldElement, recorder)) {

        if (isString(sElement.class.ref) && (sComponent.parent instanceof SC)) {
            sComponent.parent.refs[sElement.class.ref] = rootSElement.$ele;
        }

        context.$ele = rootSElement.$ele;
        return true;
    } else {
        return false;
    }

};

const renderElement = function (sElement, useOldElement, recorder) {

    if (!(sElement instanceof SE)) {
        console.log("Scope: invalid ScopeElement arg for render", sElement);
        return false;
    }

    const sComponent = sElement.sComponent;
    const jElement = sElement.class;
    const context = sComponent.context;

    if (jElement instanceof JE) {
        const tagName = jElement.tagName;
        if (!isString(tagName)) {
            console.log("Scope: invalid element tag for render", tagName);
            return false;
        }
        if (!useOldElement) {
            sElement.$ele = $(document.createElement(tagName))
                .attr(jElement.props)
                .data(SCOPE_DATA_KEY, sElement);
        }
        const $ele = sElement.$ele;

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

                                if (!isFunction(eventHandler[selector])) {
                                    console.log("Scope: invalid event handler", eventHandler[selector]);
                                    continue;
                                }

                                const selectorFunc = function (event) {
                                    eventHandler[selector].call(context, event, $(this), $ele);
                                };

                                $ele.on(eventName, selector, selectorFunc);
                                sElement.event.push([eventName, selector, selectorFunc]);
                            }
                        }
                    } else {
                        console.log("Scope: unknown event type", eventHandler);
                    }
                }
            }
        })();


        if (SCOPE_CLOSE_TAG.indexOf(tagName) === -1) {
            sElement.children.forEach(function (childSElement) {
                if (childSElement instanceof SE) {
                    renderElement(childSElement, false, recorder);
                    $ele.append(childSElement.$ele);
                } else if (childSElement instanceof SC) {
                    if (renderComponent(childSElement, false, recorder)) {
                        $ele.append(childSElement.sElementTree.$ele);
                    } else {
                        return false;
                    }
                }
            });
        }
        return true;
    } else if (isString(jElement)) {
        sElement.$ele = $(document.createTextNode(jElement));
        return true;
    } else {
        console.log("Scope: unknown element type for render", jElement);
        return false;
    }
};

module.exports = {
    c: renderComponent,
    e: renderElement
};