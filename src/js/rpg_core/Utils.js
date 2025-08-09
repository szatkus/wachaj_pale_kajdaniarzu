//=============================================================================
// Utils
//=============================================================================

function Utils() {
    throw new Error('This is a static class');
}

Utils.isOptionValid = function(name) {
    if (location.search.slice(1).split('&').contains(name)) {
        return true;
    }
    if (typeof nw !== 'undefined' && nw.App.argv.length > 0) {
        return nw.App.argv[0].split('&').contains(name);
    }
    return false;
};

Utils.isNwjs = function() {
    return typeof require === 'function' && typeof process === 'object';
};

Utils.isMobileDevice = function() {
    var r = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return r.test(navigator.userAgent);
};

Utils.isMobileSafari = function() {
    var r = /iPhone|iPad|iPod/i;
    return r.test(navigator.userAgent);
};

Utils.isAndroidChrome = function() {
    var r = /Android/i;
    return r.test(navigator.userAgent) && /Chrome/i.test(navigator.userAgent);
};

Utils.canReadGameFiles = function() {
    var scripts = document.getElementsByTagName('script');
    var lastScript = scripts[scripts.length-1];
    var xhr = new XMLHttpRequest();
    try {
        xhr.open('GET', lastScript.src);
        xhr.overrideMimeType('text/javascript');
        xhr.send();
        return true;
    } catch (e) {
        return false;
    }
};

Utils.rgbToCssColor = function(r, g, b) {
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
};

Utils.arrayEquals = function(array1, array2) {
    if (!array1 || !array2 || array1.length !== array2.length) {
        return false;
    }
    for (var i = 0; i < array1.length; i++) {
        if (array1[i] instanceof Array && array2[i] instanceof Array) {
            if (!this.arrayEquals(array1[i], array2[i])) {
                return false;
            }
        } else if (array1[i] !== array2[i]) {
            return false;
        }
    }
    return true;
};
