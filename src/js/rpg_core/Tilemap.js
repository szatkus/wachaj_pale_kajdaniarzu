//=============================================================================
// Tilemap
//=============================================================================

function Tilemap() {
    this.initialize.apply(this, arguments);
}

Tilemap.prototype = Object.create(PIXI.Container.prototype);
Tilemap.prototype.constructor = Tilemap;

Tilemap.prototype.initialize = function() {
    PIXI.Container.call(this);

    this._margin = 20;
    this._width = Graphics.width + this._margin * 2;
    this._height = Graphics.height + this._margin * 2;
    this._tileWidth = 48;
    this._tileHeight = 48;
    this._mapWidth = 0;
    this._mapHeight = 0;
    this._mapData = null;
    this._bitmaps = [];
    this._needsRefresh = false;
    this._lastTiles = [];

    this.lowerZLayer = new PIXI.tilemap.ZLayer(this, 0);
    this.upperZLayer = new PIXI.tilemap.ZLayer(this, 4);

    this.addChild(this.lowerZLayer);
    this.addChild(this.upperZLayer);

    this.origin = new Point();
};

Tilemap.prototype.destroy = function() {
    PIXI.Container.prototype.destroy.call(this);
};

Tilemap.prototype.setData = function(width, height, data) {
    this._mapWidth = width;
    this._mapHeight = height;
    this._mapData = data;
};

Tilemap.prototype.isReady = function() {
    for (var i = 0; i < this._bitmaps.length; i++) {
        if (!this._bitmaps[i] || !this._bitmaps[i].isReady()) {
            return false;
        }
    }
    return true;
};

Tilemap.prototype.update = function() {
    this.animationCount++;
    this.animationFrame = Math.floor(this.animationCount / 30);
    this.children.forEach(function(child) {
        if (child.update) {
            child.update();
        }
    });
};

Tilemap.prototype.refresh = function() {
    this._needsRefresh = true;
};

Tilemap.prototype.updateTransform = function() {
    var ox = Math.floor(this.origin.x);
    var oy = Math.floor(this.origin.y);
    var startX = Math.floor((ox - this._margin) / this._tileWidth);
    var startY = Math.floor((oy - this._margin) / this._tileHeight);
    this._paintAllTiles(startX, startY);
    if (this._needsRefresh) {
        this._needsRefresh = false;
        this._refreshLowerTiles();
        this._refreshUpperTiles();
    }
    PIXI.Container.prototype.updateTransform.call(this);
};

Tilemap.prototype._paintAllTiles = function(startX, startY) {
    var tileCols = Math.ceil(this._width / this._tileWidth) + 1;
    var tileRows = Math.ceil(this._height / this._tileHeight) + 1;
    for (var y = 0; y < tileRows; y++) {
        for (var x = 0; x < tileCols; x++) {
            this._paintTile(startX + x, startY + y);
        }
    }
};

Tilemap.prototype._paintTile = function(x, y) {
    var tableEdge = this.isTableEdge(x, y);
    var tileId0 = this._readMapData(x, y, 0);
    var tileId1 = this._readMapData(x, y, 1);
    var tileId2 = this._readMapData(x, y, 2);
    var tileId3 = this._readMapData(x, y, 3);
    var shadowBits = this._readMapData(x, y, 4);
    var upperTileId1 = this._readMapData(x, y, 5);
    this._drawTile(this.lowerZLayer, tileId0, x, y, 0, 2);
    this._drawTile(this.lowerZLayer, tileId1, x, y, 0, 2);
    this._drawShadow(this.lowerZLayer, shadowBits, x, y);
    if (tableEdge) {
        this._drawTableEdge(this.lowerZLayer, tileId0, x, y);
    }
    this._drawTile(this.upperZLayer, tileId2, x, y, 0, (tableEdge ? 2 : 3));
    this._drawTile(this.upperZLayer, tileId3, x, y, 0, (tableEdge ? 2 : 3));
    this._drawTile(this.upperZLayer, upperTileId1, x, y, 4, 1);
};

Tilemap.prototype._drawTile = function(layer, tileId, x, y, z, flags) {
    if (Tilemap.isVisibleTile(tileId)) {
        if (Tilemap.isAutotile(tileId)) {
            this._drawAutotile(layer, tileId, x, y, z);
        } else {
            this._drawNormalTile(layer, tileId, x, y, z);
        }
    }
};

Tilemap.prototype._drawNormalTile = function(layer, tileId, x, y, z) {
    var setNumber = 0;
    if (Tilemap.isTileA1(tileId)) {
        setNumber = 0;
    } else if (Tilemap.isTileA2(tileId)) {
        setNumber = 1;
    } else if (Tilemap.isTileA3(tileId)) {
        setNumber = 2;
    } else if (Tilemap.isTileA4(tileId)) {
        setNumber = 3;
    } else {
        setNumber = 4 + Math.floor(tileId / 256);
    }

    var w = this._tileWidth;
    var h = this._tileHeight;
    var sx = (Math.floor(tileId / 128) % 2 * 8 + tileId % 8) * w;
    var sy = (Math.floor(tileId % 256 / 8) % 16) * h;

    layer.addRect(setNumber, sx, sy, x * w, y * h, w, h);
};

Tilemap.prototype._drawAutotile = function(layer, tileId, x, y, z) {
    var autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
    var kind = Tilemap.getAutotileKind(tileId);
    var shape = Tilemap.getAutotileShape(tileId);
    var tx = kind % 8;
    var ty = Math.floor(kind / 8);
    var bx = 0;
    var by = 0;
    var setNumber = 0;
    var isTable = false;

    if (Tilemap.isTileA1(tileId)) {
        setNumber = 0;
        if (kind === 0) {
            bx = 0;
            by = 0;
        } else if (kind === 1) {
            bx = 0;
            by = 3;
        } else if (kind === 2) {
            bx = 6;
            by = 0;
        } else if (kind === 3) {
            bx = 6;
            by = 3;
        } else {
            bx = Math.floor(tx / 4) * 8;
            by = ty * 6 + Math.floor(tx / 2) % 2 * 3;
            if (kind % 2 === 0) {
                bx += 0;
            } else {
                bx += 4;
            }
        }
    } else if (Tilemap.isTileA2(tileId)) {
        setNumber = 1;
        bx = tx * 2;
        by = (ty - 2) * 3;
        isTable = this._isTableTile(tileId);
    } else if (Tilemap.isTileA3(tileId)) {
        setNumber = 2;
        bx = tx * 2;
        by = (ty - 6) * 2;
        autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
    } else if (Tilemap.isTileA4(tileId)) {
        setNumber = 3;
        bx = tx * 2;
        by = (ty - 10) * 5;
        if (ty % 2 === 0) {
            autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
        }
    }

    var w1 = this._tileWidth / 2;
    var h1 = this._tileHeight / 2;
    for (var i = 0; i < 4; i++) {
        var qsx = autotileTable[shape][i][0];
        var qsy = autotileTable[shape][i][1];
        var sx1 = (bx * 2 + qsx) * w1;
        var sy1 = (by * 2 + qsy) * h1;
        var dx1 = Math.floor(i % 2) * w1;
        var dy1 = Math.floor(i / 2) * h1;
        if (isTable && (qsy === 1 || qsy === 5)) {
            var qsx2 = qsx;
            var qsy2 = 3;
            if (qsy === 1) {
                qsx2 = [0, 1, 0, 1, 0, 1, 0, 1][qsx];
            }
            var sx2 = (bx * 2 + qsx2) * w1;
            var sy2 = (by * 2 + qsy2) * h1;
            layer.addRect(setNumber, sx2, sy2, x * this._tileWidth + dx1, y * this._tileHeight + dy1, w1, h1);
            dy1 += h1 / 2;
            layer.addRect(setNumber, sx1, sy1, x * this._tileWidth + dx1, y * this._tileHeight + dy1, w1, h1 / 2);
        } else {
            layer.addRect(setNumber, sx1, sy1, x * this._tileWidth + dx1, y * this._tileHeight + dy1, w1, h1);
        }
    }
};

Tilemap.prototype._drawTableEdge = function(layer, tileId, x, y) {
    if (Tilemap.isTileA2(tileId)) {
        var autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
        var kind = Tilemap.getAutotileKind(tileId);
        var shape = Tilemap.getAutotileShape(tileId);
        var tx = kind % 8;
        var ty = Math.floor(kind / 8);
        var bx = tx * 2;
        var by = (ty - 2) * 3;
        var w1 = this._tileWidth / 2;
        var h1 = this._tileHeight / 2;
        for (var i = 0; i < 2; i++) {
            var qsx = autotileTable[shape][i][0];
            var qsy = autotileTable[shape][i][1];
            var sx1 = (bx * 2 + qsx) * w1;
            var sy1 = (by * 2 + qsy) * h1;
            var dx1 = i * w1;
            var dy1 = 0;
            if (qsy === 1 || qsy === 5) {
                var qsx2 = qsx;
                var qsy2 = 3;
                if (qsy === 1) {
                    qsx2 = [0, 1, 0, 1, 0, 1, 0, 1][qsx];
                }
                var sx2 = (bx * 2 + qsx2) * w1;
                var sy2 = (by * 2 + qsy2) * h1;
                layer.addRect(0, sx2, sy2, x * this._tileWidth + dx1, y * this._tileHeight + dy1, w1, h1);
            }
        }
    }
};

Tilemap.prototype._drawShadow = function(layer, shadowBits, x, y) {
    if (shadowBits & 0x0f) {
        var w1 = this._tileWidth / 2;
        var h1 = this._tileHeight / 2;
        var color = 'rgba(0,0,0,0.5)';
        for (var i = 0; i < 4; i++) {
            if (shadowBits & (1 << i)) {
                var dx1 = Math.floor(i % 2) * w1;
                var dy1 = Math.floor(i / 2) * h1;
                layer.addRect(-1, 0, 0, x * this._tileWidth + dx1, y * this._tileHeight + dy1, w1, h1, color);
            }
        }
    }
};

Tilemap.prototype._readMapData = function(x, y, z) {
    if (this._mapData) {
        var width = this._mapWidth;
        var height = this._mapHeight;
        if (x >= 0 && x < width && y >= 0 && y < height) {
            return this._mapData[(z * height + y) * width + x] || 0;
        } else {
            return 0;
        }
    } else {
        return 0;
    }
};

Tilemap.prototype._isHigherTile = function(tileId) {
    return this.flags[tileId] & 0x10;
};

Tilemap.prototype._isTableTile = function(tileId) {
    return Tilemap.isTileA2(tileId) && (this.flags[tileId] & 0x80);
};

Tilemap.prototype.isTableEdge = function(x, y) {
    var tileId = this._readMapData(x, y, 0);
    return Tilemap.isTileA2(tileId) && (this.flags[tileId] & 0x80);
};

Tilemap.prototype._sortChildren = function() {
    this.children.sort(function(a, b) {
        if (a.z !== b.z) {
            return a.z - b.z;
        } else if (a.y !== b.y) {
            return a.y - b.y;
        } else {
            return a.spriteId - b.spriteId;
        }
    });
};

Tilemap.prototype._compareChildOrder = function(a, b) {
    if (a.z !== b.z) {
        return a.z - b.z;
    } else if (a.y !== b.y) {
        return a.y - b.y;
    } else {
        return a.spriteId - b.spriteId;
    }
};

Tilemap.prototype._refreshLowerTiles = function() {
    this._paintTiles(0, this._mapWidth, this._mapHeight);
};

Tilemap.prototype._refreshUpperTiles = function() {
    this._paintTiles(4, this._mapWidth, this._mapHeight);
};

Tilemap.prototype._paintTiles = function(z, width, height) {
    var layer = z < 4 ? this.lowerZLayer : this.upperZLayer;
    layer.clear();
    var margin = this._margin;
    var tileCols = Math.ceil((this._width + margin * 2) / this._tileWidth);
    var tileRows = Math.ceil((this._height + margin * 2) / this._tileHeight);
    var startX = Math.floor((this.origin.x - margin) / this._tileWidth);
    var startY = Math.floor((this.origin.y - margin) / this._tileHeight);

    for (var y = 0; y < tileRows; y++) {
        for (var x = 0; x < tileCols; x++) {
            var tileId = this._readMapData(startX + x, startY + y, z);
            if (tileId > 0) {
                this._drawTile(layer, tileId, startX + x, startY + y, z, 0);
            }
        }
    }
};

Tilemap.prototype.animationCount = 0;
Tilemap.prototype.animationFrame = 0;

Tilemap.TILE_ID_B = 0;
Tilemap.TILE_ID_C = 256;
Tilemap.TILE_ID_D = 512;
Tilemap.TILE_ID_E = 768;
Tilemap.TILE_ID_A5 = 1536;
Tilemap.TILE_ID_A1 = 2048;
Tilemap.TILE_ID_A2 = 2816;
Tilemap.TILE_ID_A3 = 4352;
Tilemap.TILE_ID_A4 = 5888;
Tilemap.TILE_ID_MAX = 8192;

Tilemap.isVisibleTile = function(tileId) {
    return tileId > 0 && tileId < this.TILE_ID_MAX;
};

Tilemap.isAutotile = function(tileId) {
    return tileId >= this.TILE_ID_A1;
};

Tilemap.getAutotileKind = function(tileId) {
    return Math.floor((tileId - this.TILE_ID_A1) / 48);
};

Tilemap.getAutotileShape = function(tileId) {
    return (tileId - this.TILE_ID_A1) % 48;
};

Tilemap.isTileA1 = function(tileId) {
    return tileId >= this.TILE_ID_A1 && tileId < this.TILE_ID_A2;
};

Tilemap.isTileA2 = function(tileId) {
    return tileId >= this.TILE_ID_A2 && tileId < this.TILE_ID_A3;
};

Tilemap.isTileA3 = function(tileId) {
    return tileId >= this.TILE_ID_A3 && tileId < this.TILE_ID_A4;
};

Tilemap.isTileA4 = function(tileId) {
    return tileId >= this.TILE_ID_A4 && tileId < this.TILE_ID_MAX;
};

Tilemap.isTileA5 = function(tileId) {
    return tileId >= this.TILE_ID_A5 && tileId < this.TILE_ID_A1;
};

Tilemap.isWaterTile = function(tileId) {
    if (this.isTileA1(tileId)) {
        return !(tileId >= this.TILE_ID_A1 + 96 && tileId < this.TILE_ID_A1 + 192);
    } else {
        return false;
    }
};

Tilemap.isWaterfallTile = function(tileId) {
    if (this.isTileA1(tileId)) {
        return tileId >= this.TILE_ID_A1 + 192 && tileId < this.TILE_ID_A2;
    } else {
        return false;
    }
};

Tilemap.isGroundTile = function(tileId) {
    return this.isTileA1(tileId) || this.isTileA2(tileId) || this.isTileA5(tileId);
};

Tilemap.isShadowingTile = function(tileId) {
    return this.isTileA3(tileId) || this.isTileA4(tileId);
};

Tilemap.isRoofTile = function(tileId) {
    return this.isTileA3(tileId) && (this.getAutotileKind(tileId) % 16 < 8);
};

Tilemap.isWallTopTile = function(tileId) {
    return this.isTileA4(tileId) && (this.getAutotileKind(tileId) % 16 < 8);
};

Tilemap.isWallSideTile = function(tileId) {
    return (this.isTileA3(tileId) || this.isTileA4(tileId)) &&
            (this.getAutotileKind(tileId) % 16 % 4 === 0);
};

Tilemap.isWallTile = function(tileId) {
    return this.isWallTopTile(tileId) || this.isWallSideTile(tileId);
};

Tilemap.isFloorTypeAutotile = function(tileId) {
    return (this.isTileA1(tileId) && !this.isWaterfallTile(tileId)) ||
            this.isTileA2(tileId) || this.isTileA5(tileId);
};

Tilemap.isWallTypeAutotile = function(tileId) {
    return this.isTileA3(tileId) || this.isTileA4(tileId);
};

Tilemap.isWaterfallTypeAutotile = function(tileId) {
    return this.isWaterfallTile(tileId);
};

Tilemap.FLOOR_AUTOTILE_TABLE = [
    [[2,4,1,5],[2,4,1,5],[2,4,1,5],[2,4,1,5]],
    [[2,3,1,5],[2,3,1,5],[2,3,1,5],[2,3,1,5]],
    [[2,4,1,4],[2,4,1,4],[2,4,1,4],[2,4,1,4]],
    [[2,3,1,4],[2,3,1,4],[2,3,1,4],[2,3,1,4]],
    [[2,4,1,5],[2,4,1,5],[2,4,1,5],[2,4,1,5]],
    [[3,4,1,5],[3,4,1,5],[3,4,1,5],[3,4,1,5]],
    [[2,4,0,5],[2,4,0,5],[2,4,0,5],[2,4,0,5]],
    [[3,4,0,5],[3,4,0,5],[3,4,0,5],[3,4,0,5]],
    [[2,4,1,5],[2,4,1,5],[2,4,1,5],[2,4,1,5]],
    [[2,3,1,5],[2,3,1,5],[2,3,1,5],[2,3,1,5]],
    [[2,4,1,4],[2,4,1,4],[2,4,1,4],[2,4,1,4]],
    [[2,3,1,4],[2,3,1,4],[2,3,1,4],[2,3,1,4]],
    [[2,4,1,5],[2,4,1,5],[2,4,1,5],[2,4,1,5]],
    [[3,4,1,5],[3,4,1,5],[3,4,1,5],[3,4,1,5]],
    [[2,4,0,5],[2,4,0,5],[2,4,0,5],[2,4,0,5]],
    [[3,4,0,5],[3,4,0,5],[3,4,0,5],[3,4,0,5]],
    [[2,4,1,5],[2,4,1,5],[2,4,1,5],[2,4,1,5]],
    [[3,4,1,5],[3,4,1,5],[3,4,1,5],[3,4,1,5]],
    [[2,3,1,5],[2,3,1,5],[2,3,1,5],[2,3,1,5]],
    [[3,3,1,5],[3,3,1,5],[3,3,1,5],[3,3,1,5]],
    [[2,4,1,4],[2,4,1,4],[2,4,1,4],[2,4,1,4]],
    [[3,4,1,4],[3,4,1,4],[3,4,1,4],[3,4,1,4]],
    [[2,3,1,4],[2,3,1,4],[2,3,1,4],[2,3,1,4]],
    [[3,3,1,4],[3,3,1,4],[3,3,1,4],[3,3,1,4]],
    [[2,4,1,5],[2,4,1,5],[2,4,1,5],[2,4,1,5]],
    [[2,3,1,5],[2,3,1,5],[2,3,1,5],[2,3,1,5]],
    [[2,4,1,4],[2,4,1,4],[2,4,1,4],[2,4,1,4]],
    [[2,3,1,4],[2,3,1,4],[2,3,1,4],[2,3,1,4]],
    [[2,4,0,4],[2,4,0,4],[2,4,0,4],[2,4,0,4]],
    [[3,4,0,4],[3,4,0,4],[3,4,0,4],[3,4,0,4]],
    [[2,3,0,4],[2,3,0,4],[2,3,0,4],[2,3,0,4]],
    [[3,3,0,4],[3,3,0,4],[3,3,0,4],[3,3,0,4]],
    [[2,4,1,5],[2,4,1,5],[2,4,1,5],[2,4,1,5]],
    [[3,4,1,5],[3,4,1,5],[3,4,1,5],[3,4,1,5]],
    [[2,4,0,5],[2,4,0,5],[2,4,0,5],[2,4,0,5]],
    [[3,4,0,5],[3,4,0,5],[3,4,0,5],[3,4,0,5]],
    [[2,4,1,5],[2,4,1,5],[2,4,1,5],[2,4,1,5]],
    [[2,3,1,5],[2,3,1,5],[2,3,1,5],[2,3,1,5]],
    [[2,4,1,4],[2,4,1,4],[2,4,1,4],[2,4,1,4]],
    [[2,3,1,4],[2,3,1,4],[2,3,1,4],[2,3,1,4]],
    [[2,4,0,4],[2,4,0,4],[2,4,0,4],[2,4,0,4]],
    [[3,4,0,4],[3,4,0,4],[3,4,0,4],[3,4,0,4]],
    [[2,3,0,4],[2,3,0,4],[2,3,0,4],[2,3,0,4]],
    [[3,3,0,4],[3,3,0,4],[3,3,0,4],[3,3,0,4]],
    [[0,2,1,5],[0,2,1,5],[0,2,1,5],[0,2,1,5]],
    [[0,2,1,4],[0,2,1,4],[0,2,1,4],[0,2,1,4]],
    [[0,2,0,5],[0,2,0,5],[0,2,0,5],[0,2,0,5]],
    [[0,2,0,4],[0,2,0,4],[0,2,0,4],[0,2,0,4]]
];

Tilemap.WALL_AUTOTILE_TABLE = [
    [[2,2,1,3],[2,2,1,3],[2,2,1,3],[2,2,1,3]],
    [[0,2,1,3],[0,2,1,3],[0,2,1,3],[0,2,1,3]],
    [[2,0,1,3],[2,0,1,3],[2,0,1,3],[2,0,1,3]],
    [[0,0,1,3],[0,0,1,3],[0,0,1,3],[0,0,1,3]],
    [[2,2,1,1],[2,2,1,1],[2,2,1,1],[2,2,1,1]],
    [[0,2,1,1],[0,2,1,1],[0,2,1,1],[0,2,1,1]],
    [[2,0,1,1],[2,0,1,1],[2,0,1,1],[2,0,1,1]],
    [[0,0,1,1],[0,0,1,1],[0,0,1,1],[0,0,1,1]],
    [[2,2,3,3],[2,2,3,3],[2,2,3,3],[2,2,3,3]],
    [[0,2,3,3],[0,2,3,3],[0,2,3,3],[0,2,3,3]],
    [[2,0,3,3],[2,0,3,3],[2,0,3,3],[2,0,3,3]],
    [[0,0,3,3],[0,0,3,3],[0,0,3,3],[0,0,3,3]],
    [[2,2,3,1],[2,2,3,1],[2,2,3,1],[2,2,3,1]],
    [[0,2,3,1],[0,2,3,1],[0,2,3,1],[0,2,3,1]],
    [[2,0,3,1],[2,0,3,1],[2,0,3,1],[2,0,3,1]],
    [[0,0,3,1],[0,0,3,1],[0,0,3,1],[0,0,3,1]],
    [[2,2,1,3],[2,2,1,3],[2,2,1,3],[2,2,1,3]],
    [[0,2,1,3],[0,2,1,3],[0,2,1,3],[0,2,1,3]],
    [[2,0,1,3],[2,0,1,3],[2,0,1,3],[2,0,1,3]],
    [[0,0,1,3],[0,0,1,3],[0,0,1,3],[0,0,1,3]],
    [[2,2,1,1],[2,2,1,1],[2,2,1,1],[2,2,1,1]],
    [[0,2,1,1],[0,2,1,1],[0,2,1,1],[0,2,1,1]],
    [[2,0,1,1],[2,0,1,1],[2,0,1,1],[2,0,1,1]],
    [[0,0,1,1],[0,0,1,1],[0,0,1,1],[0,0,1,1]],
    [[2,2,3,3],[2,2,3,3],[2,2,3,3],[2,2,3,3]],
    [[0,2,3,3],[0,2,3,3],[0,2,3,3],[0,2,3,3]],
    [[2,0,3,3],[2,0,3,3],[2,0,3,3],[2,0,3,3]],
    [[0,0,3,3],[0,0,3,3],[0,0,3,3],[0,0,3,3]],
    [[2,2,3,1],[2,2,3,1],[2,2,3,1],[2,2,3,1]],
    [[0,2,3,1],[0,2,3,1],[0,2,3,1],[0,2,3,1]],
    [[2,0,3,1],[2,0,3,1],[2,0,3,1],[2,0,3,1]],
    [[0,0,3,1],[0,0,3,1],[0,0,3,1],[0,0,3,1]],
    [[2,2,1,3],[2,2,1,3],[2,2,1,3],[2,2,1,3]],
    [[0,2,1,3],[0,2,1,3],[0,2,1,3],[0,2,1,3]],
    [[2,0,1,3],[2,0,1,3],[2,0,1,3],[2,0,1,3]],
    [[0,0,1,3],[0,0,1,3],[0,0,1,3],[0,0,1,3]],
    [[2,2,1,1],[2,2,1,1],[2,2,1,1],[2,2,1,1]],
    [[0,2,1,1],[0,2,1,1],[0,2,1,1],[0,2,1,1]],
    [[2,0,1,1],[2,0,1,1],[2,0,1,1],[2,0,1,1]],
    [[0,0,1,1],[0,0,1,1],[0,0,1,1],[0,0,1,1]],
    [[2,2,3,3],[2,2,3,3],[2,2,3,3],[2,2,3,3]],
    [[0,2,3,3],[0,2,3,3],[0,2,3,3],[0,2,3,3]],
    [[2,0,3,3],[2,0,3,3],[2,0,3,3],[2,0,3,3]],
    [[0,0,3,3],[0,0,3,3],[0,0,3,3],[0,0,3,3]],
    [[2,2,3,1],[2,2,3,1],[2,2,3,1],[2,2,3,1]],
    [[0,2,3,1],[0,2,3,1],[0,2,3,1],[0,2,3,1]],
    [[2,0,3,1],[2,0,3,1],[2,0,3,1],[2,0,3,1]],
    [[0,0,3,1],[0,0,3,1],[0,0,3,1],[0,0,3,1]]
];

Tilemap.WATERFALL_AUTOTILE_TABLE = [
    [[2,2,1,3],[2,2,1,3],[2,2,1,3],[2,2,1,3]],
    [[0,2,1,3],[0,2,1,3],[0,2,1,3],[0,2,1,3]],
    [[2,0,1,3],[2,0,1,3],[2,0,1,3],[2,0,1,3]],
    [[0,0,1,3],[0,0,1,3],[0,0,1,3],[0,0,1,3]],
    [[2,2,1,1],[2,2,1,1],[2,2,1,1],[2,2,1,1]],
    [[0,2,1,1],[0,2,1,1],[0,2,1,1],[0,2,1,1]],
    [[2,0,1,1],[2,0,1,1],[2,0,1,1],[2,0,1,1]],
    [[0,0,1,1],[0,0,1,1],[0,0,1,1],[0,0,1,1]],
    [[2,2,3,3],[2,2,3,3],[2,2,3,3],[2,2,3,3]],
    [[0,2,3,3],[0,2,3,3],[0,2,3,3],[0,2,3,3]],
    [[2,0,3,3],[2,0,3,3],[2,0,3,3],[2,0,3,3]],
    [[0,0,3,3],[0,0,3,3],[0,0,3,3],[0,0,3,3]],
    [[2,2,3,1],[2,2,3,1],[2,2,3,1],[2,2,3,1]],
    [[0,2,3,1],[0,2,3,1],[0,2,3,1],[0,2,3,1]],
    [[2,0,3,1],[2,0,3,1],[2,0,3,1],[2,0,3,1]],
    [[0,0,3,1],[0,0,3,1],[0,0,3,1],[0,0,3,1]],
    [[2,2,1,3],[2,2,1,3],[2,2,1,3],[2,2,1,3]],
    [[0,2,1,3],[0,2,1,3],[0,2,1,3],[0,2,1,3]],
    [[2,0,1,3],[2,0,1,3],[2,0,1,3],[2,0,1,3]],
    [[0,0,1,3],[0,0,1,3],[0,0,1,3],[0,0,1,3]],
    [[2,2,1,1],[2,2,1,1],[2,2,1,1],[2,2,1,1]],
    [[0,2,1,1],[0,2,1,1],[0,2,1,1],[0,2,1,1]],
    [[2,0,1,1],[2,0,1,1],[2,0,1,1],[2,0,1,1]],
    [[0,0,1,1],[0,0,1,1],[0,0,1,1],[0,0,1,1]],
    [[2,2,3,3],[2,2,3,3],[2,2,3,3],[2,2,3,3]],
    [[0,2,3,3],[0,2,3,3],[0,2,3,3],[0,2,3,3]],
    [[2,0,3,3],[2,0,3,3],[2,0,3,3],[2,0,3,3]],
    [[0,0,3,3],[0,0,3,3],[0,0,3,3],[0,0,3,3]],
    [[2,2,3,1],[2,2,3,1],[2,2,3,1],[2,2,3,1]],
    [[0,2,3,1],[0,2,3,1],[0,2,3,1],[0,2,3,1]],
    [[2,0,3,1],[2,0,3,1],[2,0,3,1],[2,0,3,1]],
    [[0,0,3,1],[0,0,3,1],[0,0,3,1],[0,0,3,1]],
    [[2,2,1,3],[2,2,1,3],[2,2,1,3],[2,2,1,3]],
    [[0,2,1,3],[0,2,1,3],[0,2,1,3],[0,2,1,3]],
    [[2,0,1,3],[2,0,1,3],[2,0,1,3],[2,0,1,3]],
    [[0,0,1,3],[0,0,1,3],[0,0,1,3],[0,0,1,3]],
    [[2,2,1,1],[2,2,1,1],[2,2,1,1],[2,2,1,1]],
    [[0,2,1,1],[0,2,1,1],[0,2,1,1],[0,2,1,1]],
    [[2,0,1,1],[2,0,1,1],[2,0,1,1],[2,0,1,1]],
    [[0,0,1,1],[0,0,1,1],[0,0,1,1],[0,0,1,1]],
    [[2,2,3,3],[2,2,3,3],[2,2,3,3],[2,2,3,3]],
    [[0,2,3,3],[0,2,3,3],[0,2,3,3],[0,2,3,3]],
    [[2,0,3,3],[2,0,3,3],[2,0,3,3],[2,0,3,3]],
    [[0,0,3,3],[0,0,3,3],[0,0,3,3],[0,0,3,3]],
    [[2,2,3,1],[2,2,3,1],[2,2,3,1],[2,2,3,1]],
    [[0,2,3,1],[0,2,3,1],[0,2,3,1],[0,2,3,1]],
    [[2,0,3,1],[2,0,3,1],[2,0,3,1],[2,0,3,1]],
    [[0,0,3,1],[0,0,3,1],[0,0,3,1],[0,0,3,1]]
];

Object.defineProperty(Tilemap.prototype, 'tileset', {
    get: function() {
        return this._bitmaps[4];
    },
    set: function(value) {
        if (this._bitmaps[4] !== value) {
            this._bitmaps[4] = value;
        }
    },
    configurable: true
});

Object.defineProperty(Tilemap.prototype, 'autotiles', {
    get: function() {
        return this._bitmaps.slice(0, 4);
    },
    set: function(value) {
        if (this._bitmaps[0] !== value[0] || this._bitmaps[1] !== value[1] ||
                this._bitmaps[2] !== value[2] || this._bitmaps[3] !== value[3]) {
            this._bitmaps[0] = value[0];
            this._bitmaps[1] = value[1];
            this._bitmaps[2] = value[2];
            this._bitmaps[3] = value[3];
        }
    },
    configurable: true
});

Object.defineProperty(Tilemap.prototype, 'lowerLayer', {
    get: function() {
        return this.lowerZLayer;
    },
    configurable: true
});

Object.defineProperty(Tilemap.prototype, 'upperLayer', {
    get: function() {
        return this.upperZLayer;
    },
    configurable: true
});

Object.defineProperty(Tilemap.prototype, 'width', {
    get: function() {
        return this._width;
    },
    configurable: true
});

Object.defineProperty(Tilemap.prototype, 'height', {
    get: function() {
        return this._height;
    },
    configurable: true
});

Object.defineProperty(Tilemap.prototype, 'tileWidth', {
    get: function() {
        return this._tileWidth;
    },
    configurable: true
});

Object.defineProperty(Tilemap.prototype, 'tileHeight', {
    get: function() {
        return this._tileHeight;
    },
    configurable: true
});
