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

        if (rootJElement.tagName instanceof JC) {
            const sComponent = new SC(new SE(null, rootJElement));
            require("./extract").c(null, sComponent);
            if (require("./render").c(sComponent)) {
                element.empty().append(sComponent.sElementTree.$ele);
                require("./traverse")(sComponent, afterMount);
                return sComponent;
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
            require("./extract").c(null, fakeSComponent);
            if (require("./render").c(fakeSComponent)) {
                element.empty().append(fakeSComponent.sElementTree.$ele);
                require("./traverse")(fakeSComponent, afterMount);
                return fakeSComponent;
            } else {
                return null;
            }
        }
    },
    utils: require("./utils"),
    version: "4.0.5"
};

window.Scope = module.exports = Scope;

