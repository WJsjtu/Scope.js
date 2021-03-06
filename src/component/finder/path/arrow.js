const Scope = require("Scope");
const Icon = require("./../button/toolIcon");
const ScopeUtils = Scope.utils, {isFunction, stopPropagation} = ScopeUtils;

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({
    setCss: function (backgroundColor, borderColor) {
        this.refs.wrapper.css({
            backgroundColor: backgroundColor,
            borderColor: borderColor
        });
    },
    e: function () {
        this.setCss("#E8F3FB", "#8ABED5");
    },
    l: function () {
        this.setCss("transparent", "transparent");
    },
    d: function (event) {
        stopPropagation(event);
        if (+(event.button) == 0) {
            this.setCss("#D6E7FF", "#7AA4E8");
        }
    },
    u: function (event) {
        const me = this;
        stopPropagation(event);
        me.setCss("#E8F3FB", "#8ABED5");
        if (isFunction(me.props.onClick)) {
            me.props.onClick(me.props.dirs || []);
        }
    },
    render: function () {
        const me = this;
        return (
            <div style="float: left;" title={me.props.title || ""}>
                <div onMouseEnter={me.e}
                     onMouseLeave={me.l}
                     onMouseDown={me.d}
                     onMouseUp={me.u}
                     ref="wrapper"
                     style="border: 1px transparent solid; cursor: pointer;">
                    {Icon(me.props.iconUrl, 3, 4, scale - 7, scale - 3, scale - 3)}
                </div>
            </div>
        );
    }
});