const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {isFunction, isObject, stopPropagation} = ScopeUtils;
const ToolIcon = require("./../button/toolIcon");
const FolderIcon = require("./folderIcon");

const scale = require("./../config").iconScale - 2;

const Item = Scope.createClass({

    expand: false,

    mouseOver: false,

    isActive: false,

    setArrow: function (type) {
        this.refs.arrow.find("img").css({marginLeft: -type * scale});
    },

    setCss: function (backgroundColor, borderColor) {
        this.refs.wrapper.css({
            backgroundColor: backgroundColor,
            borderColor: borderColor
        });
    },

    beforeMount: function () {
        const me = this;
        me.expand = ((me.props.activePath || "").indexOf(me.props.path) === 0);
    },

    beforeUpdate: function () {
        this.beforeMount();
    },

    afterMount: function () {
        const me = this;
        if (me.props.active) {
            me.setActive();
            if (isFunction(me.props.onClick)) {
                me.props.onClick(me, false);
            }
        }
    },

    afterUpdate: function () {
        this.afterMount();
    },

    ae: function () {
        const me = this;
        me.setArrow(me.expand ? 1 : 3);
    },

    al: function () {
        const me = this;
        me.setArrow(me.expand ? 0 : 2);
    },

    au: function (event) {
        const me = this;
        stopPropagation(event);
        me.expand = !me.expand;
        me.setArrow(me.expand ? 1 : 3);
        me.refs.children[me.expand ? "show" : "hide"]();
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
            me.props.onClick(me, true);
        }
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
        const me = this;
        const buttonUrl = (me.props.staticPath || "").replace(/\/$/ig, '') + "/tools.png";
        const folderUrl = (me.props.staticPath || "").replace(/\/$/ig, '') + "/folders.png";

        const {node, depth} = me.props, {title, type} = node;

        const commonStyle = `float: left;height: 21px;`;

        return (
            <div>
                <div onMouseEnter={me.e}
                     onMouseLeave={me.l}
                     onMouseDown={me.d}
                     onMouseUp={me.u}
                     ref="wrapper" title={title}
                     style={`font-size: ${scale / 2 + 3}px;height: 21px;line-height: 21px;vertical-align: middle;border: 1px solid transparent; background-color: transparent; width: 100%; height: ${scale + 2}px;`}>
                    <div style={`${commonStyle}width: ${depth * 19}px;`}></div>
                    <div onMouseEnter={me.ae}
                         onMouseLeave={me.al}
                         onMouseUp={me.au}
                         ref="arrow"
                         style={`${commonStyle}margin-top: 1px;`}
                    >
                        {ToolIcon(buttonUrl, me.expand ? 0 : 2, 3, scale, scale, scale)}
                    </div>
                    {FolderIcon(folderUrl, type, scale - 1)}
                    <div style={`${commonStyle}`}>{title}</div>
                    <div style="clear: both;"></div>
                </div>
                <div ref="children" style={`display: ${me.expand ? "block" : "none"};`}>
                    {(function () {
                        let result = [];
                        if (isObject(node.children)) {
                            for (let dirPath in node.children) {
                                if (node.children.hasOwnProperty(dirPath)) {
                                    const nodeInfo = node.children[dirPath];
                                    result.push(
                                        <Item staticPath={me.props.staticPath}
                                              onClick={me.props.onClick}
                                              node={nodeInfo}
                                              path={me.props.path + "/" + dirPath}
                                              active={me.props.path + "/" + dirPath == me.props.activePath}
                                              activePath={me.props.activePath}
                                              depth={me.props.depth + 1}/>
                                    );
                                }
                            }
                        }
                        return result;
                    })()}
                </div>
            </div>
        );
    }
});

module.exports = Item;