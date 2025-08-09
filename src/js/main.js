//=============================================================================
// main.js
//=============================================================================

var Imported = Imported || {};
Imported.Main = true;

var pluginManager = new PluginManager();

function setupErrorHandlers() {
    window.addEventListener('error', function(event) {
        main.onError(event.error);
    });
    process.on('uncaughtException', function(error) {
        main.onError(error);
        main.terminate();
    });
}

function Main() {
    this.busy = false;
    this.initialized = false;
}

Main.prototype.run = function() {
    this.initialize();
    this.start();
};

Main.prototype.initialize = function() {
    if (!this.initialized) {
        this.initNwjs();
        this.initGraphics();
        this.initAudio();
        this.initInput();
        this.initUtils();
        this.initManagers();
        this.initScenes();
        this.initialized = true;
    }
};

Main.prototype.initNwjs = function() {
    if (Utils.isNwjs()) {
        var gui = require('nw.gui');
        var win = gui.Window.get();
        if (process.platform === 'darwin' && !win.menu) {
            var menubar = new gui.Menu({ type: 'menubar' });
            var macMenu = new gui.Menu();
            menubar.createMacBuiltin('Game');
            win.menu = menubar;
            win.menu.append(new gui.MenuItem({
                label: 'MacNew',
                submenu: macMenu
            }));
        }
    }
};

Main.prototype.initGraphics = function() {
    var width = Number(pluginManager.parameters('Community_Basic')['screenWidth'] || 816);
    var height = Number(pluginManager.parameters('Community_Basic')['screenHeight'] || 624);
    var resizable = String(pluginManager.parameters('Community_Basic')['screenResizable'] || 'true') === 'true';
    Graphics.initialize(width, height, 'webgl', resizable);
    Graphics.boxWidth = width;
    Graphics.boxHeight = height;
};

Main.prototype.initAudio = function() {
    var noAudio = String(pluginManager.parameters('Community_Basic')['noAudio'] || 'false') === 'true';
    WebAudio.initialize(!noAudio);
};

Main.prototype.initInput = function() {
    Input.initialize();
};

Main.prototype.initUtils = function() {
    Utils.initialize();
};

Main.prototype.initManagers = function() {
    DataManager.loadDatabase();
    ConfigManager.load();
    ImageManager.loadAnimation('Slash_Normal');
    ImageManager.loadBattleback1('Grassland');
    Image.Manager.loadBattleback2('Grassland');
};

Main.prototype.initScenes = function() {
    SceneManager.run(Scene_Boot);
};

Main.prototype.onReady = function() {
    ImageManager.clearRequest();
    if (this.busy) {
        setTimeout(this.onReady.bind(this), 100);
    } else {
        SceneManager.update();
        Graphics.render(SceneManager.instance());
        requestAnimationFrame(this.onReady.bind(this));
    }
};

Main.prototype.onDatabaseLoaded = function() {
    this.initScenes();
};

Main.prototype.onCurrentSceneStarted = function() {
    ImageManager.clearRequest();
};

Main.prototype.start = function() {
    this.busy = true;
    SceneManager.run(Scene_Boot);
    SceneManager.onCurrentSceneStarted = this.onCurrentSceneStarted.bind(this);
    this.onReady();
};

Main.prototype.onError = function(e) {
    console.error(e.stack);
    try {
        this.stop();
        Graphics.printError('Error', e.message);
        AudioManager.stopAll();
    } catch (e2) {
    }
};

Main.prototype.terminate = function() {
    if (Utils.isNwjs()) {
        require('nw.gui').Window.get().close();
    }
};

var main = new Main();
