const Scope = require("Scope");
const ScopeUtils = Scope.utils, {isFunction, stopPropagation} = ScopeUtils;

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({

    isActive: false,

    setActive: function () {
        this.isActive = true;
        this.$ele.css({
            "background-color": "#1979CA",
            "color": "#FFFFFF",
            "cursor": "pointer"
        });
    },

    setDisable: function () {
        this.isActive = false;
        this.$ele.css({
            "background-color": "#F5F6F7",
            "color": "#929292",
            "cursor": "not-allowed"
        });
    },

    afterMount: function () {
        const me = this, $this = me.$ele;
        $this.hover(function () {
            me.isActive && $this.css("background-color", "#298CE1");
        }, function () {
            me.isActive && $this.css("background-color", "#1979CA");
        }).on("click", function (event) {
            stopPropagation(event);
            if (me.isActive && isFunction(me.props.onClick)) {
                me.props.onClick();
            }
        });
        me.isActive = !!me.props.isActive;
        me.isActive ? me.setActive() : me.setDisable();
    },

    render: function () {
        const style = `float: left; display: inline-block;*zoom: 1; *display: inline;font-size: ${scale / 2 + 1}px;line-height: ${scale + 2}px;padding: 0 16px;`;
        return (
            <span style={style}>选择</span>
        );
    }
});