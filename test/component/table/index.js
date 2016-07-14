const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {getScope, isObject,isFunction} = ScopeUtils;
require("./style.less");

const {Pagination, Table} = window.COMPONENTS;

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
    const matches = /(\/)?(\?|#)([^\/]+)(\/)?$/ig.exec(History.getPageUrl());
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

const PageTable = Scope.createClass({
    cid: "page-table",
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

    request: function (query) {
        const me = this, requestState = me.requestState;
        me.refs.loading.show();

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
            const pagination = me.refs.pagination;

            if (me.pagination.total != data.total) {
                me.pagination.total = data.total;
                getScope(pagination).updateTotal(data.total);
            }
            if (me.pagination.page != query.page) {
                me.pagination.page = query.page;
                getScope(pagination).updatePage(query.page);
            }
            pagination.show();
            me.refs.table.show();
            me.refs.loading.show();
            me.refs.error.text("").hide();
            getScope(me.refs.table).updateTable();
        }, function (_xhr) {
            if (_xhr.statusText != "abort") {
                me.refs.table.hide();
                me.refs.loading.hide();
                me.refs.error.text("数据加载失败!").show();
            }
        }).always(function () {
            requestState.finished = true;
            me.refs.loading.hide();
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
        const me = this, hashObject = parseHash();

        const bindHistory = function () {
            History.Adapter.bind(window, 'statechange', function () {
                const stateData = History.getState().data;
                if (stateData.cid == me.cid) {
                    me.request(stateData.query || me.query);
                }
            });
        };

        const initData = function (_query) {
            History.replaceState({
                cid: me.cid,
                query: _query
            }, null, null);
            me.request(_query).then(function () {
                me.refs.content.show();
                me.refs.input.val(_query.word);
            }).always(function () {
                bindHistory();
            });
        };

        me.refs.content.hide().css("visibility", "visible");

        if (hashObject["cid_" + me.cid]) {
            try {
                const query = JSON.parse(decodeURI(hashObject["cid_" + me.cid]));
                initData(query);
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
        History.pushState({}, null, null);
        this.afterMount();
    },

    onSort: function (index, order, callback) {
        const me = this;
        if (isFunction(me.table.onSort)) {
            me.data.data.sort(me.table.onSort(index, order));
            getScope(me.refs.table).updateTable();
            callback();
        }
    },

    onPageSelect: function (page) {

        const me = this, hashObject = parseHash(), query = {
            word: me.query.word || "",
            page: Math.abs(parseNumber(page) || 1),
            size: defaultQuerySize
        };

        hashObject["cid_" + me.cid] = encodeURI(JSON.stringify(query));

        try {
            History.pushState({
                cid: me.cid,
                query: query
            }, null, "?" + $.param(hashObject));
        } catch (e) {
            console.log(e);
            getScope(me.refs.pagination).updatePage(me.query.page);
        }
    },

    onSubmit: function (event) {
        ScopeUtils.stopPropagation(event);

        const me = this, hashObject = parseHash(), query = {
            word: me.refs.input.val() || "",
            page: 1,
            size: defaultQuerySize
        };

        hashObject["cid_" + me.cid] = encodeURI(JSON.stringify(query));

        try {
            History.pushState({
                cid: me.cid,
                query: query
            }, null, "?" + $.param(hashObject));
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

    render: function () {
        const me = this;
        return (
            <div class="page-table">
                <div ref="content" class="content">
                    <div class="pagination">
                        <Pagination ref="pagination"
                                    total={me.pagination.total}
                                    size={me.pagination.size}
                                    page={me.pagination.page}
                                    onPageSelect={me.onPageSelect.bind(me)}/>
                    </div>
                    <div class="search">
                        <div class="input">
                            <input type="text"
                                   ref="input"
                                   placeholder="输入搜索关键字"
                                   onFocus={me.onFocus}
                                   onBlur={me.onBlur}/>
                        </div>
                        <span class="submit" ref="submit" onClick={me.onSubmit}>搜&nbsp;索</span>
                    </div>
                    <div class="table">
                        <Table.Table labels={me.table.labels}
                                     onSort={me.onSort.bind(me)}
                                     height={me.table.height}
                                     ref="table">
                            {function () {
                                return isFunction(me.props.dataRender) ? me.props.dataRender(me.data) : [];
                            }}
                        </Table.Table>
                    </div>
                </div>
                <div ref="loading" class="loading">Loading</div>
                <div ref="error" class="error"></div>
            </div>
        );
    }
});


$(function () {

    const labels = [{
        text: "uid",
        width: "30%"
    }, {
        text: "timestamp",
        width: "20%"
    }, {
        text: "rand",
        width: "20%"
    }, {
        text: "text",
        width: "30%"
    }];

    const dataRender = function (requestData) {
        const data = requestData.data;
        if (!Array.isArray(data)) {
            return [];
        }
        return data.map(function (item) {
            return (
                <Table.Row>
                    <Table.Cell>{item.uid}</Table.Cell>
                    <Table.Cell>{item.timestamp}</Table.Cell>
                    <Table.Cell>{item.rand}</Table.Cell>
                    <Table.Cell>{item.text}</Table.Cell>
                </Table.Row>
            );
        });

    };

    const onSort = function (index, order) {
        const keys = ["uid", "timestamp", "rand", "text"];
        return function (a, b) {
            if (a[keys[index]] < b[keys[index]]) {
                return -1 * order;
            }
            if (a[keys[index]] > b[keys[index]]) {
                return 1 * order;
            }
            return 0;
        };
    };

    Scope.render(
        <PageTable cid="1"
                   request={{
                        url: "http://localhost/public/mp.php/user/test",
                        method: "post",
                        dataType: "json",
                        timeout : 3000
                   }}
                   filter={function(data){
                        return data.data;
                   }}
                   pagination={{page: 1, total: 1, size: 15}}
                   table={{labels: labels, height: 400, onSort: onSort}}
                   dataRender={dataRender}
        />,
        document.getElementById("container")
    );
});

/*
 public function test()
 {
 sleep(1);

 $word = isset($_POST["word"]) ? $_POST["word"] : "";
 $page = isset($_POST["page"]) ? $_POST["page"] : 1;
 $size = isset($_POST["size"]) ? $_POST["size"] : 20;

 $response = array();

 $response["total"] = 15580;
 $response["size"] = $size;

 $data = array();

 for ($i = 0; $i < $size; $i++) {
 array_push($data, array(
 "uid" => $this->uid(),
 "timestamp" => microtime(),
 "rand" => rand(0, 1e9) / 1e9,
 "text" => $page . "-" . $i . "-" . $word
 ));
 }

 $response["data"] = $data;

 die(json_encode([
 'errCode' => 0,
 "data" => $response
 ]));
 }
 */