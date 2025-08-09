/**
 * pixi-tilemap - v1.2.3
 * Copyright (c) 2015, Ivan Popelyshev
 * http://www.pixijs.com/
 *
 * Compiled: 2017-09-19
 *
 * pixi-tilemap is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
var pixi_tilemap;
(function (pixi_tilemap) {
    var CanvasTilemap = (function () {
        function CanvasTilemap(zIndex, useSquare, textureCacheSize) {
            this.zIndex = 0;
            this.useSquare = false;
            if (zIndex) {
                this.zIndex = zIndex;
            }
            if (useSquare) {
                this.useSquare = useSquare;
            }
            this.textureCacheSize = textureCacheSize || 10;
            this.tileAnim = [0, 0];
            this.clear();
        }
        CanvasTilemap.prototype.clear = function () {
            this.tiles = [];
            this.lastZ = 0;
            this.lastModified = 0;
        };
        CanvasTilemap.prototype.addFrame = function (texture, x, y) {
            var tile = new CanvasTile(texture, x, y);
            this.tiles.push(tile);
            return true;
        };
        CanvasTilemap.prototype.render = function (renderer) {
            var plugins = renderer.plugins;
            if (!plugins.tilemap.dontUseTransform) {
                var wt = this.worldTransform;
                renderer.context.setTransform(wt.a, wt.b, wt.c, wt.d, wt.tx, wt.ty);
            }
            var len = this.tiles.length;
            for (var i = 0; i < len; i++) {
                var tile = this.tiles[i];
                tile.render(renderer);
            }
        };
        return CanvasTilemap;
    }());
    pixi_tilemap.CanvasTilemap = CanvasTilemap;
    var CanvasTile = (function () {
        function CanvasTile(texture, x, y) {
            this.texture = texture;
            this.x = x;
            this.y = y;
            this.visible = true;
        }
        CanvasTile.prototype.render = function (renderer) {
            if (!this.visible)
                return;
            var frame = this.texture.frame;
            renderer.context.drawImage(this.texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, this.x, this.y, frame.width, frame.height);
        };
        return CanvasTile;
    }());
    pixi_tilemap.CanvasTile = CanvasTile;
})(pixi_tilemap || (pixi_tilemap = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var pixi_tilemap;
(function (pixi_tilemap) {
    var CompositeRectTileLayer = (function (_super) {
        __extends(CompositeRectTileLayer, _super);
        function CompositeRectTileLayer(zIndex, bitmaps, useSquare, textureCacheSize) {
            var _this = _super.call(this) || this;
            _this.modificationMarker = 0;
            _this.shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
            _this._globalMat = new PIXI.Matrix();
            _this.initialize.apply(_this, arguments);
            return _this;
        }
        CompositeRectTileLayer.prototype.initialize = function (zIndex, bitmaps, useSquare, textureCacheSize) {
            this.z = this.zIndex = zIndex;
            this.useSquare = useSquare;
            this.bitmaps = bitmaps;
            this.textureCacheSize = textureCacheSize;
        };
        CompositeRectTileLayer.prototype.setBitmaps = function (bitmaps) {
            this.bitmaps = bitmaps;
            this.refresh();
        };
        CompositeRectTileLayer.prototype.clear = function () {
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].clear();
            }
            this.modificationMarker = 0;
        };
        CompositeRectTileLayer.prototype.refresh = function () {
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].refresh();
            }
        };
        CompositeRectTileLayer.prototype.addRect = function (textureIndex, u, v, x, y, tileWidth, tileHeight, animX, animY, rotate) {
            var child = this.children[textureIndex];
            if (!child) {
                child = new pixi_tilemap.RectTileLayer(this.zIndex, this.bitmaps[textureIndex], this.useSquare, this.textureCacheSize);
                child.compositeParent = true;
                this.addChild(child);
            }
            child.addRect(0, u, v, x, y, tileWidth, tileHeight, animX, animY, rotate);
            return true;
        };
        CompositeRectTileLayer.prototype.addFrame = function (texture_, x, y, animX, animY) {
            var texture;
            var textureIndex = -1;
            if (typeof texture_ === "string") {
                texture = PIXI.Texture.fromImage(texture_);
            }
            else {
                texture = texture_;
            }
            for (var i = 0; i < this.bitmaps.length; i++) {
                if (this.bitmaps[i] === texture) {
                    textureIndex = i;
                    break;
                }
            }
            if (textureIndex < 0) {
                console.error("Texture not found in CompositeRectTileLayer");
                return false;
            }
            var child = this.children[textureIndex];
            if (!child) {
                child = new pixi_tilemap.RectTileLayer(this.zIndex, texture, this.useSquare, this.textureCacheSize);
                child.compositeParent = true;
                this.addChild(child);
            }
            child.addFrame(texture, x, y, animX, animY);
            return true;
        };
        CompositeRectTileLayer.prototype.renderCanvas = function (renderer) {
            if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
                return;
            }
            var plugin = renderer.plugins.tilemap;
            if (!plugin.dontUseTransform) {
                this.worldTransform.copy(this.transform.worldTransform);
            }
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].renderCanvas(renderer);
            }
        };
        CompositeRectTileLayer.prototype.renderWebGL = function (renderer) {
            if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
                return;
            }
            var gl = renderer.gl;
            var plugin = renderer.plugins.tilemap;
            var shader = plugin.getShader(this.useSquare);
            renderer.setObjectRenderer(plugin);
            renderer.bindShader(shader);
            this._globalMat.copy(this.transform.worldTransform);
            shader.uniforms.projectionMatrix = renderer.projection.projectionMatrix.toArray(true);
            shader.uniforms.shadowColor = this.shadowColor;
            var children = this.children;
            for (var i = 0; i < children.length; i++) {
                children[i].renderWebGL(renderer);
            }
        };
        CompositeRectTileLayer.prototype.isModified = function (anim) {
            var layers = this.children;
            if (this.modificationMarker !== layers.length) {
                return true;
            }
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].isModified(anim)) {
                    return true;
                }
            }
            return false;
        };
        CompositeRectTileLayer.prototype.clearModify = function () {
            var layers = this.children;
            this.modificationMarker = layers.length;
            for (var i = 0; i < layers.length; i++) {
                layers[i].clearModify();
            }
        };
        return CompositeRectTileLayer;
    }(PIXI.Container));
    pixi_tilemap.CompositeRectTileLayer = CompositeRectTileLayer;
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    var Constant;
    (function (Constant) {
        Constant.TEXTURES_PER_TILEMAP = 16;
        Constant.TEXTILE_SIZE = 1024;
        Constant.TEXTILE_DIMEN = 32;
        Constant.MAX_TEXTURES = 4;
        Constant.TILE_UID = 0;
    })(Constant = pixi_tilemap.Constant || (pixi_tilemap.Constant = {}));
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    var GraphicsLayer = (function (_super) {
        __extends(GraphicsLayer, _super);
        function GraphicsLayer(zIndex) {
            var _this = _super.call(this) || this;
            _this.zIndex = zIndex;
            return _this;
        }
        GraphicsLayer.prototype.renderCanvas = function (renderer) {
            var wt = null;
            if (!renderer.plugins.tilemap.dontUseTransform) {
                wt = this.worldTransform;
                renderer.context.setTransform(wt.a, wt.b, wt.c, wt.d, wt.tx, wt.ty);
            }
            _super.prototype.renderCanvas.call(this, renderer);
            if (wt) {
                renderer.context.setTransform(1, 0, 0, 1, 0, 0);
            }
        };
        GraphicsLayer.prototype.renderWebGL = function (renderer) {
            if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
                return;
            }
            var gl = renderer.gl;
            var plugin = renderer.plugins.tilemap;
            if (!plugin) {
                renderer.setObjectRenderer(renderer.plugins.graphics);
                renderer.plugins.graphics.render(this);
                return;
            }
            if (!plugin.dontUseTransform) {
                this.worldTransform.copy(this.transform.worldTransform);
            }
            renderer.setObjectRenderer(renderer.plugins.graphics);
            renderer.plugins.graphics.render(this);
        };
        return GraphicsLayer;
    }(PIXI.Graphics));
    pixi_tilemap.GraphicsLayer = GraphicsLayer;
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    var RectTileLayer = (function (_super) {
        __extends(RectTileLayer, _super);
        function RectTileLayer(zIndex, texture, useSquare, textureCacheSize) {
            var _this = _super.call(this) || this;
            _this.zIndex = 0;
            _this.useSquare = false;
            _this.pointsBuf = [];
            _this.vbuf = null;
            _this.ibuf = null;
            _this.buffers = [];
            _this.lastTime = 0;
            _this.modificationMarker = 0;
            _this.hasAnim = false;
            _this.canvasBuffer = null;
            _this.cb = null;
            _this.vbId = 0;
            _this.vb = null;
            _this.vbBuffer = null;
            _this.vbData = null;
            _this.vbStride = 0;
            _this.initialize(zIndex, texture, useSquare, textureCacheSize);
            return _this;
        }
        RectTileLayer.prototype.initialize = function (zIndex, texture, useSquare, textureCacheSize) {
            this.pointsBuf = [];
            this.clear();
            this.zIndex = zIndex;
            this.useSquare = useSquare;
            this.texture = texture;
            this.textureCacheSize = textureCacheSize || 10;
        };
        RectTileLayer.prototype.clear = function () {
            this.pointsBuf.length = 0;
            this.lastTime = 0;
            this.modificationMarker = 0;
            this.hasAnim = false;
        };
        RectTileLayer.prototype.renderCanvas = function (renderer) {
            if (!this.texture || !this.texture.valid)
                return;
            var points = this.pointsBuf;
            renderer.context.fillStyle = '#000000';
            for (var i = 0, n = points.length; i < n; i += 9) {
                var x1 = points[i + 2], y1 = points[i + 3];
                var x2 = points[i + 4], y2 = points[i + 5];
                var w = points[i + 6], h = points[i + 7];
                if (this.useSquare) {
                    renderer.context.drawImage(this.texture.baseTexture.source, x1, y1, w, h, x2, y2, w, h);
                }
                else {
                    var salt = (points[i + 8] || 0);
                    var k = salt & 0x3;
                    var b = salt & 0x4;
                    if (b) {
                        renderer.context.setTransform(0, -1, 1, 0, x2, y2 + h);
                    }
                    else {
                        renderer.context.setTransform(1, 0, 0, 1, x2, y2);
                    }
                    if (k !== 0) {
                        var temp = 0;
                        if (k === 1) {
                            renderer.context.setTransform(-1, 0, 0, 1, x2 + w, y2);
                        }
                        else if (k === 2) {
                            renderer.context.setTransform(1, 0, 0, -1, x2, y2 + h);
                        }
                        else if (k === 3) {
                            renderer.context.setTransform(-1, 0, 0, -1, x2 + w, y2 + h);
                        }
                    }
                    renderer.context.drawImage(this.texture.baseTexture.source, x1, y1, w, h, 0, 0, w, h);
                }
            }
        };
        RectTileLayer.prototype.addRect = function (textureIndex, u, v, x, y, tileWidth, tileHeight, animX, animY, rotate) {
            var pb = this.pointsBuf;
            this.hasAnim = this.hasAnim || animX > 0 || animY > 0;
            pb.push(u);
            pb.push(v);
            pb.push(x);
            pb.push(y);
            pb.push(tileWidth);
            pb.push(tileHeight);
            pb.push(animX | 0);
            pb.push(animY | 0);
            pb.push(rotate);
            return true;
        };
        RectTileLayer.prototype.addFrame = function (texture_, x, y, animX, animY) {
            var texture;
            if (typeof texture_ === "string") {
                texture = PIXI.Texture.fromImage(texture_);
            }
            else {
                texture = texture_;
            }
            var frame = texture.frame;
            this.addRect(0, frame.x, frame.y, x, y, frame.width, frame.height, animX, animY, 0);
            return true;
        };
        RectTileLayer.prototype.renderWebGL = function (renderer) {
            var points = this.pointsBuf;
            if (points.length === 0)
                return;
            var gl = renderer.gl;
            var plugin = renderer.plugins.tilemap;
            var shader = plugin.getShader(this.useSquare);
            var textures = shader.uniforms.uSamplers;
            if (this.texture) {
                textures[0] = this.texture.baseTexture;
            }
            else {
                return;
            }
            renderer.bindShader(shader);
            var vb = this.getVb(this.vbId);
            if (!vb) {
                return;
            }
            renderer.bindVao(vb.vao);
            this.lastTime = this.lastTime || 0;
            var tileAnim = plugin.tileAnim;
            shader.uniforms.animationFrame.x = tileAnim[0];
            shader.uniforms.animationFrame.y = tileAnim[1];
            var curLen = 0;
            var _pos = 0;
            var n = points.length;
            while (_pos < n) {
                var currentBatchSize = 0;
                var _p = _pos / 9;
                while (_p < points.length / 9) {
                    var buf = vb.getBuffer('rects' + _p);
                    if (!buf)
                        break;
                    var data = this.vbData;
                    var index = 0;
                    var w = points[_pos + 4];
                    var h = points[_pos + 5];
                    var u = points[_pos + 0];
                    var v = points[_pos + 1];
                    var x = points[_pos + 2];
                    var y = points[_pos + 3];
                    var animX = points[_pos + 6];
                    var animY = points[_pos + 7];
                    var rotate = points[_pos + 8];
                    if (this.useSquare) {
                        data[index++] = x;
                        data[index++] = y;
                        data[index++] = u;
                        data[index++] = v;
                        data[index++] = x + w;
                        data[index++] = y;
                        data[index++] = u + w;
                        data[index++] = v;
                        data[index++] = x + w;
                        data[index++] = y + h;
                        data[index++] = u + w;
                        data[index++] = v + h;
                        data[index++] = x;
                        data[index++] = y + h;
                        data[index++] = u;
                        data[index++] = v + h;
                    }
                    else {
                        var r = rotate;
                        var u0 = u, v0 = v, u1 = u + w, v1 = v, u2 = u + w, v2 = v + h, u3 = u, v3 = v + h;
                        if (r !== 0) {
                            var tmp = 0;
                            if (r === 1) {
                                tmp = u0;
                                u0 = u1;
                                u1 = tmp;
                                tmp = v0;
                                v0 = v1;
                                v1 = tmp;
                                tmp = u2;
                                u2 = u3;
                                u3 = tmp;
                                tmp = v2;
                                v2 = v3;
                                v3 = tmp;
                            }
                            else if (r === 2) {
                                tmp = u0;
                                u0 = u2;
                                u2 = tmp;
                                tmp = v0;
                                v0 = v2;
                                v2 = tmp;
                                tmp = u1;
                                u1 = u3;
                                u3 = tmp;
                                tmp = v1;
                                v1 = v3;
                                v3 = tmp;
                            }
                            else {
                                tmp = u0;
                                u0 = u3;
                                u3 = tmp;
                                tmp = v0;
                                v0 = v3;
                                v3 = tmp;
                                tmp = u1;
                                u1 = u2;
                                u2 = tmp;
                                tmp = v1;
                                v1 = v2;
                                v2 = tmp;
                            }
                        }
                        data[index++] = x;
                        data[index++] = y;
                        data[index++] = u0;
                        data[index++] = v0;
                        data[index++] = animX;
                        data[index++] = animY;
                        data[index++] = x + w;
                        data[index++] = y;
                        data[index++] = u1;
                        data[index++] = v1;
                        data[index++] = animX;
                        data[index++] = animY;
                        data[index++] = x + w;
                        data[index++] = y + h;
                        data[index++] = u2;
                        data[index++] = v2;
                        data[index++] = animX;
                        data[index++] = animY;
                        data[index++] = x;
                        data[index++] = y + h;
                        data[index++] = u3;
                        data[index++] = v3;
                        data[index++] = animX;
                        data[index++] = animY;
                    }
                    buf.update(data);
                    _p++;
                }
                currentBatchSize = _p * 9 - _pos;
                gl.drawElements(gl.TRIANGLES, currentBatchSize / 9 * 6, gl.UNSIGNED_SHORT, _pos / 9 * 6 * 2);
                _pos += currentBatchSize;
            }
        };
        RectTileLayer.prototype.getVb = function (vbId) {
            var vb = this.buffers[vbId];
            if (vb) {
                return vb;
            }
            var gl = PIXI.glCore.GLTexture.fromSource(this.texture.baseTexture.source).gl;
            var points = this.pointsBuf;
            var n = points.length;
            if (n === 0)
                return null;
            var _p = n / 9;
            var vao = new pixi_tilemap.glCore.VertexArrayObject(gl);
            var vertexBuf = new pixi_tilemap.glCore.GLBuffer(gl, gl.ARRAY_BUFFER, null, gl.STREAM_DRAW);
            var indexBuf = new pixi_tilemap.glCore.GLBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, null, gl.STATIC_DRAW);
            vao.addAttribute(vertexBuf, this.getShader().attributes.aVertexPosition);
            vao.addAttribute(vertexBuf, this.getShader().attributes.aTextureCoord);
            if (!this.useSquare) {
                vao.addAttribute(vertexBuf, this.getShader().attributes.aAnim);
            }
            vao.addIndex(indexBuf);
            var stride = this.useSquare ? 16 : 24;
            var data = new Float32Array(_p * 4 * (this.useSquare ? 2 : 3));
            var indices = new Uint16Array(_p * 6);
            for (var i = 0; i < _p; i++) {
                indices[i * 6 + 0] = i * 4 + 0;
                indices[i * 6 + 1] = i * 4 + 1;
                indices[i * 6 + 2] = i * 4 + 2;
                indices[i * 6 + 3] = i * 4 + 0;
                indices[i * 6 + 4] = i * 4 + 2;
                indices[i * 6 + 5] = i * 4 + 3;
            }
            vertexBuf.upload(data);
            indexBuf.upload(indices);
            this.vbId = ++pixi_tilemap.Constant.TILE_UID;
            vb = this.buffers[this.vbId] = {
                vao: vao,
                vertexBuf: vertexBuf,
                indexBuf: indexBuf,
                buffers: {},
                lastTime: -1,
                getBuffer: function (key) {
                    var b = this.buffers[key];
                    if (b)
                        return b;
                    b = new pixi_tilemap.glCore.GLBuffer(gl, gl.ARRAY_BUFFER, null, gl.STREAM_DRAW);
                    return this.buffers[key] = b;
                }
            };
            this.vbData = data;
            this.vbStride = stride;
            this.vbBuffer = vertexBuf;
            return vb;
        };
        RectTileLayer.prototype.getShader = function () {
            return this.renderer.plugins.tilemap.getShader(this.useSquare);
        };
        RectTileLayer.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            for (var i in this.buffers) {
                var vb = this.buffers[i];
                if (vb.vao) {
                    vb.vao.destroy();
                }
            }
        };
        RectTileLayer.prototype.isModified = function (anim) {
            if (this.modificationMarker !== this.pointsBuf.length ||
                (anim && this.hasAnim)) {
                return true;
            }
            return false;
        };
        RectTileLayer.prototype.clearModify = function () {
            this.modificationMarker = this.pointsBuf.length;
        };
        return RectTileLayer;
    }(PIXI.Container));
    pixi_tilemap.RectTileLayer = RectTileLayer;
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    var RectTileShader = (function (_super) {
        __extends(RectTileShader, _super);
        function RectTileShader(gl, maxTextures) {
            var _this = _super.call(this, gl, RectTileShader.VS, RectTileShader.FS.replace(/%count%/gi, maxTextures + '')) || this;
            _this.maxTextures = 0;
            _this.maxTextures = maxTextures;
            pixi_tilemap.shaderGenerator.fillSamplers(_this, _this.maxTextures);
            return _this;
        }
        return RectTileShader;
    }(pixi_tilemap.glCore.Shader));
    RectTileShader.VS = "\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform vec2 animationFrame;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord + animationFrame;\n}\n";
    RectTileShader.FS = "\nvarying vec2 vTextureCoord;\nuniform sampler2D uSamplers[%count%];\nuniform vec4 shadowColor;\n\nvoid main(void)\n{\n    vec4 color;\n    %forloop%\n    gl_FragColor = color;\n}\n";
    pixi_tilemap.RectTileShader = RectTileShader;
    var SquareTileShader = (function (_super) {
        __extends(SquareTileShader, _super);
        function SquareTileShader(gl, maxTextures) {
            var _this = _super.call(this, gl, SquareTileShader.VS, SquareTileShader.FS.replace(/%count%/gi, maxTextures + '')) || this;
            _this.maxTextures = 0;
            _this.maxTextures = maxTextures;
            pixi_tilemap.shaderGenerator.fillSamplers(_this, _this.maxTextures);
            return _this;
        }
        return SquareTileShader;
    }(pixi_tilemap.glCore.Shader));
    SquareTileShader.VS = "\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}\n";
    SquareTileShader.FS = "\nvarying vec2 vTextureCoord;\nuniform sampler2D uSamplers[%count%];\nuniform vec4 shadowColor;\n\nvoid main(void)\n{\n    vec4 color;\n    %forloop%\n    gl_FragColor = color;\n}\n";
    pixi_tilemap.SquareTileShader = SquareTileShader;
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    var TilemapShader = (function (_super) {
        __extends(TilemapShader, _super);
        function TilemapShader(gl, maxTextures, shaderVert, shaderFrag) {
            var _this = _super.call(this, gl, shaderVert, shaderFrag) || this;
            _this.maxTextures = 0;
            _this.maxTextures = maxTextures;
            pixi_tilemap.shaderGenerator.fillSamplers(_this, _this.maxTextures);
            return _this;
        }
        return TilemapShader;
    }(pixi_tilemap.glCore.Shader));
    pixi_tilemap.TilemapShader = TilemapShader;
    var RectTileShader = (function (_super) {
        __extends(RectTileShader, _super);
        function RectTileShader(gl, maxTextures) {
            var _this = _super.call(this, gl, maxTextures, RectTileShader.vert, RectTileShader.frag.replace(/%count%/gi, maxTextures + '')) || this;
            _this.vertSize = 6;
            _this.vertPerQuad = 4;
            _this.stride = _this.vertSize * 4;
            return _this;
        }
        return RectTileShader;
    }(TilemapShader));
    RectTileShader.vert = "\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec2 aAnim;\n\nuniform mat3 projectionMatrix;\nuniform vec2 animationFrame;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void){\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vTextureCoord = aTextureCoord + aAnim * animationFrame;\n}\n";
    RectTileShader.frag = "\nvarying vec2 vTextureCoord;\nuniform sampler2D uSamplers[%count%];\n\nvoid main(void){\n   vec4 color;\n   %forloop%\n   gl_FragColor = color;\n}\n";
    pixi_tilemap.RectTileShader = RectTileShader;
    var SquareTileShader = (function (_super) {
        __extends(SquareTileShader, _super);
        function SquareTileShader(gl, maxTextures) {
            var _this = _super.call(this, gl, maxTextures, SquareTileShader.vert, SquareTileShader.frag.replace(/%count%/gi, maxTextures + '')) || this;
            _this.vertSize = 4;
            _this.vertPerQuad = 4;
            _this.stride = _this.vertSize * 4;
            return _this;
        }
        return SquareTileShader;
    }(TilemapShader));
    SquareTileShader.vert = "\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void){\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vTextureCoord = aTextureCoord;\n}\n";
    SquareTileShader.frag = "\nvarying vec2 vTextureCoord;\nuniform sampler2D uSamplers[%count%];\n\nvoid main(void){\n   vec4 color;\n   %forloop%\n   gl_FragColor = color;\n}\n";
    pixi_tilemap.SquareTileShader = SquareTileShader;
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    var TileRenderer = (function (_super) {
        __extends(TileRenderer, _super);
        function TileRenderer(renderer) {
            var _this = _super.call(this, renderer) || this;
            _this.vbs = {};
            _this.indices = new Uint16Array(0);
            _this.initPlugins();
            _this.lastTime = 0;
            _this.tileAnim = [0, 0];
            _this.dontUseTransform = false;
            return _this;
        }
        TileRenderer.prototype.initPlugins = function () {
        };
        TileRenderer.prototype.onContextChange = function () {
            this.rectShader = new pixi_tilemap.RectTileShader(this.gl, pixi_tilemap.Constant.MAX_TEXTURES);
            this.squareShader = new pixi_tilemap.SquareTileShader(this.gl, pixi_tilemap.Constant.MAX_TEXTURES);
            this.checkIndexBuffer(2000);
            this.vbs = {};
        };
        TileRenderer.prototype.bindTextures = function (renderer, shader, textures) {
            var len = textures.length;
            var maxTextures = shader.maxTextures;
            if (len > maxTextures) {
                renderer.setObjectRenderer(renderer.plugins.batch);
                return;
            }
            var samplerSize = [];
            for (var i = 0; i < len; i++) {
                var texture = textures[i];
                if (!texture || !texture.valid)
                    continue;
                renderer.bindTexture(texture, i, true);
                samplerSize.push(texture.baseTexture.width);
                samplerSize.push(texture.baseTexture.height);
            }
            shader.uniforms.uSamplerSize = samplerSize;
        };
        TileRenderer.prototype.checkIndexBuffer = function (size) {
            var totalIndices = size * 6;
            if (this.indices.length < totalIndices) {
                var oldIndices = this.indices;
                this.indices = new Uint16Array(totalIndices);
                this.indices.set(oldIndices);
                var pos = oldIndices.length / 6;
                for (var i = pos; i < size; i++) {
                    this.indices[i * 6 + 0] = i * 4 + 0;
                    this.indices[i * 6 + 1] = i * 4 + 1;
                    this.indices[i * 6 + 2] = i * 4 + 2;
                    this.indices[i * 6 + 3] = i * 4 + 0;
                    this.indices[i * 6 + 4] = i * 4 + 2;
                    this.indices[i * 6 + 5] = i * 4 + 3;
                }
                if (this.ib) {
                    this.ib.upload(this.indices);
                }
                else {
                    this.ib = new pixi_tilemap.glCore.GLBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.STATIC_DRAW);
                }
            }
        };
        TileRenderer.prototype.getShader = function (useSquare) {
            return useSquare ? this.squareShader : this.rectShader;
        };
        TileRenderer.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.rectShader.destroy();
            this.squareShader.destroy();
            this.rectShader = null;
            this.squareShader = null;
        };
        return TileRenderer;
    }(PIXI.ObjectRenderer));
    pixi_tilemap.TileRenderer = TileRenderer;
    PIXI.WebGLRenderer.registerPlugin('tilemap', TileRenderer);
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    var shaderGenerator;
    (function (shaderGenerator) {
        function fillSamplers(shader, maxTextures) {
            var sampleValues = [];
            for (var i = 0; i < maxTextures; i++) {
                sampleValues[i] = i;
            }
            shader.bind();
            shader.uniforms.uSamplers = sampleValues;
            var sampleSize = [];
            for (var i = 0; i < maxTextures; i++) {
                sampleSize.push(0);
                sampleSize.push(0);
            }
            shader.uniforms.uSamplerSize = sampleSize;
        }
        shaderGenerator.fillSamplers = fillSamplers;
        function generateFragmentSrc(maxTextures, fragmentSrc) {
            return fragmentSrc.replace(/%count%/gi, maxTextures + "")
                .replace(/%forloop%/gi, this.generateSampleSrc(maxTextures));
        }
        shaderGenerator.generateFragmentSrc = generateFragmentSrc;
        function generateSampleSrc(maxTextures) {
            var src = '';
            src += '\n';
            src += '\n';
            for (var i = 0; i < maxTextures; i++) {
                if (i > 0) {
                    src += '\nelse ';
                }
                if (i < maxTextures - 1) {
                    src += 'if (vTextureId < ' + (i + 0.5) + ')';
                }
                src += '\n{';
                src += '\n\tcolor = texture2D(uSamplers[' + i + '], vTextureCoord);';
                src += '\n}';
            }
            src += '\n';
            src += '\n';
            return src;
        }
        shaderGenerator.generateSampleSrc = generateSampleSrc;
    })(shaderGenerator = pixi_tilemap.shaderGenerator || (pixi_tilemap.shaderGenerator = {}));
})(pixi_tilemap || (pixi_tilemap = {}));
var pixi_tilemap;
(function (pixi_tilemap) {
    var glCore = PIXI.glCore;
    function _hackSubImage(tex, frame, target) {
        var gl = tex.gl;
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
        var sr = tex.source;
        if (sr.nodeName) {
            var f = frame;
            var d = target;
            gl.texSubImage2D(gl.TEXTURE_2D, 0, d.x, d.y, d.width, d.height, tex.format, tex.type, sr.getImageData(f.x, f.y, f.width, f.height));
        }
        else {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, frame.x, frame.y, tex.format, tex.type, sr);
        }
        return true;
    }
    pixi_tilemap.glCore = glCore;
})(pixi_tilemap || (pixi_tilemap = {}));
Object.assign(PIXI.tilemap, pixi_tilemap);

//# sourceMappingURL=pixi-tilemap.js.map
