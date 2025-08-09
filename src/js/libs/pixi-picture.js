/**
 * pixi-picture - v1.1.0
 * Copyright (c) 2015-2017, Ivan Popelyshev
 * http://www.pixijs.com/
 *
 * Compiled: 2017-09-19
 *
 * pixi-picture is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
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
var PIXI;
(function (PIXI) {
    var picture;
    (function (picture) {
        var glCore = PIXI.glCore;
        var PictureShader = (function (_super) {
            __extends(PictureShader, _super);
            function PictureShader(gl, vert, frag) {
                var _this = _super.call(this, gl, vert, frag) || this;
                _this.uniforms.uSampler2 = 1;
                return _this;
            }
            return PictureShader;
        }(glCore.Shader));
        PictureShader.blendVert = "\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec2 aColor;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vColor;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n    vColor = aColor;\n}\n";
        PictureShader.blendFrag = "\nvarying vec2 vTextureCoord;\nvarying vec2 vColor;\n\nuniform sampler2D uSampler;\nuniform sampler2D uSampler2;\nuniform vec4 uColor;\n\nvoid main(void)\n{\n    vec4 source = texture2D(uSampler, vTextureCoord);\n    vec4 target = texture2D(uSampler2, vTextureCoord);\n\n    //reverse hardlight\n    vec4 result;\n    if (source.a == 0.0) {\n        result = vec4(0,0,0,0);\n    } else {\n        if (target.a > 0.0) {\n            //multiply\n            vec3 Cb = source.rgb/source.a, Cs;\n            if (vColor.y > 0.5) {\n                Cs = target.rgb/target.a;\n            } else {\n                Cs = Cb;\n                Cb = target.rgb/target.a;\n            }\n\n            vec3 B = Cb;\n            vec3 S = Cs;\n\n            vec3 multiply = 2.0 * S * B;\n\n            //screen\n            vec3 screen = S + B - S * B;\n\n            //overlay\n            vec3 C_result = vec3(0.0, 0.0, 0.0);\n            if (2.0 * B.r <= B.a) {\n                C_result.r = 2.0 * S.r * B.r;\n            } else {\n                C_result.r = S.a * B.a - 2.0 * (B.a - S.r) * (S.a - B.r);\n            }\n            if (2.0 * B.g <= B.a) {\n                C_result.g = 2.0 * S.g * B.g;\n            } else {\n                C_result.g = S.a * B.a - 2.0 * (B.a - S.g) * (S.a - B.g);\n            }\n            if (2.0 * B.b <= B.a) {\n                C_result.b = 2.0 * S.b * B.b;\n            } else {\n                C_result.b = S.a * B.a - 2.0 * (B.a - S.b) * (S.a - B.b);\n            }\n\n            vec3 hardlight = C_result;\n\n            if (vColor.y > 0.5) {\n                result = vec4(mix(multiply, hardlight, vColor.x), 1.0) * source.a;\n            } else {\n                result = vec4(mix(hardlight, multiply, vColor.x), 1.0) * source.a;\n            }\n        } else {\n            result = source;\n        }\n    }\n\n    gl_FragColor = result * uColor;\n}\n";
        picture.PictureShader = PictureShader;
    })(picture = PIXI.picture || (PIXI.picture = {}));
})(PIXI || (PIXI = {}));
var PIXI;
(function (PIXI) {
    var picture;
    (function (picture) {
        var PictureRenderer = (function (_super) {
            __extends(PictureRenderer, _super);
            function PictureRenderer(renderer) {
                var _this = _super.call(this, renderer) || this;
                _this.shader = null;
                _this.quad = null;
                _this.quad = new PIXI.Quad(_this.renderer.gl);
                _this.shader = new picture.PictureShader(_this.renderer.gl, picture.PictureShader.blendVert, picture.PictureShader.blendFrag);
                _this.quad.initVao(_this.shader);
                return _this;
            }
            PictureRenderer.prototype.render = function (sprite) {
                if (!sprite._texture._uvs) {
                    return;
                }
                var renderer = this.renderer;
                var quad = this.quad;
                var uvs = sprite._texture._uvs;
                var vertices = sprite.vertexData;
                var blendMode = sprite.blendMode;
                if (blendMode !== PIXI.BLEND_MODES.NORMAL &&
                    blendMode !== PIXIXI.BLEND_MODES.ADD) {
                    this.renderer.flush();
                    var rt = renderer.currentRenderTarget;
                    var fbo = rt.root ? rt.root.fbo : rt.fbo;
                    var tex = this.renderer.getBlendTexture(fbo);
                    renderer.bindTexture(tex, 1, true);
                    this.shader.uniforms.uColor = sprite.tintRgb;
                    if (blendMode === PIXI.BLEND_MODES.MULTIPLY) {
                        this.shader.uniforms.vColor = [0, 0];
                    }
                    else if (blendMode === PIXI.BLEND_MODES.SCREEN) {
                        this.shader.uniforms.vColor = [1, 1];
                    }
                    else {
                        return;
                    }
                }
                quad.map(sprite._texture, sprite.getBounds());
                renderer.bindVao(this.quad.vao);
                this.shader.uniforms.uSampler = renderer.bindTexture(sprite._texture, 0, true);
                renderer.bindShader(this.shader, false);
                quad.upload();
                quad.draw();
            };
            return PictureRenderer;
        }(PIXI.ObjectRenderer));
        picture.PictureRenderer = PictureRenderer;
        PIXI.WebGLRenderer.registerPlugin('picture', PictureRenderer);
    })(picture = PIXI.picture || (PIXI.picture = {}));
})(PIXI || (PIXI = {}));
var PIXI;
(function (PIXI) {
    var picture;
    (function (picture) {
        var Sprite = (function (_super) {
            __extends(Sprite, _super);
            function Sprite(texture) {
                var _this = _super.call(this, texture) || this;
                _this.pluginName = 'picture';
                return _this;
            }
            return Sprite;
        }(PIXI.Sprite));
        picture.Sprite = Sprite;
    })(picture = PIXI.picture || (PIXI.picture = {}));
})(PIXI || (PIXI = {}));
Object.assign(PIXI, {
    picture: PIXI.picture
});
//# sourceMappingURL=pixi-picture.js.map
