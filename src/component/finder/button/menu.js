const Scope = require("Scope");
const Icon = require("./toolIcon");

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({
    state: 0,
    disableClick: function () {
        const me = this;
        me.state = 2;
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
            if (me.state != 2) {
                me.state = 1;
                $img.css("margin-left", -me.state * scale);
            }
        }).mouseleave(function () {
            if (me.state != 2) {
                me.state = 0;
                $img.css("margin-left", -me.state * scale);
            }
        });
    },
    afterUpdate: function () {
        this.afterMount();
    },
    render: function () {
        const me = this;
        return (
            <div style="display: inline-block; *zoom: 1; *display: inline;float: left; margin-left: 2px;">
                {Icon(me.props.iconUrl, me.state, 4, scale, scale, scale)}
            </div>
        );
    }
});