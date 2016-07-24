const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {isFunction, stopPropagation} = ScopeUtils;
const Icon = require("./../button/toolIcon");

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({
    setValue: function (value) {
        if (value !== "") {
            this.refs.placeholder.hide();
        }
        this.refs.input.val(value);
    },
    onKeyDown: function (event) {
        const me = this;
        stopPropagation(event);
        event = event || window.event;
        const code = event.keyCode || event.which || event.charCode;
        if (code == 13 && isFunction(me.props.onSearch)) {
            me.props.onSearch(me.refs.input.val());
        }
    },
    onFocus: function (event) {
        const me = this;
        stopPropagation(event);
        me.refs.icon.fadeOut(200);
        me.refs.placeholder.hide();
    },
    onBlur: function (event) {
        const me = this;
        stopPropagation(event);
        me.refs.icon.fadeIn(200);
        if (me.refs.input.val() === "") {
            me.refs.placeholder.fadeIn(200);
        }
    },
    render: function () {
        const me = this;
        return (
            <div
                style={`position: absolute; right: 0; top: 0; width: 205px; height: ${scale + 1}px; padding: 0 10px;`}>
                <div style={`height: ${scale - 1}px;border: 1px #D8D8D8 solid;overflow: hidden;`}>
                    <input type="text"
                           ref="input"
                           style={`color: #6D6D6D;
                                  font-size: ${scale / 2 + 1}px;
                                  width: 100%;
                                  cursor: default;
                                  background: none;
                                  box-shadow: none;
                                  height: ${scale - 1}px;
                                  border: 0;
                                  margin: 0;
                                  padding: 0 10px 0 5px;
                                  outline: 0;
                                  display: inline-block;
                                  *zoom: 1;
                                  *display: inline;
                                  -webkit-appearance: none;`}
                           onKeydown={me.onKeyDown}
                           onFocus={me.onFocus}
                           onBlur={me.onBlur}
                    />
                </div>
                <span
                    style={`position: absolute;top: 1px;left: ${scale / 2 + 3}px;height: ${scale - 1}px;line-height: ${scale - 1}px;font-size: ${scale / 2 + 1}px;vertical-align: middle;text-align: left;color: #AFAFAF;`}
                    ref="placeholder">搜索</span>
                <div style={`position: absolute; top: 0; right: ${scale / 2 + 1}px;`} ref="icon">
                    {Icon(me.props.iconUrl, 3, 2, 23, 23, 21)}
                </div>
            </div>
        );
    }
});