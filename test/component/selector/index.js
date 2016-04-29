/*
 To build this demo:
 npm start lib scope
 npm start lib polyfill
 npm start component datepicker
 */

const Selector = require("./../../../src/component/selector/index");

$(function () {

    Scope.render(
        <Selector />,
        document.getElementById("container")
    );

});