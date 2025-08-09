/*:
 * @plugindesc This plugin provides the basic features for a community-based project.
 * @author RMMV Community
 *
 * @param screenWidth
 * @desc The width of the screen.
 * @default 816
 *
 * @param screenHeight
 * @desc The height of the screen.
 * @default 624
 *
 * @param screenResizable
 * @desc Whether the screen is resizable.
 * @default true
 *
 * @param noAudio
 * @desc Whether to disable audio.
 * @default false
 *
 * @help
 * This plugin provides basic features for a community-based project.
 * It is recommended to use this plugin for any new project.
 */

(function() {

    var parameters = PluginManager.parameters('Community_Basic');
    var screenWidth = Number(parameters['screenWidth'] || 816);
    var screenHeight = Number(parameters['screenHeight'] || 624);
    var screenResizable = String(parameters['screenResizable'] || 'true') === 'true';
    var noAudio = String(parameters['noAudio'] || 'false') === 'true';

    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        _Scene_Boot_start.call(this);
        if (Utils.isNwjs()) {
            var gui = require('nw.gui');
            var win = gui.Window.get();
            if (screenResizable) {
                win.setResizable(true);
                win.maximize();
            } else {
                win.setResizable(false);
                win.width = screenWidth;
                win.height = screenHeight;
            }
        }
    };

    if (noAudio) {
        AudioManager.stopAll = function() {};
        AudioManager.stopBgm = function() {};
        AudioManager.stopBgs =function() {};
        AudioManager.stopMe = function() {};
        AudioManager.stopSe = function() {};
        AudioManager.playBgm = function(bgm, pos) {};
        AudioManager.playBgs = function(bgs, pos) {};
        AudioManager.playMe = function(me) {};
        AudioManager.playSe = function(se) {};
        AudioManager.replayBgm = function(bgm) {};
        AudioManager.replayBgs = function(bgs) {};
        AudioManager.fadeInBgm = function(volume, duration) {};
        AudioManager.fadeOutBgm = function(duration) {};
        AudioManager.fadeInBgs = function(volume, duration) {};
        AudioManager.fadeOutBgs = function(duration) {};
    }

})();
