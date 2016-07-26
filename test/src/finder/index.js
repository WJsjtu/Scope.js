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
                    activePath="server/default/photo"
                    multiple={true}
                    disableHistory={true}
                    onRequestError={onRequestError}
                    onFileSelect={function(files){ console.log("onFileSelect", files); }}
                    onFileDelete={function(files){ console.log("onFileDelete", files); }}
                    onFileUpload={function(path, files){ console.log("onFileUpload", path, files); }}
            />,
            document.getElementById("container"),
            this
        );
    });
});