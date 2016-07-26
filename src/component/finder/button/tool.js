const Scope = require("Scope");
const ScopeUtils = Scope.utils, {isFunction, stopPropagation} = ScopeUtils;

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({

    isActive: false,

    setActive: function () {
        this.isActive = true;
        this.$ele.css({
            "border-color": "transparent",
            "color": "#3C3C3C",
            "cursor": "pointer"
        });
    },

    setDisable: function () {
        this.isActive = false;
        this.$ele.css({
            "border-color": "#F5F6F7",
            "color": "#929292",
            "cursor": "not-allowed"
        });
    },

    afterMount: function () {
        const me = this;
        me.isActive = !!me.props.isActive;
        me.isActive ? me.setActive() : me.setDisable();
    },

    afterUpdate: function () {
        this.afterMount();
    },

    e: function () {
        const me = this;
        me.isActive && me.$ele.css("border-color", "#D8D8D8");
    },

    l: function () {
        const me = this;
        me.isActive && me.$ele.css("border-color", "transparent");
    },

    d: function (event) {
        stopPropagation(event);
        const me = this;
        me.isActive && me.$ele.css("background-color", "#F5F6F7");
    },

    u: function (event) {
        stopPropagation(event);
        const me = this;
        me.isActive && me.$ele.css("background-color", "transparent");
        if (me.isActive && isFunction(me.props.onClick)) {
            me.props.onClick();
        }
    },

    render: function () {
        const me = this, style = `float: left; border: 1px solid transparent; display: inline-block;*zoom: 1; *display: inline;font-size: ${scale / 2 + 1}px;line-height: ${scale + 2}px;padding: 0 16px;`;
        return (
            <span onMouseEnter={me.e}
                  onMouseLeave={me.l}
                  onMouseDown={me.d}
                  onMouseUp={me.u}
                  style={style}>{this.props.text || ""}</span>
        );
    }
});