//=============================================================================
// Sprite
//=============================================================================

function Sprite() {
    this.initialize.apply(this, arguments);
}

Sprite.prototype = Object.create(PIXI.Sprite.prototype);
Sprite.prototype.constructor = Sprite;

Sprite.prototype.initialize = function(bitmap) {
    var texture = new PIXI.Texture(new PIXI.BaseTexture());
    PIXI.Sprite.call(this, texture);

    this._bitmap = bitmap;
    this._frame = new Rectangle();
    this._realFrame = new Rectangle();
    this._blendColor = [0, 0, 0, 0];
    this._colorTone = [0, 0, 0, 0];
    this._canvas = null;
    this._context = null;
    this._tintTexture = null;

    this.spriteId = Sprite._counter++;
};

Sprite.prototype.update = function() {
    this.children.forEach(function(child) {
        if (child.update) {
            child.update();
        }
    });
};

Sprite.prototype.move = function(x, y) {
    this.x = x;
    this.y = y;
};

Sprite.prototype.setFrame = function(x, y, width, height) {
    this._frame.set(x, y, width, height);
    this._refresh();
};

Sprite.prototype.getBlendColor = function() {
    return this._blendColor.clone();
};

Sprite.prototype.setBlendColor = function(color) {
    if (!(color instanceof Array)) {
        throw new Error('Argument must be an array');
    }
    if (!this._blendColor.equals(color)) {
        this._blendColor = color.clone();
        this._refresh();
    }
};

Sprite.prototype.getColorTone = function() {
    return this._colorTone.clone();
};

Sprite.prototype.setColorTone = function(tone) {
    if (!(tone instanceof Array)) {
        throw new Error('Argument must be an array');
    }
    if (!this._colorTone.equals(tone)) {
        this._colorTone = tone.clone();
        this._refresh();
    }
};

Sprite.prototype.destroy = function() {
    PIXI.Sprite.prototype.destroy.call(this);
    if (this._tintTexture) {
        this._tintTexture.destroy();
    }
};

Sprite.prototype._refresh = function() {
    if (this._bitmap) {
        var frame = this._frame;
        if (frame.width > 0 && frame.height > 0) {
            this._realFrame.set(frame.x, frame.y, frame.width, frame.height);
            this.texture.frame = this._realFrame;
        } else {
            this.texture.frame = Rectangle.emptyRectangle;
        }
    } else {
        this.texture.frame = Rectangle.emptyRectangle;
    }
    this.texture.baseTexture = this._bitmap ? this._bitmap._baseTexture : null;
    this.texture._updateID++;

    if (this._blendColor[3] > 0 || this._colorTone.some(function(v) { return v !== 0; })) {
        this._createTintTexture();
        this.tint = 0xffffff;
    } else {
        this.tint = 0xffffff;
        if (this._tintTexture) {
            this._tintTexture.destroy();
            this._tintTexture = null;
        }
    }
};

Sprite.prototype._createTintTexture = function() {
    if (!this._tintTexture) {
        this._tintTexture = new PIXI.RenderTexture(this.width, this.height);
    }
    var context = this._tintTexture.getContext('2d');
    var bitmap = this._bitmap;
    var frame = this._frame;
    var color = this._blendColor;
    var tone = this._colorTone;
    var r, g, b, a;

    context.clearRect(0, 0, this.width, this.height);

    if (bitmap) {
        context.drawImage(bitmap._canvas, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
        if (tone.some(function(v) { return v !== 0; })) {
            var imageData = context.getImageData(0, 0, frame.width, frame.height);
            var pixels = imageData.data;
            for (var i = 0; i < pixels.length; i += 4) {
                r = pixels[i + 0];
                g = pixels[i + 1];
                b = pixels[i + 2];
                pixels[i + 0] = (r + tone[0]).clamp(0, 255);
                pixels[i + 1] = (g + tone[1]).clamp(0, 255);
                pixels[i + 2] = (b + tone[2]).clamp(0, 255);
            }
            context.putImageData(imageData, 0, 0);
        }
        if (color[3] > 0) {
            context.globalCompositeOperation = 'lighter';
            context.fillStyle = Utils.rgbToCssColor(color[0], color[1], color[2]);
            context.fillRect(0, 0, frame.width, frame.height);
        }
    }

    this.texture.baseTexture = new PIXI.BaseTexture(this._tintTexture.getCanvas());
    this.texture.frame = new Rectangle(0, 0, this.width, this.height);
};

Sprite._counter = 0;

Object.defineProperty(Sprite.prototype, 'bitmap', {
    get: function() {
        return this._bitmap;
    },
    set: function(value) {
        if (this._bitmap !== value) {
            this._bitmap = value;
            this._refresh();
        }
    },
    configurable: true
});

Object.defineProperty(Sprite.prototype, 'width', {
    get: function() {
        return this._frame.width;
    },
    set: function(value) {
        this._frame.width = value;
        this._refresh();
    },
    configurable: true
});

Object.defineProperty(Sprite.prototype, 'height', {
    get: function() {
        return this._frame.height;
    },
    set: function(value) {
        this._frame.height = value;
        this._refresh();
    },
    configurable: true
});

Object.defineProperty(Sprite.prototype, 'opacity', {
    get: function() {
        return this.alpha * 255;
    },
    set: function(value) {
        this.alpha = value.clamp(0, 255) / 255;
    },
    configurable: true
});
