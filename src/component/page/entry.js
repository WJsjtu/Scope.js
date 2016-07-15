module.exports = function (dtd) {
    const {NAMESPACE} = require("./../../project");
    const storeName = NAMESPACE.toUpperCase().replace(/-$/g, "");
    window[storeName].getComponents(["pagination", "table"], function (Pagination, Table) {
        require(["./index"], function (page) {
            dtd.resolve(page(Pagination, Table));
        });
    });
    return dtd.promise();
};