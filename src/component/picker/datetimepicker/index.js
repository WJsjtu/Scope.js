const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {getScope} = ScopeUtils;
const DatePicker = require("./../datepicker/picker");
const TimePicker = require("./../timepicker/picker");
const {NAMESPACE} = require("./../../../project");
const isOutside = require("./../outside");
require("./style.less");

module.exports = Scope.createClass({
    style: {
        width: "315px",
        lineHeight: "30px",
        fontSize: "14px"
    },
    date: null,
    time: null,
    updateSize: function (width) {
        this.style = {
            width: width + "px",
            lineHeight: Math.floor(width / 10.5) + "px",
            fontSize: Math.floor(width * 2 / 45) + "px"
        };
    },
    beforeMount: function () {
        const me = this, width = +me.props.width;
        if (!isNaN(width) && width > 0) {
            me.updateSize(width);
        }
        const now = new Date;
        if (me.props.date) {
            const {year, month, day} = me.props.date;
            me.date = {year, month, day};
        } else {
            me.date = {
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate()
            };
        }
        if (me.props.time) {
            const {hour, minute, second} = me.props.time;
            me.time = {hour, minute, second};
        } else {
            me.time = {
                hour: now.getHours(),
                minute: now.getMinutes(),
                second: 0
            };
        }
    },
    afterMount: function () {
        const me = this;
        me.refs.input.css(me.style);
        me.refs.wrapper.css(me.style);

        const $datePicker = me.refs.datepicker;
        $datePicker.css({
            display: "block",
            position: "relative"
        });
        getScope($datePicker).refs.table.css(me.style);

        const $timePicker = me.refs.timepicker;
        $timePicker.css({
            display: "block",
            position: "relative"
        });


        const _lineHeight = parseFloat(me.style.lineHeight),
            _width = parseFloat(me.style.width);

        getScope($timePicker).$ele.css({
            width: me.style.width,
            fontSize: me.style.fontSize
        });


        const $content = getScope($timePicker).refs.content.css({
            marginTop: _lineHeight * 0.1 - 1
        });
        $content.find(".cell").css({
            height: _lineHeight * 0.8 + 2,
            lineHeight: (_lineHeight * 0.8) + "px"
        });
        $content.find("input").css({
            width: _width * 2 / 21,
            height: _lineHeight * 0.8
        });
        $content.find(".separator").css({
            width: _width * 4 / 63,
            height: _lineHeight * 0.8
        });
        const cellArrow = $content.find(".cell-arrow").css({
            width: _width * 4 / 63
        });

        cellArrow.find(".arrow").css({
            borderWidth: _width / 63
        });
        cellArrow.find(".up").css({
            height: _lineHeight * 0.4 + 1
        });
        cellArrow.find(".down").css({
            height: _lineHeight * 0.4 + 1
        });


        if (me.date && me.time) {
            const {year, month, day} = me.date;
            const {hour, minute, second} = me.time;
            me.refs.input.text(`${year}年${month}月${day}日 ${hour}点${minute}分${second}秒`);
        } else {
            me.refs.input.text("请选择...");
        }
        if (me.props.zIndex && !isNaN(+me.props.zIndex)) {
            me.refs.combine.css({
                zIndex: +me.props.zIndex
            });
        }
    },
    afterUpdate: function () {
        this.afterMount();
    },
    onDateSelect: function (year, month, day) {
        const me = this;
        me.date = {year, month, day};
        const {hour, minute, second} = me.time;
        me.refs.input.text(`${year}年${month}月${day}日 ${hour}点${minute}分${second}秒`);
        if (ScopeUtils.isFunction(me.props.onSelect)) {
            me.props.onSelect(year, month, day, hour, minute, second);
        }

    },
    onTimeSelect: function (hour, minute, second) {
        const me = this;
        me.time = {hour, minute, second};
        const {year, month, day} = me.date;
        me.refs.input.text(`${year}年${month}月${day}日 ${hour}点${minute}分${second}秒`);
        if (ScopeUtils.isFunction(me.props.onSelect)) {
            me.props.onSelect(year, month, day, hour, minute, second);
        }
    },
    onFocus: function () {
        const me = this;
        me.refs.input.parent().addClass('focused');
        me.refs.combine.show();
        const onBlur = function (_event) {
            if (isOutside([me.refs.wrapper[0]], _event)) {
                me.refs.input.parent().removeClass('focused');
                me.refs.combine.hide();
                $(document).off('click', onBlur);
            }
        };
        $(document).on('click', onBlur);
    },
    render: function () {
        const me = this;
        return (
            <div class={NAMESPACE + "datetimepicker"} ref="wrapper">
                <div class="input" onClick={me.onFocus}>
                    <span ref="input"> </span>
                </div>
                <div class="picker-wrapper">
                    <div class="combine" ref="combine">
                        <DatePicker ref="datepicker"
                                    date={me.date}
                                    dayRule={me.props.dayRule}
                                    onSelect={me.onDateSelect.bind(me)}/>
                        <TimePicker ref="timepicker"
                                    time={me.time}
                                    onSelect={me.onTimeSelect.bind(me)}/>
                    </div>
                </div>
            </div>
        );
    }
});