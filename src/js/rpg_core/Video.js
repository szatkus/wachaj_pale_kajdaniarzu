//=============================================================================
// Video
//=============================================================================

function Video() {
    throw new Error('This is a static class');
}

Video.initialize = function(width, height) {
    this._width = width;
    this._height = height;
    this._volume = 1;
    this._createElement();
    this._setupEventHandlers();
};

Video.volume = 1;

Video._createElement = function() {
    this._element = document.createElement('video');
    this._element.id = 'gameVideo';
    this._element.style.position = 'absolute';
    this._element.style.margin = 'auto';
    this._element.style.top = 0;
    this._element.style.left = 0;
    this._element.style.right = 0;
    this._element.style.bottom = 0;
    this._element.style.opacity = 0;
    this._element.width = this._width;
    this._element.height = this._height;
    this._element.setAttribute('playsinline', '');
    document.body.appendChild(this._element);
};

Video._setupEventHandlers = function() {
    this._element.addEventListener('loadeddata', this._onLoadedData.bind(this));
    this._element.addEventListener('error', this._onError.bind(this));
    this._element.addEventListener('ended', this._onEnded.bind(this));
};

Video._onLoadedData = function() {
    this._element.volume = this._volume;
    this._element.play();
    this._updateVisibility(true);
};

Video._onError = function() {
    this._error = true;
};

Video._onEnded = function() {
    this._updateVisibility(false);
};

Video._updateVisibility = function(videoVisible) {
    this._element.style.opacity = videoVisible ? 1 : 0;
};

Video.play = function(src) {
    this._element.src = src;
    this._element.load();
};

Video.isPlaying = function() {
    return this._element.style.opacity > 0;
};

Object.defineProperty(Video, 'volume', {
    get: function() {
        return this._volume;
    },
    set: function(value) {
        this._volume = value;
        if (this._element) {
            this._element.volume = this._volume;
        }
    },
    configurable: true
});
