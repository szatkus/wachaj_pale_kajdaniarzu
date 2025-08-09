//=============================================================================
// Spriteset_Base
//=============================================================================

function Spriteset_Base() {
    this.initialize.apply(this, arguments);
}

Spriteset_Base.prototype = Object.create(Sprite.prototype);
Spriteset_Base.prototype.constructor = Spriteset_Base;

Spriteset_Base.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
    this.setFrame(0, 0, Graphics.width, Graphics.height);
    this.opaque = true;
    this.createLowerLayer();
    this.createUpperLayer();
    this.update();
};

Spriteset_Base.prototype.createLowerLayer = function() {
    this.createBaseSprite();
};

Spriteset_Base.prototype.createUpperLayer = function() {
    this.createPictures();
    this.createTimer();
    this.createScreenSprites();
};

Spriteset_Base.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.updateScreenSprites();
    this.updateToneChanger();
    this.updateFlash();
    this.updateShake();
};

Spriteset_Base.prototype.createBaseSprite = function() {
    this._baseSprite = new Sprite();
    this._baseSprite.setFrame(0, 0, this.width, this.height);
    this._blackScreen = new ScreenSprite();
    this._blackScreen.opacity = 255;
    this.addChild(this._baseSprite);
    this._baseSprite.addChild(this._blackScreen);
};

Spriteset_Base.prototype.createPictures = function() {
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight;
    var x = (Graphics.width - width) / 2;
    var y = (Graphics.height - height) / 2;
    this._pictureContainer = new Sprite();
    this._pictureContainer.setFrame(x, y, width, height);
    for (var i = 1; i <= $gameScreen.maxPictures(); i++) {
        this._pictureContainer.addChild(new Sprite_Picture(i));
    }
    this.addChild(this._pictureContainer);
};

Spriteset_Base.prototype.createTimer = function() {
    this._timerSprite = new Sprite_Timer();
    this.addChild(this._timerSprite);
};

Spriteset_Base.prototype.createScreenSprites = function() {
    this._flashSprite = new ScreenSprite();
    this._fadeSprite = new ScreenSprite();
    this.addChild(this._flashSprite);
    this.addChild(this._fadeSprite);
};

Spriteset_Base.prototype.updateScreenSprites = function() {
    this._flashSprite.setColor($gameScreen.flashColor());
    this._flashSprite.opacity = $gameScreen.flashAlpha();
    this._fadeSprite.opacity = 255 - $gameScreen.brightness();
};

Spriteset_Base.prototype.updateToneChanger = function() {
    var tone = $gameScreen.tone();
    if (this._tone.join(',') !== tone.join(',')) {
        this.setColorTone(tone);
    }
};

Spriteset_Base.prototype.updateFlash = function() {
};

Spriteset_Base.prototype.updateShake = function() {
    this.x = $gameScreen.shake();
};
