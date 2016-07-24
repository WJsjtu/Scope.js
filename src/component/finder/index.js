const Scope = require("Scope");

const ScopeUtils = Scope.utils;

const {getScope, isFunction, stopPropagation, preventDefault} = ScopeUtils;

const Search = require("./search/index");
const Table = require("./table/index");
const Tree = require("./tree/index");
const Pagination = require("./pagination/index");
const Step = require("./step/index");
const Path = require("./path/index");

const scale = require("./config").iconScale;

const {NAMESPACE} = require("./../../project");

require('./style.less');

const hasHistory = History && History.options;

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

module.exports = Scope.createClass({
    cid: 1,
    history: [],
    historyIndex: 0,
    pagination: {
        page: 1,
        total: 1,
        size: 8
    },
    labels: [],
    data: {
        path: "",
        page: 1,
        total: 1,
        size: 20,
        files: [],
        dirInfo: {}
    },
    query: {
        path: "server/default/music",
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
            $content = me.refs.content;
        if (!ignoreLoading) {
            $loading.css({
                width: $content.innerWidth(),
                height: $content.innerHeight()
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
            getScope(me.refs.search).setValue(query.word);
            ScopeUtils.update(me.refs.tree);
            ScopeUtils.update(me.refs.path);
            $table.show();
        }, function (_xhr) {
            if (_xhr.statusText != "abort" && !ignoreError) {
                $error.css({
                    width: $content.innerWidth(),
                    height: $content.innerHeight()
                }).text("数据加载失败!").show();
                if (isFunction(me.props.onRequestError)) {
                    me.props.onRequestError(_xhr, me.request.bind(me, query, ignoreLoading, ignoreError));
                }
            }
        }).always(function () {
            requestState.finished = true;
            $loading.hide();
        });
    },

    beforeMount: function () {
        const me = this;
        me.cid = me.props.cid;
        if ($.isArray(me.props.labels)) {
            me.labels = me.props.labels;
        }
    },

    afterMount: function () {
        const me = this, hashObject = parseHash(), disableHistory = !!me.props.disableHistory || !hasHistory;

        let height = +me.props.height || 200;
        if (height < 200) {
            height = 200;
        }
        height += 33 + 36 + 1;

        me.refs.tree.height(height);
        me.refs.files.height(height);

        const bindHistory = function () {
            History.Adapter.bind(window, 'statechange', function () {
                const stateData = History.getState().data;
                if (stateData.cid == me.cid) {
                    me.request(stateData.query || me.query);
                }
            });
        };

        const initData = function (_query) {
            me.history.push(_query);
            !disableHistory && History.replaceState({
                cid: me.cid,
                query: _query
            }, null, null);
            me.request(_query).then(function () {
                getScope(me.refs.search).setValue(_query.word);
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

        me.updateHistory();
    },

    beforeUpdate: function () {
        this.beforeMount();
    },

    afterUpdate: function () {
        const me = this, disableHistory = !!me.props.disableHistory || !hasHistory;
        !disableHistory && History.pushState({}, null, null);
        me.history = [];
        me.historyIndex = 0;
        me.afterMount();
    },

    onSort: function (index, order, callback) {
        const me = this;
        const keys = [];
        for (var key in me.labels) {
            if (me.labels.hasOwnProperty(key)) {
                keys.push(me.labels[key].text);
            }
        }
        me.data.files.sort(function (a, b) {
            if (a[keys[index]] < b[keys[index]]) {
                return -1 * order;
            }
            if (a[keys[index]] > b[keys[index]]) {
                return 1 * order;
            }
            return 0;
        });
        getScope(me.refs.table).updateTable();
        callback();
    },


    sendQuery: function (query) {
        const me = this, hashObject = parseHash(), disableHistory = !!me.props.disableHistory || !hasHistory;
        query = $.extend({}, me.query, query);

        hashObject["cid_" + me.cid] = encodeURI(JSON.stringify(query));

        me.history.splice(me.historyIndex + 1);
        me.history.push(query);
        me.historyIndex++;

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
        me.updateHistory();
    },

    onPageSelect: function (page) {
        const me = this;
        me.sendQuery({
            page: Math.abs(parseNumber(page) || 1)
        });
    },

    onPathSelect: function (path) {
        const me = this;
        me.sendQuery({
            path: path,
            word: "",
            page: 1
        });
    },

    onSearch: function (value) {
        const me = this;
        me.sendQuery({
            word: value || "",
            page: 1
        });
    },

    onRefresh: function (event) {
        stopPropagation(event);
        preventDefault(event);
        const me = this;
        me.request(me.query).then(function () {
            getScope(me.refs.table).refs.table.scrollTop(0);
        })
    },

    onBack: function () {
        const me = this, disableHistory = !!me.props.disableHistory || !hasHistory;
        if (me.historyIndex > 0) {
            if (disableHistory) {
                me.request(me.history[--me.historyIndex]);
            } else {
                me.historyIndex--;
                History.back();
            }
        }
        me.updateHistory();
    },

    onForward: function () {
        const me = this, disableHistory = !!me.props.disableHistory || !hasHistory;
        if (me.historyIndex < me.history.length - 1) {
            if (disableHistory) {
                me.request(me.history[++me.historyIndex]);
            } else {
                me.historyIndex++;
                History.go(1);
            }
        }
        me.updateHistory();
    },

    onParent: function () {
        const me = this, pathArr = me.data.path.split("/");
        if (pathArr.length > 1) {
            pathArr.splice(pathArr.length - 1);
            me.sendQuery({
                path: pathArr.join("/")
            });
        }
    },

    updateHistory: function () {
        const me = this, historyRefs = getScope(me.refs.history).refs;
        getScope(historyRefs.backButton)[me.historyIndex > 0 ? "enableClick" : "disableClick"]();
        getScope(historyRefs.forwardButton)[me.historyIndex < me.history.length - 1 ? "enableClick" : "disableClick"]();
    },

    render: function () {
        const me = this, buttonUrl = (me.props.staticPath || "").replace(/\/$/ig, '') + "/tools.png";
        return (
            <div class={`${NAMESPACE}finder`}>
                <div style={`width: 100%;height: ${scale + 3}px;border-bottom: 1px #D8D8D8 solid;`}></div>
                <div style={`position: relative;margin: 6px 0 10px 0;height: ${scale + 1}px;`}>
                    <Step ref="history"
                          staticPath={me.props.staticPath}
                          onBack={me.onBack.bind(me)}
                          onForward={me.onForward.bind(me)}
                          onParent={me.onParent.bind(me)}
                    />
                    <div ref="path">
                        {function () {
                            return (
                                <Path staticPath={me.props.staticPath}
                                      onRefresh={me.onRefresh.bind(me)}
                                      activePath={me.data.path}
                                      dirInfo={me.data.dirInfo}
                                      onPathSelect={me.onPathSelect.bind(me)}
                                />
                            );
                        }}

                    </div>
                    <Search ref="search" iconUrl={buttonUrl} onSearch={me.onSearch.bind(me)}/>
                </div>
                <div style="position: relative;" ref="content">
                    <div
                        style="position: absolute;top: 0;left: 0;width: 169px;overflow-y: auto;overflow-x: hidden;border-right: 1px #F7F7F7 solid;"
                        ref="tree">
                        {function () {
                            return (
                                <Tree staticPath={me.props.staticPath}
                                      activePath={me.data.path}
                                      onSelect={me.onPathSelect.bind(me)}
                                      dirInfo={me.data.dirInfo}
                                />
                            );
                        }}
                    </div>
                    <div style="margin-left: 170px;" ref="files">
                        <div style="margin: 0 10px 0 0;border-bottom: 1px solid #F7F7F7;">
                            <Pagination ref="pagination"
                                        total={me.pagination.total}
                                        size={me.pagination.size}
                                        page={me.pagination.page}
                                        onPageSelect={me.onPageSelect.bind(me)}/>
                        </div>
                        <div
                            style="width: 100%;overflow-x: auto;overflow-y: hidden;font-size: 12px;line-height: 1.42857;margin-bottom: 0;background-color: transparent;position: relative;">
                            <Table ref="table"
                                   labels={me.labels}
                                   onSort={me.onSort.bind(me)}
                                   height={me.props.height}>
                                {function () {
                                    return isFunction(me.props.dataRender) ? me.props.dataRender(me.data) : [];
                                }}
                            </Table>
                        </div>
                    </div>
                    <div ref="loading" class={`${NAMESPACE}finder-loading`}>
                        <div>
                            <i class="fa fa-spinner fa-pulse fa-fw"> </i>
                            <span>&nbsp;正在初始化列表...</span>
                        </div>
                    </div>
                    <div ref="error" class={`${NAMESPACE}finder-error`}>
                        <div>
                            列表初始化失败, 请<a class={`${NAMESPACE}finder-refresh`} onClick={me.afterMount}>刷新</a>重试。
                        </div>
                    </div>
                </div>
                <div style="height: 24px;">

                </div>
            </div>
        );
    }
});