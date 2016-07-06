const Scope = require("Scope");
const ScopeUtils = Scope.utils;

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

module.exports = Scope.createClass({
    activeDate: {},
    panelDate: {},
    panel: 1,

    beforeMount: function () {
        const me = this, current = new Date();
        const currentDate = me.props.date || {
                year: current.getFullYear(),
                month: current.getMonth() + 1,
                day: 0
            };
        me.panel = 1;
        me.activeDate = currentDate;
        me.panelDate = $.extend({}, currentDate)
    },

    onDaySelect: function (year, month, day, needUpdate, event, $this) {
        ScopeUtils.stopPropagation(event);
        const me = this;
        me.activeDate.year = year;
        me.activeDate.month = month;
        me.activeDate.day = day;
        if (needUpdate) {
            me.panelDate.year = year;
            me.panelDate.month = month;
            me.updateView();
        } else {
            me.refs.tbody.find(".active").removeClass("active");
            $this.addClass("active");
        }
        if (ScopeUtils.isFunction(me.props.onSelect)) {
            me.props.onSelect(year, month, day);
        }
    },
    onMonthSelect: function (month, event) {
        ScopeUtils.stopPropagation(event);
        const me = this;
        me.panelDate.month = month;
        me.panel = 1;
        me.updateView();
    },
    onYearSelect: function (year, event) {
        ScopeUtils.stopPropagation(event);
        const me = this;
        me.panelDate.year = year;
        me.panel = 2;
        me.updateView();
    },
    updateView: function () {
        const me = this;
        me.refs.week[me.panel == 1 ? "show" : "hide"]();
        ScopeUtils.update(me.refs.title);
        ScopeUtils.update(me.refs.tbody);
    },
    switchStep: function (step, event) {
        ScopeUtils.stopPropagation(event);
        const me = this;
        if (me.panel == 1) {
            const {year, month} = me.panelDate;
            const switchedDate = (step < 0 ? getPrevMonth : getNextMonth)(year, month);
            me.panelDate = {
                year: switchedDate[0],
                month: switchedDate[1]
            };
        } else if (me.panel == 2) {
            me.panelDate = {
                year: me.panelDate.year + step
            };
        } else if (me.panel == 3) {
            me.panelDate = {
                year: me.panelDate.year + 12 * step
            };
        }
        me.updateView();
    },
    switchTitle: function (event) {
        ScopeUtils.stopPropagation(event);
        const me = this;
        if (me.panel == 1) {
            me.panel = 2;
            me.updateView();
        } else if (me.panel == 2) {
            me.panel = 3;
            me.updateView();
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
            const validate = !ScopeUtils.isFunction(dayRule) || (dayRule(year, month, date) !== false);
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
        const activeDate = me.activeDate;
        const activeYear = activeDate.year, activeMonth = activeDate.month;
        const dateObject = new Date();

        const currentYear = dateObject.getFullYear();
        const currentMonth = dateObject.getMonth() + 1;

        let monthsArray = [];

        const getMonthElement = function (year, month, defaultClass) {
            const classArray = ["item", "large"].concat(defaultClass);
            if (year == currentYear && month == currentMonth) {
                classArray.push("current");
            }

            if (year == activeYear && month == activeMonth) {
                classArray.push("active");
            }

            return (
                <div class={classArray.join(" ")}
                     onClick={me.onMonthSelect.bind(me, month)}>
                    <span>{month}</span>
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

        const tableRows = [];
        for (let i = 0; i < 3; i++) {
            const oneRow = [];
            for (let j = 0; j < 4; j++) {
                oneRow.push(monthsArray[4 * i + j]);
            }
            tableRows.push(<tr>
                <td colspan="7">{oneRow}</td>
            </tr>);
        }
        return tableRows;
    },
    renderYears: function () {
        const me = this;
        const activeYear = me.activeDate.year;
        const dateObject = new Date();

        const currentYear = dateObject.getFullYear();

        let yearsArray = [];

        const getYearElement = function (year, defaultClass) {
            const classArray = ["item", "large"].concat(defaultClass);
            if (year == currentYear) {
                classArray.push("current");
            }

            if (year == activeYear) {
                classArray.push("active");
            }

            return (
                <div class={classArray.join(" ")}
                     onClick={me.onYearSelect.bind(me, year)}>
                    <span>{year}</span>
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

        const tableRows = [];
        for (let i = 0; i < 3; i++) {
            const oneRow = [];
            for (let j = 0; j < 4; j++) {
                oneRow.push(yearsArray[4 * i + j]);
            }
            tableRows.push(<tr>
                <td colspan="7">{oneRow}</td>
            </tr>);
        }
        return tableRows;
    },
    render: function () {
        const me = this;
        return (
            <div class="date-picker">
                <div class="content">
                    <table ref="table">
                        <thead>
                        <tr class="title" ref="title">
                            <th onClick={me.switchStep.bind(me, -1)}>
                                <span>&lt;&nbsp;</span>
                            </th>
                            <th colspan="5" onClick={me.switchTitle}>
                                <div>
                                    {function () {
                                        if (me.panel == 1) {
                                            return (
                                                <span>{me.panelDate.year}&nbsp;年&nbsp;{me.panelDate.month}&nbsp;
                                                    月</span>);
                                        } else if (me.panel == 2) {
                                            return (<span>{me.panelDate.year}&nbsp;年</span>);
                                        } else if (me.panel == 3) {
                                            const startYear = parseInt(me.panelDate.year / 10) * 10 - 1;
                                            return (
                                                <span>{startYear}&nbsp;年&nbsp;-&nbsp;{startYear + 12}&nbsp;年</span>);
                                        }
                                    }}
                                </div>
                            </th>
                            <th onClick={me.switchStep.bind(me, 1)}>
                                <span>&nbsp;&gt;</span>
                            </th>
                        </tr>
                        <tr ref="week">{"日一二三四五六".split("").map(function (day) {
                            return (<th>周{day}</th>);
                        })}</tr>
                        </thead>
                        <tbody ref="tbody">{function () {
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
            </div>
        );
    }
});