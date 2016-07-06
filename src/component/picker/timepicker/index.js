const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {getScope} = ScopeUtils;
const Picker = require("./picker");
const {NAMESPACE} = require("./../../../project");
const isOutside = require("./../outside");
const fixTwo = require("./../fixTwo");
require("./style.less");

module.exports = Scope.createClass({
    style: {
        width: "315px",
        lineHeight: "30px",
        fontSize: "14px"
    },
    time: null,
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
        if (me.props.time) {
            const {hour, minute, second} = me.props.time;
            me.time = {hour, minute, second};
        }
    },
    afterMount: function () {
        const me = this,
            _lineHeight = parseFloat(me.style.lineHeight),
            _width = parseFloat(me.style.width),
            outerWidth = _width * 2;

        me.refs.wrapper.css({
            width: _width
        });
        me.refs.scroll.css({
            width: outerWidth
        });
        me.refs.input.parent().css(me.style);

        getScope(me.refs.picker).$ele.css({
            width: me.style.width,
            fontSize: me.style.fontSize,
            float: "left"
        });


        const $content = getScope(me.refs.picker).refs.content.css({
            marginTop: _lineHeight * 0.1 - 1
        });
        $content.find(".cell").css({
            height: _lineHeight * 0.8 + 2,
            lineHeight: (_lineHeight * 0.8) + "px"
        });
        $content.find("input").css({
            width: _width * 2 / 21,
            height: _lineHeight * 0.8
        });
        $content.find(".separator").css({
            width: _width * 4 / 63,
            height: _lineHeight * 0.8
        });
        const cellArrow = $content.find(".cell-arrow").css({
            width: _width * 4 / 63
        });

        cellArrow.find(".arrow").css({
            borderWidth: _width / 63
        });
        cellArrow.find(".up").css({
            height: _lineHeight * 0.4 + 1
        });
        cellArrow.find(".down").css({
            height: _lineHeight * 0.4 + 1
        });
        if (me.time) {
            const {hour, minute, second} = me.time;
            me.refs.input.text(`${fixTwo(hour)}点${fixTwo(minute)}分${fixTwo(second)}秒`);
        } else {
            me.refs.input.text("请选择...");
        }
        if (me.props.zIndex && !isNaN(+me.props.zIndex)) {
            me.refs.picker.css({
                zIndex: +me.props.zIndex
            });
        }
    },
    afterUpdate: function () {
        this.afterMount();
    },
    onSelect: function (hour, minute, second) {
        const me = this;
        me.time = {hour, minute, second};
        if (me.refs.input) {
            me.refs.input.text(`${fixTwo(hour)}点${fixTwo(minute)}分${fixTwo(second)}秒`);
        }
        if (ScopeUtils.isFunction(me.props.onSelect)) {
            me.props.onSelect(hour, minute, second);
        }
    },
    onFocus: function (event) {
        ScopeUtils.stopPropagation(event);
        const me = this, _width = parseFloat(me.style.width);
        me.refs.wrapper.addClass('focused');
        me.refs.scroll.animate({
            marginLeft: -_width
        }, 200);
        const onBlur = function (_event) {
            if (isOutside([me.refs.wrapper[0]], _event)) {
                me.refs.wrapper.removeClass('focused');
                me.refs.scroll.animate({
                    marginLeft: 0
                }, 200);
                $(document).off('click', onBlur);
            }
        };
        $(document).on('click', onBlur);
    },
    render: function () {
        const me = this;
        return (
            <div class={NAMESPACE + "timepicker"} ref="wrapper" onClick={me.onFocus}>
                <div ref="scroll">
                    <div class="input">
                        <span ref="input"> </span>
                    </div>
                    <Picker ref="picker"
                            time={me.time}
                            onSelect={me.onSelect.bind(me)}/>
                    <div style="clear: both;"></div>
                </div>
            </div>
        );
    }
});