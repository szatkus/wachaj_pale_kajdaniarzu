//=============================================================================
// Game_Battler
//=============================================================================

function Game_Battler() {
    this.initialize.apply(this, arguments);
}

Game_Battler.prototype = Object.create(Game_BattlerBase.prototype);
Game_Battler.prototype.constructor = Game_Battler;

Game_Battler.prototype.initialize = function() {
    Game_BattlerBase.prototype.initialize.call(this);
};

Game_Battler.prototype.initMembers = function() {
    Game_BattlerBase.prototype.initMembers.call(this);
    this._actions = [];
    this._speed = 0;
    this._acting = false;
    this._actionState = '';
    this._actionStateCount = 0;
    this._damagePopup = false;
    this._effectType = null;
    this._motionType = null;
    this._weaponImageId = 0;
    this._motionRefresh = false;
    this._selected = false;
};

Game_Battler.prototype.clearActions = function() {
    this._actions = [];
};

Game_Battler.prototype.clearMotion = function() {
    this._motionType = null;
    this._motionRefresh = false;
};

Game_Battler.prototype.requestMotion = function(motionType) {
    this._motionType = motionType;
};

Game_Battler.prototype.requestMotionRefresh = function() {
    this._motionRefresh = true;
};

Game_Battler.prototype.select = function() {
    this._selected = true;
};

Game_Battler.prototype.deselect = function() {
    this._selected = false;
};

Game_Battler.prototype.isActing = function() {
    return this._acting;
};

Game_Battler.prototype.isUndecided = function() {
    return this._actionState === '';
};

Game_Battler.prototype.isInputting = function() {
    return this._actionState === 'inputting';
};

Game_Battler.prototype.isWaiting = function() {
    return this._actionState === 'waiting';
};

Game_Battler.prototype.isActing = function() {
    return this._actionState === 'acting';
};

Game_Battler.prototype.isChanting = function() {
    return this._actionState === 'chanting';
};

Game_Battler.prototype.isGuardWaiting = function() {
    return this._actionState === 'guarding';
};

Game_Battler.prototype.action = function(index) {
    return this._actions[index];
};

Game_Battler.prototype.setAction = function(index, action) {
    this._actions[index] = action;
};

Game_Battler.prototype.numActions = function() {
    return this._actions.length;
};

Game_Battler.prototype.clearActions = function() {
    this._actions = [];
};

Game_Battler.prototype.result = function() {
    return this._result;
};

Game_Battler.prototype.clearResult = function() {
    this._result.clear();
};

Game_Battler.prototype.onBattleStart = function() {
    this.setActionState('undecided');
    this.clearMotion();
    if (!this.isPreserveTp()) {
        this.initTp();
    }
};

Game_Battler.prototype.onAllActionsEnd = function() {
    this.clearResult();
    this.removeStatesAuto(1);
    this.removeBuffsAuto();
};

Game_Battler.prototype.onTurnEnd = function() {
    this.clearResult();
    this.regenerateAll();
    this.updateStateTurns();
    this.updateBuffTurns();
    this.removeStatesAuto(2);
};

Game_Battler.prototype.onBattleEnd = function() {
    this.clearResult();
    this.releaseUnequippableItems(true);
    this.removeBattleStates();
    this.removeAllBuffs();
    this.clearActions();
    if (!this.isPreserveTp()) {
        this.clearTp();
    }
    this.appear();
};

Game_Battler.prototype.onDamage = function(value) {
    this.removeStatesByDamage();
    this.chargeTpByDamage(value / this.mhp);
};

Game_Battler.prototype.setActionState = function(actionState) {
    this._actionState = actionState;
    this.requestMotionRefresh();
};

Game_Battler.prototype.isActionRequested = function() {
    return this._actions.length > 0;
};

Game_Battler.prototype.makeSpeed = function() {
    this._speed = Math.min.apply(null, this._actions.map(function(action) {
        return action.speed();
    })) || 0;
};

Game_Battler.prototype.currentAction = function() {
    return this._actions[0];
};

Game_Battler.prototype.removeCurrentAction = function() {
    this._actions.shift();
};

Game_Battler.prototype.setLastTarget = function(target) {
    if (target) {
        this._lastTargetIndex = target.index();
    } else {
        this._lastTargetIndex = 0;
    }
};

Game_Battler.prototype.forceAction = function(skillId, targetIndex) {
    this.clearActions();
    var action = new Game_Action(this, true);
    action.setSkill(skillId);
    if (targetIndex === -2) {
        action.setTarget(this._lastTargetIndex);
    } else if (targetIndex === -1) {
        action.decideRandomTarget();
    } else {
        action.setTarget(targetIndex);
    }
    this._actions.push(action);
};

Game_Battler.prototype.useItem = function(item) {
    if (DataManager.isSkill(item)) {
        this.paySkillCost(item);
    } else if (DataManager.isItem(item)) {
        this.consumeItem(item);
    }
};

Game_Battler.prototype.consumeItem = function(item) {
    $gameParty.consumeItem(item);
};

Game_Battler.prototype.gainHp = function(value) {
    this._result.hpDamage = -value;
    this.setHp(this.hp + value);
};

Game_Battler.prototype.gainMp = function(value) {
    this._result.mpDamage = -value;
    this.setMp(this.mp + value);
};

Game_Battler.prototype.gainTp = function(value) {
    this._result.tpDamage = -value;
    this.setTp(this.tp + value);
};

Game_Battler.prototype.gainSilentTp = function(value) {
    this.setTp(this.tp + value);
};

Game_Battler.prototype.initTp = function() {
    this.setTp(Math.randomInt(25));
};

Game_Battler.prototype.clearTp = function() {
    this.setTp(0);
};

Game_Battler.prototype.chargeTpByDamage = function(damageRate) {
    var value = Math.floor(50 * damageRate * this.tcr);
    this.gainSilentTp(value);
};

Game_Battler.prototype.regenerateHp = function() {
    var value = Math.floor(this.mhp * this.hrg);
    if (value !== 0) {
        this.gainHp(value);
    }
};

Game_Battler.prototype.regenerateMp = function() {
    var value = Math.floor(this.mmp * this.mrg);
    if (value !== 0) {
        this.gainMp(value);
    }
};

Game_Battler.prototype.regenerateTp = function() {
    var value = Math.floor(100 * this.trg);
    this.gainSilentTp(value);
};

Game_Battler.prototype.regenerateAll = function() {
    if (this.isAlive()) {
        this.regenerateHp();
        this.regenerateMp();
        this.regenerateTp();
    }
};

Game_Battler.prototype.onRestrict = function() {
    Game_BattlerBase.prototype.onRestrict.call(this);
    this.clearActions();
};

Game_Battler.prototype.performActionStart = function(action) {
    if (!action.isGuard()) {
        this.setActionState('acting');
    }
};

Game_Battler.prototype.performAction = function(action) {
};

Game_Battler.prototype.performActionEnd = function() {
    this.setActionState('done');
};

Game_Battler.prototype.performDamage = function() {
};

Game_Battler.prototype.performMiss = function() {
    SoundManager.playMiss();
};

Game_Battler.prototype.performEvasion = function() {
    SoundManager.playEvasion();
};

Game_Battler.prototype.performMagicEvasion = function() {
    SoundManager.playMagicEvasion();
};

Game_Battler.prototype.performCounter = function() {
    SoundManager.playEvasion();
};

Game_Battler.prototype.performReflection = function() {
    SoundManager.playReflection();
};

Game_Battler.prototype.performSubstitute = function(target) {
    SoundManager.playEvasion();
};

Game_Battler.prototype.performCollapse = function() {
};

Game_Battler.prototype.makeActions = function() {
    this.clearActions();
    if (this.canMove()) {
        var actionTimes = this.makeActionTimes();
        this._actions = [];
        for (var i = 0; i < actionTimes; i++) {
            this._actions.push(new Game_Action(this));
        }
    }
    this.setActionState('waiting');
};

Game_Battler.prototype.makeActionTimes = function() {
    return this.actionPlusSet().reduce(function(r, p) {
        return Math.random() < p ? r + 1 : r;
    }, 1);
};

Game_Battler.prototype.speed = function() {
    return this._speed;
};

Game_Battler.prototype.makeSpeed = function() {
    this._speed = this.agi + Math.randomInt(Math.floor(5 + this.agi / 4));
};

Game_Battler.prototype.currentAction = function() {
    return this._actions[0];
};

Game_Battler.prototype.removeCurrentAction = function() {
    this._actions.shift();
};

Game_Battler.prototype.setLastTarget = function(target) {
    if (target) {
        this._lastTargetIndex = target.index();
    } else {
        this._lastTargetIndex = 0;
    }
};

Game_Battler.prototype.forceAction = function(skillId, targetIndex) {
    this.clearActions();
    var action = new Game_Action(this, true);
    action.setSkill(skillId);
    if (targetIndex === -2) {
        action.setTarget(this._lastTargetIndex);
    } else if (targetIndex === -1) {
        action.decideRandomTarget();
    } else {
        action.setTarget(targetIndex);
    }
    this._actions.push(action);
};

Game_Battler.prototype.useItem = function(item) {
    if (DataManager.isSkill(item)) {
        this.paySkillCost(item);
    } else if (DataManager.isItem(item)) {
        this.consumeItem(item);
    }
};

Game_Battler.prototype.consumeItem = function(item) {
    $gameParty.consumeItem(item);
};

Game_Battler.prototype.gainHp = function(value) {
    this._result.hpDamage = -value;
    this.setHp(this.hp + value);
};

Game_Battler.prototype.gainMp = function(value) {
    this._result.mpDamage = -value;
    this.setMp(this.mp + value);
};

Game_Battler.prototype.gainTp = function(value) {
    this._result.tpDamage = -value;
    this.setTp(this.tp + value);
};

Game_Battler.prototype.gainSilentTp = function(value) {
    this.setTp(this.tp + value);
};

Game_Battler.prototype.initTp = function() {
    this.setTp(Math.randomInt(25));
};

Game_Battler.prototype.clearTp = function() {
    this.setTp(0);
};

Game_Battler.prototype.chargeTpByDamage = function(damageRate) {
    var value = Math.floor(50 * damageRate * this.tcr);
    this.gainSilentTp(value);
};

Game_Battler.prototype.regenerateHp = function() {
    var value = Math.floor(this.mhp * this.hrg);
    if (value !== 0) {
        this.gainHp(value);
    }
};

Game_Battler.prototype.regenerateMp = function() {
    var value = Math.floor(this.mmp * this.mrg);
    if (value !== 0) {
        this.gainMp(value);
    }
};

Game_Battler.prototype.regenerateTp = function() {
    var value = Math.floor(100 * this.trg);
    this.gainSilentTp(value);
};

Game_Battler.prototype.regenerateAll = function() {
    if (this.isAlive()) {
        this.regenerateHp();
        this.regenerateMp();
        this.regenerateTp();
    }
};

Game_Battler.prototype.onRestrict = function() {
    Game_BattlerBase.prototype.onRestrict.call(this);
    this.clearActions();
    this.clearMotion();
};

Game_Battler.prototype.startDamagePopup = function() {
    this._damagePopup = true;
};

Game_Battler.prototype.isDamagePopupRequested = function() {
    return this._damagePopup;
};

Game_Battler.prototype.clearDamagePopup = function() {
    this._damagePopup = false;
};

Game_Battler.prototype.startWeaponAnimation = function(weaponImageId) {
    this._weaponImageId = weaponImageId;
};

Game_Battler.prototype.weaponImageId = function() {
    return this._weaponImageId;
};

Game_Battler.prototype.motionType = function() {
    return this._motionType;
};

Game_Battler.prototype.isMotionRequested = function() {
    return !!this._motionType;
};

Game_Battler.prototype.isMotionRefreshed = function() {
    return this._motionRefresh;
};

Game_Battler.prototype.clearMotion = function() {
    this._motionType = null;
    this._motionRefresh = false;
};

Game_Battler.prototype.isSelected = function() {
    return this._selected;
};
