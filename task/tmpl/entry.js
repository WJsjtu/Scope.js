module.exports = function (dtd) {
    require(["./index"], function (component) {
        dtd.resolve(component);
    });
    return dtd.promise();
};