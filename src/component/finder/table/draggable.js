const $document = $(document);

function Draggable($this, options) {
    const me = this;
    me.$this = $this;
    me.isMoving = false;
    me.origin = {
        x: 0,
        y: 0
    };
    me.options = $.extend({}, options);

    me.proxy = {
        onDragStart: me.onDragStart.bind(me),
        onDragMove: me.onDragMove.bind(me),
        onDragEnd: me.onDragEnd.bind(me)
    };

    $this.on("mousedown", me.onMouseDown.bind(me));
}


const DraggablePrototype = Draggable.prototype;
DraggablePrototype.onMouseDown = function (event) {
    event = event || window.event;
    event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
    const me = this;

    if (+(event.button) !== 0) {
        return;
    }

    me.isMoving = false;

    if (me.setCapture) {
        me.setCapture();
    } else if (window.captureEvents) {
        window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
    }
    me.origin = {
        x: event.pageX,
        y: event.pageY
    };

    $document.on("mousemove", me.proxy.onDragMove);
    $document.on("mouseup", me.proxy.onDragEnd);

};

DraggablePrototype.onDragStart = function (event) {
    event = event || window.event;
    const me = this;
    if (typeof me.options.onDragStart == "function") {
        me.options.onDragStart({
            x: event.pageX,
            y: event.pageY
        }, $.extend({}, me.origin));
    }
};

DraggablePrototype.onDragMove = function (event) {
    event = event || window.event;
    const me = this;

    if (!me.isMoving) {
        me.isMoving = true;
        me.proxy.onDragStart(event);
    } else {
        if (typeof me.options.onDragMove == "function") {
            me.options.onDragMove({
                x: event.pageX,
                y: event.pageY
            }, $.extend({}, me.origin));
        }
    }
};

DraggablePrototype.onDragEnd = function (event) {
    event = event || window.event;
    const me = this;

    me.isMoving = false;

    if (me.releaseCapture) {
        me.releaseCapture();
    } else if (window.captureEvents) {
        window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
    }


    $document.off("mousemove", me.proxy.onDragMove);
    $document.off("mouseup", me.proxy.onDragEnd);

    if (typeof me.options.onDragEnd == "function") {
        me.options.onDragEnd({
            x: event.pageX,
            y: event.pageY
        }, $.extend({}, me.origin));
    }
};

DraggablePrototype.stop = function () {

    const me = this;

    me.isMoving = false;

    if (me.releaseCapture) {
        me.releaseCapture();
    } else if (window.captureEvents) {
        window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
    }


    $document.off("mousemove", me.proxy.onDragMove);
    $document.off("mouseup", me.proxy.onDragEnd);
};

module.exports = Draggable;