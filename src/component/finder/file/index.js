const Scope = require("Scope");
const Utils = require("./utils");
const scale = require("./../config").iconScale;
const ScopeUtils = Scope.utils;
const {stopPropagation, isFunction} = ScopeUtils;

const cellStyle = `display: inline-block; *zoom: 1; *display: inline;overflow: hidden;word-wrap: normal;text-overflow: ellipsis;white-space: nowrap;line-height: ${scale + 2}px;font-size: ${scale / 2 + 1}px;`;

const leftMargin = 17;

const File = Scope.createClass({

        mouseOver: false,

        isActive: false,

        setCss: function (backgroundColor, borderColor) {
            this.refs.border && this.refs.border.width(this.$ele.innerWidth() - leftMargin - 2).css({
                "background-color": backgroundColor,
                "border-color": borderColor
            });
        },

        e: function () {
            const me = this;
            if (!me.isActive) {
                me.setCss("#E8F3FB", "#8ABED5");
                me.mouseOver = true;
            }
        },

        l: function () {
            const me = this;
            if (!me.isActive) {
                me.setDefault();
            }
        },

        d: function (event) {
            const me = this;
            stopPropagation(event);
            if (+(event.button) == 0) {
                me.setCss("#D6E7FF", "#7AA4E8");
            }
        },

        u: function (event) {
            const me = this;
            stopPropagation(event);
            me.setActive();
            if (isFunction(me.props.onClick)) {
                me.props.onClick(me);
            }
        },

        c: function (event) {
            const me = this;
            stopPropagation(event);
            me.setActive();
            if (isFunction(me.props.onDoubleClick)) {
                me.props.onDoubleClick(me);
            }
        },

        afterMount: function () {
            const me = this;
            me.isActive = !!me.props.isActive;
            if (me.isActive) {
                me.setActive();
                if (isFunction(me.props.recordActive)) {
                    me.props.recordActive(me);
                }
            }
        },

        afterUpdate: function () {
            this.afterMount();
        },

        setBlur: function () {
            const me = this;
            me.setCss("#F7F7F7", "#DDDDDD");
            me.isActive = false;
            me.mouseOver = false;
        },

        setActive: function () {
            const me = this;
            me.setCss("#D2E7F6", "#5C9DD9");
            me.isActive = true;
            me.mouseOver = false;
        },

        setDefault: function () {
            const me = this;
            me.setCss("transparent", "transparent");
            me.isActive = false;
            me.mouseOver = false;
        },

        render: function () {
            const me = this, file = me.props.file || {};
            return (
                <div onMouseEnter={me.e}
                     onMouseLeave={me.l}
                     onMouseDown={me.d}
                     onMouseUp={me.u}
                     onDblClick={me.c}
                     class="finder-row"
                     style={`cursor: default; width: 100%; font-size: 0;line-height: 0;position: relative;height: ${scale}px;`}>
                    <div ref="border"
                         style={`position: absolute; top: 0; left: ${leftMargin}px; z-index: 998; display: inline-block; *zoom: 1; *display: inline;border: 1px transparent solid; height: ${scale}px;`}></div>

                    <div style={`width: 100%; position: absolute; top: 0; left: 10px; z-index: 999;`}>
                        <div class="finder-cell" style={cellStyle}>
                            <div
                                style={`margin-top: 2px; margin-left: ${leftMargin - 2}px; margin-right: 5px; float: left;`}>
                                {Utils.file.icon(file.name, me.props.iconUrl, scale - 3).component}
                            </div>
                            <div style="float: left;">
                                <span>{file.name || "- -"}</span>
                            </div>
                            <div style="clear:both;"></div>
                        </div>
                        <div class="finder-cell" style={cellStyle}>{Utils.date(file.timestamp)}</div>
                        <div class="finder-cell" style={cellStyle}>{Utils.file.type(file.name)}</div>
                        <div class="finder-cell" style={cellStyle}>{Utils.file.size(file.size)}</div>
                        <div class="finder-cell" style={cellStyle}>{file.description}</div>
                    </div>
                </div>
            );
        }
    })
    ;

File.labels = [{
    text: "名称",
    width: "39%"
}, {
    text: "修改日期",
    width: "13%"
}, {
    text: "类型",
    width: "13%"
}, {
    text: "大小",
    width: "13%"
}, {
    text: "描述",
    width: "13%"
}];

File.compare = function (index, order, a, b) {
    if (index == 0) {
        return ("" + a.name).localeCompare(b.name) * order;
    } else if (index == 1) {
        return (a.timestamp - b.timestamp) * order;
    } else if (index == 2) {
        return Utils.file.type(a.name).localeCompare(Utils.file.type(b.name)) * order;
    } else if (index == 3) {
        return (a.size - b.size) * order;
    } else if (index == 4) {
        return a.description.localeCompare(b.description) * order;
    }
};

module.exports = File;