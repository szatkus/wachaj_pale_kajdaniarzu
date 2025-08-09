//=============================================================================
// Window_MenuActor
//=============================================================================

function Window_MenuActor() {
    this.initialize.apply(this, arguments);
}

Window_MenuActor.prototype = Object.create(Window_MenuStatus.prototype);
Window_MenuActor.prototype.constructor = Window_MenuActor;

Window_MenuActor.prototype.initialize = function() {
    Window_MenuStatus.prototype.initialize.call(this, 0, 0);
    this.hide();
};

Window_MenuActor.prototype.processOk = function() {
    if (!this.cursorAll()) {
        $gameParty.setTargetActor($gameParty.members()[this.index()]);
    }
    this.callOkHandler();
};

Window_MenuActor.prototype.selectLast = function() {
    this.select($gameParty.targetActor().index() || 0);
};

Window_MenuActor.prototype.selectForItem = function(item) {
    var actor = $gameParty.menuActor();
    var action = new Game_Action(actor);
    action.setItemObject(item);
    this.setCursorFixed(false);
    this.setCursorAll(false);
    if (action.isForUser()) {
        this.select(actor.index());
        this.setCursorFixed(true);
    } else if (action.isForAll()) {
        this.select(0);
        this.setCursorAll(true);
    } else {
        this.select(actor.index());
    }
};
