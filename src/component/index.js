const {NAMESPACE} = require("./../project");

const storeName = NAMESPACE.toUpperCase().replace(/-$/g, "");

(function (window) {
    if (!window[storeName]) {
        window[storeName] = {};
    }
    window[storeName].getComponents = function (comps, callback) {
        const compEntries = {
            page: require("./page/entry"),
            pagination: require("./pagination/entry"),
            picker: require("./picker/entry"),
            table: require("./table/entry"),
            uploader: require("./uploader/entry")
        };
        const compCaches = {};
        if (Array.isArray(comps)) {
            $.when.apply(this, comps.map(function (comp) {
                if (compCaches[comp]) {
                    return $.Deferred().resolve(compCaches[comp]);
                } else {
                    return $.Deferred(compEntries[comp]).done(function (component) {
                        compCaches[comp] = component;
                    });
                }
            })).done(callback);
        }
    };
})(window);