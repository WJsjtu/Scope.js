/*
 To build this demo:
 npm start component daypicker
 npm start lib scope
 npm start lib polyfill
 */

const DatePicker = require('./../../../src/component/datepicker/index');

$(function () {

    const date = {
        year: 2016,
        month: 4,
        day: 21
    };

    const instance = Scope.render(
        <DatePicker date={date}
                    dayRule={function(year, month, day){
                        if(day == 13){
                            return false;
                        }
                   }}
                    onSelect={function(year, month, day){
                       document.getElementById('label').innerHTML = `${year}年${month}月${day}日`;
                   }}
        />,
        document.getElementById('container')
    );
    document.getElementById('label').innerHTML = `${date.year}年${date.month}月${date.day}日`;
    console.log(instance);
});