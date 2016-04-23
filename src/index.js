const Scope = require('Scope');

const List = Scope.createClass({
    data: [],
    getRandom: function () {
        this.data = [];
        for (let i = 0; i < 20; i++) {
            this.data.push(Math.random());
        }
    },
    updateRightColumn: function ($handler, event) {
        $handler.stopPropagation(event);
        this.getRandom();
        $handler.refs.ul2.update();
    },
    onActive: {
        'li': function ($handler, event) {
            $handler.stopPropagation(event);
            console.log($handler);
            $handler.owner.$ele.find('li.active').removeClass('active');
            $handler.$ele.addClass('active');
        }
    },
    getList: function () {
        return this.data.map(function (ele) {
            return <li onClick={function(){
                console.log(ele);
            }}>{ele}</li>;
        });
    },
    render: function () {
        const me = this;
        me.getRandom();
        return (
            <div>
                <a onClick={me.updateRightColumn}>{me.props.label || 'updateRightColumn'}</a>
                <div>
                    <ul ref="ul1" style="display:inline-block;list-style:none;*zoom:1;*display:inline;margin:0;"
                        onClick={me.onActive}>
                        {me.getList()}
                    </ul>
                    <ul ref="ul2" style="display:inline-block;list-style:none;*zoom:1;*display:inline;margin:0;"
                        onClick={me.onActive}>
                        {me.getList}
                    </ul>
                </div>
            </div>
        );
    }
});

const Wrapper = Scope.createClass({
    update: function ($handler) {
        console.log($handler);
        $handler.refs.List.update();
    },
    reRender: function ($handler) {
        console.log($handler);
        $handler.refs.List.render();
    },
    render: function () {
        const me = this;
        return (
            <div>
                <a onClick={me.update}>update</a>
                <span>&nbsp;|&nbsp;</span>
                <a onClick={me.reRender}>reRender</a>
                <List ref="List"/>
            </div>
        );
    }
});

$(function () {
    window.List = List;
    const mixedDom = Scope.render(
        <div class="hehe">
            <Wrapper ref="fds"/>
            <List label='label'/>
        </div>,
        document.getElementById('test1')
    );
    const compRoot = Scope.render(
        <Wrapper ref="fds"/>,
        document.getElementById('test2')
    );
    console.log(mixedDom, compRoot);
});