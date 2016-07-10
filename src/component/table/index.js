const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const Draggable = require("./draggable");
const {NAMESPACE} = require("./../../project");
require("./style.less");

module.exports = Scope.createClass({
    beforeMount: function () {
        const me = this;
        me.labels = Array.isArray(me.props.labels) ? me.props.labels : [];
    },
    resizeTable: function () {
        const me = this;
        let totalWidth = 0;

        me.refs.thead.find(".separator").each(function () {
            totalWidth += $(this).closest("th").width();
        });
        me.refs.table.width(totalWidth);
    },
    afterMount: function () {
        const me = this;

        me.refs.thead.find(".separator").each(function (index) {
            const $this = $(this), $label = $this.closest("th");
            let width = $label.width();
            $label.width(width);

            let minWidth = me.labels[index].minWidth,
                maxWidth = me.labels[index].maxWidth;

            minWidth = minWidth < $this.width() ? $this.width() : minWidth;

            const draggable = new Draggable($this, {
                onDragMove: function (currentPoint, originPoint) {
                    const _width = currentPoint.x - originPoint.x + width;
                    if (me.labels[index]) {
                        if (minWidth && minWidth >= _width) {
                            draggable.stop();
                            $label.width(minWidth);
                            return;
                        }
                        if (maxWidth && maxWidth <= _width) {
                            draggable.stop();
                            $label.width(maxWidth);
                            return;
                        }
                    }
                    $label.width(_width);
                    me.resizeTable();

                },
                onDragEnd: function () {
                    width = $label.width();
                }
            });

            if (me.props.height) {
                const maxHeight = parseFloat(me.props.height);
                if (!isNaN(maxHeight)) {
                    me.refs.table.height(maxHeight);
                }
            }
        });
        me.resizeTable();
    },
    afterUpdate: function () {
        this.afterMount();
    },
    updateTable: function () {
        Scope.update(this.refs.tbody);
    },
    render: function () {
        const me = this;
        return (
            <div class={NAMESPACE + "table"}>
                <table ref="table">
                    <thead ref="thead">
                    <tr>
                        {me.labels.map(function (labelObject) {
                            let text, width = (100 / me.labels.length) + "%", onSort = null;
                            if (!ScopeUtils.isObject(labelObject)) {
                                text = "" + labelObject;
                            } else {
                                text = labelObject.text || "--";
                                labelObject.width && (width = labelObject.width);
                                ScopeUtils.isFunction(labelObject.onSort) && (onSort = labelObject.onSort);
                            }
                            return (
                                <th style={`width: ${width}; cursor: ${onSort ? "pointer" : "default"}`}>
                                    <span>{text}</span>
                                    <span class="separator">|</span>
                                </th>
                            );
                        })}
                    </tr>
                    </thead>
                    <tbody ref="tbody" style="">
                    {me.props.children}
                    </tbody>
                </table>
            </div>
        );
    }
})
;