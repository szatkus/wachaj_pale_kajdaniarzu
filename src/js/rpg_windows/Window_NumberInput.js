//=============================================================================
// Window_NumberInput
//=============================================================================

function Window_NumberInput() {
    this.initialize.apply(this, arguments);
}

Window_NumberInput.prototype = Object.create(Window_Selectable.prototype);
Window_NumberInput.prototype.constructor = Window_NumberInput;

Window_NumberInput.prototype.initialize = function(messageWindow) {
    this._messageWindow = messageWindow;
    Window_Selectable.prototype.initialize.call(this, 0, 0, 0, 0);
    this._number = 0;
    this._maxDigits = 1;
    this.openness = 0;
    this.deactivate();
    this.createButtons();
};

Window_NumberInput.prototype.start = function() {
    this._maxDigits = $gameMessage.numInputMaxDigits();
    this._number = $gameVariables.value($gameMessage.numInputVariableId());
    this._number = this._number.clamp(0, Math.pow(10, this._maxDigits) - 1);
    this.updatePlacement();
    this.placeButtons();
    this.updateButtonsVisiblity();
    this.createContents();
    this.refresh();
    this.open();
    this.activate();
    this.select(0);
};

Window_NumberInput.prototype.updatePlacement = function() {
    var messageY = this._messageWindow.y;
    var spacing = 8;
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    this.x = (Graphics.boxWidth - this.width) / 2;
    if (messageY >= Graphics.boxHeight / 2) {
        this.y = messageY - this.height - spacing;
    } else {
        this.y = messageY + this._messageWindow.height + spacing;
    }
};

Window_NumberInput.prototype.windowWidth = function() {
    return this.maxCols() * this.itemWidth() + this.padding * 2;
};

Window_NumberInput.prototype.windowHeight = function() {
    return this.fittingHeight(1);
};

Window_NumberInput.prototype.maxCols = function() {
    return this._maxDigits;
};

Window_NumberInput.prototype.maxItems = function() {
    return this._maxDigits;
};

Window_NumberInput.prototype.spacing = function() {
    return 0;
};

Window_NumberInput.prototype.itemWidth = function() {
    return 32;
};

Window_NumberInput.prototype.createButtons = function() {
    var bitmap = ImageManager.loadSystem('ButtonSet');
    var buttonWidth = 48;
    var buttonHeight = 48;
    this._buttons = [];
    for (var i = 0; i < 3; i++) {
        var button = new Sprite_Button();
        var x = buttonWidth * [1, 2, 4][i];
        var w = buttonWidth;
        var h = buttonHeight;
        button.bitmap = bitmap;
        button.setColdFrame(x, 0, w, h);
        button.setHotFrame(x, h, w, h);
        button.visible = false;
        this._buttons.push(button);
        this.addChild(button);
    }
    this._buttons[0].setClickHandler(this.onButtonDown.bind(this));
    this._buttons[1].setClickHandler(this.onButtonUp.bind(this));
    this._buttons[2].setClickHandler(this.onButtonOk.bind(this));
};

Window_NumberInput.prototype.placeButtons = function() {
    var numButtons = this._buttons.length;
    var spacing = 16;
    var totalWidth = -spacing;
    for (var i = 0; i < numButtons; i++) {
        totalWidth += this._buttons[i].width + spacing;
    }
    var x = (this.width - totalWidth) / 2;
    for (var j = 0; j < numButtons; j++) {
        var button = this._buttons[j];
        button.x = x;
        button.y = this.height - button.height - 4;
        x += button.width + spacing;
    }
};

Window_NumberInput.prototype.updateButtonsVisiblity = function() {
    if (TouchInput.isPressed()) {
        for (var i = 0; i < this._buttons.length; i++) {
            this._buttons[i].visible = true;
        }
    }
};

Window_NumberInput.prototype.showButtons = function() {
    for (var i = 0; i < this._buttons.length; i++) {
        this._buttons[i].visible = true;
    }
};

Window_NumberInput.prototype.hideButtons = function() {
    for (var i = 0; i < this._buttons.length; i++) {
        this._buttons[i].visible = false;
    }
};

Window_NumberInput.prototype.refresh = function() {
    this.contents.clear();
    this.drawNumber();
};

Window_NumberInput.prototype.drawNumber = function() {
    var x = this.cursorX();
    var y = 0;
    var width = this.cursorWidth();
    this.resetTextColor();
    this.drawText(this._number, x, y, width, 'right');
};

Window_NumberInput.prototype.cursorWidth = function() {
    var digitWidth = this.textWidth('0');
    return this.maxItems() * digitWidth + this.textPadding() * 2;
};

Window_NumberInput.prototype.cursorX = function() {
    return this.contentsWidth() - this.cursorWidth();
};

Window_NumberInput.prototype.processDigitChange = function() {
    if (this.isOpenAndActive()) {
        if (Input.isRepeated('up')) {
            this.changeDigit(true);
        } else if (Input.isRepeated('down')) {
            this.changeDigit(false);
        }
    }
};

Window_NumberInput.prototype.changeDigit = function(up) {
    var index = this.index();
    var place = Math.pow(10, this._maxDigits - 1 - index);
    var n = Math.floor(this._number / place) % 10;
    this._number -= n * place;
    if (up) {
        n = (n + 1) % 10;
    } else {
        n = (n + 9) % 10;
    }
    this._number += n * place;
    this.refresh();
    SoundManager.playCursor();
};

Window_NumberInput.prototype.isOkTriggered = function() {
    return Input.isTriggered('ok');
};

Window_NumberInput.prototype.processOk = function() {
    SoundManager.playOk();
    $gameVariables.setValue($gameMessage.numInputVariableId(), this._number);
    this._messageWindow.terminate();
    this.close();
};

Window_NumberInput.prototype.onButtonUp = function() {
    this.changeDigit(true);
};

Window_NumberInput.prototype.onButtonDown = function() {
    this.changeDigit(false);
};

Window_NumberInput.prototype.onButtonOk = function() {
    this.processOk();
    this.hideButtons();
};
