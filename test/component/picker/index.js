const Picker = require("./../../../src/component/picker/index");

$(function () {

    Scope.render(
        <Picker.DatePicker zIndex={999}
                           dayRule={function(year, month, day){
                        if(day == 13){ return false; }
                    }}
                           onSelect={function(year, month, day){
                       console.log(`${year}-${month}-${day}`);
                    }}
        />,
        document.getElementById("date-picker-container")
    );

    Scope.render(
        <Picker.TimePicker zIndex={998}
                           onSelect={function(hour, minute, second){
                       console.log(`${hour}:${minute}:${second}`);
                    }}/>,
        document.getElementById("time-picker-container")
    );

});