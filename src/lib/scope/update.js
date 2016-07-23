const {SE, SC, JE} = require("./class");
const {isString, isObject, isFunction} = require("./utils");
const $ = require("jquery");

const destroy = function (sElement, shouldRemove) {

    $.isArray(sElement.children) && sElement.children.forEach(function (childSElement) {
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

        $.isArray(sElement.event) && sElement.event.forEach(function (eventInfoArray) {
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
        console.log("Scope: invalid ScopeElement arg for update", sElement);
        return false;
    }

    const $oldEle = sElement.$ele;

    if (!($oldEle instanceof $)) {
        console.log("Scope: invalid jQuery instance of a ScopeElement", sElement);
        return false;
    }

    const extractModule = require("./extract"), renderModule = require("./render"), traverseModule = require("./traverse");


    destroy(sElement, false);

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

        extractModule.e(sComponent.sElementTree, true);


        if (renderModule.c(sComponent, true)) {
            traverseModule(sComponent, afterUpdate);
        }

    } else {
        extractModule.e(sElement, true);

        function ScopeRecorder(sComponent) {
            this.children = [];
            this.check = function (_sComponent) {
                if (_sComponent.parent === sComponent) {
                    this.children.push(_sComponent);
                }
            };
        }

        const recorder = new ScopeRecorder(sElement.sComponent);

        if (renderModule.e(sElement, true, recorder)) {
            recorder.children.forEach(function (childComponent) {
                traverseModule(childComponent, afterUpdate);
            });
        }
    }

};

module.exports = update;