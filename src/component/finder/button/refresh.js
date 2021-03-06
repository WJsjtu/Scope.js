const Scope = require("Scope");
const Icon = require("./toolIcon");
const ScopeUtils = Scope.utils, {isFunction, stopPropagation} = ScopeUtils;

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({
    state: 0,

    setCss: function (backgroundColor, borderColor) {
        this.refs.wrapper.css({
            backgroundColor: backgroundColor,
            borderColor: borderColor
        });
    },

    e: function () {
        const me = this;
        if (me.state != 3) {
            me.state = 1;
            me.setCss("#E8F3FB", "#8ABED5");
        }
    },
    l: function () {
        const me = this;
        if (me.state != 3) {
            me.state = 0;
            me.setCss("transparent", "transparent");
            me.refs.wrapper.css({borderLeftColor: "#D8D8D8"});
        }
    },
    d: function (event) {
        const me = this;
        stopPropagation(event);
        if (me.state == 1 && +(event.button) == 0) {
            me.state = 2;
            me.setCss("#D6E7FF", "#7AA4E8");
        }
    },
    u: function (event) {
        const me = this;
        stopPropagation(event);
        if (me.state == 2) {
            me.state = 1;
            me.setCss("#E8F3FB", "#8ABED5");
            if (isFunction(me.props.onClick)) {
                me.props.onClick();
            }
        }
    },
    render: function () {
        const me = this;
        return (
            <div style="float: right;" title={me.props.title || ""}>
                <div onMouseEnter={me.e}
                     onMouseLeave={me.l}
                     onMouseDown={me.d}
                     onMouseUp={me.u}
                     ref="wrapper"
                     style="border: 1px transparent solid; border-left: 1px #D8D8D8 solid; cursor: pointer;">
                    {Icon(me.props.iconUrl, 2, 2, scale - 1, scale - 3, scale - 1)}
                </div>
            </div>
        );
    }
});