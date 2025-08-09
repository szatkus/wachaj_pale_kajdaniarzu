//=============================================================================
// Stage
//=============================================================================

function Stage() {
    this.initialize.apply(this, arguments);
}

Stage.prototype = Object.create(PIXI.Container.prototype);
Stage.prototype.constructor = Stage;

Stage.prototype.initialize = function() {
    PIXI.Container.call(this);

    // The interactive flag causes a memory leak.
    this.interactive = false;
};

/**
 * The update method is reserved for RPG Maker MV.
 */
Stage.prototype.update = function() {
    this.children.forEach(function(child) {
        if (child.update) {
            child.update();
        }
    });
};
