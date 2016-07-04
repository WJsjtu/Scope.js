const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {getScope} = ScopeUtils;
const Picker = require("./picker");
const {NAMESPACE} = require("./../../../project");

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
    style: {
        width: "315px",
        lineHeight: "30px",
        fontSize: "14px"
    },
    date: null,
    updateSize: function (width) {
        this.style = {
            width: width + "px",
            lineHeight: Math.floor(width / 10.5) + "px",
            fontSize: Math.floor(width * 2 / 45) + "px"
        };
    },
    beforeMount: function () {
        const me = this, width = +me.props.width;
        if (!isNaN(width) && width > 0) {
            me.updateSize(width);
        }
        if (me.props.date) {
            const {year, month, day} = me.props.date;
            me.date = {year, month, day};
        }
    },
    afterMount: function () {
        const me = this;
        me.refs.input.css(me.style);
        me.refs.wrapper.css(me.style);
        getScope(me.refs.picker).refs.table.css(me.style);
        if (me.date) {
            const {year, month, day} = me.date;
            me.refs.input.text(`${year}年${month}月${day}日`);
        } else {
            me.refs.input.text("请选择...");
        }
    },
    afterUpdate: function () {
        this.afterMount();
    },
    onSelect: function (year, month, day) {
        const me = this;
        me.date = {year, month, day};
        if (me.refs.input) {
            me.refs.input.text(`${year}年${month}月${day}日`);
        }
        if (typeof me.props.onSelect == "function") {
            me.props.onSelect(year, month, day);
        }
    },
    onFocus: function (event) {
        ScopeUtils.stopPropagation(event);
        const me = this;
        me.refs.input.parent().addClass('focused');
        me.refs.picker.show();
        const onBlur = function (_event) {
            if (isOutside([me.refs.wrapper[0]], _event)) {
                me.refs.input.parent().removeClass('focused');
                me.refs.picker.hide();
                $(document).off('click', onBlur);
            }
        };
        $(document).on('click', onBlur);
    },
    render: function () {
        const me = this;
        return (
            <div class={NAMESPACE + "datepicker"} ref="wrapper">
                <div class="input" onClick={me.onFocus}>
                    <span ref="input"> </span>
                </div>
                <Picker ref="picker"
                        date={me.date}
                        dayRule={me.props.dayRule}
                        onSelect={me.onSelect.bind(me)}/>
            </div>
        );
    }
});