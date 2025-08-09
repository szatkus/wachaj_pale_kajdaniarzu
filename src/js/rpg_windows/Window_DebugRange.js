//=============================================================================
// Window_DebugRange
//=============================================================================

function Window_DebugRange() {
    this.initialize.apply(this, arguments);
}

Window_DebugRange.prototype = Object.create(Window_Selectable.prototype);
Window_DebugRange.prototype.constructor = Window_DebugRange;

Window_DebugRange.prototype.initialize = function(x, y) {
    this._maxSwitches = Math.ceil(($dataSystem.switches.length - 1) / 10);
    this._maxVariables = Math.ceil(($dataSystem.variables.length - 1) / 10);
    var width = this.windowWidth();
    var height = this.windowHeight();
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
    this.setTopRow(Window_DebugRange.lastTopRow);
    this.select(Window_DebugRange.lastIndex);
    this.activate();
};

Window_DebugRange.lastTopRow = 0;
Window_DebugRange.lastIndex = 0;

Window_DebugRange.prototype.windowWidth = function() {
    return 240;
};

Window_DebugRange.prototype.windowHeight = function() {
    return Graphics.boxHeight;
};

Window_DebugRange.prototype.maxItems = function() {
    return this._maxSwitches + this._maxVariables;
};

Window_DebugRange.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    if (this._editWindow) {
        this._editWindow.setMode(this.mode());
        this._editWindow.setTopId(this.topId());
    }
};

Window_DebugRange.prototype.mode = function() {
    return this.index() < this._maxSwitches ? 'switches' : 'variables';
};

Window_DebugRange.prototype.topId = function() {
    var index = this.index();
    if (index < this._maxSwitches) {
        return index * 10 + 1;
    } else {
        return (index - this._maxSwitches) * 10 + 1;
    }
};

Window_DebugRange.prototype.refresh = function() {
    this.createContents();
    this.drawAllItems();
};

Window_DebugRange.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    var id = index * 10 + 1;
    var id_w = this.textWidth('0000');
    var id_x = rect.x + rect.width - id_w - this.textPadding();
    var text;
    if (index < this._maxSwitches) {
        text = 'S';
    } else {
        text = 'V';
        id -= this._maxSwitches * 10;
    }
    this.changeTextColor(this.systemColor());
    this.drawText(text, rect.x, rect.y, rect.width);
    this.resetTextColor();
    this.drawText(String(id).padZero(4), id_x, rect.y, id_w);
    this.drawText('-', id_x + id_w, rect.y, this.textWidth('-'));
    this.drawText(String(id + 9).padZero(4), id_x + id_w + this.textWidth('-'), rect.y, id_w);
};

Window_DebugRange.prototype.isCancelTriggered = function() {
    return (Window_Selectable.prototype.isCancelTriggered.call(this) ||
            Input.isTriggered('debug'));
};

Window_DebugRange.prototype.processCancel = function() {
    Window_Selectable.prototype.processCancel.call(this);
    Window_DebugRange.lastTopRow = this.topRow();
    Window_DebugRange.lastIndex = this.index();
};

Window_DebugRange.prototype.setEditWindow = function(editWindow) {
    this._editWindow = editWindow;
};
