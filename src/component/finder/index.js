const Scope = require("Scope");

const ScopeUtils = Scope.utils;

const {getScope, isFunction, stopPropagation, preventDefault} = ScopeUtils;

const Search = require("./search/index");
const Table = require("./table/index");
const Tree = require("./tree/index");
const Pagination = require("./pagination/index");
const Step = require("./step/index");
const Path = require("./path/index");
const File = require("./file");
const Select = require("./button/select");
const Tool = require("./button/tool");
const Multiple = require("./button/multi");

const Config = require("./config");
const {fileKey, dataFilter} = Config;
const scale = Config.iconScale;

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
    activeFiles: [],

    pagination: {
        page: 1,
        total: 1,
        size: 8
    },
    labels: File.labels,
    data: {
        path: "",
        page: 1,
        total: 1,
        size: 20,
        files: [],
        dirInfo: {}
    },
    query: {
        path: "",
        word: "",
        page: 1,
        size: defaultQuerySize
    },
    requestState: {
        finished: true,
        xhr: null
    },
    isMulti: false,


    request: function (query, ignoreLoading, ignoreError) {
        const me = this, requestState = me.requestState, $pagination = me.refs.pagination;
        if (!ignoreLoading) {
            me.command("loading");
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
            data = dataFilter(data);
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
            me.activeFiles = [];
            me.updateTool();
            getScope(me.refs.table).updateTable();
            getScope(me.refs.search).setValue(query.word);
            ScopeUtils.update(me.refs.tree);
            ScopeUtils.update(me.refs.path);
            me.command("normal");
        }, function (_xhr) {
            if (_xhr.statusText != "abort" && !ignoreError) {
                me.command("error", "数据加载失败!");
                if (isFunction(me.props.onRequestError)) {
                    me.props.onRequestError(_xhr, me.request.bind(me, query, ignoreLoading, ignoreError));
                }
            }
        }).always(function () {
            requestState.finished = true;
        });
    },

    beforeMount: function () {
        const me = this;
        me.cid = this.props.cid;
        me.query.path = (me.props.activePath || "").replace(/(^\/|\/$)/ig, "");
    },

    afterMount: function () {
        const me = this, hashObject = parseHash(), disableHistory = !!me.props.disableHistory || !hasHistory;

        const $loading = me.refs.loading, $table = me.refs.table, $content = me.refs.content, $error = me.refs.error;

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

            $error.hide();
            $loading.css({
                width: $content.innerWidth(),
                height: $content.innerHeight()
            }).show();

            me.request(_query, true, true).then(function () {
                getScope(me.refs.search).setValue(_query.word);
                !disableHistory && bindHistory();
            }, function () {
                $loading.hide();
                $error.css({
                    width: $content.innerWidth(),
                    height: $content.innerHeight()
                }).show();
                $table.hide();
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
        me.data[fileKey].sort(function (a, b) {
            return File.compare(index, order, a, b);
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

    command: function () {
        const me = this,
            $loading = me.refs.loading,
            $table = me.refs.table,
            $content = me.refs.content,
            $error = me.refs.error;

        const args = Array.prototype.slice.call(arguments, 0);
        const command = args.splice(0, 1);
        if (command == "refresh") {
            me.request(me.query).then(function () {
                getScope(me.refs.table).refs.table.scrollTop(0);
            })
        } else if (command == "loading") {
            $loading.css({
                width: $content.innerWidth(),
                height: $content.innerHeight()
            }).html(
                $(`<div><i class="fa fa-spinner fa-pulse fa-fw"></i><span>&nbsp;正在加载数据...</span></div>`)
            ).show();
            $error.text("").hide();
            $table.hide();
        } else if (command == "error") {
            $loading.hide();
            $error.css({
                width: $content.innerWidth(),
                height: $content.innerHeight()
            }).text(args[0] || "").show();
            $table.hide();
        } else if (command == "normal") {
            $loading.hide();
            $error.text("").hide();
            $table.show();
        } else if (command == "setPath") {
            me.onPathSelect.apply(me, args);
        } else if (command == "setPage") {
            me.onPageSelect.apply(me, args);
        } else if (command == "setSearch") {
            me.onSearch.apply(me, args);
        }
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

    onFileClick: function (fileItem, isActive, isMulti) {
        const me = this;
        if (!isMulti) {
            if (me.activeFiles.length) {
                me.activeFiles.forEach(function (fileContext) {
                    if (fileContext != fileItem) {
                        fileContext.setDefault.call(fileContext);
                    }
                });
            }
            me.activeFiles = [fileItem];
        } else {
            if (isActive) {
                me.activeFiles.push(fileItem);
            } else {
                const index = me.activeFiles.indexOf(fileItem);
                if (index >= 0 && index < me.activeFiles.length) {
                    me.activeFiles.splice(index, 1);
                }
            }
        }
        me.updateTool();
    },

    onFileDoubleClick: function (fileItem) {
        const me = this;
        if (me.activeFiles.length) {
            me.activeFiles.forEach(function (fileContext) {
                if (fileContext != fileItem) {
                    fileContext.setDefault.call(fileContext);
                }
            });
        }
        me.activeFiles = [fileItem];
        me.onFileSelect();
    },

    onFileSelect: function () {
        const me = this;
        if (isFunction(me.props.onFileSelect)) {
            me.props.onFileSelect(me.getActiveFile());
        }
    },

    onFileDelete: function () {
        const me = this;
        if (isFunction(me.props.onFileDelete)) {
            me.props.onFileDelete(me.getActiveFile());
        }
    },

    onFileUpload: function () {
        const me = this;
        if (isFunction(me.props.onFileUpload)) {
            me.props.onFileUpload(me.data.path, me.getActiveFile());
        }
    },

    onMultiple: function (isMulti) {
        const me = this;
        me.isMulti = isMulti;
        getScope(me.refs.table).updateTable();
    },

    getActiveFile: function () {
        return this.activeFiles.map(function (file) {
            return file.props.file;
        });
    },

    updateTool: function () {
        const me = this, $select = me.refs.select, $delete = me.refs.delete;
        if (me.activeFiles.length) {
            getScope($select).setActive();
            getScope($delete).setActive();
        } else {
            getScope($select).setDisable();
            getScope($delete).setDisable();
        }
        ScopeUtils.update(me.refs.status);
    },

    updateHistory: function () {
        const me = this, historyRefs = getScope(me.refs.history).refs;
        getScope(historyRefs.backButton)[me.historyIndex > 0 ? "enableClick" : "disableClick"]();
        getScope(historyRefs.forwardButton)[me.historyIndex < me.history.length - 1 ? "enableClick" : "disableClick"]();
    },

    renderFiles: function () {
        const me = this, iconUrl = (me.props.staticPath || "").replace(/\/$/ig, '') + "/icons.png";
        const files = me.data[fileKey];
        if (!Array.isArray(files)) {
            return [];
        }
        const result = files.map(function (file) {

            let isActive = false;


            for (let i = 0, length = me.activeFiles.length; i < length; i++) {
                if (me.activeFiles[i].props.file === file) {
                    isActive = true;
                    break;
                }
            }

            return (
                <File iconUrl={iconUrl}
                      file={file}
                      multiple={me.isMulti}
                      recordActive={function(item){
                          me.activeFiles.push(item);
                      }}
                      isActive={isActive}
                      onClick={me.onFileClick.bind(me)}
                      onDoubleClick={me.onFileDoubleClick.bind(me)}
                />
            );
        });

        me.activeFiles = [];

        return result;
    },

    render: function () {
        const me = this, buttonUrl = (me.props.staticPath || "").replace(/\/$/ig, '') + "/tools.png";
        return (
            <div class={`${NAMESPACE}finder`}>
                <div style={`width: 100%;height: ${scale + 3}px;border-bottom: 1px #D8D8D8 solid;`}>
                    <Select ref="select" onClick={me.onFileSelect.bind(me)}/>
                    <Tool ref="delete" text="删除" onClick={me.onFileDelete.bind(me)}/>
                    <Tool isActive={true} text="上传" onClick={me.onFileUpload.bind(me)}/>
                    <Multiple ref="multi"
                              isActive={me.props.multiple}
                              multiple={me.isMulti}
                              onClick={me.onMultiple.bind(me)}/>
                    <div style="clear: both;"></div>
                </div>
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
                                   height={me.props.height}
                                   minWidth={function(){ return me.refs.files ? me.refs.files.innerWidth() : 0; }}
                            >
                                {function () {
                                    return me.renderFiles();
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
                <div style={`height: ${scale + 2}px;color: #1E395B;vertical-align: middle;`} ref="status"
                     class={`${NAMESPACE}finder-status`}>
                    {function () {
                        let totalSize = 0;
                        me.activeFiles.forEach(function (fileContext) {
                            totalSize += fileContext.props.file.size;
                        });
                        return [
                            <span
                                style={`margin-left: 15px; line-height: ${scale + 2}px;font-size: ${scale / 2 + 2}px;`}>{me.data[fileKey].length}个项目&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                选中{me.activeFiles.length}个项目</span>,
                            <span
                                style={`margin-left: 5px; line-height: ${scale + 2}px;font-size: ${scale / 2 + 1}px;`}>{require("./file/utils").file.size(totalSize)}</span>
                        ];
                    }}
                </div>
            </div>
        );
    }
});