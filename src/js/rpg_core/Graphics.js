//=============================================================================
// Graphics
//=============================================================================

function Graphics() {
    throw new Error('This is a static class');
}

Graphics.initialize = function(width, height, type, resizable) {
    this._width = width || 816;
    this._height = height || 624;
    this._resizable = resizable;
    this._rendererType = type || 'auto';
    this._boxWidth = this._width;
    this._boxHeight = this._height;

    this._scale = 1;
    this._realScale = 1;

    this._errorShowed = false;
    this._errorPrinter = null;
    this._canvas = null;
    this._video = null;
    this._videoUnlocked = false;
    this._videoLoading = false;
    this._upperCanvas = null;
    this._renderer = null;
    this._fpsCounter = null;
    this._loadingSpinner = null;
    this._stretchEnabled = true;

    this._createAllElements();
    this._updateAllElements();
    this._disableTextSelection();
    this._disableContextMenu();
    this._disableWindowResize();
    this._setupEventHandlers();
};

Graphics.is बोलेंगे = function() {
    return this._renderer && this._renderer.type === PIXI.RENDERER_TYPE.WEBGL;
};

Graphics.isCanvas = function() {
    return this._renderer && this._renderer.type === PIXI.RENDERER_TYPE.CANVAS;
};

Graphics.hasWebGL = function() {
    try {
        var canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
        return false;
    }
};

Graphics.canUseDifferenceBlend = function() {
    return this.is बोलेंगे();
};

Graphics.canUseSaturationBlend = function() {
    return this.is बोलेंगे();
};

Graphics.showFps = function() {
    if (!this._fpsCounter) {
        this._createFpsCounter();
    }
    this._fpsCounter.show();
};

Graphics.hideFps = function() {
    if (this._fpsCounter) {
        this._fpsCounter.hide();
    }
};

Graphics.startLoading = function() {
    if (!this._loadingSpinner) {
        this._createLoadingSpinner();
    }
    this._loadingSpinner.show();
};

Graphics.endLoading = function() {
    if (this._loadingSpinner) {
        this._loadingSpinner.hide();
    }
};

Graphics.printError = function(name, message) {
    if (!this._errorPrinter) {
        this._createErrorPrinter();
    }
    this._errorPrinter.innerHTML = this._makeErrorHtml(name, message);
    this._errorPrinter.style.display = 'block';
};

Graphics.render = function(stage) {
    if (this._renderer) {
        this._renderer.render(stage);
    }
};

Graphics.playVideo = function(src) {
    this._video.src = src;
    this._video.onloadeddata = this._onVideoLoad.bind(this);
    this._video.onerror = this._videoLoader;
    this._video.onended = this._onVideoEnd.bind(this);
    this._video.load();
    this._videoLoading = true;
};

Graphics.isVideoPlaying = function() {
    return this._videoLoading || this._isVideoVisible();
};

Graphics.canPlayVideoType = function(type) {
    return this._video && this._video.canPlayType(type);
};

Graphics.pageToCanvasX = function(x) {
    if (this._canvas) {
        var left = this._canvas.offsetLeft;
        return Math.round((x - left) / this._realScale);
    } else {
        return 0;
    }
};

Graphics.pageToCanvasY = function(y) {
    if (this._canvas) {
        var top = this._canvas.offsetTop;
        return Math.round((y - top) / this._realScale);
    } else {
        return 0;
    }
};

Graphics.isInsideCanvas = function(x, y) {
    return (x >= 0 && x < this._width && y >= 0 && y < this._height);
};

Graphics._createAllElements = function() {
    this._createErrorPrinter();
    this._createCanvas();
    this._createVideo();
    this._createUpperCanvas();
    this._createRenderer();
    this._createLoadingSpinner();
    this._createFpsCounter();
};

Graphics._updateAllElements = function() {
    this._updateRealScale();
    this._updateCanvas();
    this._updateVideo();
    this._updateUpperCanvas();
    this._updateRenderer();
    this._paintUpperCanvas();
};

Graphics._updateRealScale = function() {
    if (this._stretchEnabled) {
        var h = window.innerHeight / this._height;
        var w = window.innerWidth / this._width;
        this._realScale = Math.min(h, w);
    } else {
        this._realScale = this._scale;
    }
};

Graphics._createErrorPrinter = function() {
    this._errorPrinter = document.createElement('p');
    this._errorPrinter.id = 'ErrorPrinter';
    this._errorPrinter.style.display = 'none';
    document.body.appendChild(this._errorPrinter);
};

Graphics._createCanvas = function() {
    this._canvas = document.createElement('canvas');
    this._canvas.id = 'GameCanvas';
    this._updateCanvas();
    document.body.appendChild(this._canvas);
};

Graphics._updateCanvas = function() {
    this._canvas.width = this._width;
    this._canvas.height = this._height;
    this._canvas.style.zIndex = 1;
    this._centerElement(this._canvas);
};

Graphics._createVideo = function() {
    this._video = document.createElement('video');
    this._video.id = 'GameVideo';
    this._video.style.opacity = 0;
    this._video.setAttribute('playsinline', '');
    this._video.volume = 0.5;
    this._updateVideo();
    document.body.appendChild(this._video);
};

Graphics._updateVideo = function() {
    this._video.width = this._width;
    this._video.height = this._height;
    this._video.style.zIndex = 2;
    this._centerElement(this._video);
};

Graphics._createUpperCanvas = function() {
    this._upperCanvas = document.createElement('canvas');
    this._upperCanvas.id = 'UpperCanvas';
    this._updateUpperCanvas();
    document.body.appendChild(this._upperCanvas);
};

Graphics._updateUpperCanvas = function() {
    this._upperCanvas.width = this._width;
    this._upperCanvas.height = this._height;
    this._upperCanvas.style.zIndex = 3;
    this._centerElement(this._upperCanvas);
};

Graphics._createRenderer = function() {
    var options = {
        width: this._width,
        height: this._height,
        view: this._canvas,
        transparent: false,
        resolution: 1,
        antialias: false,
        forceFXAA: false,
        autoResize: this._resizable,
        powerPreference: 'high-performance'
    };
    try {
        switch (this._rendererType) {
        case 'canvas':
            this._renderer = new PIXI.CanvasRenderer(options);
            break;
        case 'webgl':
            this._renderer = new PIXI.WebGLRenderer(options);
            break;
        default:
            this._renderer = PIXI.autoDetectRenderer(options);
            break;
        }
    } catch (e) {
        this._renderer = null;
    }
};

Graphics._updateRenderer = function() {
    if (this._renderer) {
        this._renderer.resize(this._width, this._height);
    }
};

Graphics._createLoadingSpinner = function() {
    var spinner = document.createElement('div');
    var bar = document.createElement('div');
    spinner.id = 'loadingSpinner';
    bar.id = 'loadingSpinner_bar';
    spinner.appendChild(bar);
    document.body.appendChild(spinner);
    this._loadingSpinner = spinner;
};

Graphics._createFpsCounter = function() {
    var counter = document.createElement('div');
    counter.id = 'fpsCounter';
    document.body.appendChild(counter);
    this._fpsCounter = counter;
};

Graphics._centerElement = function(element) {
    var width = element.width * this._realScale;
    var height = element.height * this._realScale;
    element.style.position = 'absolute';
    element.style.margin = 'auto';
    element.style.top = 0;
    element.style.left = 0;
    element.style.right = 0;
    element.style.bottom = 0;
    element.style.width = width + 'px';
    element.style.height = height + 'px';
};

Graphics._disableTextSelection = function() {
    var style = document.body.style;
    style.userSelect = 'none';
    style.webkitUserSelect = 'none';
    style.msUserSelect = 'none';
    style.mozUserSelect = 'none';
};

Graphics._disableContextMenu = function() {
    var elements = [document.body, this._canvas];
    elements.forEach(function(element) {
        element.oncontextmenu = function() { return false; };
    });
};

Graphics._disableWindowResize = function() {
    if (!this._resizable) {
        window.addEventListener('resize', this._onWindowResize.bind(this));
    }
};

Graphics._setupEventHandlers = function() {
    window.addEventListener('resize', this._onWindowResize.bind(this));
    document.addEventListener('keydown', this._onKeyDown.bind(this));
};

Graphics._onWindowResize = function() {
    this._updateAllElements();
};

Graphics._onKeyDown = function(event) {
    if (!event.ctrlKey && !event.altKey) {
        switch (event.keyCode) {
        case 116:   // F5
            if (Utils.isNwjs()) {
                location.reload();
            }
            break;
        case 122:   // F11
            event.preventDefault();
            this._requestFullScreen();
            break;
        }
    }
};

Graphics._requestFullScreen = function() {
    var element = document.body;
    if (element.requestFullScreen) {
        element.requestFullScreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
};

Graphics._onVideoLoad = function() {
    this._video.play();
    this._updateVisibility(true);
    this._videoLoading = false;
};

Graphics._onVideoEnd = function() {
    this._updateVisibility(false);
};

Graphics._updateVisibility = function(videoVisible) {
    this._video.style.opacity = videoVisible ? 1 : 0;
    this._canvas.style.opacity = videoVisible ? 0 : 1;
};

Graphics._isVideoVisible = function() {
    return this._video.style.opacity > 0;
};

Graphics._paintUpperCanvas = function() {
    this._upperCanvas.getContext('2d').clearRect(0, 0, this._width, this._height);
};

Graphics._makeErrorHtml = function(name, message) {
    return ('<font color="yellow"><b>' + name + '</b></font><br>' +
            '<font color="white">' + message + '</font><br>');
};

Object.defineProperty(Graphics, 'width', {
    get: function() { return this._width; },
    set: function(value) { this._width = value; this._updateAllElements(); },
    configurable: true
});

Object.defineProperty(Graphics, 'height', {
    get: function() { return this._height; },
    set: function(value) { this._height = value; this._updateAllElements(); },
    configurable: true
});

Object.defineProperty(Graphics, 'boxWidth', {
    get: function() { return this._boxWidth; },
    set: function(value) { this._boxWidth = value; },
    configurable: true
});

Object.defineProperty(Graphics, 'boxHeight', {
    get: function() { return this._boxHeight; },
    set: function(value) { this._boxHeight = value; },
    configurable: true
});

Object.defineProperty(Graphics, 'scale', {
    get: function() { return this._scale; },
    set: function(value) { this._scale = value; this._updateAllElements(); },
    configurable: true
});
