const {SE, SC, JE} = require("./class");
const {isString, isObject, isFunction} = require("./utils");
const $ = require("jquery");

const destroy = function (sElement, shouldRemove) {

    Array.isArray(sElement.children) && sElement.children.forEach(function (childSElement) {
        if (childSElement instanceof SE) {

            destroy(childSElement, true);

            const template = childSElement.class;
            //JE or string
            if (template instanceof JE) {

                //remove old ref
                if (isString(template.ref) && (childSElement.sComponent instanceof SC)) {
                    delete childSElement.sComponent.refs[template.ref];
                }
            }

        } else if (childSElement instanceof SC) {

            destroy(childSElement.sElementTree, true);

            const _childElementSElement = childSElement.sElement;

            //remove old ref
            if (isString(_childElementSElement.class.ref) && (childSElement.parent instanceof SC)) {
                delete childSElement.parent.refs[_childElementSElement.class.ref];
            }

        }
    });

    sElement.children = [];


    if (sElement.$ele instanceof $) {

        Array.isArray(sElement.event) && sElement.event.forEach(function (eventInfoArray) {
            const eventName = eventInfoArray[0], selector = eventInfoArray[1], eventFunc = eventInfoArray[2];
            if (selector == null) {
                sElement.$ele.off(eventName, eventFunc);
            } else {
                sElement.$ele.off(eventName, selector, eventFunc);
            }

        });

        sElement.event = [];
        if (shouldRemove) {
            sElement.$ele.remove();
            sElement.$ele = null;
        }
    }
};

const update = function (sElement) {
    const extract = require("./extract"), render = require("./render");

    //if the node is the rootNode of a component
    if ((sElement.sComponent instanceof SC) && (sElement.sComponent.sElementTree === sElement)) {
        const sComponent = sElement.sComponent;
        extract.e(sComponent.sElementTree);

        if (isObject(sComponent.context) && isFunction(sComponent.context.beforeUpdate)) {
            sComponent.context.beforeUpdate.call(isObject(sComponent.context));
        }

        render.c(sComponent, "update");

    } else {
        extract.e(sElement);
        render.e(sElement, "update");
    }
};

module.exports = function (sElement) {
    if (sElement instanceof SE) {
        const $oldEle = sElement.$ele;
        destroy(sElement, false);
        update(sElement);
        if ($oldEle instanceof $) {
            $oldEle.hide().after(sElement.$ele).remove();
        }
    }
};