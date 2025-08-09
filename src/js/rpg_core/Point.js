//=============================================================================
// Point
//=============================================================================

function Point() {
    this.initialize.apply(this, arguments);
}

Point.prototype = Object.create(PIXI.Point.prototype);
Point.prototype.constructor = Point;

Point.prototype.initialize = function(x, y) {
    PIXI.Point.call(this, x, y);
};

Point.prototype.clone = function() {
    return new Point(this.x, this.y);
};

Point.prototype.equals = function(other) {
    return this.x === other.x && this.y === other.y;
};
