const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {NAMESPACE} = require("./../../../project");

const parseNumber = function (number) {
    number = parseInt(number);
    if (isNaN(number)) {
        return false;
    }
    return number;
};

module.exports = Scope.createClass({
    size: 15,
    page: 1,
    total: 1,
    beforeMount: function () {
        const me = this;
        me.size = Math.abs(parseNumber(me.props.size) || 15);
        let total = me.total = Math.abs(parseNumber(me.props.total) || 1);
        let page = parseNumber(me.props.page) || 1;
        if (page != total) {
            if (page < 0) {
                page %= total;
                page += total;
            }
            if (page > total) {
                page = total
            }
        }
        me.page = page;
    },
    onPageSelect: function (pageIndex, event) {
        ScopeUtils.stopPropagation(event);
        this.updatePage(pageIndex, true);
    },
    onKeyDown: function (event, $this) {
        ScopeUtils.stopPropagation(event);
        if (event.which == 13) {
            this.updatePage($this.val(), true);
        }
    },
    onFocus: function (event, $this) {
        ScopeUtils.stopPropagation(event);
        $this.addClass("focused");
    },
    onBlur: function (event, $this) {
        ScopeUtils.stopPropagation(event);
        $this.val(this.page).removeClass("focused");
    },
    updateTotal: function (total, trigger) {
        const me = this, _total = Math.abs(parseNumber(total) || 1);
        me.total = _total;
        me.refs.total.text(_total);
        me.updatePage(me.page, trigger);
    },
    updatePage: function (page, trigger) {
        const me = this, total = me.total;

        let tempPage = parseNumber(page) || 1;
        if (tempPage != total) {
            if (tempPage < 0) {
                tempPage %= total;
                tempPage += total;
            }
            if (tempPage > total) {
                tempPage = total
            }
        }

        me.page = tempPage;
        ScopeUtils.update(me.refs.list);
        me.refs.input.val(tempPage);

        if (trigger && ScopeUtils.isFunction(me.props.onPageSelect)) {
            me.props.onPageSelect(tempPage);
        }

    },
    render: function () {
        const me = this;
        return (
            <div class={NAMESPACE + "finder-pagination"}>
                <div class="pages">
                    <ul class="pagination" ref="list">
                        {function () {
                            const page = me.page, beginIndex = page - ((page - 1) % me.size);
                            const commandPages = [
                                <li>
                                    <a class="first" onClick={me.onPageSelect.bind(me, 1)}>首页</a>
                                </li>,
                                <li>
                                    <a onClick={me.onPageSelect.bind(me, page - 1)}>上一页</a>
                                </li>
                            ];

                            if (page == 1) {
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
                            const list = [], page = me.page, beginIndex = page - ((page - 1) % me.size);
                            for (let i = 0; i < me.size; i++) {
                                const pageIndex = beginIndex + i;
                                if (beginIndex + i > me.total) {
                                    break;
                                }
                                list.push(
                                    <li>
                                        <a class={pageIndex == page ? "active": ""}
                                           onClick={me.onPageSelect.bind(me, pageIndex)}>
                                            {pageIndex}
                                        </a>
                                    </li>
                                );
                            }
                            return list;
                        }}
                        {function () {
                            const page = me.page, beginIndex = page - ((page - 1) % me.size);
                            const total = me.total, lastIndex = total - ((total - 1) % me.size);
                            const commandPages = [
                                <li>
                                    <a onClick={me.onPageSelect.bind(me, page + 1)}>下一页</a>
                                </li>,
                                <li>
                                    <a class="last" onClick={me.onPageSelect.bind(me, total)}>尾页</a>
                                </li>
                            ];

                            if (page == total) {
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
                                            <a onClick={me.onPageSelect.bind(me, beginIndex + me.size)}>...</a>
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
                    <input ref="input" type="text" value={me.page}
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