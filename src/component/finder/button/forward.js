const Scope = require("Scope");
const Icon = require("./toolIcon");
const ScopeUtils = Scope.utils, {isFunction, stopPropagation} = ScopeUtils;

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({
    state: 0,

    disableClick: function () {
        this.setState(3);
    },

    enableClick: function () {
        this.setState(0);
    },

    setState: function (state) {
        const me = this;
        me.state = state;
        me.$ele.find("img").css("margin-left", -state * scale);
    },

    e: function () {
        (this.state != 3) && this.setState(1);
    },

    l: function () {
        (this.state != 3) && this.setState(0);
    },

    d: function (event) {
        stopPropagation(event);
        if (this.state != 3 && +(event.button) == 0) {
            this.setState(2);
        }
    },

    u: function (event) {
        const me = this;
        stopPropagation(event);
        if (me.state == 2) {
            me.setState(1);
            if (isFunction(me.props.onClick)) {
                me.props.onClick();
            }
        }
    },

    render: function () {
        const me = this;
        return (
            <div onMouseEnter={me.e}
                 onMouseLeave={me.l}
                 onMouseDown={me.d}
                 onMouseUp={me.u}
                 style="display: inline-block; *zoom: 1; *display: inline;float: left; margin-left: 8px;" title="前进">
                {Icon(me.props.iconUrl, me.state, 0, scale, scale, scale)}
            </div>
        );
    }
});