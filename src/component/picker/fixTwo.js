module.exports = function (number) {
    number = +number;
    if (isNaN(number)) {
        return "--";
    }
    number = number < 0 ? -number : number;
    if (number >= 10) {
        return "" + number;
    } else {
        return "0" + number;
    }
};
