//=============================================================================
// Window_DebugEdit
//=============================================================================

function Window_DebugEdit() {
    this.initialize.apply(this, arguments);
}

Window_DebugEdit.prototype = Object.create(Window_Selectable.prototype);
Window_DebugEdit.prototype.constructor = Window_DebugEdit;

Window_DebugEdit.prototype.initialize = function(x, y, width) {
    var height = this.fittingHeight(10);
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._mode = 'switches';
    this._topId = 1;
    this.refresh();
};

Window_DebugEdit.prototype.maxItems = function() {
    return 10;
};

Window_DebugEdit.prototype.refresh = function() {
    this.contents.clear();
    this.drawAllItems();
};

Window_DebugEdit.prototype.drawItem = function(index) {
    var dataId = this._topId + index;
    var rect = this.itemRectForText(index);
    var idText = String(dataId).padZero(4) + ':';
    var idWidth = this.textWidth(idText);
    var name = this.itemName(dataId);
    var status = this.itemStatus(dataId);
    var statusWidth = this.textWidth('-00000000');
    this.resetTextColor();
    this.drawText(idText, rect.x, rect.y, rect.width);
    rect.x += idWidth;
    rect.width -= idWidth + statusWidth;
    this.drawText(name, rect.x, rect.y, rect.width);
    this.drawText(status, rect.x + rect.width, rect.y, statusWidth, 'right');
};

Window_DebugEdit.prototype.itemName = function(dataId) {
    if (this._mode === 'switches') {
        return $dataSystem.switches[dataId];
    } else {
        return $dataSystem.variables[dataId];
    }
};

Window_DebugEdit.prototype.itemStatus = function(dataId) {
    if (this._mode === 'switches') {
        return $gameSwitches.value(dataId) ? '[ON]' : '[OFF]';
    } else {
        return String($gameVariables.value(dataId));
    }
};

Window_DebugEdit.prototype.setMode = function(mode) {
    if (this._mode !== mode) {
        this._mode = mode;
        this.refresh();
    }
};

Window_DebugEdit.prototype.setTopId = function(id) {
    if (this._topId !== id) {
        this._topId = id;
        this.refresh();
    }
};

Window_DebugEdit.prototype.currentId = function() {
    return this._topId + this.index();
};

Window_DebugEdit.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    if (this.active) {
        if (this._mode === 'switches') {
            this.updateSwitch();
        } else {
            this.updateVariable();
        }
    }
};

Window_DebugEdit.prototype.updateSwitch = function() {
    if (Input.isRepeated('ok')) {
        var switchId = this.currentId();
        $gameSwitches.setValue(switchId, !$gameSwitches.value(switchId));
        this.redrawCurrentItem();
        SoundManager.playCursor();
    }
};

Window_DebugEdit.prototype.updateVariable = function() {
    var variableId = this.currentId();
    var value = $gameVariables.value(variableId);
    if (Input.isRepeated('right')) {
        value++;
    }
    if (Input.isRepeated('left')) {
        value--;
    }
    if (Input.isRepeated('pagedown')) {
        value += 10;
    }
    if (Input.isRepeated('pageup')) {
        value -= 10;
    }
    if ($gameVariables.value(variableId) !== value) {
        $gameVariables.setValue(variableId, value);
        this.redrawCurrentItem();
        SoundManager.playCursor();
    }
};
