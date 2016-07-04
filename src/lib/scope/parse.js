const {isString, isFunction, isObject, escapeHtml} = require("./utils");
const {JC, JE} = require("./class");

module.exports = function createElement() {

    //parse jsx object
    const args = Array.prototype.slice.call(arguments, 0);
    const firstTwo = args.splice(0, 2);
    const tagName = firstTwo[0];
    const rawProps = firstTwo[1];
    const children = args;


    let props = {}, event = {}, ref = null;

    if (rawProps !== null && (isString(tagName) || (tagName instanceof JC))) {
        for (let key in rawProps) {
            if (rawProps.hasOwnProperty(key)) {
                const prop = rawProps[key];
                if (key === "ref") {
                    ref = escapeHtml("" + prop);
                } else if (key.match(/^on/) && isString(tagName)) {
                    if (prop && (isFunction(prop) || isObject(prop))) {
                        event[key.replace(/^on/, "").toLowerCase()] = prop;
                    }
                } else {
                    props[key] = prop;
                }
            }
        }
    }

    return new JE(tagName, props, children, event, ref);

};