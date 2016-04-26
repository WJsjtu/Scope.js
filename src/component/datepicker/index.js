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

const DatePicker = Scope.createClass({
    activeDate: {},
    panelDate: {},
    panel: 1,
    beforeMount: function () {

        const current = new Date();
        const me = this;

        const currentDate = me.props.date || {
                year: current.getFullYear(),
                month: current.getMonth() + 1,
                day: current.getDate()
            };

        me.panel = 1;
        me.activeDate = currentDate;
        me.panelDate = $.extend({}, currentDate)
    },
    onDaySelect: function (year, month, day, needUpdate, $handler, event) {
        $handler.stopPropagation(event);
        const me = this;
        me.activeDate.year = year;
        me.activeDate.month = month;
        me.activeDate.day = day;
        if (needUpdate) {
            me.panelDate.year = year;
            me.panelDate.month = month;
            me.updateView($handler.refs);
        } else {
            $handler.refs.body.$ele.find(".active").removeClass("active");
            $handler.$ele.addClass("active");
        }
        if (typeof me.props.onSelect == "function") {
            me.props.onSelect(year, month, day);
        }
    },
    onMonthSelect: function (month, $handler, event) {
        $handler.stopPropagation(event);
        const me = this;
        me.panelDate.month = month;
        me.panel = 1;
        me.updateView($handler.refs);
    },
    onYearSelect: function (year, $handler, event) {
        $handler.stopPropagation(event);
        const me = this;
        me.panelDate.year = year;
        me.panel = 2;
        me.updateView($handler.refs);
    },
    updateView: function (refs) {
        refs.title.update();
        refs.body.update();
    },
    switchPrev: function ($handler, event) {
        $handler.stopPropagation(event);
        const me = this;
        if (me.panel != 3) {
            const {year, month} = me.panelDate;
            const switchedDate = getPrevMonth(year, month);
            me.panelDate = {
                year: switchedDate[0],
                month: switchedDate[1]
            };
        } else {
            me.panelDate = {
                year: me.panelDate.year - 12
            };
        }
        me.updateView($handler.refs);
    },
    switchNext: function ($handler, event) {
        $handler.stopPropagation(event);
        const me = this;
        if (me.panel != 3) {
            const {year, month} = me.panelDate;
            const switchedDate = getNextMonth(year, month);
            me.panelDate = {
                year: switchedDate[0],
                month: switchedDate[1]
            };
        } else {
            me.panelDate = {
                year: me.panelDate.year + 12
            };
        }
        me.updateView($handler.refs);
    },
    switchTitle: function ($handler, event) {
        $handler.stopPropagation(event);
        const me = this;
        if (me.panel == 1) {
            me.panel = 2;
            me.updateView($handler.refs);
        } else if (me.panel == 2) {
            me.panel = 3;
            me.updateView($handler.refs);
        }
    },
    renderDays: function () {
        const me = this;
        const {year, month} = me.panelDate;
        const activeDate = me.activeDate;
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
            const handler = validate !== false ? me.onDaySelect.bind(me, year, month, date, needUpdate) : null;

            const classArray = ["item"].concat(defaultClass);
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
    },
    renderMonths: function () {
        const me = this;
        const width = me.props.width || 315;
        const lineHeight = Math.floor(width / 10.5);
        const activeDate = me.activeDate;
        const activeYear = activeDate.year, activeMonth = activeDate.month;
        const dateObject = new Date();

        const currentYear = dateObject.getFullYear();
        const currentMonth = dateObject.getMonth() + 1;

        let monthsArray = [];

        const getMonthElement = function (year, month, defaultClass) {
            const classArray = ["item"].concat(defaultClass);
            if (year == currentYear && month == currentMonth) {
                classArray.push("current");
            }

            if (year == activeYear && month == activeMonth) {
                classArray.push("active");
            }

            return (
                <div
                    style={"width: 25%;float: left;"}
                    class={classArray.join(" ")}
                    onClick={me.onMonthSelect.bind(me, month)}>
                    <span style={"line-height: " + (lineHeight * 7 / 3) + "px;"}>{month}</span>
                </div>
            );

        };

        for (let i = 0; i < 12; i++) {
            monthsArray.push(getMonthElement(
                me.panelDate.year,
                i + 1,
                []
            ));
        }

        monthsArray.push(<div style={"clear: both;"}></div>);

        return (
            <tr>
                <td colspan="7">
                    {monthsArray}
                </td>
            </tr>
        );
    },
    renderYears: function () {
        const me = this;
        const width = me.props.width || 315;
        const lineHeight = Math.floor(width / 10.5);
        const activeYear = me.activeDate.year;
        const dateObject = new Date();

        const currentYear = dateObject.getFullYear();

        let yearsArray = [];

        const getYearElement = function (year, defaultClass) {
            const classArray = ["item"].concat(defaultClass);
            if (year == currentYear) {
                classArray.push("current");
            }

            if (year == activeYear) {
                classArray.push("active");
            }

            return (
                <div
                    style={"width: 25%;float: left;"}
                    class={classArray.join(" ")}
                    onClick={me.onYearSelect.bind(me, year)}>
                    <span style={"line-height: " + (lineHeight * 7 / 3) + "px;"}>{year}</span>
                </div>
            );

        };

        const startYear = parseInt(me.panelDate.year / 10) * 10 - 1;
        for (let i = 0; i < 12; i++) {
            yearsArray.push(getYearElement(
                startYear + i,
                []
            ));
        }

        yearsArray.push(<div style={"clear: both;"}></div>);

        return (
            <tr>
                <td colspan="7">
                    {yearsArray}
                </td>
            </tr>
        );
    },
    render: function () {
        const me = this;
        const width = me.props.width || 315;
        return (
            <div class="datepicker" style={`width:${width}px;`}>
                <table
                    style={`width:${width}px;line-height:${Math.floor(width / 10.5)}px;font-size:${Math.floor(width * 2 / 45)}px;`}>
                    <thead ref="title">
                    <tr class="title">
                        <th onClick={me.switchPrev}>
                            <span>&lt;&nbsp;</span>
                        </th>
                        <th colspan="5" onClick={me.switchTitle}>
                            <div>
                                {function () {
                                    if (me.panel == 1) {
                                        return (
                                            <span>{me.panelDate.year}&nbsp;年&nbsp;{me.panelDate.month}&nbsp;月</span>);
                                    } else if (me.panel == 2) {
                                        return (<span>{me.panelDate.year}&nbsp;年</span>);
                                    } else if (me.panel == 3) {
                                        const startYear = parseInt(me.panelDate.year / 10) * 10 - 1;
                                        return (<span>{startYear}&nbsp;年&nbsp;-&nbsp;{startYear + 12}&nbsp;年</span>);
                                    }
                                }}
                            </div>
                        </th>
                        <th onClick={me.switchNext}>
                            <span>&nbsp;&gt;</span>
                        </th>
                    </tr>
                    {function () {
                        if (me.panel == 1) {
                            return (
                                <tr class="week">{weekDays.map(function (day) {
                                    return (<th>周{day}</th>);
                                })}</tr>
                            );
                        } else {
                            return null;
                        }
                    }}
                    </thead>
                    <tbody ref="body">{function () {
                        if (me.panel == 2) {
                            return me.renderMonths();
                        } else if (me.panel == 3) {
                            return me.renderYears();
                        } else {
                            return me.renderDays();
                        }
                    }}</tbody>
                </table>
            </div>
        );
    }
});

module.exports = DatePicker;