const traverse = function (sComponent, callback) {
    sComponent.children.forEach(function (child) {
        traverse(child, callback);
    });
    callback(sComponent);
};

module.exports = traverse;