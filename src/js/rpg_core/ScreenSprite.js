//=============================================================================
// ScreenSprite
//=============================================================================

function ScreenSprite() {
    this.initialize.apply(this, arguments);
}

ScreenSprite.prototype = Object.create(PIXI.Sprite.prototype);
ScreenSprite.prototype.constructor = ScreenSprite;

ScreenSprite.prototype.initialize = function() {
    PIXI.Sprite.call(this, new PIXI.Texture(new PIXI.BaseTexture()));

    this._graphics = new PIXI.Graphics();
    this.addChild(this._graphics);
    this.opacity = 255;
    this.color = [0, 0, 0, 0];
};

ScreenSprite.prototype.setBlack = function() {
    this.color = [0, 0, 0, 255];
};

ScreenSprite.prototype.setWhite = function() {
    this.color = [255, 255, 255, 255];
};

ScreenSprite.prototype.setScreen = function() {
    this.color = [0, 0, 0, 0];
};

ScreenSprite.prototype.setColor = function(r, g, b) {
    this.color = [r, g, b, 255];
};

ScreenSprite.prototype.setOpacity = function(opacity) {
    this.opacity = opacity;
};

ScreenSprite.prototype.update = function() {
    PIXI.Sprite.prototype.update.call(this);
    this._graphics.clear();
    var r = this.color[0];
    var g = this.color[1];
    var b = this.color[2];
    var a = this.color[3] * this.opacity / 255 / 255;
    this._graphics.beginFill((r << 16) | (g << 8) | b, a);
    this._graphics.drawRect(0, 0, Graphics.width, Graphics.height);
    this._graphics.endFill();
};

Object.defineProperty(ScreenSprite.prototype, 'opacity', {
    get: function() {
        return this.alpha * 255;
    },
    set: function(value) {
        this.alpha = value.clamp(0, 255) / 255;
    },
    configurable: true
});
