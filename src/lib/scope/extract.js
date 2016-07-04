const {isFunction, isString, isObject} = require("./utils");
const {SE, SC, JE, JC} = require("./class");

const extractComponent = function (parentSComponent, sComponent) {
    sComponent.parent = parentSComponent;
    if (parentSComponent instanceof SC) {
        if (!Array.isArray(parentSComponent.children)) {
            parentSComponent.children = [];
        }
        parentSComponent.children.push(sComponent);
    }
    const rootSElement = new SE(sComponent, sComponent.jElementTree);
    sComponent.sElementTree = rootSElement;
    extractElement(rootSElement);
};

const extractElement = function (sElement) {
    const sComponent = sElement.sComponent;
    const jElement = sElement.class;

    if (jElement == null) {
        return;
    }

    const context = sComponent.context;

    const extractJElementChildren = function (_jElementChildren) {

        const _children = [];

        _jElementChildren.forEach(function (childJElement) {

            //this is possible since a function element may return null
            if (!childJElement) {
                return false;
            }

            //当数据源是函数时,在指定的环境中动态生成元素节点
            while (isFunction(childJElement)) {
                childJElement = childJElement.call(context);
            }

            //If is array call the function itself recursively
            if (Array.isArray(childJElement)) {
                Array.prototype.push.apply(_children, childJElement);
                return true;
            }

            //a text node could be a string or even number or boolean
            if (!isObject(childJElement)) {
                _children.push("" + childJElement);
                return true;
            }

            //if not instance of `SElement`
            if (!(childJElement instanceof JE)) {
                //console.log("A function element returns non-element object!");
                return false;
            }

            //basic html element or an element is a component
            if (isString(childJElement.tagName) || (childJElement.tagName instanceof JC)) {
                _children.push(childJElement);
            } else {
                //console.log("An unknown element type!");
                return false;
            }
        });


        let hasFunction = false;
        for (let index = _children.length - 1; index >= 0; index--) {
            if (isFunction(_children[index])) {
                hasFunction = true;
                break;
            }
        }

        if (hasFunction) {
            return extractJElementChildren(_children);
        } else {
            return _children;
        }
    };

    const children = extractJElementChildren(jElement.children);

    sElement.children = children.map(function (_jElementChildren) {
        return new SE(sComponent, _jElementChildren);
    });

    //the children extract finished to this line of code
    //Note: sElement.children consists of an array of sElements|sComponents among which are possibly components
    //You need to be careful to recursively call extractElement since the sComponent may change.

    (function () {
        for (let j = sElement.children.length - 1; j >= 0; j--) {
            const _sElementChildren = sElement.children[j],
                _jElementChildren = _sElementChildren.class;
            if (isObject(_jElementChildren)) {
                if (_jElementChildren.tagName instanceof JC) {
                    const _sComponent = new SC(_sElementChildren);
                    sElement.children[j] = _sComponent;
                    extractComponent(sComponent, _sComponent);
                } else if (isString(_jElementChildren.tagName)) {
                    extractElement(_sElementChildren);
                }
            }
        }
    })();
};

module.exports = {
    c: extractComponent,
    e: extractElement
};