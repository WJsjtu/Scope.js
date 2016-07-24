const Scope = require("Scope");
const {stopPropagation, getTarget, isFunction} = Scope.utils;

const Refresh = require("./../button/refresh"),
    DropDown = require("./../button/dropdown"),
    Arrow = require("./arrow"),
    Text = require("./text");

const FolderIcon = require("./../tree/folderIcon");

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({

    afterMount: function () {
        const me = this;
        me.refs.input.hide();
        me.refs.directory.css("width", me.$ele.innerWidth() - 3 * scale);
        me.refs.input.val((me.props.activePath || "").replace(/(^\/|\/$)/ig, ""));
    },

    afterUpdate: function () {
        this.afterMount();
    },

    onClick: function (event, $this) {
        stopPropagation(event);
        const me = this;
        if (getTarget(event) === $this[0]) {
            me.refs.path.hide();
            me.refs.input.css("display", "block").select();
            me.refs.wrapper.css("border-color", "#6D9AE4");
        }
    },

    onIconClick: function (event) {
        stopPropagation(event);
        const me = this;
        me.refs.path.hide();
        me.refs.input.css("display", "block").select();
        me.refs.wrapper.css("border-color", "#6D9AE4");
    },

    onBlur: function (event, $this) {
        stopPropagation(event);
        const me = this;
        $this.val((me.props.activePath || "").replace(/(^\/|\/$)/ig, ""));
        $this.hide();
        me.refs.path.show();
        me.refs.wrapper.css("border-color", "#D8D8D8");
    },

    onKeyDown: function (event) {
        const me = this;
        stopPropagation(event);
        event = event || window.event;
        const code = event.keyCode || event.which || event.charCode;
        if (code == 13 && isFunction(me.props.onPathSelect)) {
            me.props.onPathSelect(me.refs.input.val().replace(/(^\/|\/$)/ig, ""));
        }
    },

    render: function () {
        const me = this, iconUrl = (me.props.staticPath || "").replace(/\/$/ig, '') + "/tools.png", folderUrl = (me.props.staticPath || "").replace(/\/$/ig, '') + "/folders.png";
        return (
            <div style={`margin-left: 105px;margin-right: 225px;height: ${scale + 1}px;`}>
                <div ref="wrapper"
                     style={`position: relative;height: ${scale - 1}px;border: 1px #D8D8D8 solid;-webkit-transition: all .3s ease-out;transition: all .3s ease-out;`}>
                    <div style="line-height: 0;font-size: 0;margin-left: 2px; float: left;" onClick={me.onIconClick}>
                        {FolderIcon(folderUrl, "plain", scale - 4)}
                    </div>
                    <div ref="directory"
                        style={`padding: 0; margin: 0; border: none; height: ${scale - 1}px; overflow: hidden;float: left;`}>
                        <input ref="input"
                               onBlur={me.onBlur}
                               onKeydown={me.onKeyDown}
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
                                  display: block;
                                  -webkit-appearance: none;`}/>
                        <div ref="path" onClick={me.onClick}>
                            {function () {
                                const dirInfo = me.props.dirInfo, targetPaths = (me.props.activePath || "").replace(/(^\/|\/$)/ig, "").split("/"), result = [],
                                    addToPath = function (_dirInfo, targetPath) {
                                        if (_dirInfo != null) {
                                            const _dirs = [];
                                            let subInfo = null;
                                            for (var path in _dirInfo) {
                                                if (_dirInfo.hasOwnProperty(path)) {
                                                    path == targetPath && _dirs.push(path);
                                                    subInfo = _dirInfo[path];
                                                }
                                            }
                                            return {
                                                dir: _dirs,
                                                info: subInfo
                                            }
                                        }
                                    };


                                let tempInfo = dirInfo, fullPath = "";

                                for (let i = 0, length = targetPaths.length; i < length; i++) {
                                    const _result = addToPath(tempInfo, targetPaths[i]);
                                    tempInfo = _result.info;
                                    result.push(<Arrow iconUrl={iconUrl} dirs={_result.dir} root={fullPath}/>);

                                    fullPath += '/' + targetPaths[i];
                                    result.push(<Text text={targetPaths[i]}
                                                      fullPath={fullPath}
                                                      onClick={me.props.onPathSelect}/>);
                                }

                                return result;

                            }}
                            <div style="clear: both;"></div>
                        </div>
                    </div>
                    <Refresh iconUrl={iconUrl}
                             onClick={me.props.onRefresh}
                             title="刷新"/>

                    <DropDown iconUrl={iconUrl}
                              title="上一个位置"/>
                    <div style="clear: both;"></div>
                </div>
            </div>
        );
    }
});