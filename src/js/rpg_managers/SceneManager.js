//=============================================================================
// SceneManager
//=============================================================================

function SceneManager() {
    throw new Error('This is a static class');
}

SceneManager._scene             = null;
SceneManager._nextScene         = null;
SceneManager._stack             = [];
SceneManager._stopped           = false;
SceneManager._sceneStarted      = false;
SceneManager._exiting           = false;
SceneManager._previousClass     = null;
SceneManager._backgroundBitmap  = null;
SceneManager._screenWidth       = 816;
SceneManager._screenHeight      = 624;
SceneManager._boxWidth          = 816;
SceneManager._boxHeight         = 624;

SceneManager.run = function(sceneClass) {
    try {
        this.initialize();
        this.goto(sceneClass);
        this.requestUpdate();
    } catch (e) {
        this.catchException(e);
    }
};

SceneManager.initialize = function() {
    this.initGraphics();
    this.checkBrowser();
    this.checkPluginErrors();
    this.setupErrorHandlers();
};

SceneManager.initGraphics = function() {
    var type = this.preferableRendererType();
    Graphics.initialize(this._screenWidth, this._screenHeight, type);
    Graphics.boxWidth = this._boxWidth;
    Graphics.boxHeight = this._boxHeight;
    this.updateResolution();
};

SceneManager.preferableRendererType = function() {
    if (Utils.isOptionValid('canvas')) {
        return 'canvas';
    } else if (Utils.isOptionValid('webgl')) {
        return 'webgl';
    } else {
        return 'auto';
    }
};

SceneManager.updateResolution = function() {
    this._screenWidth = $dataSystem.advanced.screenWidth;
    this._screenHeight = $dataSystem.advanced.screenHeight;
    Graphics.width = this._screenWidth;
    Graphics.height = this._screenHeight;
};

SceneManager.checkBrowser = function() {
    if (!PIXI.utils.isWebGLSupported()) {
        throw new Error('Your browser does not support WebGL.');
    }
};

SceneManager.checkPluginErrors = function() {
    PluginManager.checkErrors();
};

SceneManager.setupErrorHandlers = function() {
    window.addEventListener('error', this.onError.bind(this));
    document.addEventListener('keydown', this.onKeyDown.bind(this));
};

SceneManager.requestUpdate = function() {
    if (!this._stopped) {
        requestAnimationFrame(this.update.bind(this));
    }
};

SceneManager.update = function() {
    try {
        this.tickStart();
        this.updateInputData();
        this.updateMain();
        this.tickEnd();
    } catch (e) {
        this.catchException(e);
    }
};

SceneManager.terminate = function() {
    window.close();
};

SceneManager.onError = function(e) {
    console.error(e.message);
    console.error(e.filename, e.lineno);
    try {
        this.stop();
        Graphics.printError('Error', e.message);
        AudioManager.stopAll();
    } catch (e2) {
    }
};

SceneManager.onKeyDown = function(event) {
    if (!event.ctrlKey && !event.altKey) {
        switch (event.keyCode) {
        case 116:   // F5
            if (Utils.isNwjs()) {
                location.reload();
            }
            break;
        case 119:   // F8
            if (Utils.isNwjs() && Utils.isOptionValid('test')) {
                require('nw.gui').Window.get().showDevTools();
            }
            break;
        }
    }
};

SceneManager.catchException = function(e) {
    if (e instanceof Error) {
        Graphics.printError(e.name, e.message);
        console.error(e.stack);
    } else {
        Graphics.printError('UnknownError', e);
    }
    AudioManager.stopAll();
    this.stop();
};

SceneManager.tickStart = function() {
    Graphics.tickStart();
};

SceneManager.tickEnd = function() {
    Graphics.tickEnd();
};

SceneManager.updateInputData = function() {
    Input.update();
    TouchInput.update();
};

SceneManager.updateMain = function() {
    this.changeScene();
    this.updateScene();
    this.renderScene();
    this.requestUpdate();
};

SceneManager.changeScene = function() {
    if (this.isSceneChanging() && !this.isCurrentSceneBusy()) {
        if (this._scene) {
            this._scene.terminate();
            this._previousClass = this._scene.constructor;
        }
        this._scene = this._nextScene;
        if (this._scene) {
            this._scene.create();
            this._sceneStarted = false;
            this.onSceneCreate();
        }
        if (this._exiting) {
            this.terminate();
        }
    }
};

SceneManager.updateScene = function() {
    if (this._scene) {
        if (!this._sceneStarted && this._scene.isReady()) {
            this._scene.start();
            this._sceneStarted = true;
            this.onSceneStart();
        }
        if (this.isCurrentSceneStarted()) {
            this._scene.update();
        }
    }
};

SceneManager.renderScene = function() {
    if (this.isCurrentSceneStarted()) {
        Graphics.render(this._scene);
    }
};

SceneManager.onSceneCreate = function() {
    Graphics.startLoading();
};

SceneManager.onSceneStart = function() {
    Graphics.endLoading();
};

SceneManager.isSceneChanging = function() {
    return this._exiting || !!this._nextScene;
};

SceneManager.isCurrentSceneBusy = function() {
    return this._scene && this._scene.isBusy();
};

SceneManager.isCurrentSceneStarted = function() {
    return this._scene && this._sceneStarted;
};

SceneManager.goto = function(sceneClass) {
    if (sceneClass) {
        this._nextScene = new sceneClass();
    }
    if (this._scene) {
        this._scene.stop();
    }
};

SceneManager.push = function(sceneClass) {
    this._stack.push(this._scene.constructor);
    this.goto(sceneClass);
};

SceneManager.pop = function() {
    if (this._stack.length > 0) {
        this.goto(this._stack.pop());
    } else {
        this.exit();
    }
};

SceneManager.exit = function() {
    this.goto(null);
    this._exiting = true;
};

SceneManager.clearStack = function() {
    this._stack = [];
};

SceneManager.stop = function() {
    this._stopped = true;
};

SceneManager.prepareNextScene = function() {
    this._nextScene.prepare.apply(this._nextScene, arguments);
};

SceneManager.snap = function() {
    return Bitmap.snap(this._scene);
};

SceneManager.snapForBackground = function() {
    this._backgroundBitmap = this.snap();
    this.setBGBlack();
};

SceneManager.backgroundBitmap = function() {
    return this._backgroundBitmap;
};

SceneManager.setBGBlack = function() {
    var black = new Bitmap(Graphics.width, Graphics.height);
    this._backgroundBitmap = black;
};

Object.defineProperty(SceneManager, 'scene', {
    get: function() {
        return this._scene;
    },
    configurable: true
});
