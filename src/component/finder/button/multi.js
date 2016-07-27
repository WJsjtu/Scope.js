const Scope = require("Scope");
const ScopeUtils = Scope.utils, {isFunction, stopPropagation} = ScopeUtils;

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({

    isMulti: false,

    isActive: false,

    setActive: function () {
        this.isActive = true;
        this.$ele.css({
            borderColor: "transparent",
            color: "#3C3C3C",
            cursor: "pointer"
        });
    },

    setDisable: function () {
        this.isActive = false;
        this.$ele.css({
            borderColor: "#F5F6F7",
            color: "#929292",
            cursor: "not-allowed"
        });
    },

    beforeMount: function () {
        const me = this;
        me.isMulti = !!me.props.multiple;
        me.isActive = !!me.props.isActive;
    },

    beforeUpdate: function () {
        this.beforeMount();
    },

    afterMount: function () {
        const me = this;
        me.$ele.css({
            borderColor: "transparent",
            color: "#3C3C3C",
            cursor: "pointer"
        });
        me.isActive ? me.setActive() : me.setDisable();
    },

    afterUpdate: function () {
        this.afterMount();
    },


    e: function () {
        const me = this;
        me.isActive && me.$ele.css({borderColor: "#D8D8D8"});
    },

    l: function () {
        const me = this;
        me.isActive && me.$ele.css({borderColor: "transparent"});
    },


    d: function (event) {
        stopPropagation(event);
        const me = this;
        if (me.isActive) {
            me.$ele.css({backgroundColor: "#F5F6F7"});
            me.isMulti = !me.isMulti;
            me.$ele.text(me.isMulti ? "单选" : "多选");
        }
    },

    u: function (event) {
        stopPropagation(event);
        const me = this;
        if (me.isActive) {
            me.$ele.css({backgroundColor: "transparent"});
            if (isFunction(me.props.onClick)) {
                me.props.onClick(me.isMulti);
            }
        }
    },

    render: function () {
        const me = this, style = `float: left; border: 1px solid transparent; font-size: ${scale / 2 + 1}px;line-height: ${scale + 2}px;padding: 0 16px;`;
        return (
            <span onMouseEnter={me.e}
                  onMouseLeave={me.l}
                  onMouseDown={me.d}
                  onMouseUp={me.u}
                  style={style}>{me.isMulti ? "单选" : "多选"}</span>
        );
    }
});