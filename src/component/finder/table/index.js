const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {isFunction} = ScopeUtils;
const Draggable = require("./draggable");
const {NAMESPACE} = require("./../../../project");

module.exports = Scope.createClass({
    isMoving: false,
    beforeMount: function () {
        const me = this;
        me.labels = Array.isArray(me.props.labels) ? me.props.labels : [];
    },
    resizeTable: function () {
        const me = this, widthArray = [];

        me.refs.head.find(".separator").each(function () {
            const $label = $(this).closest(".label"), width = $label.outerWidth();
            $label.width(width);
            widthArray.push(width);
        });

        const totalWidth = window.eval(widthArray.join("+"));
        const minWidth = (isFunction(me.props.minWidth) ? me.props.minWidth() : me.props.minWidth) || totalWidth;
        me.$ele.innerWidth(Math.max(minWidth, totalWidth));
        me.refs.table.innerWidth(Math.max(minWidth, totalWidth));
        me.refs.head.innerWidth(totalWidth);
        me.refs.body.innerWidth(totalWidth);
        me.refs.body.find("div.finder-row").each(function () {
            $(this).find("div.finder-cell").each(function (index) {
                $(this).outerWidth(+widthArray[index]);
            });
        });
        return widthArray;
    },
    afterMount: function () {
        const me = this;

        me.resizeTable();

        const $line = $(`<div class="${NAMESPACE + "finder-table-line"}"></div>`);

        if (me.props.height) {
            me.refs.table.height(me.props.height);
        }

        me.refs.head.find(".separator").each(function (index) {
            const $this = $(this), $label = $this.closest(".label");
            let width, {minWidth, maxWidth} = me.labels[index];

            minWidth = (minWidth && minWidth > 100) ? minWidth : 100;
            maxWidth = maxWidth ? Math.max(maxWidth, minWidth) : 9999;

            new Draggable($this, {
                onDragStart: function (currentPoint) {
                    me.isMoving = true;
                    width = $label.outerWidth();
                    $line.appendTo($("body")).show().css({
                        left: currentPoint.x,
                        top: $label.offset().top,
                        height: me.refs.table.outerHeight() + me.refs.head.outerHeight()
                    });
                    me.refs.body.css({
                        "-webkit-touch-callout": "none",
                        "-webkit-user-select": "none",
                        "-khtml-user-select": "none",
                        "-moz-user-select": "none",
                        "-ms-user-select": "none",
                        "user-select": "none"
                    });
                },
                onDragMove: function (currentPoint, originPoint) {
                    const _width = currentPoint.x - originPoint.x + width;
                    if (_width < minWidth) {
                        $line.css({
                            left: minWidth + originPoint.x - width
                        });
                    } else if (_width > maxWidth) {
                        $line.css({
                            left: maxWidth + originPoint.x - width
                        });
                    } else {
                        $line.css({
                            left: currentPoint.x
                        });
                    }
                },
                onDragEnd: function (currentPoint, originPoint) {
                    setTimeout(function () {
                        me.isMoving = false;
                    }, 300);
                    $line.remove();
                    me.refs.body.css({
                        "-webkit-touch-callout": "initial",
                        "-webkit-user-select": "initial",
                        "-khtml-user-select": "initial",
                        "-moz-user-select": "initial",
                        "-ms-user-select": "initial",
                        "user-select": "initial"
                    });
                    let _width = currentPoint.x - originPoint.x + width;
                    if (_width < minWidth) {
                        _width = minWidth;
                    } else if (_width > maxWidth) {
                        _width = maxWidth;
                    }
                    $label.outerWidth(_width);
                    me.resizeTable();
                }
            });
        });
    },
    afterUpdate: function () {
        this.afterMount();
    },
    updateTable: function (resetHead) {
        const me = this;
        if (resetHead) {
            me.refs.head.find("div.arrow").hide();
        }
        ScopeUtils.update(me.refs.body);
        me.resizeTable();
    },
    render: function () {
        const me = this;
        return (
            <div class={NAMESPACE + "finder-table"}>
                <div class="head" ref="head">
                    {me.labels.map(function (labelObject, index) {
                        let text, width = (100 / me.labels.length) + "%", onSort = null;
                        if (!ScopeUtils.isObject(labelObject)) {
                            text = "" + labelObject;
                        } else {
                            text = labelObject.text || "--";
                            labelObject.width && (width = labelObject.width);
                        }
                        if (ScopeUtils.isFunction(me.props.onSort)) {
                            onSort = me.props.onSort;
                        }

                        const toggleSort = function (event, $this) {
                            ScopeUtils.stopPropagation(event);
                            if (onSort != null && !me.isMoving) {

                                const sortOrder = $this.data("order");
                                onSort(index, sortOrder, (function () {
                                    $this.data("order", sortOrder > 0 ? -1 : 1);
                                    me.refs.head.find("div.arrow").empty().hide();
                                    $this.closest("div.label").find(">div.arrow").css({
                                        display: "block"
                                    }).html(`<div class="${sortOrder > 0 ? "up" : "down"}"></div>`);
                                }));

                            }
                        };

                        return (
                            <div class="label" style={`width: ${width};`}>
                                <span class="text"
                                      style={`cursor: ${onSort ? "pointer" : "default"};`}
                                      onClick={toggleSort}
                                      data-order="1"
                                >{text}</span>
                                <span class="separator">|</span>
                                <div class="arrow"></div>
                            </div>
                        );
                    })}
                </div>
                <div style="width: 100%;overflow: auto;overflow-x: hidden;" ref="table">
                    <div style="width: 100%;" ref="body">
                        {me.props.children}
                    </div>
                </div>
            </div>
        );
    }
});