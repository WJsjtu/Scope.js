const Scope = require("Scope");
const {NAMESPACE} = require("./../../../src/project");
const storeName = NAMESPACE.toUpperCase().replace(/-$/g, "");

window[storeName].getComponents(["finder"], function (Finder) {
    $(function () {

        const onRequestError = function (xhr, retry) {
            console.log(xhr);
            //retry();
        };

        Scope.render(
            <Finder cid="2"
                    request={{
                        url: "http://localhost/public/mp.php/user/explorer",
                        method: "post",
                        dataType: "json",
                        timeout : 3000
                    }}
                    height="400"
                    staticPath="./icons/"
                    disableHistory={true}
                    onRequestError={onRequestError}
                    onFileSelect={function(file){ console.log("onFileSelect", file); }}
                    onFileDelete={function(file){ console.log("onFileDelete", file); }}
            />,
            document.getElementById("container"),
            this
        );
    });
});