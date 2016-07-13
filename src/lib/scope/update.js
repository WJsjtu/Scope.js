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


    if (shouldRemove && sElement.$ele instanceof $) {

        Array.isArray(sElement.event) && sElement.event.forEach(function (eventInfoArray) {
            const eventName = eventInfoArray[0], selector = eventInfoArray[1], eventFunc = eventInfoArray[2];
            if (selector == null) {
                sElement.$ele.off(eventName, eventFunc);
            } else {
                sElement.$ele.off(eventName, selector, eventFunc);
            }

        });

        sElement.event = [];
        sElement.$ele.remove();
        sElement.$ele = null;
    }
};

const update = function (sElement) {

    if (!(sElement instanceof SE)) {
        return;
    }

    if (!(sElement.sComponent instanceof SC)) {
        return;
    }

    const $oldEle = sElement.$ele;

    if (!($oldEle instanceof $)) {
        return;
    }


    const extract = require("./extract"), render = require("./render");


    destroy(sElement, false);

    const beforeUpdate = function (_sComponent) {
        if (_sComponent instanceof SC) {
            const _context = _sComponent.context;
            if (isObject(_context)) {
                if (isFunction(_context.beforeUpdate)) {
                    _context.beforeUpdate.call(_context);
                }
            }
        }
    };

    const afterUpdate = function (_sComponent) {
        if (_sComponent instanceof SC) {
            const _context = _sComponent.context;
            if (isObject(_context)) {
                if (isFunction(_context.afterUpdate)) {
                    _context.afterUpdate.call(_context);
                }
            }
        }
    };

    //if the node is the rootNode of a component
    if (sElement.sComponent.sElementTree === sElement) {

        const sComponent = sElement.sComponent;

        extract.e(sComponent.sElementTree);

        require("./traverse")(sComponent, beforeUpdate);

        render.c(sComponent, true);

        //$oldEle.hide().after(sElement.$ele).remove();

        require("./traverse")(sComponent, afterUpdate);

    } else {
        extract.e(sElement);

        sElement.sComponent.children.forEach(function (childComponent) {
            require("./traverse")(childComponent, beforeUpdate);
        });

        render.e(sElement, true);

        //$oldEle.hide().after(sElement.$ele).remove();

        sElement.sComponent.children.forEach(function (childComponent) {
            require("./traverse")(childComponent, afterUpdate);
        });
    }

};

module.exports = update;