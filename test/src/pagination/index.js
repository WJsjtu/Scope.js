const Scope = require("Scope");
const {NAMESPACE} = require("./../../../src/project");
const storeName = NAMESPACE.toUpperCase().replace(/-$/g, "");

window[storeName].getComponents(["pagination"], function (Pagination) {
    $(function () {
        const paginationScope = Scope.render(
            <Pagination total={320} size={15} page={2} onPageSelect={function(page){
            console.log(page);
        }}/>,
            document.getElementById("container")
        ).context;

        $("#change").click(function () {
            paginationScope.updateTotal(90);
        });
    });
});
