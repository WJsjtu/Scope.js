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
        const me = this, $this = me.$ele;
        $this.hover(function () {
            me.isActive && $this.css("border-color", "#D8D8D8");
        }, function () {
            me.isActive && $this.css("border-color", "transparent");
        }).mousedown(function () {
            stopPropagation(event);
            me.isActive && $this.css("background-color", "#F5F6F7");
        }).mouseup(function () {
            stopPropagation(event);
            me.isActive && $this.css("background-color", "transparent");
            if (me.isActive && isFunction(me.props.onClick)) {
                me.props.onClick();
            }
        });
        me.isActive = !!me.props.isActive;
        me.isActive ? me.setActive() : me.setDisable();
    },

    render: function () {
        const style = `float: left; border: 1px solid transparent; display: inline-block;*zoom: 1; *display: inline;font-size: ${scale / 2 + 1}px;line-height: ${scale + 2}px;padding: 0 16px;`;
        return (
            <span style={style}>{this.props.text || ""}</span>
        );
    }
});