/*
 To build this demo:
 npm start lib scope
 npm start lib polyfill
 npm start component datepicker
 */

const DatePicker = require("./../../../src/component/datepicker/index");

$(function () {

    Scope.render(
        <DatePicker date={{ year: 2016, month: 4, day: 21 }}
                    dayRule={function(year, month, day){
                        if(day == 13){ return false; }
                    }}
                    onSelect={function(year, month, day){
                       console.log(`${year}-${month}-${day}`);
                    }}
        />,
        document.getElementById("container")
    );

});