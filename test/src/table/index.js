const Scope = require("Scope");
const {NAMESPACE} = require("./../../../src/project");
const storeName = NAMESPACE.toUpperCase().replace(/-$/g, "");

window[storeName].getComponents(["page", "table"], function (Page, Table) {
    const {Row, Cell} = Table;
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
            const data = requestData.data;
            if (!Array.isArray(data)) {
                return [];
            }
            return data.map(function (item) {
                return (
                    <Row>
                        <Cell>{item.uid}</Cell>
                        <Cell>{item.timestamp}</Cell>
                        <Cell>{item.rand}</Cell>
                        <Cell>{item.text}</Cell>
                    </Row>
                );
            });

        };

        const onSort = function (index, order) {
            const keys = ["uid", "timestamp", "rand", "text"];
            return function (a, b) {
                if (a[keys[index]] < b[keys[index]]) {
                    return -1 * order;
                }
                if (a[keys[index]] > b[keys[index]]) {
                    return 1 * order;
                }
                return 0;
            };
        };

        Scope.render(
            <Page cid="1"
                  request={{
                        url: "http://localhost/public/mp.php/user/test",
                        method: "post",
                        dataType: "json",
                        timeout : 3000
                   }}
                  filter={function(data){
                        return data.data;
                   }}
                  pagination={{page: 1, total: 1, size: 15}}
                  table={{labels: labels, height: 400, onSort: onSort}}
                  dataRender={dataRender}
                  disableHistory={false}
            />,
            document.getElementById("container")
        );
    });
});

/*
 public function test()
 {
 sleep(1);
 header('Access-Control-Allow-Origin: *');

 $word = isset($_POST["word"]) ? $_POST["word"] : "";
 $page = isset($_POST["page"]) ? $_POST["page"] : 1;
 $size = isset($_POST["size"]) ? $_POST["size"] : 20;

 $response = array();

 $response["total"] = 15580;
 $response["size"] = $size;

 $data = array();

 for ($i = 0; $i < $size; $i++) {
 array_push($data, array(
 "uid" => $this->uid(),
 "timestamp" => microtime(),
 "rand" => rand(0, 1e9) / 1e9,
 "text" => $page . "-" . $i . "-" . $word
 ));
 }

 $response["data"] = $data;

 die(json_encode([
 'errCode' => 0,
 "data" => $response
 ]));
 }
 */