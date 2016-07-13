const isFunction = function (fn) {
    return "[object Function]" === Object.prototype.toString.call(fn);
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


const utils = {

    SCOPE_DATA_KEY: "scopeDataKey",

    SCOPE_CLOSE_TAG: "br hr img map area base input".split(" "),

    isFunction: isFunction,
    isString: isString,
    isObject: isObject,
    isElement: isElement,
    escapeHtml: escapeHtml,

    //************************** event *************
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

    //************************** scope **************
    getScope: function (ref) {
        if (ref instanceof $) {
            const sElement = ref.data(utils.SCOPE_DATA_KEY);
            if (sElement && sElement.sComponent) {
                return sElement.sComponent.context;
            }
        }
        return null;
    },

    update: function (ref) {
        if (ref instanceof $) {
            const sElement = ref.data(utils.SCOPE_DATA_KEY);
            if (sElement) {
                require("./update")(sElement);
            }
        }
        return false;
    }
};

module.exports = utils;