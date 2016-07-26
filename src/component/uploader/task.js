const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const utils = require("./utils");
const {NAMESPACE} = require("./../../project");
const COMP_NAMESPACE = NAMESPACE + "uploader-";

//status {0: pending, 1: uploading, 2: pause 3: cancel 4:done 5: error

const blankDash = "- -";
const visibility = "visibility";

module.exports = Scope.createClass({
    status: 0,
    fileInfo: {
        fileID: 0,
        name: '',
        size: 0,
        loaded: 0,
        lastLoaded: 0,
        lastRecord: 0
    },
    serverInfo: {
        name: '',
        url: ''
    },
    data: null,
    beforeMount: function () {
        const me = this, fileInfo = me.fileInfo;
        me.data = me.props.data;
        const originFile = me.data.files[0] || {};
        fileInfo.fileID = me.data.fileID;
        fileInfo.name = originFile.name;
        fileInfo.size = +originFile.size;
    },
    afterMount: function () {
        const me = this;
        me.$ele.data("fileUploadTask", me);
        me.props.list[me.fileInfo.fileID] = me.$ele;
    },
    updateSize: function (size) {
        const me = this, fileInfo = me.fileInfo;
        fileInfo.size = size;
        me.refs.total.text(utils.file.size(size) || blankDash);
    },
    updateProgress: function (loaded) {
        const me = this, fileInfo = me.fileInfo;
        const currentTime = (new Date).getTime();
        fileInfo.loaded = loaded;
        const progressPercentage = fileInfo.size ? (100 * loaded / fileInfo.size).toFixed(2) : '';
        if (currentTime - fileInfo.lastRecord > 800) {
            me.refs.loaded.text(utils.file.size(loaded) || blankDash);
            me.refs.percentage.text(
                progressPercentage ? progressPercentage + " %" : blankDash
            );
            me.refs.speed.text(
                (utils.file.size(
                    1000 * (fileInfo.loaded - fileInfo.lastLoaded) / (currentTime - fileInfo.lastRecord)
                ) || blankDash) + "/s"
            );
            fileInfo.lastLoaded = fileInfo.loaded;
            fileInfo.lastRecord = currentTime;
        }
        if (progressPercentage) {
            me.refs.progress.css({
                width: progressPercentage + "%"
            });
        }
    },
    switchStatus: function (status) {
        const me = this;
        me.props.switchStatus(me.fileInfo.fileID, me.status, status);
        me.status = status;
    },
    start: function () {
        const me = this;
        if (me.status == 0) {
            me.switchStatus(1);
            me.fileInfo.lastRecord = (new Date).getTime();
            me.refs.upload.show();
            me.refs.label.text("上传中");
            ScopeUtils.update(me.refs.operation);
            try {
                me.data.submit();
            } catch (e) {
                me.error(e.toString());
            }
        }
    },
    pause: function () {
        const me = this;
        if (me.status == 1 && (me.fileInfo.size ? (me.fileInfo.loaded < me.fileInfo.size) : true)) {
            me.switchStatus(2);
            me.refs.speed.text(blankDash + " / s");
            me.refs.label.text("已暂停");
            ScopeUtils.update(me.refs.operation);
            try {
                me.data.abort();
            } catch (e) {
                me.error(e.toString());
            }
        }
    },
    resume: function () {
        const me = this;
        if ((me.status == 2 || me.status == 5) && me.serverInfo.name && me.props.url) {
            $.getJSON(me.props.url, {
                file: me.serverInfo.name
            }).done(function (result) {
                me.data.uploadedBytes = result.file && result.file.size;
                // clear the previous data:
                me.data.data = null;
                me.switchStatus(1);
                me.fileInfo.lastRecord = (new Date()).getTime();
                me.updateProgress(me.data.uploadedBytes);
                ScopeUtils.update(me.refs.operation);
                me.refs.upload.show().css(visibility, "visible");
                me.refs.progress.parent().css(visibility, "visible");
                me.refs.operation.show();
                me.refs.label.text("上传中");
                try {
                    me.data.submit();
                } catch (e) {
                    me.error(e.toString());
                }
            }).fail(function () {
                me.error("无法查询到文件信息");
            });
        }
    },
    cancel: function () {
        const me = this;
        if (me.status == 0 || me.status == 2 || me.status == 5) {
            me.switchStatus(3);
            me.refs.upload.hide();
            me.refs.progress.parent().css(visibility, "hidden");
            me.refs.operation.hide();
            me.refs.label.text("已取消");
        }
    },
    done: function (url) {
        const me = this;
        if (me.status == 1) {
            me.switchStatus(4);
            if (!me.serverInfo.name) {
                const matches = url.match(/[^\/]+$/ig);
                if (matches.length) {
                    me.serverInfo.name = matches[0];
                }
            }
            if (!me.serverInfo.url) {
                me.serverInfo.url = url;
            }
            me.refs.progress.parent().css(visibility, "hidden");
            me.refs.upload.text(utils.file.size(me.fileInfo.size));
            me.refs.label.text("已完成");
            me.refs.operation.html(`<div><a class="task-link" href="${url}" target="_blank">${url}</a></div>`);
        }
    },
    error: function (message) {
        const me = this;
        if (me.status != 0 && me.status != 2 && me.status != 4) {
            me.switchStatus(5);
            me.refs.upload.css(visibility, "hidden");
            me.refs.progress.parent().css(visibility, "hidden");
            me.refs.operation.show();
            ScopeUtils.update(me.refs.operation);
            me.refs.label.html(`<span class="task-error">上传出错:&nbsp;${message || "未知错误"}</span>`).show();
        }
    },
    emit: function (name, event) {
        ScopeUtils.stopPropagation(event);
        ScopeUtils.preventDefault(event);
        this[name]();
    },
    render: function () {
        const me = this, fileInfo = me.fileInfo;
        if (!me.data || !me.data.files || !me.data.files.length) {
            return <div>任务出错</div>;
        }
        return (
            <div class={COMP_NAMESPACE + "task"}>
                {(function () {
                    return utils.file.icon(fileInfo.name, "icons/icons.png", 54, "task-icon").component;
                })()}
                <div class="task-info">
                    <div class="task-name">
                        <span>{fileInfo.name || blankDash}</span>
                    </div>
                    <div class="task-panel">
                        <div class="task-status">
                            <div class="task-label" ref="label">待上传</div>
                            <div class="task-upload" ref="upload">
                                <div style="float:left;">
                                    <span ref="loaded" style="width: 70px; text-align: right;">0 B</span>
                                    <span style="width: 20px; text-align: center;"> / </span>
                                    <span ref="total">{utils.file.size(fileInfo.size) || blankDash}</span>
                                </div>
                                <div style="float:right;">
                                    <span ref="percentage" style="width: 70px; text-align: right;">0 %</span>
                                    <span ref="speed" style="width: 90px; text-align: right;">- - B / s</span>
                                </div>
                                <div style="clear: both;"></div>
                            </div>
                        </div>
                        <div class="task-progress">
                            <div ref="progress"></div>
                        </div>
                        <div class="task-operation" ref="operation">
                            {function () {
                                const status = me.status;
                                if (status == 0) {
                                    return [
                                        <a class="task-start" onClick={me.emit.bind(me, "start")}>开始上传</a>,
                                        <a onClick={me.emit.bind(me, "cancel")}>取消</a>
                                    ];
                                }
                                if (status == 1) {
                                    return (<a onClick={me.emit.bind(me, "pause")}>暂停</a>);
                                }
                                if (status == 2) {
                                    return [
                                        <a class="task-start" onClick={me.emit.bind(me, "resume")}>继续上传</a>,
                                        <a onClick={me.emit.bind(me, "cancel")}>取消</a>
                                    ];
                                }
                                if (status == 5) {
                                    return [
                                        <a class="task-start" onClick={me.emit.bind(me, "resume")}>重新上传</a>,
                                        <a onClick={me.emit.bind(me, "cancel")}>取消</a>
                                    ];
                                }
                            }}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});