const Scope = require("Scope");
const Utils = require("./utils");
const scale = require("./../config").iconScale;
const ScopeUtils = Scope.utils;
const {stopPropagation, isFunction} = ScopeUtils;

const File = Scope.createClass({

    mouseOver: false,

    isMulti: false,

    isActive: false,

    setCss: function (backgroundColor, borderColor) {
        this.refs.border && this.refs.border.css({
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
        if (me.isMulti) {
            me.isActive = !me.isActive;
            me.isActive ? me.setActive() : me.setDefault();
            me.refs.check[0].checked = !!me.isActive;
        } else {
            me.setActive();
            me.refs.check[0].checked = false;
        }
        if (isFunction(me.props.onClick)) {
            me.props.onClick(me, me.isActive, me.isMulti);
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

    cc: function (event) {
        ScopeUtils.preventDefault(event);
    },

    beforeMount: function () {
        const me = this;
        me.isMulti = !!me.props.multiple;
    },

    beforeUpdate: function () {
        this.beforeMount();
    },

    afterMount: function () {
        const me = this;
        me.isActive = !!me.props.isActive;
        if (me.isActive) {
            me.setActive();
            me.refs.check[0].checked = me.isMulti;
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

        const thisStyle = `line-height: ${scale + 2}px;font-size: ${scale / 2 + 1}px;cursor: default; width: 100%; position: relative;height: ${scale}px;`;

        const borderStyle = `margin-left: ${scale - 5}px; border: 1px transparent solid; height: ${scale}px;`;

        const toolStyle = `position: absolute; top: 0; left: ${scale / 2}px; margin: 2px 5px 0 ${scale - 7}px;`;

        const iconStyle = `float: left; display: ${me.isMulti ? "block" : "none"};line-height: ${scale}px;margin-right: ${(scale + 2) / 4}px;`;

        const cellStyle = `float: left;overflow: hidden;word-wrap: normal;text-overflow: ellipsis;white-space: nowrap;`;
        const spanStyle = `padding-left: ${scale / 4}px;`;

        return (
            <div onMouseEnter={me.e}
                 onMouseLeave={me.l}
                 onMouseDown={me.d}
                 onMouseUp={me.u}
                 onDblClick={me.c}
                 class="finder-row"
                 style={thisStyle}>
                <div ref="border" style={borderStyle}></div>
                <div style={`width: 100%; position: absolute; top: 0; left: 0; z-index: 999;`}>
                    <div class="finder-cell" style={cellStyle + "position: relative;"}>
                        <div style={toolStyle}>
                            <div style={iconStyle}>
                                <input ref="check" type="checkbox" onClick={me.cc}/>
                            </div>
                            <div style="float: left; ">
                                {Utils.file.icon(file.name, me.props.iconUrl, scale - 3).component}
                            </div>
                            <div style="clear: both;"></div>
                        </div>
                            <span
                                style={`margin-left: ${2 * scale + 4 + (me.isMulti ? (scale - 3) : 0)}px`}>{file.name || "- -"}</span>
                    </div>
                    <div class="finder-cell" style={cellStyle}>
                        <span style={spanStyle}>{Utils.date(file.timestamp)}</span>
                    </div>
                    <div class="finder-cell" style={cellStyle}>
                        <span style={spanStyle}>{Utils.file.type(file.name)}</span>
                    </div>
                    <div class="finder-cell" style={cellStyle}>
                        <span style={spanStyle}>{Utils.file.size(file.size)}</span>
                    </div>
                    <div class="finder-cell" style={cellStyle}>
                        <span style={spanStyle}>{file.description}</span>
                    </div>
                    <div style="clear: both;"></div>
                </div>
            </div>
        );
    }
});

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