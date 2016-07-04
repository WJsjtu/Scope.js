const {isFunction} = require("./utils");

function ScopeJSXComponent(context) {
    this.context = context;
}

function ScopeJSXElement(tagName, props, children, event, ref) {
    const me = this;
    me.tagName = tagName;
    me.props = props;
    me.children = children;
    me.event = event;
    me.ref = ref;
}

/* this is an instance of ScopeJSXComponent
 *
 * @property(class) ScopeJSXComponent
 * @property(context) object
 * @property(jElementTree) ScopeJSXElement | null
 * @property(sElementTree) ScopeElement | null Note this refers to the first node rendered by render function
 * @property(children) array [ScopeComponent]
 * @property(parent) ScopeComponent | null
 * @property(refs) object
 * @property(sElement) ScopeElement Note: this is the component element like <component />
 *
 * */
function ScopeComponent(sElement) {
    const me = this, jComponent = sElement.class.tagName;
    me.class = jComponent;
    //copy the context for a new instance of the component
    const context = me.context = $.extend(true, {}, jComponent.context);
    context.props = $.extend(false, {}, sElement.class.props);
    context.props.children = sElement.class.children;

    if (isFunction(context.beforeMount)) {
        context.beforeMount.call(context);
    }

    if (isFunction(context.render)) {
        me.jElementTree = context.render.call(context);
    } else {
        me.jElementTree = null;
    }

    me.sElementTree = null;
    me.children = [];
    me.parent = null;
    me.refs = {};
    me.sElement = sElement;
}

/* this is an instance of ScopeJSXElement
 *
 * @property(class) ScopeJSXElement
 * @property(component) ScopeComponent
 * @property(children) array [ScopeElement | ScopeComponent]
 * @property(event) array [object | function]
 * @property($ele) jQuery Object | null
 * */

function ScopeElement(sComponent, jElement) {
    const me = this;
    me.class = jElement;
    me.sComponent = sComponent;
    me.children = [];
    me.event = [];
    me.$ele = null;
}

module.exports = {
    JC: ScopeJSXComponent,
    JE: ScopeJSXElement,
    SC: ScopeComponent,
    SE: ScopeElement
};