const Scope = require("Scope");
const Icon = require("./toolIcon");
const ScopeUtils = Scope.utils, {isFunction, stopPropagation} = ScopeUtils;

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({
    state: 0,
    disableClick: function () {
        const me = this;
        me.state = 3;
        me.$ele.find("img").css("margin-left", -me.state * scale);
    },
    enableClick: function () {
        const me = this;
        me.state = 0;
        me.$ele.find("img").css("margin-left", -me.state * scale);
    },
    afterMount: function () {
        const me = this, $img = me.$ele.find("img");

        me.$ele.mouseenter(function () {
            if (me.state != 3) {
                me.state = 1;
                $img.css("margin-left", -me.state * scale);
            }
        }).mouseleave(function () {
            if (me.state != 3) {
                me.state = 0;
                $img.css("margin-left", -me.state * scale);
            }
        }).mousedown(function (event) {
            stopPropagation(event);
            if (me.state == 1 && +(event.button) == 0) {
                me.state = 2;
                $img.css("margin-left", -me.state * scale);
            }
        }).mouseup(function (event) {
            stopPropagation(event);
            if (me.state == 2) {
                me.state = 1;
                $img.css("margin-left", -me.state * scale);
                if (isFunction(me.props.onClick)) {
                    me.props.onClick();
                }
            }
        });

    },
    afterUpdate: function () {
        this.afterMount();
    },
    render: function () {
        const me = this;
        return (
            <div style="display: inline-block; *zoom: 1; *display: inline;float: left; margin-left: 8px;" title="前进">
                {Icon(me.props.iconUrl, me.state, 0, scale, scale, scale)}
            </div>
        );
    }
});