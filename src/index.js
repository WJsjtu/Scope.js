const Scope = require('Scope');

const List = Scope.createClass({
    data: [],
    getRandom: function () {
        this.data = [];
        for (let i = 0; i < 20; i++) {
            this.data.push(Math.random());
        }
    },
    generate: function ($handler, event) {
        $handler.stopPropagation(event);
        this.getRandom();
        const $ul2DataElement = $handler.refs.ul2.update();
    },
    onActive: {
        'li': function ($handler, event) {
            $handler.stopPropagation(event);
            console.log($handler);
            $handler.ownerRef.$ele.find('li.active').removeClass('active');
            $handler.$this.addClass('active');
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
        console.log(me);
        me.getRandom();
        return (
            <div>
                <a onClick={me.generate}>{me.props.label || 'try'}</a>
                <div>
                    <ul ref="ul1" style="display:inline-block;list-style:none;*zoom:1;*display:inline;"
                        onClick={me.onActive}>
                        {me.getList()}
                    </ul>
                    <ul ref="ul2" style="display:inline-block;list-style:none;*zoom:1;*display:inline;"
                        onClick={me.onActive}>
                        {me.getList}
                    </ul>
                </div>
            </div>
        );
    }
});

const Wrapper = Scope.createClass({
    tryout: function ($handler) {
        console.log($handler)
    },
    render: function () {
        const me = this;
        return (
            <div>
                <a onClick={me.tryout}>tryout</a>
                <List ref="List"/>
            </div>
        );
    }
});

$(function () {
    window.List = List;
    const a = Scope.render(
        <div class="hehe">
            <Wrapper ref="fds"/>
            <List label='label'/>
        </div>,
        document.getElementById('test1')
    );
    const b = Scope.render(
        <Wrapper ref="fds"/>,
        document.getElementById('test2')
    );
    console.log(List, a, b);
});