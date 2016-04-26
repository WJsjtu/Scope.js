/*
 To build this demo:
 npm start component daypicker
 npm start lib scope
 npm start lib polyfill
 */

const DayPicker = require('./../../../src/component/calender/index');

$(function () {
    const activeDay = {
        year: 2016,
        month: 4,
        day: 21
    };

    const currentPanel = {
        year: 2016,
        month: 4
    };

    const instance = Scope.render(
        <DayPicker width={300} date={currentPanel} active={activeDay} onSelect={function(year, month, day){
            document.getElementById('label').innerHTML = `${year}年${month}月${day}日`;
        }}/>,
        document.getElementById('container')
    );
    document.getElementById('label').innerHTML = `${activeDay.year}年${activeDay.month}月${activeDay.day}日`;
    console.log(instance);
});