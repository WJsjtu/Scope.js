const Scope = require("Scope");
const {NAMESPACE} = require("./../../../src/project");
const storeName = NAMESPACE.toUpperCase().replace(/-$/g, "");

window[storeName].getComponents(["uploader"], function (Uploader) {

    $(function () {

        window.$uploader = Scope.render(
            <Uploader url="http://127.0.0.1/public/mp.php/upload/upload"/>,
            document.getElementById("container")
        );

    });
});