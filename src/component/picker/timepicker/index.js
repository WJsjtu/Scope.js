const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {getScope} = ScopeUtils;
const {NAMESPACE} = require("./../../../project");
const Picker = require("./picker");
require("./style.less");

module.exports = Scope.createClass({
    render: function () {
        return (
            <div class={NAMESPACE + "timepicker"}>
                <Picker />
            </div>
        );
    }
});