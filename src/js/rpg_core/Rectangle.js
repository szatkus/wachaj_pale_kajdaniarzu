//=============================================================================
// Rectangle
//=============================================================================

function Rectangle() {
    this.initialize.apply(this, arguments);
}

Rectangle.prototype = Object.create(PIXI.Rectangle.prototype);
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.initialize = function(x, y, width, height) {
    PIXI.Rectangle.call(this, x, y, width, height);
};

Rectangle.prototype.clone = function() {
    return new Rectangle(this.x, this.y, this.width, this.height);
};

Rectangle.prototype.contains = function(x, y) {
    return (this.x <= x && x < this.x + this.width &&
            this.y <= y && y < this.y + this.height);
};
