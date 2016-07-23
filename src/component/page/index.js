const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {getScope, isObject, isFunction} = ScopeUtils;
const {NAMESPACE} = require("./../../project");
require("./style.less");

const hasHistory = History && History.options;

module.exports = function (Pagination, Table) {
    const parseNumber = function (number) {
        number = parseInt(number);
        if (isNaN(number)) {
            return false;
        }
        return number;
    };

    const defaultQuerySize = 20;

    const parseHash = function () {
        //?cid_{cid}=json(query)
        const hashObject = {};
        const matches = /(\/)?(\?|#)([^\/]+)(\/)?$/ig.exec(window.location.href);
        if (matches && matches.length >= 4) {
            const hashString = matches[3];
            hashString.split("&").forEach(function (pair) {
                pair = pair.split("=");
                if (pair.length == 2) {
                    hashObject[pair[0]] = decodeURIComponent(pair[1]);
                }
            });
        }
        return hashObject;
    };

    return Scope.createClass({
        cid: 1,
        pagination: {
            page: 1,
            total: 1,
            size: 15
        },
        table: {
            labels: [],
            onSort: null,
            height: null
        },
        data: {
            page: 1,
            total: 1,
            size: 20,
            data: []
        },
        query: {
            word: "",
            page: 1,
            size: defaultQuerySize
        },
        requestState: {
            finished: true,
            xhr: null
        },

        request: function (query, ignoreLoading, ignoreError) {
            const me = this, requestState = me.requestState, refs = me.refs,
                $error = me.refs.error,
                $pagination = refs.pagination,
                $loading = refs.loading,
                $table = refs.table,
                $body = getScope($table).refs.table;
            if (!ignoreLoading) {
                $loading.css({
                    height: $body.outerHeight(),
                    position: "relative"
                }).html(
                    $(`<div><i class="fa fa-spinner fa-pulse fa-fw"></i><span>&nbsp;正在加载数据...</span></div>`)
                ).show();
                $error.text("").hide();
                $table.hide();
            }

            if (!requestState.finished && requestState.xhr) {
                requestState.xhr.abort();
                requestState.xhr = null;
                requestState.finished = true;
            }

            const xhr = $.ajax($.extend({}, me.props.request, {data: query}));
            requestState.xhr = xhr;
            requestState.finished = false;

            return xhr.then(function (data) {
                if (isFunction(me.props.filter)) {
                    data = me.props.filter(data);
                }
                me.data = data;
                me.query = query;

                if (me.pagination.total != data.total) {
                    me.pagination.total = data.total;
                    getScope($pagination).updateTotal(data.total);
                }
                if (me.pagination.page != query.page) {
                    me.pagination.page = query.page;
                    getScope($pagination).updatePage(query.page);
                }
                getScope($table).updateTable();
                $table.show();
            }, function (_xhr) {
                if (_xhr.statusText != "abort" && !ignoreError) {
                    $error.css({
                        width: "100%",
                        height: $body.outerHeight(),
                        position: "relative",
                        left: 0
                    }).text("数据加载失败!").show();
                }
            }).always(function () {
                requestState.finished = true;
                $loading.hide();
            });
        },

        beforeMount: function () {
            const me = this, {pagination} = this;
            me.cid = me.props.cid;
            if (isObject(me.props.pagination)) {
                me.pagination = me.props.pagination;
                pagination.size = Math.abs(parseNumber(pagination.size) || 15);
            }
            if (isObject(me.props.table)) {
                me.table = $.extend({}, me.props.table);
            }
        },

        afterMount: function () {
            const me = this, hashObject = parseHash(), $content = me.refs.content, disableHistory = !!me.props.disableHistory || !hasHistory;

            me.refs.error.hide();
            me.refs.loading.css({
                width: $content.outerWidth(),
                height: $content.outerHeight(),
                left: 0,
                top: 0
            }).show();

            $content.css("visibility", "visible").hide();

            const bindHistory = function () {
                History.Adapter.bind(window, 'statechange', function () {
                    const stateData = History.getState().data;
                    if (stateData.cid == me.cid) {
                        me.request(stateData.query || me.query);
                    }
                });
            };

            const initData = function (_query) {
                !disableHistory && History.replaceState({
                    cid: me.cid,
                    query: _query
                }, null, null);
                me.request(_query, true, true).then(function () {
                    $content.show();
                    me.refs.input.val(_query.word);
                    !disableHistory && bindHistory();
                }, function () {
                    me.refs.error.css({
                        left: 0,
                        top: 0
                    }).show();
                });
            };

            if (hashObject["cid_" + me.cid]) {
                try {
                    const query = JSON.parse(decodeURI(hashObject["cid_" + me.cid]));
                    initData($.extend({}, me.query, query));
                } catch (e) {
                    initData(me.query);
                }
            } else {
                initData(me.query);
            }
        },

        beforeUpdate: function () {
            this.beforeMount();
        },

        afterUpdate: function () {
            const me = this, disableHistory = !!me.props.disableHistory || !hasHistory;
            !disableHistory && History.pushState({}, null, null);
            me.afterMount();
        },

        onSort: function (index, order, callback) {
            const me = this;
            if (isFunction(me.table.onSort)) {
                me.data.data.sort(me.table.onSort(index, order));
                getScope(me.refs.table).updateTable();
                callback();
            }
        },


        sendQuery: function (query) {
            const me = this, hashObject = parseHash(), disableHistory = !!me.props.disableHistory || !hasHistory;

            query = $.extend({}, me.query, query);

            hashObject["cid_" + me.cid] = encodeURI(JSON.stringify(query));

            try {
                if (disableHistory) {
                    me.request(query);
                } else {
                    History.pushState({
                        cid: me.cid,
                        query: query
                    }, null, "?" + $.param(hashObject));
                }
            } catch (e) {
                console.log(e);
            }
        },

        onPageSelect: function (page) {
            const me = this;
            me.sendQuery({
                page: Math.abs(parseNumber(page) || 1)
            });
        },

        onSubmit: function (event) {
            ScopeUtils.stopPropagation(event);

            const me = this, hashObject = parseHash(), query = {
                word: me.refs.input.val() || "",
                page: 1,
                size: defaultQuerySize
            }, disableHistory = !!me.props.disableHistory || !hasHistory;

            hashObject["cid_" + me.cid] = encodeURI(JSON.stringify(query));

            try {
                if (disableHistory) {
                    me.request(query);
                } else {
                    History.pushState({
                        cid: me.cid,
                        query: query
                    }, null, "?" + $.param(hashObject));
                }
            } catch (e) {
                console.log(e);
                getScope(me.refs.pagination).updatePage(me.query.page);
            }
        },

        onFocus: function (event, $this) {
            ScopeUtils.stopPropagation(event);
            $this.addClass("focused");
        },

        onBlur: function (event, $this) {
            ScopeUtils.stopPropagation(event);
            $this.removeClass("focused");
        },

        onKeyDown: function (event) {
            if (event.which == 13) {
                this.onSubmit(event);
            }
        },

        onRefresh: function (callback, event) {
            ScopeUtils.stopPropagation(event);
            ScopeUtils.preventDefault(event);
            callback.call(this);
        },

        onTop: function () {
            ScopeUtils.stopPropagation(event);
            ScopeUtils.preventDefault(event);
            getScope(this.refs.table).refs.table.scrollTop(0);
        },

        render: function () {
            const me = this;
            return (
                <div class={NAMESPACE + "page"}>
                    <div ref="content" class="content">
                        <div class="pagination">
                            <Pagination ref="pagination"
                                        total={me.pagination.total}
                                        size={me.pagination.size}
                                        page={me.pagination.page}
                                        onPageSelect={me.onPageSelect.bind(me)}/>
                        </div>
                        <div class="search">
                            <span class="tool" onClick={me.onTop}>返回列表顶部</span>
                            <span class="tool" onClick={me.onRefresh.bind(me, function(){
                                me.request(me.query);
                                getScope(me.refs.table).refs.table.scrollTop(0);
                            })}>刷&nbsp;新</span>

                            <span class="submit" ref="submit" onClick={me.onSubmit}>搜&nbsp;索</span>
                            <div class="input">
                                <input type="text"
                                       ref="input"
                                       placeholder="输入搜索关键字"
                                       onFocus={me.onFocus}
                                       onBlur={me.onBlur}
                                       onKeydown={me.onKeyDown}
                                />
                            </div>
                            <div style="clear: both;"></div>
                        </div>
                        <div class="table">
                            <Table.Table ref="table"
                                         labels={me.table.labels}
                                         onSort={me.onSort.bind(me)}
                                         height={me.table.height}>
                                {function () {
                                    return isFunction(me.props.dataRender) ? me.props.dataRender(me.data) : [];
                                }}
                            </Table.Table>
                        </div>
                    </div>
                    <div ref="loading" class="loading">
                        <div>
                            <i class="fa fa-spinner fa-pulse fa-fw"> </i>
                            <span>&nbsp;正在初始化列表...</span>
                        </div>
                    </div>
                    <div ref="error" class="error">
                        列表初始化失败, 请<a class="refresh" onClick={me.onRefresh.bind(me, function(){
                            me.afterMount();
                        })}>刷新</a>重试。
                    </div>
                </div>
            );
        }
    });
};

