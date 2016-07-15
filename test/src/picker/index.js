const Scope = require("Scope");
const {NAMESPACE} = require("./../../../src/project");
const storeName = NAMESPACE.toUpperCase().replace(/-$/g, "");

window[storeName].getComponents(["picker"], function (Picker) {

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

        Scope.render(
            <Picker.DateTimePicker zIndex={997}
                                   onSelect={function(year, month, day, hour, minute, second){
                       console.log(`${year}-${month}-${day} ${hour}:${minute}:${second}`);
                    }}/>,
            document.getElementById("datetime-picker-container")
        );

    });
});