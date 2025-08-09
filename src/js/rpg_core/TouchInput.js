//=============================================================================
// TouchInput
//=============================================================================

function TouchInput() {
    throw new Error('This is a static class');
}

TouchInput.initialize = function() {
    this.clear();
    this._setupEventHandlers();
};

TouchInput.keyRepeatWait = 24;
TouchInput.keyRepeatInterval = 6;

TouchInput.clear = function() {
    this._mousePressed = false;
    this._screenPressed = false;
    this._pressedTime = 0;
    this._events = {};
    this._events.triggered = false;
    this._events.cancelled = false;
    this._events.moved = false;
    this._events.released = false;
    this._events.wheelX = 0;
    this._events.wheelY = 0;
    this._x = 0;
    this._y = 0;
    this._date = 0;
};

TouchInput.update = function() {
    if (this.isPressed()) {
        this._pressedTime++;
    }
    this._events.triggered = this._pressedTime === 1;
    this._events.cancelled = false;
    this._events.moved = false;
    this._events.released = false;
    this._events.wheelX = 0;
    this._events.wheelY = 0;
};

TouchInput.isPressed = function() {
    return this._mousePressed || this._screenPressed;
};

TouchInput.isTriggered = function() {
    return this._events.triggered;
};

TouchInput.isRepeated = function() {
    return (this.isPressed() &&
            (this._events.triggered ||
             (this._pressedTime >= this.keyRepeatWait &&
              this._pressedTime % this.keyRepeatInterval === 0)));
};

TouchInput.isLongPressed = function() {
    return this.isPressed() && this._pressedTime >= this.keyRepeatWait;
};

TouchInput.isCancelled = function() {
    return this._events.cancelled;
};

TouchInput.isMoved = function() {
    return this._events.moved;
};

TouchInput.isReleased = function() {
    return this._events.released;
};

TouchInput.wheelX = 0;
TouchInput.wheelY = 0;
TouchInput.x = 0;
TouchInput.y = 0;
TouchInput.date = 0;

TouchInput._setupEventHandlers = function() {
    var isSupportPassive = false;
    try {
        var options = Object.defineProperty({}, 'passive', {
            get: function() {
                isSupportPassive = true;
            }
        });
        window.addEventListener('test', null, options);
    } catch (e) {
    }
    var passive = isSupportPassive ? { passive: false } : false;
    document.addEventListener('mousedown', this._onMouseDown.bind(this));
    document.addEventListener('mousemove', this._onMouseMove.bind(this));
    document.addEventListener('mouseup', this._onMouseUp.bind(this));
    document.addEventListener('wheel', this._onWheel.bind(this), passive);
    document.addEventListener('touchstart', this._onTouchStart.bind(this), passive);
    document.addEventListener('touchmove', this._onTouchMove.bind(this), passive);
    document.addEventListener('touchend', this._onTouchEnd.bind(this));
    document.addEventListener('touchcancel', this._onTouchCancel.bind(this));
};

TouchInput._onMouseDown = function(event) {
    if (event.button === 0) {
        this._onTrigger(event.pageX, event.pageY);
    } else if (event.button === 2) {
        this._onCancel(event.pageX, event.pageY);
    }
};

TouchInput._onMouseMove = function(event) {
    if (this._mousePressed) {
        this._onMove(event.pageX, event.pageY);
    }
};

TouchInput._onMouseUp = function(event) {
    if (event.button === 0) {
        this._onRelease(event.pageX, event.pageY);
    }
};

TouchInput._onWheel = function(event) {
    this._events.wheelX += event.deltaX;
    this._events.wheelY += event.deltaY;
    event.preventDefault();
};

TouchInput._onTouchStart = function(event) {
    if (event.touches.length === 1) {
        var touch = event.touches[0];
        this._onTrigger(touch.pageX, touch.pageY);
    } else if (event.touches.length >= 2) {
        var touch = event.touches[0];
        this._onCancel(touch.pageX, touch.pageY);
    }
};

TouchInput._onTouchMove = function(event) {
    var touch = event.touches[0];
    this._onMove(touch.pageX, touch.pageY);
};

TouchInput._onTouchEnd = function(event) {
    var touch = event.changedTouches[0];
    this._onRelease(touch.pageX, touch.pageY);
};

TouchInput._onTouchCancel = function(event) {
    this._screenPressed = false;
};

TouchInput._onTrigger = function(x, y) {
    this._mousePressed = true;
    this._screenPressed = true;
    this._pressedTime = 0;
    this._onMove(x, y);
};

TouchInput._onCancel = function(x, y) {
    this._screenPressed = false;
    this._events.cancelled = true;
    this._x = x;
    this._y = y;
};

TouchInput._onMove = function(x, y) {
    this._x = x;
    this._y = y;
    this._events.moved = true;
};

TouchInput._onRelease = function(x, y) {
    this._mousePressed = false;
    this._screenPressed = false;
    this._events.released = true;
    this._x = x;
    this._y = y;
};

Object.defineProperty(TouchInput, 'wheelX', {
    get: function() { return this._events.wheelX; },
    configurable: true
});

Object.defineProperty(TouchInput, 'wheelY', {
    get: function() { return this._events.wheelY; },
    configurable: true
});

Object.defineProperty(TouchInput, 'x', {
    get: function() { return this._x; },
    configurable: true
});

Object.defineProperty(TouchInput, 'y', {
    get: function() { return this._y; },
    configurable: true
});

Object.defineProperty(TouchInput, 'date', {
    get: function() { return this._date; },
    configurable: true
});
