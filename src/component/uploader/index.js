const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {getScope} = ScopeUtils;

require("./lib/jquery.ui.widget");
require("./lib/jquery.iframe-transport");
require("./lib/jquery.fileupload");

const utils = require("./utils");
const Task = require("./task");
require("./style.less");
//status {0: pending, 1: uploading, 2: pause 3: cancel 4:done 5: error

const EVENT_PREFIX = "fileupload";
const {NAMESPACE} = require("./../../project");
const COMP_NAMESPACE = NAMESPACE + "uploader-";

module.exports = Scope.createClass({
    statePool: {
        0: {},
        1: {},
        2: {},
        3: {},
        4: {},
        5: {}
    },
    files: {},
    afterMount: function () {
        const me = this, refs = me.refs, $input = refs.input;

        if (!me.props.url || !$.support.fileInput) {
            $input.prop("disabled", true).addClass("btn-disabled");
            return false;
        }

        $input.fileupload({
            url: me.props.url,
            dataType: "json",
            disableImageResize: true,
            disableImagePreview: true,
            disableAudioPreview: true,
            disableVideoPreview: true,
            maxChunkSize: 2 * 1024 * 1024,
            autoUpload: false
        }).on(EVENT_PREFIX + "add", function (e, data) {
            let fileID = utils.uid();
            while (me.files[fileID]) {
                fileID = utils.uid();
            }
            //This is an important hack for jQuery File Upload O__O "…
            data.formData = {
                fid: fileID,
                uuid: me.uuid
            };
            data.fileID = fileID;

            const $li = $(document.createElement("li"));
            Scope.render(<Task url={me.props.url}
                               data={data}
                               list={me.files}
                               switchStatus={me.switchStatus.bind(me)}/>, $li);
            me.statePool[0][fileID] = me.files[fileID];
            refs.list.append($li);
            refs.startAll.show();
            refs.cancelAll.show();
        }).on(EVENT_PREFIX + "progress", function (e, data) {
            const $task = me.files[data.fileID];
            const instance = $task.data("fileUploadTask");
            getScope($task).updateProgress(data.loaded);
            if (!instance.fileInfo.size) {
                getScope($task).updateSize(data.total);
            }
        }).on(EVENT_PREFIX + "done", function (e, data) {
            const $task = me.files[data.fileID];
            const instance = $task.data("fileUploadTask");
            if (data.result && data.result.files && data.result.files.length) {
                const doneFile = data.result.files[0];
                if (doneFile.error) {
                    getScope($task).error(doneFile.error);
                } else {
                    instance.serverInfo.url = doneFile.url;
                    getScope($task).done(doneFile.url);
                }
            } else {
                getScope($task).error("服务器数据错误");
            }
        }).on(EVENT_PREFIX + "fail", function (e, data) {
            getScope(me.files[data.fileID]).error(data.error);
        }).on(EVENT_PREFIX + "chunkdone", function (e, data) {
            const instance = me.files[data.fileID].data("fileUploadTask");
            if (!instance.serverInfo.name && data.result && data.result.files && data.result.files.length) {
                instance.serverInfo.name = data.result.files[0].name;
            }
        }).on(EVENT_PREFIX + "chunkfail", function (e, data) {
            getScope(me.files[data.fileID]).error(data.errorThrown);
        });
    },
    switchStatus: function (fileID, oldStatus, newStatus) {
        const me = this;
        if (me.statePool[oldStatus] && me.statePool[oldStatus][fileID]) {
            const instance = me.statePool[oldStatus][fileID];
            delete me.statePool[oldStatus][fileID];
            const hasOld = me.countStatus(oldStatus);

            let hasNew = false;
            if (me.statePool[newStatus]) {
                hasNew = me.countStatus(newStatus);
                me.statePool[newStatus][fileID] = instance;
            }
            if (!hasOld || !hasNew) {
                me.updateController();
            }
        }
    },
    updateController: function () {
        const me = this, connectStatus = function (button, statusArr) {
            let total = 0;
            for (var i = 0; i < statusArr.length; i++) {
                total += me.countStatus(statusArr[i]);
            }
            me.refs[button] && me.refs[button][total ? "show" : "hide"]();
        };
        connectStatus("startAll", [0, 2]);
        connectStatus("cancelAll", [0, 2]);
        connectStatus("pauseAll", [1]);
    },
    countStatus: function (status) {
        const me = this;
        if (me.statePool[status]) {
            let count = 0;
            for (var i in me.statePool[status]) {
                count++;
            }
            return count;
        } else {
            return -1;
        }
    },
    emit: function (command) {
        const me = this, dealAll = function (status, process) {
            for (var task in me.statePool[status]) {
                if (me.statePool[status].hasOwnProperty(task)) {
                    getScope(me.statePool[status][task])[process]();
                }
            }
        };
        if (command == "startAll") {
            dealAll(0, "start");
            dealAll(2, "resume");
        } else if (command == "cancelAll") {
            dealAll(0, "cancel");
            dealAll(2, "cancel");
            dealAll(5, "cancel");
        } else if (command == "pauseAll") {
            dealAll(1, "pause");
        }
        me.updateController();
    },
    render: function () {
        const me = this, name = me.props.name || "files";
        return (
            <div class={NAMESPACE + "uploader"}>
                <div class={COMP_NAMESPACE + "controller"}>
                    <div class={COMP_NAMESPACE + "input"}>
                        <a>
                            <i class="fa fa-fw fa-upload" aria-hidden="true" title="添加上传文件"> </i>
                            <span>&nbsp;添加上传文件</span>
                        </a>
                        <input ref="input" type="file" name={name + "[]"} multiple/>
                    </div>
                    {[
                        ["startAll", "play", "开始上传全部"],
                        ["cancelAll", "remove", "取消全部任务"],
                        ["pauseAll", "pause", "暂停上传任务"]
                    ].map(function (ele) {
                        return (
                            <div style="display: none;" ref={ele[0]} class={COMP_NAMESPACE + "btn"}
                                 onClick={me.emit.bind(me, ele[0])}>
                                <a>
                                    <i class={"fa fa-fw fa-" + ele[1]} aria-hidden="true" title={ele[2]}> </i>
                                    <span>&nbsp;{ele[2]}</span>
                                </a>
                            </div>
                        );
                    })}
                    <div style="clear: both;"></div>
                </div>
                <ul ref="list">

                </ul>
            </div>
        );
    }

});