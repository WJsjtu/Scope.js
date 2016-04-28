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
        } else {
            me.$input.text('请选择...');
        }

        const style = {
            "line-height": me.lineHeight + "px",
            "font-size": me.fontSize + "px"
        };
        me.$input.css(style);
        component.refs.picker.refs.table.$ele.css(style);
        component.refs.wrapper.$ele.css({
            width: me.width
        });
    },
    afterUpdate: function () {
        this.afterMount();
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
                <Picker ref="picker"
                        date={me.props.date}
                        dayRule={me.props.dayRule}
                        onSelect={me.onSelect}/>
            </div>
        );
    }
});