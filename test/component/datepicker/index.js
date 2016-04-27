/*
 To build this demo:
 npm start lib scope
 npm start lib polyfill
 npm start component datepicker
 */

const DatePicker = require("./../../../src/component/datepicker/index");

$(function () {

    const instance = Scope.render(
        <DatePicker date={{ year: 2016, month: 4, day: 21 }}
                    dayRule={function(year, month, day){
                        if(day == 13){ return false; }
                    }}
                    onSelect={function(year, month, day){
                       console.log(`${year}年${month}月${day}日`);
                    }}
        />,
        document.getElementById("container")
    );
    console.log(instance);
    
});