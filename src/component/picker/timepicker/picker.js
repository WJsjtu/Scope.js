const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {getScope} = ScopeUtils;

const twoDashes = "--";
const CHANGE_EVENT_STRING = "keydown keyup input propertychange change";
const HOUR = "hour", MINUTE = "minute", SECOND = "second";

const fixTwo = function (number) {
    number = +number;
    if (isNaN(number)) {
        return twoDashes;
    }
    number = number < 0 ? -number : number;
    if (number >= 10) {
        return "" + number;
    } else {
        return "0" + number;
    }
};

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

    bindEvent: function (refName, upper) {
        const me = this;
        me.refs[refName].on(CHANGE_EVENT_STRING, function (event) {
            ScopeUtils.stopPropagation(event);
            const value = parseInt(+$(this).val());
            if (me.timeout) {
                clearTimeout(me.timeout);
            }
            me.timeout = setTimeout(function () {
                if (isNaN(value) || value < 0) {
                    me.updateValue(refName, 0);
                } else if (value > upper) {
                    me.updateValue(refName, upper);
                } else {
                    me.updateValue(refName, value);
                }
                if (me.refs[HOUR].val() == twoDashes) {
                    me.updateValue(HOUR, 0);
                }
                if (me.refs[MINUTE].val() == twoDashes) {
                    me.updateValue(MINUTE, 0);
                }
                if (me.refs[SECOND].val() == twoDashes) {
                    me.updateValue(SECOND, 0);
                }
                clearTimeout(me.timeout);
                me.timeout = null;
            }, 500);
        }).on("focus", function () {
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
    },


    unBindEvent: function (refName) {
        const me = this;
        if (me.timeout) {
            clearTimeout(me.timeout);
        }
        me.refs[refName].off(CHANGE_EVENT_STRING);
    },

    afterMount: function () {
        const me = this;
        me.bindEvent(HOUR, 23);
        me.bindEvent(MINUTE, 59);
        me.bindEvent(SECOND, 59);
    },

    afterUpdate: function ($component) {
        this.afterMount($component);
    },

    updateValue: function (ref, value) {
        const me = this;
        me.currentTime[ref] = +fixTwo(value);
        me.refs[ref].val(fixTwo(value));
    },

    calculate: function (type, step) {
        const me = this;
        if (type == 1) {
            let hour = me.currentTime[HOUR] + step;
            hour %= 24;
            if (hour < 0) {
                hour += 24;
            }
            me.updateValue(HOUR, hour);
        } else if (type == 2) {
            let minute = me.currentTime[MINUTE] + step;
            me.calculate(1, Math.floor(minute / 60));
            minute %= 60;
            if (minute < 0) {
                minute += 60;
            }
            me.updateValue(MINUTE, minute);
        } else if (type == 3) {
            let second = me.currentTime[SECOND] + step;
            me.calculate(2, Math.floor(second / 60));
            second %= 60;
            if (second < 0) {
                second += 60;
            }
            me.updateValue(SECOND, second);
        }
    },

    tick: function (event, type, step) {
        const me = this;
        ScopeUtils.stopPropagation(event);
        me.unBindEvent(HOUR);
        me.unBindEvent(MINUTE);
        me.unBindEvent(SECOND);
        me.calculate(type, step);
        me.bindEvent(HOUR, 23);
        me.bindEvent(MINUTE, 59);
        me.bindEvent(SECOND, 59);
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
            <div class="picker">
                <div class="button">
                    <div class="up" onClick={me.up.bind(me, 1)}>
                        <div class="arrow"></div>
                    </div>
                    <div class="separator"></div>
                    <div class="up" onClick={me.up.bind(me, 2)}>
                        <div class="arrow"></div>
                    </div>
                    <div class="separator"></div>
                    <div class="up" onClick={me.up.bind(me, 3)}>
                        <div class="arrow"></div>
                    </div>
                    <div style="clear: both;"></div>
                </div>
                <div class="input">
                    <div class="selector">
                        <div><input type="text" ref={HOUR} value={fixTwo(me.currentTime[HOUR])}/>
                        </div>
                    </div>
                    <div class="separator">:</div>
                    <div class="selector">

                        <div><input type="text" ref={MINUTE} value={fixTwo(me.currentTime[MINUTE])}/></div>
                    </div>
                    <div class="separator">:</div>
                    <div class="selector">

                        <div><input type="text" ref={SECOND} value={fixTwo(me.currentTime[SECOND])}/></div>
                    </div>
                    <div style="clear: both;"></div>
                </div>
                <div class="button">
                    <div class="down" onClick={me.down.bind(me, 1)}>
                        <div class="arrow"></div>
                    </div>
                    <div class="separator"></div>
                    <div class="down" onClick={me.down.bind(me, 2)}>
                        <div class="arrow"></div>
                    </div>
                    <div class="separator"></div>
                    <div class="down" onClick={me.down.bind(me, 3)}>
                        <div class="arrow"></div>
                    </div>
                    <div style="clear: both;"></div>
                </div>
            </div>
        );
    }
});