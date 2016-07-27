const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {isObject, isFunction} = ScopeUtils;

const Item = require("./item");

const scale = require("./../config").iconScale;

module.exports = Scope.createClass({

    activeItem: null,
    activePath: "",

    beforeMount: function () {
        const me = this;
        me.activePath = (me.props.activePath || "").replace(/(^\/|\/$)/ig, "");
    },

    beforeUpdate: function () {
        this.beforeMount();
    },

    onItemClick: function (context, trigger) {
        const me = this;
        if (me.activeItem != null) {
            me.activeItem.setDefault.call(me.activeItem);
        }
        me.activeItem = context;
        if (trigger && isFunction(me.props.onSelect)) {
            me.props.onSelect(context.props.path);
        }
    },

    render: function () {
        const me = this;
        return (
            <div style={`margin-top: ${scale / 11 * 3}px;font-size: ${scale / 2 + 2}px;line-height: 21px;vertical-align: middle;width: 9999px;`}>
                <div ref="wrapper">
                    {(function () {
                        const rootNode = me.props.dirInfo;
                        const result = [];
                        if (isObject(rootNode)) {
                            for (let pathDir in rootNode) {
                                if (rootNode.hasOwnProperty(pathDir)) {
                                    const nodeInfo = rootNode[pathDir];
                                    result.push(
                                        <Item staticPath={me.props.staticPath}
                                              onClick={me.onItemClick.bind(me)}
                                              node={nodeInfo}
                                              path={pathDir}
                                              active={pathDir == me.activePath}
                                              activePath={me.activePath}
                                              depth={0}/>
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