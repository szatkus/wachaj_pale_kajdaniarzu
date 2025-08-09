//=============================================================================
// DataManager
//=============================================================================

function DataManager() {
    throw new Error('This is a static class');
}

var $dataActors       = null;
var $dataClasses      = null;
var $dataSkills       = null;
var $dataItems        = null;
var $dataWeapons      = null;
var $dataArmors       = null;
var $dataEnemies      = null;
var $dataTroops       = null;
var $dataStates       = null;
var $dataAnimations   = null;
var $dataTilesets     = null;
var $dataCommonEvents = null;
var $dataSystem       = null;
var $dataMapInfos     = null;
var $dataMap          = null;
var $gameTemp         = null;
var $gameSystem       = null;
var $gameScreen       = null;
var $gameTimer        = null;
var $gameMessage      = null;
var $gameSwitches     = null;
var $gameVariables    = null;
var $gameSelfSwitches = null;
var $gameActors       = null;
var $gameParty        = null;
var $gameTroop        = null;
var $gameMap          = null;
var $gamePlayer       = null;
var $testEvent        = null;

DataManager._globalId       = 'RPGMV';
DataManager._lastAccessedId = 1;
DataManager._errorUrl       = null;

DataManager._databaseFiles = [
    { name: '$dataActors',       src: 'Actors.json'       },
    { name: '$dataClasses',      src: 'Classes.json'      },
    { name: '$dataSkills',       src: 'Skills.json'       },
    { name: '$dataItems',        src: 'Items.json'        },
    { name: '$dataWeapons',      src: 'Weapons.json'      },
    { name: '$dataArmors',       src: 'Armors.json'       },
    { name: '$dataEnemies',      src: 'Enemies.json'      },
    { name: '$dataTroops',       src: 'Troops.json'       },
    { name: '$dataStates',       src: 'States.json'       },
    { name: '$dataAnimations',   src: 'Animations.json'   },
    { name: '$dataTilesets',     src: 'Tilesets.json'     },
    { name: '$dataCommonEvents', src: 'CommonEvents.json' },
    { name: '$dataSystem',       src: 'System.json'       },
    { name: '$dataMapInfos',     src: 'MapInfos.json'     }
];

DataManager.loadDatabase = function() {
    var test = this.isBattleTest() || this.isEventTest();
    var prefix = test ? 'test_' : '';
    for (var i = 0; i < this._databaseFiles.length; i++) {
        var name = this._databaseFiles[i].name;
        var src = this._databaseFiles[i].src;
        this.loadDataFile(name, prefix + src);
    }
    if (this.isEventTest()) {
        this.loadDataFile('$testEvent', 'test_event.json');
    }
};

DataManager.loadDataFile = function(name, src) {
    var xhr = new XMLHttpRequest();
    var url = 'data/' + src;
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function() {
        if (xhr.status < 400) {
            window[name] = JSON.parse(xhr.responseText);
            DataManager.onLoad(window[name]);
        }
    };
    xhr.onerror = function() {
        DataManager._errorUrl = DataManager._errorUrl || url;
    };
    window[name] = null;
    xhr.send();
};

DataManager.isDatabaseLoaded = function() {
    this.checkError();
    for (var i = 0; i < this._databaseFiles.length; i++) {
        if (!window[this._databaseFiles[i].name]) {
            return false;
        }
    }
    return true;
};

DataManager.loadMapData = function(mapId) {
    if (mapId > 0) {
        var filename = 'Map%1.json'.format(mapId.padZero(3));
        this.loadDataFile('$dataMap', filename);
    } else {
        this.makeEmptyMap();
    }
};

DataManager.makeEmptyMap = function() {
    $dataMap = {};
    $dataMap.data = [];
    $dataMap.events = [];
    $dataMap.width = 100;
    $dataMap.height = 100;
    $dataMap.scrollType = 3;
};

DataManager.isMapLoaded = function() {
    this.checkError();
    return !!$dataMap;
};

DataManager.onLoad = function(object) {
    var array;
    if (object === $dataMap) {
        this.extractMetadata(object);
        array = object.events;
    } else {
        array = object;
    }
    if (Array.isArray(array)) {
        for (var i = 0; i < array.length; i++) {
            var data = array[i];
            if (data && data.note !== undefined) {
                this.extractMetadata(data);
            }
        }
    }
};

DataManager.extractMetadata = function(data) {
    var re = /<([^<>:]+)(:?)([^>]*)>/g;
    data.meta = {};
    for (;;) {
        var match = re.exec(data.note);
        if (match) {
            if (match[2] === ':') {
                data.meta[match[1]] = match[3];
            } else {
                data.meta[match[1]] = true;
            }
        } else {
            break;
        }
    }
};

DataManager.checkError = function() {
    if (DataManager._errorUrl) {
        throw new Error('Failed to load: ' + DataManager._errorUrl);
    }
};

DataManager.isBattleTest = function() {
    return Utils.isOptionValid('btest');
};

DataManager.isEventTest = function() {
    return Utils.isOptionValid('etest');
};

DataManager.isSkillForcing = function() {
    return Utils.isOptionValid('skill');
};

DataManager.saveGame = function(savefileId) {
    try {
        StorageManager.save(savefileId, this.makeSaveContents());
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

DataManager.loadGame = function(savefileId) {
    try {
        return this.extractSaveContents(StorageManager.load(savefileId));
    } catch (e) {
        console.error(e);
        return false;
    }
};

DataManager.isAnySavefileExists = function() {
    return StorageManager.isAnySavefileExists();
};

DataManager.latestSavefileId = function() {
    return StorageManager.latestSavefileId();
};

DataManager.loadAllSavefileImages = function() {
    var info = this.loadSavefileInfo(0);
    if (info) {
        this.loadSavefileImages(info);
    }
};

DataManager.loadSavefileInfo = function(savefileId) {
    return StorageManager.load(savefileId);
};

DataManager.loadSavefileImages = function(info) {
    if (info.characters) {
        for (var i = 0; i < info.characters.length; i++) {
            ImageManager.loadCharacter(info.characters[i][0]);
        }
    }
    if (info.faces) {
        for (var j = 0; j < info.faces.length; j++) {
            ImageManager.loadFace(info.faces[j][0]);
        }
    }
};

DataManager.maxSavefiles = function() {
    return 20;
};

DataManager.savefileInfo = function(savefileId) {
    return StorageManager.load(savefileId);
};

DataManager.makeSaveContents = function() {
    // A save data does not contain $gameTemp, $gameMessage, and $gameTroop.
    var contents = {};
    contents.system        = $gameSystem;
    contents.screen        = $gameScreen;
    contents.timer         = $gameTimer;
    contents.switches      = $gameSwitches;
    contents.variables     = $gameVariables;
    contents.selfSwitches  = $gameSelfSwitches;
    contents.actors        = $gameActors;
    contents.party         = $gameParty;
    contents.map           = $gameMap;
    contents.player        = $gamePlayer;
    return contents;
};

DataManager.extractSaveContents = function(contents) {
    $gameSystem        = contents.system;
    $gameScreen        = contents.screen;
    $gameTimer         = contents.timer;
    $gameSwitches      = contents.switches;
    $gameVariables     = contents.variables;
    $gameSelfSwitches  = contents.selfSwitches;
    $gameActors        = contents.actors;
    $gameParty         = contents.party;
    $gameMap           = contents.map;
    $gamePlayer        = contents.player;
    return true;
};

DataManager.createGameObjects = function() {
    $gameTemp          = new Game_Temp();
    $gameSystem        = new Game_System();
    $gameScreen        = new Game_Screen();
    $gameTimer         = new Game_Timer();
    $gameMessage       = new Game_Message();
    $gameSwitches      = new Game_Switches();
    $gameVariables     = new Game_Variables();
    $gameSelfSwitches  = new Game_SelfSwitches();
    $gameActors        = new Game_Actors();
    $gameParty         = new Game_Party();
    $gameTroop         = new Game_Troop();
    $gameMap           = new Game_Map();
    $gamePlayer        = new Game_Player();
};

DataManager.setupNewGame = function() {
    this.createGameObjects();
    $gameParty.setupStartingMembers();
    $gamePlayer.reserveTransfer($dataSystem.startMapId,
        $dataSystem.startX, $dataSystem.startY);
    Graphics.playVideo('videos/opening.webm');
};

DataManager.setupBattleTest = function() {
    this.createGameObjects();
    $gameParty.setupBattleTest();
    BattleManager.setup($dataSystem.testTroopId, true, false);
    BattleManager.playBattleBgm();
};

DataManager.setupEventTest = function() {
    this.createGameObjects();
    $gameParty.setupStartingMembers();
    $gamePlayer.reserveTransfer(-1, 8, 6);
    $gamePlayer.setTransparent(true);
};

DataManager.isEventTest = function() {
    return Utils.isOptionValid('etest');
};
