const Scope = require("Scope");
const Icon = require("./toolIcon");
const ScopeUtils = Scope.utils, {isFunction, stopPropagation} = ScopeUtils;

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({
    state: 0,
    disableClick: function () {
        this.state = 3;
        this.refs.wrapper.css({
            "border": "1px solid transparent",
            "background-color": "transparent"
        });
    },
    enableClick: function () {
        this.state = 0;
    },
    afterMount: function () {
        const me = this, $wrapper = me.refs.wrapper;

        $wrapper.mouseenter(function () {
            if (me.state != 3) {
                me.state = 1;
                $wrapper.css({
                    "border": "1px #8EB2EC solid",
                    "background-color": "#E2EEFF"
                });
            }
        }).mouseleave(function () {
            if (me.state != 3) {
                me.state = 0;
                $wrapper.css({
                    "border": "1px transparent solid",
                    "background-color": "transparent"
                });
            }
        }).mousedown(function (event) {
            stopPropagation(event);
            if (me.state == 1 && +(event.button) == 0) {
                me.state = 2;
                $wrapper.css({
                    "border": "1px #6D9AE4 solid",
                    "background-color": "#C7DEFF"
                });
            }
        }).mouseup(function (event) {
            stopPropagation(event);
            if (me.state == 2) {
                me.state = 1;
                $wrapper.css({
                    "border": "1px #8EB2EC solid",
                    "background-color": "#E2EEFF"
                });
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
            <div style="display: inline-block; *zoom: 1; *display: inline;float: left;">
                <div ref="wrapper" style="border: 1px solid transparent; cursor: pointer;">
                    {Icon(me.props.iconUrl, 0, 2, scale - 1, scale - 1, scale - 1)}
                </div>
            </div>
        );
    }
});