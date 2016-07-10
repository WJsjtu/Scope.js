const Table = require("./../../../src/component/table/index");

$(function () {

    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    const tableScope = Scope.render(
        <Table labels={numbers}>
            {function () {
                return numbers.map(function (number) {
                    const children = numbers.map(function (_number) {
                        return <td style="text-align: center;">{`${number}*${_number} = ${number * _number}`}</td>;
                    });
                    return (
                        <tr>{children}</tr>
                    );
                });
            }}
        </Table>,
        document.getElementById("container")
    ).context;
});