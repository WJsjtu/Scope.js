const Scope = require("Scope");
const ScopeUtils = Scope.utils;

const twoDashes = "--";
const CHANGE_EVENT_STRING = "keydown keyup input propertychange change";
const HOUR = "hour", MINUTE = "minute", SECOND = "second";

const fixTwo = require("./../fixTwo");

module.exports = Scope.createClass({
    currentTime: {},
    beforeMount: function () {
        const me = this;
        if (me.props.time) {
            const {hour, minute, second} = me.props.time;
            me.currentTime = {hour, minute, second};
        } else {
            me.currentTime = {
                hour: twoDashes,
                minute: twoDashes,
                second: twoDashes
            };
        }
    },

    timeout: null,

    bindEvent: function () {
        const me = this;
        [[HOUR, 23], [MINUTE, 59], [SECOND, 59]].forEach(function (_arr) {
            const refName = _arr[0], upper = _arr[1];
            me.refs[refName].on(CHANGE_EVENT_STRING, function (event) {
                ScopeUtils.stopPropagation(event);
                const value = parseInt(+$(this).val());
                if (me.timeout) {
                    clearTimeout(me.timeout);
                }
                me.timeout = setTimeout(function () {
                    if (isNaN(value) || value < 0) {
                        me.currentTime[refName] = 0;
                    } else if (value > upper) {
                        me.currentTime[refName] = +fixTwo(upper);
                    } else {
                        me.currentTime[refName] = +fixTwo(value);
                    }
                    me.unBindEvent();
                    [HOUR, MINUTE, SECOND].forEach(function (_refName) {
                        if (me.refs[_refName].val() == twoDashes) {
                            me.currentTime[_refName] = 0;
                        }
                    });
                    me.bindEvent();
                    clearTimeout(me.timeout);
                    me.timeout = null;
                    me.updateValue();
                }, 500);
            });
        });
    },


    unBindEvent: function () {
        const me = this;
        if (me.timeout) {
            clearTimeout(me.timeout);
        }
        [HOUR, MINUTE, SECOND].forEach(function (_refName) {
            me.refs[_refName].off(CHANGE_EVENT_STRING);
        });
    },

    afterMount: function () {
        const me = this;
        me.bindEvent();
        [HOUR, MINUTE, SECOND].forEach(function (refName) {
            me.refs[refName].on("focus", function () {
                const $this = $(this);
                $this.addClass("focused").select();
                if ($this.val() == twoDashes) {
                    $this.val("");
                }
            }).on("blur", function () {
                const $this = $(this);
                if ($this.val() == "") {
                    $this.val(twoDashes);
                }
                $(this).removeClass("focused")
            });
        });
    },

    afterUpdate: function ($component) {
        this.afterMount($component);
    },

    updateValue: function () {
        const me = this;

        me.unBindEvent();
        for (let ref in me.currentTime) {
            if (me.currentTime.hasOwnProperty(ref)) {
                me.refs[ref].val(fixTwo(me.currentTime[ref]));
            }
        }
        me.bindEvent();

        const {hour, minute, second} = me.currentTime;
        if (ScopeUtils.isFunction(me.props.onSelect)) {
            me.props.onSelect(hour, minute, second);
        }
    },

    calculate: function (type, step) {
        const me = this;

        const _calculate = function (_type, _step) {
            if (_type == 1) {
                let hour = me.currentTime[HOUR] + _step;
                hour %= 24;
                if (hour < 0) {
                    hour += 24;
                }
                me.currentTime[HOUR] = hour;
            } else if (_type == 2) {
                let minute = me.currentTime[MINUTE] + _step;
                _calculate(1, Math.floor(minute / 60));
                minute %= 60;
                if (minute < 0) {
                    minute += 60;
                }
                me.currentTime[MINUTE] = minute;
            } else if (_type == 3) {
                let second = me.currentTime[SECOND] + _step;
                _calculate(2, Math.floor(second / 60));
                second %= 60;
                if (second < 0) {
                    second += 60;
                }
                me.currentTime[SECOND] = second;
            }
        };
        _calculate(type, step);
        me.updateValue();
    },

    tick: function (event, type, step) {
        const me = this;
        ScopeUtils.stopPropagation(event);
        me.calculate(type, step);
    },

    up: function (type, event) {
        this.tick(event, type, 1);
    },
    down: function (type, event) {
        this.tick(event, type, -1);
    },
    render: function () {
        const me = this;
        return (
            <div class="time-picker">
                <div class="content" ref="content">
                    <div class="cell">
                        <div class="cell-input">
                            <input type="text" ref={HOUR} value={fixTwo(me.currentTime[HOUR])}/>
                        </div>
                        <div class="cell-arrow">
                            <div class="up" onClick={me.up.bind(me, 1)}>
                                <div class="arrow"></div>
                            </div>
                            <div class="down" onClick={me.down.bind(me, 1)}>
                                <div class="arrow"></div>
                            </div>
                        </div>
                        <div style="clear:both;"></div>
                    </div>
                    <div class="separator">:</div>
                    <div class="cell">
                        <div class="cell-input">
                            <input type="text" ref={MINUTE} value={fixTwo(me.currentTime[MINUTE])}/>
                        </div>
                        <div class="cell-arrow">
                            <div class="up" onClick={me.up.bind(me, 2)}>
                                <div class="arrow"></div>
                            </div>
                            <div class="down" onClick={me.down.bind(me, 2)}>
                                <div class="arrow"></div>
                            </div>
                        </div>
                        <div style="clear:both;"></div>
                    </div>
                    <div class="separator">:</div>
                    <div class="cell">
                        <div class="cell-input">
                            <input type="text" ref={SECOND} value={fixTwo(me.currentTime[SECOND])}/>
                        </div>
                        <div class="cell-arrow">
                            <div class="up" onClick={me.up.bind(me, 3)}>
                                <div class="arrow"></div>
                            </div>
                            <div class="down" onClick={me.down.bind(me, 3)}>
                                <div class="arrow"></div>
                            </div>
                        </div>
                        <div style="clear:both;"></div>
                    </div>
                    <div style="clear:both;"></div>
                </div>
            </div>
        );
    }
});