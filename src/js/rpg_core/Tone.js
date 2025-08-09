//=============================================================================
// Tone
//=============================================================================

function Tone() {
    this.initialize.apply(this, arguments);
}

Tone.prototype.initialize = function(r, g, b, gray) {
    this._red = r || 0;
    this._green = g || 0;
    this._blue = b || 0;
    this._gray = gray || 0;
};

Tone.prototype.clone = function() {
    return new Tone(this._red, this._green, this._blue, this._gray);
};

Tone.prototype.equals = function(other) {
    return (this._red === other._red &&
            this._green === other._green &&
            this._blue === other._blue &&
            this._gray === other._gray);
};

Object.defineProperty(Tone.prototype, 'red', {
    get: function() { return this._red; },
    set: function(value) { this._red = value; },
    configurable: true
});

Object.defineProperty(Tone.prototype, 'green', {
    get: function() { return this._green; },
    set: function(value) { this._green = value; },
    configurable: true
});

Object.defineProperty(Tone.prototype, 'blue', {
    get: function() { return this._blue; },
    set: function(value) { this._blue = value; },
    configurable: true
});

Object.defineProperty(Tone.prototype, 'gray', {
    get: function() { return this._gray; },
    set: function(value) { this._gray = value; },
    configurable: true
});
