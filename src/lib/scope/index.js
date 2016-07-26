const {SC, SE, JC, JE} = require("./class");
const {isElement, isObject, isFunction} = require("./utils");
const $ = require("jquery");

const Scope = {
    createElement: require("./parse"),
    createClass: function (context) {
        return new JC(context);
    },
    render: function (rootJElement, element, context) {
        if (!(rootJElement instanceof JE)) {
            throw new TypeError("Scope.render type error!");
        }

        if (!(element instanceof $) && !isElement(element)) {
            throw new TypeError("Scope.render should mount element on a DOM or a jQuery Object!");
        }

        if (isElement(element)) {
            element = $(element);
        }

        const afterMount = function (_sComponent) {
            if (_sComponent instanceof SC) {
                const _context = _sComponent.context;
                if (isObject(_context)) {
                    if (isFunction(_context.afterMount)) {
                        _context.afterMount.call(_context);
                    }
                }
            }
        };


        const extractModule = require("./extract"), renderModule = require("./render"), traverseModule = require("./traverse");

        if (rootJElement.tagName instanceof JC) {
            const sComponent = new SC(new SE(null, rootJElement));
            extractModule.c(null, sComponent, false);
            if (renderModule.c(sComponent)) {
                element.empty().append(sComponent.sElementTree.$ele);
                traverseModule(sComponent, afterMount);
                return sComponent.context.$ele;
            } else {
                return null;
            }
        } else {
            const fakeSComponent = new SC(new SE(null, (function () {
                const _component = Scope.createClass({
                    render: isObject(context) ? (function () {
                        return rootJElement;
                    }).bind(context) : function () {
                        return rootJElement;
                    }
                });
                return <_component />;
            })()));
            extractModule.c(null, fakeSComponent, false);
            if (renderModule.c(fakeSComponent)) {
                element.empty().append(fakeSComponent.sElementTree.$ele);
                traverseModule(fakeSComponent, afterMount);
                return fakeSComponent.context.$ele;
            } else {
                return null;
            }
        }
    },
    utils: require("./utils"),
    version: "4.1.0"
};

window.Scope = module.exports = Scope;

