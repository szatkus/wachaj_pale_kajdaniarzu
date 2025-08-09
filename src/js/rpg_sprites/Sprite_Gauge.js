//=============================================================================
// Sprite_Gauge
//=============================================================================

function Sprite_Gauge() {
    this.initialize.apply(this, arguments);
}

Sprite_Gauge.prototype = Object.create(Sprite.prototype);
Sprite_Gauge.prototype.constructor = Sprite_Gauge;

Sprite_Gauge.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
    this.initMembers();
    this.createBitmap();
};

Sprite_Gauge.prototype.initMembers = function() {
    this._battler = null;
    this._statusType = '';
    this._value = 0;
    this._maxValue = 0;
    this._duration = 0;
    this._flashingCount = 0;
};

Sprite_Gauge.prototype.createBitmap = function() {
    var width = this.bitmapWidth();
    var height = this.bitmapHeight();
    this.bitmap = new Bitmap(width, height);
};

Sprite_Gauge.prototype.bitmapWidth = function() {
    return 128;
};

Sprite_Gauge.prototype.bitmapHeight = function() {
    return 32;
};

Sprite_Gauge.prototype.gaugeHeight = function() {
    return 6;
};

Sprite_Gauge.prototype.gaugeX = function() {
    return 0;
};

Sprite_Gauge.prototype.labelY = function() {
    return 3;
};

Sprite_Gauge.prototype.labelFontFace = function() {
    return 'GameFont';
};

Sprite_Gauge.prototype.labelFontSize = function() {
    return 20;
};

Sprite_Gauge.prototype.valueColor = function() {
    return '#ffffff';
};

Sprite_Gauge.prototype.valueOutlineColor = function() {
    return 'rgba(0, 0, 0, 1)';
};

Sprite_Gauge.prototype.valueOutlineWidth = function() {
    return 2;
};

Sprite_Gauge.prototype.setup = function(battler, statusType) {
    this._battler = battler;
    this._statusType = statusType;
    var a = this.currentValue();
    var b = this.currentMaxValue();
    this.updateBitmap(a, b);
};

Sprite_Gauge.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.updateBitmap();
};

Sprite_Gauge.prototype.updateBitmap = function() {
    var value = this.currentValue();
    var maxValue = this.currentMaxValue();
    if (value !== this._value || maxValue !== this._maxValue) {
        this._value = value;
        this._maxValue = maxValue;
        this.redraw();
    }
};

Sprite_Gauge.prototype.currentValue = function() {
    if (this._battler) {
        switch (this._statusType) {
        case 'hp':
            return this._battler.hp;
        case 'mp':
            return this._battler.mp;
        case 'tp':
            return this._battler.tp;
        }
    }
    return 0;
};

Sprite_Gauge.prototype.currentMaxValue = function() {
    if (this._battler) {
        switch (this._statusType) {
        case 'hp':
            return this._battler.mhp;
        case 'mp':
            return this._battler.mmp;
        case 'tp':
            return this._battler.maxTp();
        }
    }
    return 0;
};

Sprite_Gauge.prototype.label = function() {
    switch (this._statusType) {
    case 'hp':
        return TextManager.hpA;
    case 'mp':
        return TextManager.mpA;
    case 'tp':
        return TextManager.tpA;
    default:
        return '';
    }
};

Sprite_Gauge.prototype.gaugeBackColor = function() {
    return this.textColor(3);
};

Sprite_Gauge.prototype.gaugeColor1 = function() {
    switch (this._statusType) {
    case 'hp':
        return this.hpGaugeColor1();
    case 'mp':
        return this.mpGaugeColor1();
    case 'tp':
        return this.tpGaugeColor1();
    default:
        return this.normalColor1();
    }
};

Sprite_Gauge.prototype.gaugeColor2 = function() {
    switch (this._statusType) {
    case 'hp':
        return this.hpGaugeColor2();
    case 'mp':
        return this.mpGaugeColor2();
    case 'tp':
        return this.tpGaugeColor2();
    default:
        return this.normalColor2();
    }
};

Sprite_Gauge.prototype.labelColor = function() {
    return this.systemColor();
};

Sprite_Gauge.prototype.redraw = function() {
    this.bitmap.clear();
    var currentValue = this.currentValue();
    var currentMaxValue = this.currentMaxValue();
    this.drawGauge();
    this.drawLabel();
    if (!isNaN(currentValue)) {
        this.drawValue();
    }
};

Sprite_Gauge.prototype.drawGauge = function() {
    var gaugeX = this.gaugeX();
    var gaugeY = this.bitmapHeight() - this.gaugeHeight();
    var gaugeWidth = this.bitmapWidth() - gaugeX;
    var gaugeHeight = this.gaugeHeight();
    var rate = (this._maxValue > 0) ? (this._value / this._maxValue) : 0;
    var fillW = Math.floor(gaugeWidth * rate);
    var color1 = this.gaugeColor1();
    var color2 = this.gaugeColor2();
    this.bitmap.fillRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight, this.gaugeBackColor());
    this.bitmap.gradientFillRect(gaugeX, gaugeY, fillW, gaugeHeight, color1, color2);
};

Sprite_Gauge.prototype.drawLabel = function() {
    var label = this.label();
    var x = this.gaugeX();
    var y = this.labelY();
    var width = this.bitmapWidth();
    var height = this.bitmapHeight();
    this.bitmap.fontFace = this.labelFontFace();
    this.bitmap.fontSize = this.labelFontSize();
    this.bitmap.textColor = this.labelColor();
    this.bitmap.drawText(label, x, y, width, height, 'left');
};

Sprite_Gauge.prototype.drawValue = function() {
    var currentValue = this.currentValue();
    var width = this.bitmapWidth();
    var height = this.bitmapHeight();
    this.bitmap.fontFace = this.labelFontFace();
    this.bitmap.fontSize = this.labelFontSize();
    this.bitmap.textColor = this.valueColor();
    this.bitmap.outlineColor = this.valueOutlineColor();
    this.bitmap.outlineWidth = this.valueOutlineWidth();
    this.bitmap.drawText(currentValue, 0, 0, width, height, 'right');
};
