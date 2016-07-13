const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {getScope, isObject,isFunction} = ScopeUtils;
require("./style.less");
const Pagination = require("./../../../src/component/pagination/index");
const {Table, Row, Cell} = require("./../../../src/component/table/index");

const parseNumber = function (number) {
    number = parseInt(number);
    if (isNaN(number)) {
        return false;
    }
    return number;
};

const defaultQuerySize = 20;

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
    parseHash: function () {
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
    },

    request: function (query) {
        const me = this;
        return function (dtd) {
            if (isFunction(me.props.dataSource)) {
                $.Deferred(me.props.dataSource(query)).then(function (data) {
                    dtd.resolve(data);
                }, function () {
                    dtd.reject();
                });
            } else {
                dtd.reject();
            }
            return dtd.promise();
        };
    },

    error: function (error) {
        const me = this;
        me.refs.table.hide();
        me.refs.loading.hide();
        me.refs.error.text(error).show();
    },

    update: function () {
        const me = this, pagination = me.refs.pagination, query = me.query, data = me.data;

        pagination.show();
        if (me.pagination.total != data.total) {
            me.pagination.total = data.total;
            getScope(pagination).updateTotal(data.total);
        }
        if (me.pagination.page != query.page) {
            me.pagination.page = query.page;
            getScope(pagination).updatePage(query.page);
        }

        me.refs.input.val(query.word);

        me.refs.table.show();
        me.refs.loading.show();
        me.refs.error.text("").hide();
        getScope(me.refs.table).updateTable();
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
        const me = this, hashObject = me.parseHash();

        const bindHistory = function () {
            History.Adapter.bind(window, 'statechange', function () {
                const stateData = History.getState().data;
                if (stateData.cid == me.cid) {
                    me.refs.loading.show();
                    $.Deferred(me.request(stateData.query || me.query)).then(function (data) {
                        me.data = data;
                        me.query = stateData.query || me.query;
                        me.update();
                    }, function () {
                        me.error("数据加载失败!");
                    }).always(function () {
                        me.refs.loading.hide();
                    });
                }
            });
        };

        const initData = function (_query) {
            History.replaceState({
                cid: me.cid,
                query: _query
            }, null, null);
            $.Deferred(me.request(_query)).then(function (data) {
                me.data = data;
                me.query = _query;
                bindHistory();
                me.update();
                me.refs.content.show();
            }, function () {
                me.error("数据加载失败!");
            }).always(function () {
                me.refs.loading.hide();
            });
        };

        me.refs.content.hide().css("visibility", "visible");
        me.refs.loading.show();

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

        const me = this, hashObject = me.parseHash(), query = {
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

        const me = this, hashObject = me.parseHash(), query = {
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

    render: function () {
        const me = this;
        return (
            <div class="page-table">
                <div ref="content" class="content">
                    <div>
                        <input type="text" ref="input"/>
                        <button ref="submit" onClick={me.onSubmit}>搜索</button>
                    </div>
                    <div class="pagination">
                        <Pagination ref="pagination"
                                    total={me.pagination.total}
                                    size={me.pagination.size}
                                    page={me.pagination.page}
                                    onPageSelect={me.onPageSelect.bind(me)}/>
                    </div>
                    <div class="table">
                        <Table labels={me.table.labels}
                               onSort={me.onSort.bind(me)}
                               height={me.table.height}
                               ref="table">
                            {function () {
                                return isFunction(me.props.dataRender) ? me.props.dataRender(me.data) : [];
                            }}
                        </Table>
                    </div>
                </div>
                <div ref="loading" class="loading">Loading</div>
                <div ref="error" class="error"></div>
            </div>
        );
    }
});


$(function () {

    const uid = function () {
        let s = [];
        let hexDigits = "0123456789abcdef";
        for (let i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        return s.join("");
    };

    const requestData = function (query) {
        const {word, page, size} = query;
        return function (dtd) {
            const tasks = function () {
                const response = {
                    total: 15580,
                    page: page,
                    size: size,
                    data: []
                };

                for (let i = 0; i < response.size; i++) {
                    response.data.push({
                        uid: uid(),
                        timestamp: (new Date).getTime(),
                        rand: Math.random(),
                        text: response.page + " - " + (i + 1) + " - " + word
                    });
                }

                dtd.resolve(response);
            };
            setTimeout(tasks, 1000);
            return dtd.promise();
        };
    };

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
                <Row>
                    <Cell>{item.uid}</Cell>
                    <Cell>{item.timestamp}</Cell>
                    <Cell>{item.rand}</Cell>
                    <Cell>{item.text}</Cell>
                </Row>
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
                   dataSource={requestData}
                   pagination={{page: 1, total: 1, size: 15}}
                   table={{labels: labels, height: 400, onSort: onSort}}
                   dataRender={dataRender}
        />,
        document.getElementById("container")
    );
});