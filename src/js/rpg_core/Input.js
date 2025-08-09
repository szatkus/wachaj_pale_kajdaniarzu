//=============================================================================
// Input
//=============================================================================

function Input() {
    throw new Error('This is a static class');
}

Input.initialize = function() {
    this.clear();
    this._wrapNwjsAlert();
    this._setupEventHandlers();
};

Input.keyMapper = {
    9: 'tab',       // tab
    13: 'ok',       // enter
    16: 'shift',    // shift
    17: 'control',  // control
    18: 'alt',      // alt
    27: 'escape',   // escape
    32: 'ok',       // space
    33: 'pageup',   // pageup
    34: 'pagedown', // pagedown
    37: 'left',     // left arrow
    38: 'up',       // up arrow
    39: 'right',    // right arrow
    40: 'down',     // down arrow
    45: 'escape',   // insert
    81: 'pageup',   // Q
    87: 'pagedown', // W
    88: 'escape',   // X
    90: 'ok',       // Z
    96: 'escape',   // numpad 0
    98: 'down',     // numpad 2
    100: 'left',    // numpad 4
    102: 'right',   // numpad 6
    104: 'up',      // numpad 8
    120: 'debug'    // F9
};

Input.gamepadMapper = {
    0: 'ok',        // A
    1: 'cancel',    // B
    2: 'shift',     // X
    3: 'menu',      // Y
    4: 'pageup',    // LB
    5: 'pagedown',  // RB
    12: 'up',       // D-pad up
    13: 'down',     // D-pad down
    14: 'left',     // D-pad left
    15: 'right',    // D-pad right
};

Input.clear = function() {
    this._currentState = {};
    this._previousState = {};
    this._gamepadStates = [];
    this._latestButton = null;
    this._pressedTime = 0;
    this._dir4 = 0;
    this._dir8 = 0;
    this._preferredAxis = '';
    this._date = 0;
};

Input.update = function() {
    this._pollGamepads();
    if (this._currentState[this._latestButton]) {
        this._pressedTime++;
    } else {
        this._latestButton = null;
    }
    for (var name in this._currentState) {
        if (this._currentState[name] && !this._previousState[name]) {
            this._latestButton = name;
            this._pressedTime = 0;
            this._date = Date.now();
        }
        this._previousState[name] = this._currentState[name];
    }
    this._updateDirection();
};

Input.isPressed = function(keyName) {
    if (this._isEscapeCompatible(keyName) && this.isPressed('escape')) {
        return true;
    } else {
        return !!this._currentState[keyName];
    }
};

Input.isTriggered = function(keyName) {
    if (this._isEscapeCompatible(keyName) && this.isTriggered('escape')) {
        return true;
    } else {
        return this._latestButton === keyName && this._pressedTime === 0;
    }
};

Input.isRepeated = function(keyName) {
    if (this._isEscapeCompatible(keyName) && this.isRepeated('escape')) {
        return true;
    } else {
        return (this._latestButton === keyName &&
                (this._pressedTime === 0 ||
                 (this._pressedTime >= this.keyRepeatWait &&
                  this._pressedTime % this.keyRepeatInterval === 0)));
    }
};

Input.isLongPressed = function(keyName) {
    if (this._isEscapeCompatible(keyName) && this.isLongPressed('escape')) {
        return true;
    } else {
        return (this._latestButton === keyName &&
                this._pressedTime >= this.keyRepeatWait);
    }
};

Input.dir4 = 0;
Input.dir8 = 0;
Input.keyRepeatWait = 24;
Input.keyRepeatInterval = 6;

Input._wrapNwjsAlert = function() {
    if (Utils.isNwjs()) {
        var _alert = window.alert;
        window.alert = function() {
            var gui = require('nw.gui');
            var win = gui.Window.get();
            _alert.apply(this, arguments);
            win.focus();
            Input.clear();
        };
    }
};

Input._setupEventHandlers = function() {
    document.addEventListener('keydown', this._onKeyDown.bind(this));
    document.addEventListener('keyup', this._onKeyUp.bind(this));
    window.addEventListener('blur', this._onLostFocus.bind(this));
};

Input._onKeyDown = function(event) {
    if (this._shouldPreventDefault(event.keyCode)) {
        event.preventDefault();
    }
    if (event.keyCode === 144) {    // Numlock
        this.clear();
    }
    var buttonName = this.keyMapper[event.keyCode];
    if (buttonName) {
        this._currentState[buttonName] = true;
    }
};

Input._shouldPreventDefault = function(keyCode) {
    switch (keyCode) {
    case 8:     // backspace
    case 33:    // pageup
    case 34:    // pagedown
    case 37:    // left arrow
    case 38:    // up arrow
    case 39:    // right arrow
    case 40:    // down arrow
        return true;
    }
    return false;
};

Input._onKeyUp = function(event) {
    var buttonName = this.keyMapper[event.keyCode];
    if (buttonName) {
        this._currentState[buttonName] = false;
    }
    if (event.keyCode === 0) {  // For QtWebEngine on OS X
        this.clear();
    }
};

Input._onLostFocus = function() {
    this.clear();
};

Input._pollGamepads = function() {
    if (navigator.getGamepads) {
        var gamepads = navigator.getGamepads();
        if (gamepads) {
            for (var i = 0; i < gamepads.length; i++) {
                var gamepad = gamepads[i];
                if (gamepad && gamepad.connected) {
                    this._updateGamepadState(gamepad);
                }
            }
        }
    }
};

Input._updateGamepadState = function(gamepad) {
    var lastState = this._gamepadStates[gamepad.index] || [];
    var newState = [];
    var buttons = gamepad.buttons;
    for (var i = 0; i < buttons.length; i++) {
        newState[i] = buttons[i].pressed;
    }
    if (lastState.length !== newState.length) {
        lastState = new Array(newState.length).fill(false);
    }
    for (var j = 0; j < newState.length; j++) {
        if (newState[j] !== lastState[j]) {
            var buttonName = this.gamepadMapper[j];
            if (buttonName) {
                this._currentState[buttonName] = newState[j];
            }
        }
    }
    this._gamepadStates[gamepad.index] = newState;
};

Input._updateDirection = function() {
    var x = this._signX();
    var y = this._signY();

    this._dir8 = this._makeNumpadDirection(x, y);

    if (x !== 0 && y !== 0) {
        if (this._preferredAxis === 'x') {
            y = 0;
        } else {
            x = 0;
        }
    } else if (x !== 0) {
        this._preferredAxis = 'y';
    } else if (y !== 0) {
        this._preferredAxis = 'x';
    }

    this._dir4 = this._makeNumpadDirection(x, y);
};

Input._signX = function() {
    var x = 0;
    if (this.isPressed('left')) {
        x--;
    }
    if (this.isPressed('right')) {
        x++;
    }
    return x;
};

Input._signY = function() {
    var y = 0;
    if (this.isPressed('up')) {
        y--;
    }
    if (this.isPressed('down')) {
        y++;
    }
    return y;
};

Input._makeNumpadDirection = function(x, y) {
    if (x !== 0 || y !== 0) {
        return  5 - y * 3 + x;
    }
    return 0;
};

Input._isEscapeCompatible = function(keyName) {
    return keyName === 'cancel' || keyName === 'menu';
};

Object.defineProperty(Input, 'date', {
    get: function() { return this._date; },
    configurable: true
});
