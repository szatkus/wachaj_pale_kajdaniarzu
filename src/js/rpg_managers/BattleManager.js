//=============================================================================
// BattleManager
//=============================================================================

function BattleManager() {
    throw new Error('This is a static class');
}

BattleManager.setup = function(troopId, canEscape, canLose) {
    this.initMembers();
    this._canEscape = canEscape;
    this._canLose = canLose;
    $gameTroop.setup(troopId);
    $gameScreen.onBattleStart();
    this.makeEscapeRatio();
};

BattleManager.initMembers = function() {
    this._phase = 'init';
    this._canEscape = false;
    this._canLose = false;
    this._battleTest = false;
    this._eventCallback = null;
    this._preemptive = false;
    this._surprise = false;
    this._actorIndex = -1;
    this._actionForced = false;
    this._actionBattlers = [];
    this._subject = null;
    this._action = null;
    this._targets = [];
    this._logWindow = null;
    this._spriteset = null;
    this._escapeRatio = 0;
    this._escaped = false;
    this._rewards = {};
    this._turnForced = false;
};

BattleManager.isBattleTest = function() {
    return this._battleTest;
};

BattleManager.setBattleTest = function(battleTest) {
    this._battleTest = battleTest;
};

BattleManager.setLogWindow = function(logWindow) {
    this._logWindow = logWindow;
};

BattleManager.setSpriteset = function(spriteset) {
    this._spriteset = spriteset;
};

BattleManager.onEncounter = function() {
    this._preemptive = (Math.random() < this.ratePreemptive());
    this._surprise = (Math.random() < this.rateSurprise() && !this._preemptive);
};

BattleManager.ratePreemptive = function() {
    return $gameParty.ratePreemptive($gameTroop.agility());
};

BattleManager.rateSurprise = function() {
    return $gameParty.rateSurprise($gameTroop.agility());
};

BattleManager.saveBgmAndBgs = function() {
    this._mapBgm = AudioManager.saveBgm();
    this._mapBgs = AudioManager.saveBgs();
};

BattleManager.playBattleBgm = function() {
    AudioManager.playBgm($gameSystem.battleBgm());
    AudioManager.stopBgs();
};

BattleManager.playVictoryMe = function() {
    AudioManager.playMe($gameSystem.victoryMe());
};

BattleManager.playDefeatMe = function() {
    AudioManager.playMe($gameSystem.defeatMe());
};

BattleManager.replayBgmAndBgs = function() {
    if (this._mapBgm) {
        AudioManager.replayBgm(this._mapBgm);
    } else {
        AudioManager.stopBgm();
    }
    if (this._mapBgs) {
        AudioManager.replayBgs(this._mapBgs);
    }
};

BattleManager.makeEscapeRatio = function() {
    this._escapeRatio = 0.5 * $gameParty.agility() / $gameTroop.agility();
};

BattleManager.update = function() {
    if (!this.isBusy() && !this.updateEvent()) {
        this.updateTurn();
    }
};

BattleManager.updateEvent = function() {
    switch (this._phase) {
    case 'start':
    case 'turn':
    case 'turnEnd':
        if (this.isActionForced()) {
            this.processForcedAction();
            return true;
        } else {
            return this.updateEventMain();
        }
    }
    return this.checkAbort();
};

BattleManager.updateEventMain = function() {
    $gameTroop.updateInterpreter();
    $gameParty.requestMotionRefresh();
    if ($gameTroop.isEventRunning() || this.checkBattleEnd()) {
        return true;
    }
    $gameTroop.setupBattleEvent();
    if ($gameTroop.isEventRunning() || SceneManager.isSceneChanging()) {
        return true;
    }
    return false;
};

BattleManager.updateTurn = function() {
    $gameParty.requestMotionRefresh();
    if (!this._turnForced) {
        this.startTurn();
    }
    this.updateTurnEnd();
};

BattleManager.updateTurnEnd = function() {
    if (this._phase === 'turnEnd') {
        this.endTurn();
    }
};

BattleManager.endBattle = function(result) {
    this._phase = 'battleEnd';
    if (this._eventCallback) {
        this._eventCallback(result);
    }
    if (result === 0) {
        $gameSystem.onBattleWin();
        this.makeRewards();
        this.displayVictoryMessage();
        this.displayRewards();
        this.gainRewards();
        this.endBattleAfterRewards();
    } else {
        $gameSystem.onBattleEscape();
        this.displayEscapeMessage();
        this.replayBgmAndBgs();
        SceneManager.pop();
    }
    this._logWindow.clear();
    this._spriteset.update();
    this._escaped = (result > 0);
};

BattleManager.endBattleAfterRewards = function() {
    this.replayBgmAndBgs();
    SceneManager.pop();
};

BattleManager.checkBattleEnd = function() {
    if (this._phase) {
        if (this.checkAbort()) {
            return true;
        } else if ($gameParty.isAllDead()) {
            this.processDefeat();
            return true;
        } else if ($gameTroop.isAllDead()) {
            this.processVictory();
            return true;
        }
    }
    return false;
};

BattleManager.checkAbort = function() {
    if ($gameParty.isEmpty() || this.isAborting()) {
        this.processAbort();
        return true;
    }
    return false;
};

BattleManager.isBusy = function() {
    return ($gameMessage.isBusy() || this._spriteset.isBusy() ||
            this._logWindow.isBusy());
};

BattleManager.isAborting = function() {
    return $gameParty.isAllDead() || $gameTroop.isAllDead() || this._escaped;
};

BattleManager.canEscape = function() {
    return this._canEscape;
};

BattleManager.canLose = function() {
    return this._canLose;
};

BattleManager.isEscaped = function() {
    return this._escaped;
};

BattleManager.actor = function() {
    return this._actionBattlers[this._actorIndex];
};

BattleManager.startBattle = function() {
    this._phase = 'start';
    $gameSystem.onBattleStart();
    $gameParty.onBattleStart();
    $gameTroop.onBattleStart();
    this.displayStartMessages();
};

BattleManager.displayStartMessages = function() {
    if (this._preemptive) {
        this._logWindow.addText(TextManager.preemptive.format($gameParty.name()));
    } else if (this._surprise) {
        this._logWindow.addText(TextManager.surprise.format($gameParty.name()));
    }
    this._logWindow.wait();
};

BattleManager.startTurn = function() {
    this._phase = 'turn';
    this.clearActor();
    $gameTroop.increaseTurn();
    this.makeActionOrders();
    $gameParty.requestMotionRefresh();
    this._logWindow.startTurn();
};

BattleManager.endTurn = function() {
    this._phase = 'turnEnd';
    this._preemptive = false;
    this._surprise = false;
    this.allBattleMembers().forEach(function(battler) {
        battler.onTurnEnd();
        this.displayCurrentState(battler);
    }, this);
    if (this.isForcedTurn()) {
        this._turnForced = false;
    }
};

BattleManager.isForcedTurn = function () {
    return this._turnForced;
};

BattleManager.updateAction = function() {
    var target = this._targets.shift();
    if (target) {
        this.invokeAction(this._subject, target);
    } else {
        this.endAction();
    }
};

BattleManager.endAction = function() {
    this._logWindow.endAction(this._subject);
    this._phase = 'turn';
};

BattleManager.invokeAction = function(subject, target) {
    this._logWindow.push('pushBaseLine');
    if (Math.random() < this._action.item().successRate * 0.01) {
        this.applyAction(subject, target);
    } else {
        this.displayActionFailure(subject, target);
    }
    this._logWindow.push('popBaseLine');
};

BattleManager.applyAction = function(subject, target) {
    var result = target.result();
    this.displayAction(subject, target);
    var item = this._action.item();
    if (this.applyCritical(target, item)) {
        this.applyDamage(target, item.damage);
        this.applyItemEffect(subject, item, target);
        this.applyItemUserEffect(subject, item);
    } else {
        this.applyDamage(target, item.damage);
        this.applyItemEffect(subject, item, target);
        this.applyItemUserEffect(subject, item);
    }
    this.displayActionResults(subject, target);
};

BattleManager.applyCritical = function(target, item) {
    if (item.damage.critical) {
        var critical = (Math.random() < this.criticalRate(target));
        if (critical) {
            target.onCritical(this._subject);
        }
        return critical;
    } else {
        return false;
    }
};

BattleManager.criticalRate = function(target) {
    return this._subject.cri * (1 - target.cev);
};

BattleManager.applyDamage = function(target, damage) {
    var result = target.result();
    result.clear();
    result.used = true;
    result.missed = false;
    result.evaded = false;
    result.physical = false;
    result.drain = false;
    if (damage.type > 0) {
        result.critical = (Math.random() < this.criticalRate(target));
        var value = this.makeDamageValue(this._subject, target, damage, result.critical);
        this.executeDamage(target, value);
    }
};

BattleManager.makeDamageValue = function(subject, target, damage, critical) {
    var item = this._action.item();
    var baseValue = this.evalDamageFormula(subject, target, damage, critical);
    var value = baseValue * this.calcElementRate(target, damage.elementId);
    if (this.isPhysical()) {
        value *= target.pdr;
    }
    if (this.isMagical()) {
        value *= target.mdr;
    }
    if (baseValue < 0) {
        value *= target.rec;
    }
    value = this.applyGuard(value, target);
    value = this.applyVariance(value, damage.variance);
    value = this.applyCritical(value, critical);
    value = Math.round(value);
    return value;
};

BattleManager.evalDamageFormula = function(subject, target, damage, critical) {
    try {
        var a = subject;
        var b = target;
        var v = $gameVariables._data;
        var sign = ([3, 4].contains(damage.type) ? -1 : 1);
        var value = Math.max(eval(damage.formula), 0) * sign;
        if (isNaN(value)) value = 0;
        return value;
    } catch (e) {
        return 0;
    }
};

BattleManager.calcElementRate = function(target, elementId) {
    if (elementId < 0) {
        return this.calcAttackElementRate(target);
    } else {
        return target.elementRate(elementId);
    }
};

BattleManager.calcAttackElementRate = function(target) {
    var elementRate = 1;
    var elements = this._subject.attackElements();
    elements.forEach(function(elementId) {
        elementRate *= target.elementRate(elementId);
    });
    return elementRate;
};

BattleManager.isPhysical = function() {
    return this._action.isPhysical();
};

BattleManager.isMagical = function() {
    return this._action.isMagical();
};

BattleManager.applyGuard = function(damage, target) {
    return damage / (damage > 0 && target.isGuard() ? 2 * target.grd : 1);
};

BattleManager.applyVariance = function(damage, variance) {
    var amp = Math.floor(Math.max(Math.abs(damage) * variance / 100, 0));
    var v = Math.randomInt(amp + 1) + Math.randomInt(amp + 1) - amp;
    return damage >= 0 ? damage + v : damage - v;
};

BattleManager.applyCritical = function(damage, critical) {
    return damage > 0 && critical ? damage * 3 : damage;
};

BattleManager.executeDamage = function(target, value) {
    var result = target.result();
    if (value === 0) {
        result.critical = false;
    }
    if (this.isHpEffect()) {
        this.executeHpDamage(target, value);
    }
    if (this.isMpEffect()) {
        this.executeMpDamage(target, value);
    }
};

BattleManager.executeHpDamage = function(target, value) {
    if (value > 0) {
        target.gainHp(-value);
        if (value > 0) {
            target.onDamage(value);
        }
    } else {
        target.gainHp(-value);
    }
};

BattleManager.executeMpDamage = function(target, value) {
    if (value !== 0) {
        target.gainMp(-value);
    }
};

BattleManager.applyItemEffect = function(subject, item, target) {
    item.effects.forEach(function(effect) {
        this.applyItemEffect(subject, item, target, effect);
    }, this);
};

BattleManager.applyItemEffect = function(subject, item, target, effect) {
    switch (effect.code) {
    case Game_Action.EFFECT_RECOVER_HP:
        this.itemEffectRecoverHp(target, effect);
        break;
    case Game_Action.EFFECT_RECOVER_MP:
        this.itemEffectRecoverMp(target, effect);
        break;
    case Game_Action.EFFECT_GAIN_TP:
        this.itemEffectGainTp(target, effect);
        break;
    case Game_Action.EFFECT_ADD_STATE:
        this.itemEffectAddState(target, effect);
        break;
    case Game_Action.EFFECT_REMOVE_STATE:
        this.itemEffectRemoveState(target, effect);
        break;
    case Game_Action.EFFECT_ADD_BUFF:
        this.itemEffectAddBuff(target, effect);
        break;
    case Game_Action.EFFECT_ADD_DEBUFF:
        this.itemEffectAddDebuff(target, effect);
        break;
    case Game_Action.EFFECT_REMOVE_BUFF:
        this.itemEffectRemoveBuff(target, effect);
        break;
    case Game_Action.EFFECT_REMOVE_DEBUFF:
        this.itemEffectRemoveDebuff(target, effect);
        break;
    case Game_Action.EFFECT_SPECIAL:
        this.itemEffectSpecial(target, effect);
        break;
    case Game_Action.EFFECT_GROW:
        this.itemEffectGrow(target, effect);
        break;
    case Game_Action.EFFECT_LEARN_SKILL:
        this.itemEffectLearnSkill(target, effect);
        break;
    case Game_Action.EFFECT_COMMON_EVENT:
        this.itemEffectCommonEvent(target, effect);
        break;
    }
};

BattleManager.itemEffectRecoverHp = function(target, effect) {
    var value = (target.mhp * effect.value1 + effect.value2) * target.rec;
    if (this.isItem()) {
        value *= this._subject.pha;
    }
    value = Math.floor(value);
    if (value !== 0) {
        target.gainHp(value);
        this.displayHpRecovery(target);
    }
};

BattleManager.itemEffectRecoverMp = function(target, effect) {
    var value = (target.mmp * effect.value1 + effect.value2) * target.rec;
    if (this.isItem()) {
        value *= this._subject.pha;
    }
    value = Math.floor(value);
    if (value !== 0) {
        target.gainMp(value);
        this.displayMpRecovery(target);
    }
};

BattleManager.itemEffectGainTp = function(target, effect) {
    var value = Math.floor(effect.value1);
    if (value !== 0) {
        target.gainTp(value);
        this.displayTpGain(target);
    }
};

BattleManager.itemEffectAddState = function(target, effect) {
    if (effect.dataId === 0) {
        this.itemEffectAddAttackState(target, effect);
    } else {
        this.itemEffectAddNormalState(target, effect);
    }
};

BattleManager.itemEffectAddAttackState = function(target, effect) {
    this._subject.attackStates().forEach(function(stateId) {
        var chance = effect.value1;
        chance *= target.stateRate(stateId);
        chance *= this._subject.attackStatesRate(stateId);
        chance *= this.lukEffectRate(target);
        if (Math.random() < chance) {
            target.addState(stateId);
            this.displayAffectedStatus(target);
        }
    }.bind(this), target);
};

BattleManager.itemEffectAddNormalState = function(target, effect) {
    var chance = effect.value1;
    if (!this.isCertainHit()) {
        chance *= target.stateRate(effect.dataId);
        chance *= this.lukEffectRate(target);
    }
    if (Math.random() < chance) {
        target.addState(effect.dataId);
        this.displayAffectedStatus(target);
    }
};

BattleManager.itemEffectRemoveState = function(target, effect) {
    var chance = effect.value1;
    if (Math.random() < chance) {
        target.removeState(effect.dataId);
        this.displayAffectedStatus(target);
    }
};

BattleManager.itemEffectAddBuff = function(target, effect) {
    target.addBuff(effect.dataId, effect.value1);
    this.displayAffectedStatus(target);
};

BattleManager.itemEffectAddDebuff = function(target, effect) {
    var chance = target.debuffRate(effect.dataId) * this.lukEffectRate(target);
    if (Math.random() < chance) {
        target.addDebuff(effect.dataId, effect.value1);
        this.displayAffectedStatus(target);
    }
};

BattleManager.itemEffectRemoveBuff = function(target, effect) {
    if (target.isBuffAffected(effect.dataId)) {
        target.removeBuff(effect.dataId);
        this.displayAffectedStatus(target);
    }
};

BattleManager.itemEffectRemoveDebuff = function(target, effect) {
    if (target.isDebuffAffected(effect.dataId)) {
        target.removeBuff(effect.dataId);
        this.displayAffectedStatus(target);
    }
};

BattleManager.itemEffectSpecial = function(target, effect) {
    if (effect.dataId === Game_Action.SPECIAL_EFFECT_ESCAPE) {
        this.displayAction();
        this.startEscape();
    }
};

BattleManager.itemEffectGrow = function(target, effect) {
    target.addParam(effect.dataId, Math.floor(effect.value1));
    this.displayAffectedStatus(target);
};

BattleManager.itemEffectLearnSkill = function(target, effect) {
    if (target.isActor()) {
        target.learnSkill(effect.dataId);
    }
};

BattleManager.itemEffectCommonEvent = function(target, effect) {
    $gameTemp.reserveCommonEvent(effect.dataId);
};

BattleManager.lukEffectRate = function(target) {
    return Math.max(1.0 + (this._subject.luk - target.luk) * 0.001, 0.0);
};

BattleManager.applyItemUserEffect = function(subject, item) {
    var value = Math.floor(item.tpGain * subject.tcr);
    subject.gainSilentTp(value);
};

BattleManager.displayAction = function(subject, target) {
    var logWindow = this._logWindow;
    logWindow.displayAction(subject, this._action.item());
};

BattleManager.displayActionFailure = function(subject, target) {
    var logWindow = this._logWindow;
    logWindow.displayAction(subject, this._action.item());
    if (target.result().isHit() && !target.result().success) {
        logWindow.addText('But it failed!');
    } else {
        logWindow.displayMiss(target);
    }
};

BattleManager.displayCounter = function(target) {
    var logWindow = this._logWindow;
    logWindow.displayCounter(target);
};

BattleManager.displayReflection = function(target) {
    var logWindow = this._logWindow;
    logWindow.displayReflection(target);
};

BattleManager.displaySubstitute = function(substitute, target) {
    var logWindow = this._logWindow;
    logWindow.displaySubstitute(substitute, target);
};

BattleManager.displayActionResults = function(subject, target) {
    if (target.result().used) {
        this.displayCritical(target);
        this.displayDamage(target);
        this.displayAffectedStatus(target);
        this.displayFailure(target);
    }
};

BattleManager.displayCritical = function(target) {
    if (target.result().critical) {
        if (target.isActor()) {
            this._logWindow.displayCritical(target);
        } else {
            this._logWindow.displayCritical(target);
        }
    }
};

BattleManager.displayDamage = function(target) {
    if (target.result().missed) {
        this.displayMiss(target);
    } else if (target.result().evaded) {
        this.displayEvasion(target);
    } else {
        this.displayHpDamage(target);
        this.displayMpDamage(target);
        this.displayTpDamage(target);
    }
};

BattleManager.displayHpDamage = function(target) {
    if (target.result().hpAffected) {
        if (target.result().hpDamage > 0 && !target.result().drain) {
            this.displayHpChange(target, -target.result().hpDamage);
        }
        if (target.result().hpDamage < 0) {
            this.displayHpChange(target, -target.result().hpDamage);
        }
    }
};

BattleManager.displayMpDamage = function(target) {
    if (target.isAlive() && target.result().mpDamage !== 0) {
        this.displayMpChange(target, -target.result().mpDamage);
    }
};

BattleManager.displayTpDamage = function(target) {
    if (target.isAlive() && target.result().tpDamage !== 0) {
        this.displayTpChange(target, -target.result().tpDamage);
    }
};

BattleManager.displayHpChange = function(target, value) {
    if (value > 0) {
        this.displayHpRecovery(target);
    } else if (value < 0) {
        this.displayHpLoss(target);
    }
};

BattleManager.displayMpChange = function(target, value) {
    if (value > 0) {
        this.displayMpRecovery(target);
    } else if (value < 0) {
        this.displayMpLoss(target);
    }
};

BattleManager.displayTpChange = function(target, value) {
    if (value > 0) {
        this.displayTpGain(target);
    }
};

BattleManager.displayHpRecovery = function(target) {
    var logWindow = this._logWindow;
    logWindow.displayRecovery(target);
};

BattleManager.displayMpRecovery = function(target) {
    var logWindow = this._logWindow;
    logWindow.displayRecovery(target);
};

BattleManager.displayTpGain = function(target) {
    var logWindow = this._logWindow;
    logWindow.displayTpGain(target);
};

BattleManager.displayHpLoss = function(target) {
    var logWindow = this._logWindow;
    logWindow.displayHpLoss(target);
};

BattleManager.displayMpLoss = function(target) {
    var logWindow = this._logWindow;
    logWindow.displayMpLoss(target);
};

BattleManager.displayMiss = function(target) {
    var logWindow = this._logWindow;
    logWindow.displayMiss(target);
};

BattleManager.displayEvasion = function(target) {
    var logWindow = this._logWindow;
    logWindow.displayEvasion(target);
};

BattleManager.displayAffectedStatus = function(target) {
    var logWindow = this._logWindow;
    logWindow.displayAffectedStatus(target);
};

BattleManager.displayFailure = function(target) {
    var logWindow = this._logWindow;
    logWindow.displayFailure(target);
};

BattleManager.displayCurrentState = function(battler) {
    var stateText = battler.mostImportantStateText();
    if (stateText) {
        this._logWindow.addText(battler.name() + stateText);
        this._logWindow.wait();
    }
};

BattleManager.displayVictoryMessage = function() {
    this._logWindow.addText(TextManager.victory.format($gameParty.name()));
    this._logWindow.wait();
};

BattleManager.displayEscapeMessage = function() {
    this._logWindow.addText(TextManager.escapeStart.format($gameParty.name()));
    this._logWindow.wait();
};

BattleManager.displayRewards = function() {
    var logWindow = this._logWindow;
    logWindow.displayExp(this._rewards.exp, this._rewards.newSkills);
    logWindow.displayGold(this._rewards.gold);
    logWindow.displayDropItems(this._rewards.items);
    logWindow.wait();
};

BattleManager.gainRewards = function() {
    $gameParty.gainGold(this._rewards.gold);
    $gameParty.gainItems(this._rewards.items);
    $gameParty.allMembers().forEach(function(actor) {
        actor.gainExp(this._rewards.exp);
    }, this);
};

BattleManager.processVictory = function() {
    $gameParty.removeBattleStates();
    $gameParty.performVictory();
    this.playVictoryMe();
    this.replayBgmAndBgs();
    this.makeRewards();
    this.displayVictoryMessage();
    this.displayRewards();
    this.gainRewards();
    this.endBattle(0);
};

BattleManager.processEscape = function() {
    $gameParty.performEscape();
    SoundManager.playEscape();
    var success = this._preemptive ? true : (Math.random() < this._escapeRatio);
    if (success) {
        this.displayEscapeSuccessMessage();
        this._escaped = true;
        this.processAbort();
    } else {
        this.displayEscapeFailureMessage();
        this._escapeRatio += 0.1;
        $gameParty.clearActions();
        this.startTurn();
    }
    return success;
};

BattleManager.processAbort = function() {
    $gameParty.removeBattleStates();
    this.replayBgmAndBgs();
    this.endBattle(1);
};

BattleManager.processDefeat = function() {
    this.displayDefeatMessage();
    this.playDefeatMe();
    if (this._canLose) {
        this.replayBgmAndBgs();
    } else {
        AudioManager.stopBgm();
    }
    this.endBattle(2);
};

BattleManager.displayEscapeSuccessMessage = function() {
    this._logWindow.addText(TextManager.escapeStart.format($gameParty.name()));
    this._logWindow.wait();
};

BattleManager.displayEscapeFailureMessage = function() {
    this._logWindow.addText(TextManager.escapeFailure.format($gameParty.name()));
    this._logWindow.wait();
};

BattleManager.displayDefeatMessage = function() {
    this._logWindow.addText(TextManager.defeat.format($gameParty.name()));
    this._logWindow.wait();
};

BattleManager.startAction = function() {
    var subject = this._subject;
    var action = subject.currentAction();
    var targets = action.makeTargets();
    this._phase = 'action';
    this._action = action;
    this._targets = targets;
    subject.useItem(action.item());
    this._action.applyGlobal();
    this.refreshStatus();
    this._logWindow.startAction(subject, action, targets);
};

BattleManager.inputtingAction = function() {
    return this._actorIndex >= 0;
};

BattleManager.selectNextCommand = function() {
    if (this._actorIndex < $gameParty.size() - 1) {
        this._actorIndex++;
        this.startInput();
    } else {
        this.startTurn();
    }
};

BattleManager.selectPreviousCommand = function() {
    if (this._actorIndex > 0) {
        this._actorIndex--;
        this.startInput();
    }
};

BattleManager.refreshStatus = function() {
    this._spriteset.refreshStatus();
};

BattleManager.startInput = function() {
    this._phase = 'input';
    $gameParty.makeActions();
    if (this._surprise || !$gameParty.canInput()) {
        this.startTurn();
    }
};

BattleManager.makeActionOrders = function() {
    var battlers = [];
    if (!this._surprise) {
        battlers = battlers.concat($gameParty.members());
    }
    if (!this._preemptive) {
        battlers = battlers.concat($gameTroop.members());
    }
    battlers.forEach(function(battler) {
        battler.makeSpeed();
    });
    battlers.sort(function(a, b) {
        return b.speed() - a.speed();
    });
    this._actionBattlers = battlers;
};

BattleManager.allBattleMembers = function() {
    return $gameParty.members().concat($gameTroop.members());
};

BattleManager.isForcedAction = function() {
    return this._actionForced;
};

BattleManager.processForcedAction = function() {
    if (this._actionForced) {
        this._logWindow.startAction(this._subject, this._action, this._targets);
        this._actionForced = false;
    }
};

BattleManager.abort = function() {
    this._escaped = true;
    this.processAbort();
};

BattleManager.setEventCallback = function(callback) {
    this._eventCallback = callback;
};

BattleManager.makeRewards = function() {
    this._rewards = {};
    this._rewards.gold = $gameTroop.goldTotal();
    this._rewards.exp = $gameTroop.expTotal();
    this._rewards.items = $gameTroop.makeDropItems();
};
