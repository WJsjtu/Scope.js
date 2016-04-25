const Scope = require("Scope");

require('./style.less');

const weekDays = "日一二三四五六".split('');

const getPrevMonth = function (year, month) {
    return month == 1 ? [year - 1, 12] : [year, month - 1];
};

const getNextMonth = function (year, month) {
    return month == 12 ? [year + 1, 1] : [year, month + 1];
};

const getDayCount = function (year, month) {
    const isLeap = ((month == 2) && (year % 4 == 0 && year % 100 != 0 || year % 400 == 0));
    return [1, -2, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1][month - 1] + 30 + isLeap;
};

const DayPicker = Scope.createClass({
    onSelect: function (year, month, day, needUpdate, $handler, event) {
        $handler.stopPropagation(event);
        const activeDate = this.props.active;
        activeDate.year = year;
        activeDate.month = month;
        activeDate.day = day;
        if (needUpdate) {
            const panelDate = this.props.date;
            panelDate.year = year;
            panelDate.month = month;
            this.updateView($handler.refs);
        } else {
            $handler.refs.body.$ele.find(".day.active").removeClass("active");
            $handler.$ele.addClass("active");
        }
        if (typeof this.props.onSelect == "function") {
            this.props.onSelect(year, month, day);
        }
    },
    updateView: function (refs) {
        const duration = 300;
        refs.title.$ele.fadeOut(duration, function () {
            refs.title.update();
            refs.title.$ele.fadeIn(duration);
        });
        refs.body.$ele.fadeOut(duration, function () {
            refs.body.update();
            refs.body.$ele.fadeIn(duration);
        });
    },
    switchPrev: function ($handler, event) {
        $handler.stopPropagation(event);
        const me = this;
        const {year, month} = me.props.date;
        const switchedDate = getPrevMonth(year, month);
        me.props.date = {
            year: switchedDate[0],
            month: switchedDate[1]
        };
        me.updateView($handler.refs);
    },
    switchNext: function ($handler, event) {
        $handler.stopPropagation(event);
        const me = this;
        const {year, month} = me.props.date;
        const switchedDate = getNextMonth(year, month);
        me.props.date = {
            year: switchedDate[0],
            month: switchedDate[1]
        };
        me.updateView($handler.refs);
    },
    render: function () {
        const me = this;
        const width = me.props.width || 315;
        return (
            <table
                style={`width:${width}px;line-height:${Math.floor(width / 10.5)}px;font-size:${Math.floor(width * 2 / 45)}px;`}>
                <thead>
                <tr>
                    <th colspan="7">
                        <div class="title" ref="title">
                            {function () {
                                const {year, month} = me.props.date;
                                return (
                                    <div style="float:left">
                                        <span>{year}年{month}月</span>
                                    </div>
                                );
                            }}
                            {function () {
                                const {year, month} = me.props.date;
                                return (
                                    <div style="float:right">
                                    <span class="arrow" onClick={me.switchPrev}>
                                        <span class="plain">&lt;&nbsp;</span>
                                        <span>{getPrevMonth(year, month)[1]}月</span>
                                    </span>
                                        <span class="plain">&nbsp;|&nbsp;</span>
                                    <span class="arrow" onClick={me.switchNext}>
                                        <span>{getNextMonth(year, month)[1]}月</span>
                                        <span class="plain">&nbsp;&gt;</span>
                                    </span>
                                    </div>
                                );
                            }}
                            <div style="clear:both"></div>
                        </div>
                    </th>
                </tr>
                <tr class="week">{weekDays.map(function (day) {
                    return (<th>周{day}</th>);
                })}</tr>
                </thead>
                <tbody ref="body">{function () {
                    const {year, month} = me.props.date;
                    const activeDate = me.props.active;
                    const activeYear = activeDate.year, activeMonth = activeDate.month, activeDay = activeDate.day;
                    const dayCount = getDayCount(year, month);
                    const dateObject = new Date();

                    const currentYear = dateObject.getFullYear();
                    const currentMonth = dateObject.getMonth() + 1;
                    const currentDay = dateObject.getDate();

                    dateObject.setFullYear(year);
                    dateObject.setMonth(month - 1);
                    dateObject.setDate(1);

                    let prevDays = dateObject.getDay();
                    if (!prevDays) {
                        prevDays = 7;
                    }

                    const prevMonth = getPrevMonth(year, month);
                    const prevMonthDayCount = getDayCount.apply(me, prevMonth);
                    const nextMonth = getNextMonth(year, month);


                    let daysArray = [];

                    const getDayElement = function (year, month, date, defaultClass, needUpdate) {
                        const dayRule = me.props.dayRule;
                        const validate = (typeof dayRule != "function") || dayRule(year, month, date);
                        const handler = validate !== false ? me.onSelect.bind(me, year, month, date, needUpdate) : null;

                        const classArray = ["day"].concat(defaultClass);
                        if (validate === false) {
                            classArray.push("disabled");
                        }
                        if (year == currentYear && month == currentMonth && date == currentDay) {
                            classArray.push("current");
                        }

                        if (year == activeYear && month == activeMonth && date == activeDay) {
                            classArray.push("active");
                        }

                        return (
                            <td class={classArray.join(" ")} onClick={handler}>{date}</td>
                        );

                    };

                    for (let i = 0; i < prevDays; i++) {
                        daysArray.push(getDayElement(
                            prevMonth[0],
                            prevMonth[1],
                            prevMonthDayCount - prevDays + 1 + i,
                            ["old"],
                            true
                        ));
                    }

                    for (let i = 0; i < dayCount; i++) {
                        daysArray.push(getDayElement(
                            year,
                            month,
                            i + 1,
                            []
                        ));
                    }

                    for (let i = 0; i < 42 - prevDays - dayCount; i++) {
                        daysArray.push(getDayElement(
                            nextMonth[0],
                            nextMonth[1],
                            i + 1,
                            ["new"],
                            true
                        ));
                    }

                    const tableRows = [];
                    for (let i = 0; i < 6; i++) {
                        const oneRow = [];
                        for (let j = 0; j < 7; j++) {
                            oneRow.push(daysArray[7 * i + j]);
                        }
                        tableRows.push(<tr>{oneRow}</tr>);
                    }

                    return tableRows;
                }}</tbody>
            </table>
        );
    }
});

//window.DayPicker = DayPicker;
module.exports = DayPicker;