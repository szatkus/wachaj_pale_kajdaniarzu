//=============================================================================
// Bitmap
//=============================================================================

function Bitmap() {
    this.initialize.apply(this, arguments);
}

Bitmap.prototype.initialize = function(width, height) {
    if (width > 0 && height > 0) {
        this._canvas = document.createElement('canvas');
        this._context = this._canvas.getContext('2d');
        this._canvas.width = width;
        this._canvas.height = height;
        this._baseTexture = new PIXI.BaseTexture(this._canvas);
        this._baseTexture.mipmap = false;
        this._baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        this._image = null;
        this._url = '';
        this._paintOpacity = 255;
        this._smooth = false;
        this.fontFace = 'GameFont';
        this.fontSize = 28;
        this.fontItalic = false;
        this.textColor = '#ffffff';
        this.outlineColor = 'rgba(0, 0, 0, 0.5)';
        this.outlineWidth = 4;
    } else {
        this._canvas = null;
        this._context = null;
        this._baseTexture = null;
    }
};

Bitmap.load = function(url) {
    var bitmap = new Bitmap();
    bitmap._url = url;
    bitmap._image = new Image();
    bitmap._image.src = url;
    bitmap._image.onload = Bitmap.prototype._onLoad.bind(bitmap);
    bitmap._image.onerror = Bitmap.prototype._onError.bind(bitmap);
    return bitmap;
};

Bitmap.snap = function(stage) {
    var width = Graphics.width;
    var height = Graphics.height;
    var bitmap = new Bitmap(width, height);
    var context = bitmap._context;
    var renderTexture = new PIXI.RenderTexture(width, height);
    if (stage) {
        Graphics.renderer.render(stage, renderTexture);
        stage.worldTransform.identity();
        var canvas = Graphics.renderer.extract.canvas(renderTexture);
        context.drawImage(canvas, 0, 0);
    } else {
        //
    }
    renderTexture.destroy(true);
    bitmap._baseTexture.update();
    return bitmap;
};

Bitmap.prototype.isReady = function() {
    return this._canvas && (!this._image || this._image.width > 0);
};

Bitmap.prototype._onLoad = function() {
    this._canvas.width = this._image.width;
    this._canvas.height = this._image.height;
    this._baseTexture.update();
    this._context.drawImage(this._image, 0, 0);
};

Bitmap.prototype._onError = function() {
    this._image.error = true;
};

Bitmap.prototype.width = function() {
    return this._canvas ? this._canvas.width : 0;
};

Bitmap.prototype.height = function() {
    return this._canvas ? this._canvas.height : 0;
};

Bitmap.prototype.rect = function() {
    return new Rectangle(0, 0, this.width(), this.height());
};

Bitmap.prototype.smooth = function(smooth) {
    if (this._smooth !== smooth) {
        this._smooth = smooth;
        if (this._baseTexture) {
            this._baseTexture.scaleMode = this._smooth ? PIXI.SCALE_MODES.LINEAR : PIXI.SCALE_MODES.NEAREST;
        }
    }
};

Bitmap.prototype.paintOpacity = function(opacity) {
    if (this._paintOpacity !== opacity) {
        this._paintOpacity = opacity;
        this._context.globalAlpha = this._paintOpacity / 255;
    }
};

Bitmap.prototype.clear = function() {
    this._context.clearRect(0, 0, this.width(), this.height());
    this._baseTexture.update();
};

Bitmap.prototype.getPixel = function(x, y) {
    var data = this._context.getImageData(x, y, 1, 1).data;
    var r = data[0];
    var g = data[1];
    var b = data[2];
    var a = data[3];
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a / 255 + ')';
};

Bitmap.prototype.getAlphaPixel = function(x, y) {
    var data = this._context.getImageData(x, y, 1, 1).data;
    return data[3];
};

Bitmap.prototype.clearRect = function(x, y, width, height) {
    this._context.clearRect(x, y, width, height);
    this._baseTexture.update();
};

Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
    // [Note] Different browser can draw text differently.
    //        So we are using a temporary canvas to draw text and then
    //        blitting it to the main canvas.
    var context = this._context;
    var alpha = context.globalAlpha;
    maxWidth = maxWidth || 0xffffffff;
    var tx = x;
    var ty = y + lineHeight - Math.round(this.fontSize * 0.35);
    var outlineWidth = this.outlineWidth;
    var outlineColor = this.outlineColor;
    var textColor = this.textColor;
    context.font = this._makeFontNameText();
    context.lineJoin = 'round';
    context.lineWidth = outlineWidth;
    context.strokeStyle = outlineColor;
    context.fillStyle = textColor;
    context.textAlign = align;
    context.textBaseline = 'alphabetic';
    this._drawTextOutline(text, tx, ty, maxWidth);
    this._drawTextBody(text, tx, ty, maxWidth);
};

Bitmap.prototype.measureTextWidth = function(text) {
    var context = this._context;
    context.font = this._makeFontNameText();
    return context.measureText(text).width;
};

Bitmap.prototype.drawCircle = function(x, y, radius, color) {
    var context = this._context;
    context.save();
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.fill();
    context.restore();
    this._baseTexture.update();
};

Bitmap.prototype.drawIcon = function(iconIndex, x, y) {
    var bitmap = ImageManager.loadSystem('IconSet');
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
    var sx = iconIndex % 16 * pw;
    var sy = Math.floor(iconIndex / 16) * ph;
    this.blt(bitmap, sx, sy, pw, ph, x, y);
};

Bitmap.prototype.blt = function(source, sx, sy, sw, sh, dx, dy, dw, dh) {
    dw = dw || sw;
    dh = dh || sh;
    if (sx >= 0 && sy >= 0 && sw > 0 && sh > 0 && dw > 0 && dh > 0 &&
            sx + sw <= source.width() && sy + sh <= source.height()) {
        this._context.drawImage(source._canvas, sx, sy, sw, sh, dx, dy, dw, dh);
        this._baseTexture.update();
    }
};

Bitmap.prototype.fillRect = function(x, y, width, height, color) {
    var context = this._context;
    context.save();
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
    context.restore();
    this._baseTexture.update();
};

Bitmap.prototype.gradientFillRect = function(x, y, width, height, color1, color2, vertical) {
    var context = this._context;
    var x1 = vertical ? x : x;
    var y1 = vertical ? y : y;
    var x2 = vertical ? x : x + width;
    var y2 = vertical ? y + height : y;
    var grad = context.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    context.save();
    context.fillStyle = grad;
    context.fillRect(x, y, width, height);
    context.restore();
    this._baseTexture.update();
};

Bitmap.prototype.clear = function() {
    this.clearRect(0, 0, this.width(), this.height());
};

Bitmap.prototype.fillAll = function(color) {
    this.fillRect(0, 0, this.width(), this.height(), color);
};

Bitmap.prototype.blur = function() {
    for (var i = 0; i < 2; i++) {
        var w = this.width();
        var h = this.height();
        var canvas = this._canvas;
        var context = this._context;
        var tempCanvas = document.createElement('canvas');
        var tempContext = tempCanvas.getContext('2d');
        tempCanvas.width = w + 2;
        tempCanvas.height = h + 2;
        tempContext.drawImage(canvas, 0, 0, w, h, 1, 1, w, h);
        tempContext.drawImage(canvas, 0, 0, w, 1, 1, 0, w, 1);
        tempContext.drawImage(canvas, 0, 0, 1, h, 0, 1, 1, h);
        tempContext.drawImage(canvas, 0, h - 1, w, 1, 1, h + 1, w, 1);
        tempContext.drawImage(canvas, w - 1, 0, 1, h, w + 1, 1, 1, h);
        context.save();
        context.fillStyle = 'black';
        context.fillRect(0, 0, w, h);
        context.globalCompositeOperation = 'lighter';
        context.globalAlpha = 1 / 9;
        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                context.drawImage(tempCanvas, x, y, w, h, 0, 0, w, h);
            }
        }
        context.restore();
    }
    this._baseTexture.update();
};

Bitmap.prototype.addLoadListener = function(listner) {
    if (!this.isReady()) {
        this._loadListeners.push(listner);
    } else {
        listner(this);
    }
};

Bitmap.prototype._makeFontNameText = function() {
    return (this.fontItalic ? 'Italic ' : '') + this.fontSize + 'px ' + this.fontFace;
};

Bitmap.prototype._drawTextOutline = function(text, tx, ty, maxWidth) {
    var context = this._context;
    context.strokeText(text, tx, ty, maxWidth);
};

Bitmap.prototype._drawTextBody = function(text, tx, ty, maxWidth) {
    var context = this._context;
    context.fillText(text, tx, ty, maxWidth);
};
