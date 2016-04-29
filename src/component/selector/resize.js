const AutoSizeInputOptions = (function () {
    function AutoSizeInputOptions(space) {
        if (typeof space === "undefined") {
            space = 30;
        }
        this.space = space;
    }

    return AutoSizeInputOptions;
})();

let isModernBrowser = true;

(function () {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.match(/msie ([\d.]+)/) != null) {//ie6--ie9
        uaMatch = userAgent.match(/msie ([\d.]+)/);
        return (isModernBrowser = false);
    } else if (userAgent.match(/(trident)\/([\w.]+)/)) {
        uaMatch = userAgent.match(/trident\/([\w.]+)/);
        switch (uaMatch[1]) {
            case "4.0":
            case "5.0":
                isModernBrowser = false;
                break;
            case "6.0":
            case "7.0":
                isModernBrowser = true;
                break;
            default:
                isModernBrowser = false;
        }
    }
})();

var AutoSizeInput = (function () {
    function AutoSizeInput(input, options) {
        const me = this;
        me._input = $(input);
        me._options = $.extend({}, AutoSizeInput.getDefaultOptions(), options);

        // Init mirror
        me._mirror = $('<span style="position:absolute; top:-999px; left:0; white-space:pre;"/>');

        // Copy to mirror
        $.each(['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'textTransform', 'wordSpacing', 'textIndent'], function (i, val) {
            me._mirror[0].style[val] = me._input.css(val);
        });
        $("body").append(me._mirror);

        // Bind events - change update paste click mousedown mouseup focus blur
        // IE 9 need keydown to keep updating while deleting (keeping backspace in - else it will first update when backspace is released)
        // IE 9 need keyup incase text is selected and backspace/deleted is hit - keydown is to early
        // How to fix problem with hitting the delete "X" in the box - but not updating!? mouseup is apparently to early
        // Could bind separatly and set timer
        // Add so it automatically updates if value of input is changed http://stackoverflow.com/a/1848414/58524
        me._input.on("keydown keyup input propertychange change", function (e) {
            me.update();
            if (typeof options.onChange == "function") {
                options.onChange.call(this, e);
            }
        });

        // Update
        me.update();
    }

    const AutoSizeInputPrototype = AutoSizeInput.prototype;

    AutoSizeInputPrototype.updateMirror = function () {
        const me = this;
        // Copy to mirror
        $.each(['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'textTransform', 'wordSpacing', 'textIndent'], function (i, val) {
            me._mirror[0].style[val] = me._input.css(val);
        });
    };

    AutoSizeInputPrototype.getOptions = function () {
        return this._options;
    };

    AutoSizeInputPrototype.update = function () {

        const me = this;
        var value = me._input.val() || "";

        if (value === me._mirror.text()) {
            // Nothing have changed - skip
            return;
        }

        // Update mirror
        me._mirror.text(value);

        // Calculate the width
        let newWidth = me._mirror.width() + me._options.space;

        const fontSize = parseInt(me._mirror[0].style['fontSize']);

        if (!isModernBrowser && newWidth > fontSize * 6) {
            newWidth += fontSize + 1;
        }

        // Update the width
        me._input.width(newWidth);
    };

    AutoSizeInput.getDefaultOptions = function () {
        return this._defaultOptions;
    };

    AutoSizeInput.getInstanceKey = function () {
        // Use camelcase because .data()['autosize-input-instance'] will not work
        return "AutoSizeInputInstance";
    };
    AutoSizeInput._defaultOptions = new AutoSizeInputOptions();
    return AutoSizeInput;
})();

module.exports = function ($ele, options) {
    const validTypes = ["text", "password", "search", "url", "tel", "email", "number"];
    $ele.each(function () {
        // Make sure it is only applied to input elements of valid type
        // Or let it be the responsibility of the programmer to only select and apply to valid elements?
        if (!(this.tagName == "INPUT" && $.inArray(this.type, validTypes) > -1)) {
            // Skip - if not input and of valid type
            return;
        }

        const $this = $(this);

        if (!$this.data(AutoSizeInput.getInstanceKey())) {
            // Create and attach instance
            $this.data(AutoSizeInput.getInstanceKey(), new AutoSizeInput(this, options));
        }
    });
};