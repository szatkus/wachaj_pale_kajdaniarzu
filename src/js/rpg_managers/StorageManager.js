//=============================================================================
// StorageManager
//=============================================================================

function StorageManager() {
    throw new Error('This is a static class');
}

StorageManager.save = function(savefileId, json) {
    if (this.isLocalMode()) {
        this.saveToLocalFile(savefileId, json);
    } else {
        this.saveToForage(savefileId, json);
    }
};

StorageManager.load = function(savefileId) {
    if (this.isLocalMode()) {
        return this.loadFromLocalFile(savefileId);
    } else {
        return this.loadFromForage(savefileId);
    }
};

StorageManager.exists = function(savefileId) {
    if (this.isLocalMode()) {
        return this.localFileExists(savefileId);
    } else {
        return this.forageExists(savefileId);
    }
};

StorageManager.remove = function(savefileId) {
    if (this.isLocalMode()) {
        this.removeLocalFile(savefileId);
    } else {
        this.removeForage(savefileId);
    }
};

StorageManager.isLocalMode = function() {
    return Utils.isNwjs();
};

StorageManager.saveToLocalFile = function(savefileId, json) {
    var data = LZString.compressToBase64(json);
    var fs = require('fs');
    var dirPath = this.localFileDirectoryPath();
    var filePath = this.localFilePath(savefileId);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
    fs.writeFileSync(filePath, data);
};

StorageManager.loadFromLocalFile = function(savefileId) {
    var data = null;
    var fs = require('fs');
    var filePath = this.localFilePath(savefileId);
    if (fs.existsSync(filePath)) {
        data = fs.readFileSync(filePath, { encoding: 'utf8' });
    }
    return LZString.decompressFromBase64(data);
};

StorageManager.localFileExists = function(savefileId) {
    var fs = require('fs');
    return fs.existsSync(this.localFilePath(savefileId));
};

StorageManager.removeLocalFile = function(savefileId) {
    var fs = require('fs');
    var filePath = this.localFilePath(savefileId);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

StorageManager.saveToForage = function(savefileId, json) {
    var key = this.forageKey(savefileId);
    var data = LZString.compressToBase64(json);
    localforage.setItem(key, data);
};

StorageManager.loadFromForage = function(savefileId) {
    var key = this.forageKey(savefileId);
    return localforage.getItem(key).then(function(value) {
        return LZString.decompressFromBase64(value);
    });
};

StorageManager.forageExists = function(savefileId) {
    var key = this.forageKey(savefileId);
    return localforage.getItem(key).then(function(value) {
        return value !== null;
    });
};

StorageManager.removeForage = function(savefileId) {
    var key = this.forageKey(savefileId);
    localforage.removeItem(key);
};

StorageManager.localFileDirectoryPath = function() {
    var path = require('path');
    var base = path.dirname(process.mainModule.filename);
    return path.join(base, 'save/');
};

StorageManager.localFilePath = function(savefileId) {
    var name;
    if (savefileId < 0) {
        name = 'config.rpgsave';
    } else if (savefileId === 0) {
        name = 'global.rpgsave';
    } else {
        name = 'file%1.rpgsave'.format(savefileId);
    }
    return this.localFileDirectoryPath() + name;
};

StorageManager.forageKey = function(savefileId) {
    var gameId = $dataSystem.gameId;
    if (savefileId < 0) {
        return 'RPG Config';
    } else if (savefileId === 0) {
        return 'RPG Global';
    } else {
        return 'RPG File%1'.format(savefileId);
    }
};
