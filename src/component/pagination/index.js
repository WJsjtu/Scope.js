const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {getScope} = ScopeUtils;
const {NAMESPACE} = require("./../../project");
require("./style.less");

module.exports = Scope.createClass({
    step: 15,
    active: 1,
    total: 1,
    beforeMount: function () {
        const me = this,
            propStep = parseInt(+(me.props.step)),
            propActive = parseInt(+(me.props.active)),
            propTotal = parseInt(+(me.props.total));

        me.step = Math.abs(propStep);
        me.total = (isNaN(propTotal) && propTotal) ? 1 : Math.abs(propTotal);
        me.active = (isNaN(propActive) && propActive) ? 1 : propActive;
        if (me.active != me.total) {
            if (me.active < 0) {
                me.active %= me.total;
                me.active += me.total;
            }
            if (me.active > me.total) {
                me.active = me.total
            }
        }
    },
    onPageSelect: function (pageIndex, event) {
        ScopeUtils.stopPropagation(event);
        this.updateActive(pageIndex);
    },
    onKeyDown: function (event, $this) {
        ScopeUtils.stopPropagation(event);
        if (event.which == 13) {
            this.updateActive($this.val());
        }
    },
    onFocus: function (event, $this) {
        ScopeUtils.stopPropagation(event);
        $this.addClass("focused");
    },
    onBlur: function (event, $this) {
        ScopeUtils.stopPropagation(event);
        $this.val(this.active).removeClass("focused");
    },
    updateTotal: function (total) {
        const me = this;
        let _total = parseInt(+(total));
        if (!isNaN(_total)) {
            _total = Math.abs(_total);
            if (_total < 1) {
                _total = 1;
            }
            me.total = _total;
            me.refs.total.text(_total);
            me.updateActive(me.active, true);
        }
    },
    updateActive: function (page, forceUpdate) {
        const me = this;
        let _page = parseInt(+(page));

        const oldActive = me.active;

        me.active = (isNaN(_page) && _page) ? 1 : _page;
        if (me.active != me.total) {
            if (me.active < 0) {
                me.active %= me.total;
                me.active += me.total;
            }
            if (me.active > me.total) {
                me.active = me.total
            }
        }

        if (me.active != oldActive || forceUpdate) {
            ScopeUtils.update(me.refs.list);
            me.refs.input.val(me.active);
        }
        if (ScopeUtils.isFunction(me.props.onPageSelect)) {
            me.props.onPageSelect(me.active);
        }
    },
    render: function () {
        const me = this;
        return (
            <div class={NAMESPACE + "pagination"}>
                <div class="pages">
                    <ul class="pagination" ref="list">
                        {function () {
                            const beginIndex = me.active - ((me.active - 1) % me.step);
                            const commandPages = [
                                <li>
                                    <a class="first" onClick={me.onPageSelect.bind(me, 1)}>首页</a>
                                </li>,
                                <li>
                                    <a onClick={me.onPageSelect.bind(me, me.active - 1)}>上一页</a>
                                </li>
                            ];

                            if (me.active == 1) {
                                return [
                                    <li>
                                        <a class="disabled first">首页</a>
                                    </li>,
                                    <li>
                                        <a class="disabled">上一页</a>
                                    </li>
                                ]
                            } else {
                                if (beginIndex == 1) {
                                    return commandPages;
                                } else {
                                    commandPages.push(
                                        <li>
                                            <a onClick={me.onPageSelect.bind(me, beginIndex - 1)}>...</a>
                                        </li>
                                    );
                                    return commandPages;
                                }
                            }

                        }}
                        {function () {
                            const list = [], beginIndex = me.active - ((me.active - 1) % me.step);
                            for (let i = 0; i < me.step; i++) {
                                const pageIndex = beginIndex + i;
                                if (beginIndex + i > me.total) {
                                    break;
                                }
                                list.push(
                                    <li>
                                        <a class={pageIndex == me.active ? "active": ""}
                                           onClick={me.onPageSelect.bind(me, pageIndex)}>
                                            {pageIndex}
                                        </a>
                                    </li>
                                );
                            }
                            return list;
                        }}
                        {function () {
                            const beginIndex = me.active - ((me.active - 1) % me.step);
                            const lastIndex = me.total - ((me.total - 1) % me.step);
                            const commandPages = [
                                <li>
                                    <a onClick={me.onPageSelect.bind(me, me.active + 1)}>下一页</a>
                                </li>,
                                <li>
                                    <a class="last" onClick={me.onPageSelect.bind(me, me.total)}>尾页</a>
                                </li>
                            ];

                            if (me.active == me.total) {
                                return [
                                    <li>
                                        <a class="disabled">下一页</a>
                                    </li>,
                                    <li>
                                        <a class="disabled last">尾页</a>
                                    </li>
                                ]
                            } else {
                                if (beginIndex == lastIndex) {
                                    return commandPages;
                                } else {
                                    commandPages.unshift(
                                        <li>
                                            <a onClick={me.onPageSelect.bind(me, beginIndex + me.step)}>...</a>
                                        </li>
                                    );
                                    return commandPages;
                                }
                            }
                        }}
                    </ul>
                </div>
                <div class="info">
                    <span>第</span>
                    <input ref="input" type="text" value={me.active}
                           onFocus={me.onFocus}
                           onKeydown={me.onKeyDown}
                           onBlur={me.onBlur}/>
                    <span>页&nbsp;&nbsp;共&nbsp;</span>
                    <span ref="total">{me.total}</span>
                    <span>&nbsp;页</span>
                </div>
                <div style="clear: both;"></div>
            </div>
        );
    }
});