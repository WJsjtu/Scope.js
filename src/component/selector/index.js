const resizeInput = require("./resize");
const Scope = require("Scope");
const ScopeUtils = Scope.utils;
const {getRefs} = ScopeUtils;

require('./style.less');

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
    width: 315,
    lineHeight: 30,
    fontSize: 14,
    $input: null,
    $wrapper: null,
    autoSizeInput: null,
    updateSize: function (width) {
        const me = this;
        me.width = width;
        me.lineHeight = Math.floor(width / 10.5);
        me.fontSize = Math.floor(width * 2 / 45);
    },
    afterMount: function ($component) {
        const me = this, refs = getRefs($component);
        me.$input = refs.input.css({
            height: me.lineHeight + "px",
            "line-height": me.lineHeight + "px",
            "font-size": me.fontSize + "px"
        });
        me.$input.parent().css({
            "line-height": (me.lineHeight - 4) + "px",
            "font-size": me.fontSize + "px"
        });
        me.$wrapper = refs.wrapper.css({
            width: me.width,
            "line-height": me.lineHeight + "px",
            "font-size": me.fontSize + "px"
        });

        resizeInput(me.$input, {
            space: 5,
            onChange: function (e) {
            }
        });
        me.autoSizeInput = me.$input.data("AutoSizeInputInstance");
    },

    inputFocus: function () {
        const me = this, $input = me.$input;
        if ($input.parent().hasClass('focused')) {
            return;
        }
        $input.parent().addClass('focused');
        $input.focus();
        const onBlur = function (event) {
            if (isOutside([me.$wrapper[0]], event)) {
                $input.parent().removeClass('focused');
                //$handler.refs.picker.$ele.hide();
                $(document).off('click', onBlur);
            }
        };
        $(document).on('click', onBlur);
    },

    onFocus: function ($this, event) {
        ScopeUtils.stopPropagation(event);
        this.inputFocus();
    },
    onKeyDown: function ($this, event) {
        ScopeUtils.stopPropagation(event);
        event = event || window.event;
        const me = this;
        const code = event.keyCode || event.which || event.charCode;
        const value = $this.val();
        const $item = $(`<div class="text"><div class="label">${value}</div><div class="delete">×</div></div>`);
        if (code == 13) {
            $this.before($item);
            $this.val('');
            $item.on('click', 'div.delete', function (_event) {
                ScopeUtils.stopPropagation(_event);
                $item.remove();
                me.inputFocus();
            });
            $item.on('click', 'div.label', function (_event) {
                ScopeUtils.stopPropagation(_event);
                me.$input.val($(this).html());
                $item.remove();
                me.inputFocus();
                me.autoSizeInput.update();
            });
        }
    },
    render: function () {
        const me = this;
        return (
            <div class="selector" ref="wrapper" onClick={me.onFocus}>
                <div class="input">
                    <input ref="input" onKeydown={me.onKeyDown}/>
                </div>
            </div>
        );
    }
});