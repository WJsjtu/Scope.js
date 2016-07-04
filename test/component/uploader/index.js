/*
 To build this demo:
 npm start lib scope
 npm start lib polyfill
 npm start component datepicker
 */

const Uploader = require("./../../../src/component/uploader/index");

$(function () {

    window.uploader = Scope.render(
        <Uploader url="http://127.0.0.1/public/mp.php/upload/upload"/>,
        document.getElementById("container")
    );

});