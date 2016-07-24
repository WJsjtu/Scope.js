const Scope = require("Scope");
const Icon = require("./toolIcon");
const ScopeUtils = Scope.utils, {isFunction} = ScopeUtils;

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({
    state: 0,
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
                    "border-left": "1px #D8D8D8 solid",
                    "background-color": "transparent"
                });
            }
        }).mousedown(function (event) {
            ScopeUtils.stopPropagation(event);
            if (me.state == 1 && +(event.button) == 0) {
                me.state = 2;
                $wrapper.css({
                    "border": "1px #6D9AE4 solid",
                    "background-color": "#C7DEFF"
                });
            }
        }).mouseup(function (event) {
            ScopeUtils.stopPropagation(event);
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
            <div style="display: inline-block; *zoom: 1; *display: inline;float: right;" title={me.props.title || ""}>
                <div ref="wrapper"
                     style="border: 1px transparent solid; border-left: 1px #D8D8D8 solid; cursor: pointer;">
                    {Icon(me.props.iconUrl, 2, 2, scale - 1, scale - 3, scale - 1)}
                </div>
            </div>
        );
    }
});