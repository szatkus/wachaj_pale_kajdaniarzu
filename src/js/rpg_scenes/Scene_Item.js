//=============================================================================
// Scene_Item
//=============================================================================

function Scene_Item() {
    this.initialize.apply(this, arguments);
}

Scene_Item.prototype = Object.create(Scene_ItemBase.prototype);
Scene_Item.prototype.constructor = Scene_Item;

Scene_Item.prototype.initialize = function() {
    Scene_ItemBase.prototype.initialize.call(this);
};

Scene_Item.prototype.create = function() {
    Scene_ItemBase.prototype.create.call(this);
    this.createHelpWindow();
    this.createCategoryWindow();
    this.createItemWindow();
    this.createActorWindow();
};

Scene_Item.prototype.createCategoryWindow = function() {
    this._categoryWindow = new Window_ItemCategory();
    this._categoryWindow.setHelpWindow(this._helpWindow);
    this._categoryWindow.y = this._helpWindow.height;
    this._categoryWindow.setHandler('ok',     this.onCategoryOk.bind(this));
    this._categoryWindow.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(this._categoryWindow);
};

Scene_Item.prototype.createItemWindow = function() {
    var wy = this._categoryWindow.y + this._categoryWindow.height;
    var wh = Graphics.boxHeight - wy;
    this._itemWindow = new Window_ItemList(0, wy, Graphics.boxWidth, wh);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this.addWindow(this._itemWindow);
    this._categoryWindow.setItemWindow(this._itemWindow);
};

Scene_Item.prototype.createActorWindow = function() {
    this._actorWindow = new Window_MenuActor();
    this._actorWindow.setHandler('ok',     this.onActorOk.bind(this));
    this._actorWindow.setHandler('cancel', this.onActorCancel.bind(this));
    this.addWindow(this._actorWindow);
};

Scene_Item.prototype.user = function() {
    return this.actor();
};

Scene_Item.prototype.onCategoryOk = function() {
    this._itemWindow.activate();
    this._itemWindow.selectLast();
};

Scene_Item.prototype.onItemOk = function() {
    $gameParty.setLastItem(this.item());
    this.determineItem();
};

Scene_Item.prototype.onItemCancel = function() {
    this._itemWindow.deselect();
    this._categoryWindow.activate();
};

Scene_Item.prototype.onActorOk = function() {
    if (this.canUse()) {
        this.useItem();
    } else {
        SoundManager.playBuzzer();
    }
};

Scene_Item.prototype.onActorCancel = function() {
    this.hideActorWindow();
};

Scene_Item.prototype.determineItem = function() {
    var action = new Game_Action(this.user());
    var item = this.item();
    action.setItemObject(item);
    if (action.isForFriend()) {
        this.showActorWindow();
        this._actorWindow.select(this.user().index());
    } else {
        this.useItem();
        this.activateItemWindow();
    }
};

Scene_Item.prototype.showActorWindow = function() {
    this._itemWindow.hide();
    this._categoryWindow.hide();
    this._actorWindow.show();
    this._actorWindow.activate();
};

Scene_Item.prototype.hideActorWindow = function() {
    this._actorWindow.hide();
    this.activateItemWindow();
};

Scene_Item.prototype.activateItemWindow = function() {
    this._itemWindow.refresh();
    this._itemWindow.activate();
};

Scene_Item.prototype.itemTargetActors = function() {
    var action = new Game_Action(this.user());
    action.setItemObject(this.item());
    if (!action.isForFriend()) {
        return [];
    } else if (action.isForAll()) {
        return $gameParty.members();
    } else {
        return [$gameParty.members()[this._actorWindow.index()]];
    }
};

Scene_Item.prototype.canUse = function() {
    return this.user().canUse(this.item()) && this.isItemEffectsValid();
};

Scene_Item.prototype.isItemEffectsValid = function() {
    var action = new Game_Action(this.user());
    action.setItemObject(this.item());
    return this.itemTargetActors().some(function(target) {
        return action.testApply(target);
    }, this);
};

Scene_Item.prototype.useItem = function() {
    Scene_ItemBase.prototype.useItem.call(this);
    this._itemWindow.redrawCurrentItem();
};
