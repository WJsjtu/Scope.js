const Scope = require("Scope");
const Icon = require("./toolIcon");

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({
    state: 0,
    disableClick: function () {
        this.setState(2);
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
        (this.state != 2) && this.setState(1);
    },

    l: function () {
        (this.state != 2) && this.setState(0);
    },

    render: function () {
        const me = this;
        return (
            <div onMouseEnter={me.e}
                 onMouseLeave={me.l}
                 style="display: inline-block; *zoom: 1; *display: inline;float: left; margin-left: 2px;">
                {Icon(me.props.iconUrl, me.state, 4, scale, scale, scale)}
            </div>
        );
    }
});