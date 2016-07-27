const Scope = require("Scope");
const ScopeUtils = Scope.utils, {isFunction, stopPropagation} = ScopeUtils;

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({

    isActive: false,

    setActive: function () {
        this.isActive = true;
        this.$ele.css({
            backgroundColor: "#1979CA",
            color: "#FFFFFF",
            cursor: "pointer"
        });
    },

    setDisable: function () {
        this.isActive = false;
        this.$ele.css({
            backgroundColor: "#F5F6F7",
            color: "#929292",
            cursor: "not-allowed"
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
        me.isActive && me.$ele.css({backgroundColor: "#298CE1"});
    },

    l: function () {
        const me = this;
        me.isActive && me.$ele.css({backgroundColor: "#1979CA"});
    },

    c: function (event) {
        const me = this;
        stopPropagation(event);
        if (me.isActive && isFunction(me.props.onClick)) {
            me.props.onClick();
        }
    },

    render: function () {
        const me = this, style = `float: left;font-size: ${scale / 2 + 1}px;line-height: ${scale + 2}px;padding: 0 16px;`;
        return (
            <span onMouseEnter={me.e}
                  onMouseLeave={me.l}
                  onClick={me.c}
                  style={style}>选择</span>
        );
    }
});