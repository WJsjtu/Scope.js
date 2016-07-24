const Scope = require("Scope");
const {NAMESPACE} = require("./../../../src/project");
const storeName = NAMESPACE.toUpperCase().replace(/-$/g, "");

window[storeName].getComponents(["finder"], function (Finder) {
    $(function () {

        const labels = [{
            text: "uid",
            width: "30%"
        }, {
            text: "timestamp",
            width: "20%"
        }, {
            text: "rand",
            width: "20%"
        }, {
            text: "text",
            width: "30%"
        }];

        const dataRender = function (requestData) {
            const files = requestData.files;
            if (!Array.isArray(files)) {
                return [];
            }
            return files.map(function (file) {
                return (
                    <div class="finder-row">
                        <div class="finder-cell">{file.uid}</div>
                        <div class="finder-cell">{file.timestamp}</div>
                        <div class="finder-cell">{file.rand}</div>
                        <div class="finder-cell">{file.text}</div>
                    </div>
                );
            });

        };

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
                    filter={function(data){
                    return data.data;
                }}
                    labels={labels}
                    height="400"
                    staticPath="./icons/"
                    dataRender={dataRender}
                    disableHistory={true}
                    onRequestError={onRequestError}
            />,
            document.getElementById("container"),
            this
        );
    });
});