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
        this.refs.arrow.find("img").css("margin-left", -type * scale);
    },

    setCss: function (backgroundColor, borderColor) {
        this.refs.wrapper.css({
            "background-color": backgroundColor,
            "border-color": borderColor
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
        const me = this, $wrapper = me.refs.wrapper, $arrow = me.refs.arrow.find("img");

        $wrapper.mouseenter(function () {
            if (!me.isActive) {
                me.setCss("#E8F3FB", "#8ABED5");
                me.mouseOver = true;
            }
        }).mouseleave(function () {
            if (!me.isActive) {
                me.setDefault();
            }
        }).mousedown(function (event) {
            stopPropagation(event);
            if (+(event.button) == 0) {
                me.setCss("#D6E7FF", "#7AA4E8");
            }
        }).mouseup(function (event) {
            stopPropagation(event);
            me.setActive();
            if (isFunction(me.props.onClick)) {
                me.props.onClick(me, true);
            }
        });

        $arrow.mouseenter(function () {
            me.setArrow(me.expand ? 1 : 3);
        }).mouseleave(function () {
            me.setArrow(me.expand ? 0 : 2);
        }).mouseup(function (event) {
            stopPropagation(event);
            me.expand = !me.expand;
            me.setArrow(me.expand ? 1 : 3);
            me.refs.children[me.expand ? "show" : "hide"]();
        });

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

        const inlineBlockStyle = `display: inline-block; *zoom: 1; *display: inline;float: left;height: 21px;cursor: default;`;

        return (
            <div>
                <div ref="wrapper" title={title}
                     style={`font-size: ${(scale + 2) / 2}px;height: 21px;line-height: 21px;vertical-align: middle;border: 1px solid transparent; background-color: transparent; width: 100%; height: ${scale + 2}px;`}>
                    <div style={`${inlineBlockStyle}width: ${depth * 19}px;`}></div>
                    <div style={`${inlineBlockStyle}margin-top: 1px;`}
                         ref="arrow">
                        {ToolIcon(buttonUrl, me.expand ? 0 : 2, 3, scale, scale, scale)}
                    </div>
                    {FolderIcon(folderUrl, type, scale - 1)}
                    <div style={`${inlineBlockStyle}`}>{title}</div>
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