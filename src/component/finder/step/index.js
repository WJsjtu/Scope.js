const Scope = require("Scope");

const Back = require("./../button/back"),
    Forward = require("./../button/forward"),
    Menu = require("./../button/menu"),
    Parent = require("./../button/parent");

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({
    render: function () {
        const me = this, iconUrl = (me.props.staticPath || "").replace(/\/$/ig, '') + "/tools.png";
        return (
            <div style={`position: absolute;left: 0;font-size: 0;top: 0;width: 105px;height: ${scale + 1}px;`}>
                <Back ref="backButton"
                      iconUrl={iconUrl}
                      onClick={me.props.onBack}
                />

                <Forward ref="forwardButton"
                         iconUrl={iconUrl}
                         onClick={me.props.onForward}
                />

                <Menu iconUrl={iconUrl}/>

                <Parent ref="parentButton"
                        iconUrl={iconUrl}
                        onClick={me.props.onParent}
                />

                <div style="clear: both;"></div>
            </div>
        );
    }
});