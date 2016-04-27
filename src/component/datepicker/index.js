const Picker = require("./picker");

require("./style.less");

const isOutside = function (elements, event) {
    let eventTarget = (event.target) ? event.target : event.srcElement;
    if (eventTarget.parentElement == null && eventTarget != document.body.parentElement) {
        return false;
    }
    while (eventTarget != null) {
        if (elements.indexOf(eventTarget) != -1) return false;
        eventTarget = eventTarget.parentElement;
    }
    return true;
};

module.exports = Scope.createClass({
    $input: null,
    width: 315,
    lineHeight: 30,
    fontSize: 14,
    updateSize: function (width) {
        const me = this;
        me.width = width;
        me.lineHeight = Math.floor(width / 10.5);
        me.fontSize = Math.floor(width * 2 / 45);
    },
    afterMount: function (component) {
        const me = this;
        me.$input = component.refs.input.$ele;
        me.props.width && me.updateSize(me.props.width);
        if (me.props.date) {
            const {year, month, day} = me.props.date;
            me.$input.text(`${year}年${month}月${day}日`);
        }
        me.$input.css({
            "line-height": me.lineHeight + "px",
            "font-size": me.fontSize + "px"
        }).parent().css({
            width: me.width
        });
        component.refs.wrapper.$ele.css({
            width: me.width
        });
    },
    onSelect: function (year, month, day) {
        const me = this;
        me.$input && me.$input.text(`${year}年${month}月${day}日`);
        if (typeof me.props.onSelect == "function") {
            me.props.onSelect(year, month, day);
        }
    },
    onFocus: function ($handler, event) {
        $handler.stopPropagation(event);
        const me = this;
        me.$input.parent().addClass('focused');
        $handler.refs.picker.$ele.show();
        const onBlur = function (_event) {
            if (isOutside([$handler.refs.wrapper.$ele[0]], _event)) {
                me.$input.parent().removeClass('focused');
                $handler.refs.picker.$ele.hide();
                $(document).off('click', onBlur);
            }
        };
        $(document).on('click', onBlur);
    },
    render: function () {
        const me = this;
        return (
            <div class="datepicker" ref="wrapper">
                <div class="input" onClick={me.onFocus}>
                    <span ref="input"> </span>
                </div>
                <Picker date={me.props.date} width={me.props.width} dayRule={me.props.dayRule} ref="picker"
                        onSelect={me.onSelect}/>
            </div>
        );
    }
});