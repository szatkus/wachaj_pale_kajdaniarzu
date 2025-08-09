//=============================================================================
// WebAudio
//=============================================================================

function WebAudio() {
    this.initialize.apply(this, arguments);
}

WebAudio.prototype.initialize = function(url) {
    if (!WebAudio._initialized) {
        WebAudio.initialize();
    }
    this.clear();

    if (url) {
        this._url = url;
        this._load(url);
    }
};

WebAudio.initialize = function(noAudio) {
    if (!this._initialized) {
        this._context = new (window.AudioContext || window.webkitAudioContext)();
        this._masterGain = this._context.createGain();
        this._masterGain.connect(this._context.destination);
        this._initialized = true;
        if (noAudio) {
            this._context.close();
        }
    }
};

WebAudio.prototype.clear = function() {
    this.stop();
    this._buffer = null;
    this._sourceNode = null;
    this._gainNode = null;
    this._pannerNode = null;
    this._totalTime = 0;
    this._sampleRate = 0;
    this._loop = false;
    this._loopStart = 0;
    this._loopLength = 0;
    this._startTime = 0;
    this._volume = 1;
    this._pitch = 1;
    this._pan = 0;
    this._onLoad = null;
    this._onEnd = null;
    this._isLoaded = false;
    this._isError = false;
    this._isPlaying = false;
};

WebAudio.prototype.isLoaded = function() {
    return this._isLoaded;
};

WebAudio.prototype.isError = function() {
    return this._isError;
};

WebAudio.prototype.isPlaying = function() {
    return this._isPlaying;
};

WebAudio.prototype.play = function(loop, offset) {
    if (this.isLoaded()) {
        this._startTime = this._context.currentTime - offset;
        this._createNodes();
        this._sourceNode.loop = loop;
        this._sourceNode.start(0, offset);
        this._isPlaying = true;
    }
};

WebAudio.prototype.stop = function() {
    if (this._sourceNode) {
        this._sourceNode.stop(0);
        this._sourceNode = null;
        this._gainNode = null;
        this._pannerNode = null;
        this._isPlaying = false;
    }
};

WebAudio.prototype.fadeIn = function(duration) {
    if (this.isLoaded()) {
        if (this._gainNode) {
            var gain = this._gainNode.gain;
            var currentTime = this._context.currentTime;
            gain.setValueAtTime(0, currentTime);
            gain.linearRampToValueAtTime(this._volume, currentTime + duration);
        }
    }
};

WebAudio.prototype.fadeOut = function(duration) {
    if (this._gainNode) {
        var gain = this._gainNode.gain;
        var currentTime = this._context.currentTime;
        gain.setValueAtTime(this._volume, currentTime);
        gain.linearRampToValueAtTime(0, currentTime + duration);
    }
};

WebAudio.prototype.seek = function() {
    if (this._sourceNode) {
        var offset = this._context.currentTime - this._startTime;
        this.play(this._sourceNode.loop, offset);
    }
};

WebAudio.prototype.addLoadListener = function(listner) {
    this._onLoad = listner;
};

WebAudio.prototype.addEndListener = function(listner) {
    this._onEnd = listner;
};

WebAudio.prototype._load = function(url) {
    if (WebAudio._context) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
            if (xhr.status < 400) {
                this._onXhrLoad(xhr);
            }
        }.bind(this);
        xhr.onerror = function() {
            this._isError = true;
        }.bind(this);
        xhr.send();
    }
};

WebAudio.prototype._onXhrLoad = function(xhr) {
    var array = xhr.response;
    this._context.decodeAudioData(array, function(buffer) {
        this._buffer = buffer;
        this._isLoaded = true;
        if (this._onLoad) {
            this._onLoad();
        }
    }.bind(this));
};

WebAudio.prototype._createNodes = function() {
    var context = this._context;
    this._sourceNode = context.createBufferSource();
    this._sourceNode.buffer = this._buffer;
    this._sourceNode.loopStart = this._loopStart;
    this._sourceNode.loopEnd = this._loopStart + this._loopLength;
    this._sourceNode.onended = this._onEnd;
    this._gainNode = context.createGain();
    this._gainNode.gain.value = this._volume;
    this._pannerNode = context.createPanner();
    this._pannerNode.panningModel = 'equalpower';
    this._pannerNode.setPosition(this._pan, 0, 1 - Math.abs(this._pan));
    this._sourceNode.connect(this._gainNode);
    this._gainNode.connect(this._pannerNode);
    this._pannerNode.connect(WebAudio._masterGain);
};

WebAudio.prototype._setupEventHandlers = function() {
    document.addEventListener('visibilitychange', this._onVisibilityChange.bind(this));
};

WebAudio.prototype._onVisibilityChange = function() {
    if (document.visibilityState === 'hidden') {
        this._onHide();
    } else {
        this._onShow();
    }
};

WebAudio.prototype._onHide = function() {
    if (this._isPlaying) {
        this._context.suspend();
    }
};

WebAudio.prototype._onShow = function() {
    if (this._isPlaying) {
        this._context.resume();
    }
};

WebAudio._initialized = false;
WebAudio._context = null;
WebAudio._masterGain = null;

Object.defineProperty(WebAudio.prototype, 'volume', {
    get: function() {
        return this._volume;
    },
    set: function(value) {
        this._volume = value;
        if (this._gainNode) {
            this._gainNode.gain.value = this._volume;
        }
    },
    configurable: true
});

Object.defineProperty(WebAudio.prototype, 'pitch', {
    get: function() {
        return this._pitch;
    },
    set: function(value) {
        this._pitch = value;
        if (this._sourceNode) {
            this._sourceNode.playbackRate.value = this._pitch;
        }
    },
    configurable: true
});

Object.defineProperty(WebAudio.prototype, 'pan', {
    get: function() {
        return this._pan;
    },
    set: function(value) {
        this._pan = value;
        if (this._pannerNode) {
            this._pannerNode.setPosition(this._pan, 0, 1 - Math.abs(this._pan));
        }
    },
    configurable: true
});
