//=============================================================================
// ConfigManager
//=============================================================================

function ConfigManager() {
    throw new Error('This is a static class');
}

ConfigManager.alwaysDash        = false;
ConfigManager.commandRemember   = false;
ConfigManager.bgmVolume         = 100;
ConfigManager.bgsVolume         = 100;
ConfigManager.meVolume          = 100;
ConfigManager.seVolume          = 100;

ConfigManager.load = function() {
    var json;
    var config = {};
    try {
        json = StorageManager.load(-1);
    } catch (e) {
        console.error(e);
    }
    if (json) {
        config = JSON.parse(json);
    }
    this.applyData(config);
};

ConfigManager.save = function() {
    StorageManager.save(-1, JSON.stringify(this.makeData()));
};

ConfigManager.makeData = function() {
    var config = {};
    config.alwaysDash        = this.alwaysDash;
    config.commandRemember   = this.commandRemember;
    config.bgmVolume         = this.bgmVolume;
    config.bgsVolume         = this.bgsVolume;
    config.meVolume          = this.meVolume;
    config.seVolume          = this.seVolume;
    return config;
};

ConfigManager.applyData = function(config) {
    this.alwaysDash        = this.readFlag(config, 'alwaysDash');
    this.commandRemember   = this.readFlag(config, 'commandRemember');
    this.bgmVolume         = this.readVolume(config, 'bgmVolume');
    this.bgsVolume         = this.readVolume(config, 'bgsVolume');
    this.meVolume          = this.readVolume(config, 'meVolume');
    this.seVolume          = this.readVolume(config, 'seVolume');
};

ConfigManager.readFlag = function(config, name) {
    return config[name] !== undefined ? config[name] : false;
};

ConfigManager.readVolume = function(config, name) {
    var value = config[name];
    if (value !== undefined) {
        return Number(value).clamp(0, 100);
    } else {
        return 100;
    }
};
