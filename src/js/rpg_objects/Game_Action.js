//=============================================================================
// Game_Action
//=============================================================================

function Game_Action() {
    this.initialize.apply(this, arguments);
}

Game_Action.prototype.initialize = function(subject, forcing) {
    this._subjectActorId = 0;
    this._subjectEnemyIndex = -1;
    this._forcing = forcing || false;
    this.setSubject(subject);
    this.clear();
};

Game_Action.prototype.clear = function() {
    this._item = new Game_Item();
    this._targetIndex = -1;
};

Game_Action.prototype.setSubject = function(subject) {
    if (subject.isActor()) {
        this._subjectActorId = subject.actorId();
        this._subjectEnemyIndex = -1;
    } else {
        this._subjectEnemyIndex = subject.index();
        this._subjectActorId = 0;
    }
};

Game_Action.prototype.subject = function() {
    if (this._subjectActorId > 0) {
        return $gameActors.actor(this._subjectActorId);
    } else {
        return $gameTroop.members()[this._subjectEnemyIndex];
    }
};

Game_Action.prototype.friendsUnit = function() {
    return this.subject().friendsUnit();
};

Game_Action.prototype.opponentsUnit = function() {
    return this.subject().opponentsUnit();
};

Game_Action.prototype.setEnemyAction = function(action) {
    if (action) {
        this.setSkill(action.skillId);
    } else {
        this.clear();
    }
};

Game_Action.prototype.setAttack = function() {
    this.setSkill(this.subject().attackSkillId());
};

Game_Action.prototype.setGuard = function() {
    this.setSkill(this.subject().guardSkillId());
};

Game_Action.prototype.setSkill = function(skillId) {
    this._item.setObject($dataSkills[skillId]);
};

Game_Action.prototype.setItem = function(itemId) {
    this._item.setObject($dataItems[itemId]);
};

Game_Action.prototype.setItemObject = function(object) {
    this._item.setObject(object);
};

Game_Action.prototype.setTarget = function(targetIndex) {
    this._targetIndex = targetIndex;
};

Game_Action.prototype.item = function() {
    return this._item.object();
};

Game_Action.prototype.isSkill = function() {
    return this._item.isSkill();
};

Game_Action.prototype.isItem = function() {
    return this._item.isItem();
};

Game_Action.prototype.numRepeats = function() {
    var repeats = this.item().repeats;
    if (this.isAttack()) {
        repeats += this.subject().attackTimesAdd();
    }
    return Math.floor(repeats);
};

Game_Action.prototype.checkItemScope = function(list) {
    return list.contains(this.item().scope);
};

Game_Action.prototype.isForOpponent = function() {
    return this.checkItemScope([1, 2, 3, 4, 5, 6]);
};

Game_Action.prototype.isForFriend = function() {
    return this.checkItemScope([7, 8, 9, 10, 11]);
};

Game_Action.prototype.isForDeadFriend = function() {
    return this.checkItemScope([9, 10]);
};

Game_Action.prototype.isForUser = function() {
    return this.checkItemScope([11]);
};

Game_Action.prototype.isForOne = function() {
    return this.checkItemScope([1, 3, 7, 9]);
};

Game_Action.prototype.isForRandom = function() {
    return this.checkItemScope([3, 4, 5, 6]);
};

Game_Action.prototype.isForAll = function() {
    return this.checkItemScope([2, 8, 10]);
};

Game_Action.prototype.needsSelection = function() {
    return this.checkItemScope([1, 7, 9]);
};

Game_Action.prototype.numTargets = function() {
    return this.isForRandom() ? this.item().scope - 2 : 0;
};

Game_Action.prototype.checkDamageType = function(list) {
    return list.contains(this.item().damage.type);
};

Game_Action.prototype.isHpEffect = function() {
    return this.checkDamageType([1, 3, 5]);
};

Game_Action.prototype.isMpEffect = function() {
    return this.checkDamageType([2, 4, 6]);
};

Game_Action.prototype.isDamage = function() {
    return this.checkDamageType([1, 2]);
};

Game_Action.prototype.isRecover = function() {
    return this.checkDamageType([3, 4]);
};

Game_Action.prototype.isDrain = function() {
    return this.checkDamageType([5, 6]);
};

Game_Action.prototype.isHpRecover = function() {
    return this.checkDamageType([3]);
};

Game_Action.prototype.isMpRecover = function() {
    return this.checkDamageType([4]);
};

Game_Action.prototype.isCertainHit = function() {
    return this.item().hitType === Game_Action.HITTYPE_CERTAIN;
};

Game_Action.prototype.isPhysical = function() {
    return this.item().hitType === Game_Action.HITTYPE_PHYSICAL;
};

Game_Action.prototype.isMagical = function() {
    return this.item().hitType === Game_Action.HITTYPE_MAGICAL;
};

Game_Action.prototype.isAttack = function() {
    return this.item() === $dataSkills[this.subject().attackSkillId()];
};

Game_Action.prototype.isGuard = function() {
    return this.item() === $dataSkills[this.subject().guardSkillId()];
};

Game_Action.prototype.isMagicSkill = function() {
    if (this.isSkill()) {
        return $dataSystem.magicSkills.contains(this.item().stypeId);
    } else {
        return false;
    }
};

Game_Action.prototype.decideRandomTarget = function() {
    var target;
    if (this.isForDeadFriend()) {
        target = this.friendsUnit().randomDeadTarget();
    } else if (this.isForFriend()) {
        target = this.friendsUnit().randomTarget();
    } else {
        target = this.opponentsUnit().randomTarget();
    }
    if (target) {
        this._targetIndex = target.index();
    } else {
        this.clear();
    }
};

Game_Action.prototype.setConfusion = function() {
    this.setAttack();
};

Game_Action.prototype.prepare = function() {
    if (this.subject().isConfused() && !this._forcing) {
        this.setConfusion();
    }
};

Game_Action.prototype.isValid = function() {
    return (this._forcing && this.item()) || this.subject().canUse(this.item());
};

Game_Action.prototype.speed = function() {
    var agi = this.subject().agi;
    var speed = agi + Math.randomInt(Math.floor(5 + agi / 4));
    if (this.item()) {
        speed += this.item().speed;
    }
    if (this.isAttack()) {
        speed += this.subject().attackSpeed();
    }
    return speed;
};

Game_Action.prototype.makeTargets = function() {
    var targets = [];
    if (!this._forcing && this.subject().isConfused()) {
        targets = this.targetsForConfusion();
    } else if (this.isForOpponent()) {
        targets = this.targetsForOpponents();
    } else if (this.isForFriend()) {
        targets = this.targetsForFriends();
    }
    return this.repeatTargets(targets);
};

Game_Action.prototype.targetsForConfusion = function() {
    var targets = [];
    if (this.isForFriend()) {
        targets.push(this.opponentsUnit().randomTarget());
    } else if (this.isForOpponent()) {
        targets.push(this.friendsUnit().randomTarget());
    } else {
        targets.push(this.opponentsUnit().randomTarget());
    }
    return targets;
};

Game_Action.prototype.targetsForOpponents = function() {
    var targets = [];
    var unit = this.opponentsUnit();
    if (this.isForRandom()) {
        for (var i = 0; i < this.numTargets(); i++) {
            targets.push(unit.randomTarget());
        }
    } else if (this.isForOne()) {
        if (this._targetIndex < 0) {
            targets.push(unit.randomTarget());
        } else {
            targets.push(unit.smoothTarget(this._targetIndex));
        }
    } else {
        targets = unit.aliveMembers();
    }
    return targets;
};

Game_Action.prototype.targetsForFriends = function() {
    var targets = [];
    var unit = this.friendsUnit();
    if (this.isForUser()) {
        return [this.subject()];
    } else if (this.isForDeadFriend()) {
        if (this.isForOne()) {
            targets.push(unit.smoothDeadTarget(this._targetIndex));
        } else {
            targets = unit.deadMembers();
        }
    } else if (this.isForOne()) {
        if (this._targetIndex < 0) {
            targets.push(unit.randomTarget());
        } else {
            targets.push(unit.smoothTarget(this._targetIndex));
        }
    } else {
        targets = unit.aliveMembers();
    }
    return targets;
};

Game_Action.prototype.repeatTargets = function(targets) {
    var repeatedTargets = [];
    var repeats = this.numRepeats();
    for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        if (target) {
            for (var j = 0; j < repeats; j++) {
                repeatedTargets.push(target);
            }
        }
    }
    return repeatedTargets;
};

Game_Action.prototype.confuseSubject = function() {
    if (this.subject().isConfused()) {
        var target = this.friendsUnit().randomTarget();
        this.subject().currentAction().setTarget(target.index());
    }
};

Game_Action.prototype.evaluate = function() {
    var value = 0;
    this.itemTargetCandidates().forEach(function(target) {
        var targetValue = this.evaluateWithTarget(target);
        if (this.isForAll()) {
            value += targetValue;
        } else if (targetValue > value) {
            value = targetValue;
            this._targetIndex = target.index();
        }
    }, this);
    value *= this.numRepeats();
    if (value > 0) {
        value += Math.random();
    }
    return value;
};

Game_Action.prototype.itemTargetCandidates = function() {
    if (!this.isValid()) {
        return [];
    } else if (this.isForOpponent()) {
        return this.opponentsUnit().aliveMembers();
    } else if (this.isForUser()) {
        return [this.subject()];
    } else if (this.isForDeadFriend()) {
        return this.friendsUnit().deadMembers();
    } else {
        return this.friendsUnit().aliveMembers();
    }
};

Game_Action.prototype.evaluateWithTarget = function(target) {
    if (this.isHpEffect()) {
        var value = this.makeDamageValue(this.subject(), target, this.item().damage, false);
        if (this.isForOpponent()) {
            return value / Math.max(target.hp, 1);
        } else {
            var recovery = Math.min(-value, target.mhp - target.hp);
            return recovery / target.mhp;
        }
    }
};

Game_Action.prototype.testApply = function(target) {
    return (this.isForDeadFriend() === target.isDead() &&
            ($gameParty.inBattle() || this.isForOpponent() ||
             (this.isHpRecover() && target.hp < target.mhp) ||
             (this.isMpRecover() && target.mp < target.mmp) ||
             (this.hasItemAnyValidEffects(target))));
};

Game_Action.prototype.hasItemAnyValidEffects = function(target) {
    return this.item().effects.some(function(effect) {
        return this.testItemEffect(target, effect);
    }, this);
};

Game_Action.prototype.testItemEffect = function(target, effect) {
    switch (effect.code) {
    case Game_Action.EFFECT_RECOVER_HP:
        return target.hp < target.mhp || effect.value1 < 0 || effect.value2 < 0;
    case Game_Action.EFFECT_RECOVER_MP:
        return target.mp < target.mmp || effect.value1 < 0 || effect.value2 < 0;
    case Game_Action.EFFECT_ADD_STATE:
        return !target.isStateAffected(effect.dataId);
    case Game_Action.EFFECT_REMOVE_STATE:
        return target.isStateAffected(effect.dataId);
    case Game_Action.EFFECT_ADD_BUFF:
        return !target.isMaxBuffAffected(effect.dataId);
    case Game_Action.EFFECT_ADD_DEBUFF:
        return !target.isMaxDebuffAffected(effect.dataId);
    case Game_Action.EFFECT_REMOVE_BUFF:
        return target.isBuffAffected(effect.dataId);
    case Game_Action.EFFECT_REMOVE_DEBUFF:
        return target.isDebuffAffected(effect.dataId);
    case Game_Action.EFFECT_LEARN_SKILL:
        return target.isActor() && !target.isLearnedSkill(effect.dataId);
    default:
        return true;
    }
};

Game_Action.prototype.apply = function(target) {
    var result = target.result();
    this.subject().clearResult();
    result.clear();
    result.used = this.testApply(target);
    result.missed = (result.used && Math.random() >= this.itemHit(target));
    result.evaded = (!result.missed && Math.random() < this.itemEva(target));
    result.physical = this.isPhysical();
    result.drain = this.isDrain();
    if (result.isHit()) {
        if (this.item().damage.type > 0) {
            result.critical = (Math.random() < this.itemCri(target));
            var value = this.makeDamageValue(this.subject(), target, this.item().damage, result.critical);
            this.executeDamage(target, value);
        }
        this.item().effects.forEach(function(effect) {
            this.applyItemEffect(target, effect);
        }, this);
        this.applyItemUserEffect(this.subject());
    }
};

Game_Action.prototype.makeDamageValue = function(subject, target, damage, critical) {
    var item = this.item();
    var baseValue = this.evalDamageFormula(subject, target, damage, critical);
    var value = baseValue * this.calcElementRate(target);
    if (this.isPhysical()) {
        value *= target.pdr;
    }
    if (this.isMagical()) {
        value *= target.mdr;
    }
    if (baseValue < 0) {
        value *= target.rec;
    }
    if (this.isDrain()) {
        value = Math.min(value, target.hp);
    }
    value = this.applyGuard(value, target);
    value = this.applyVariance(value, damage.variance);
    value = this.applyCritical(value, critical);
    var result = target.result();
    result.hpAffected = this.isHpEffect();
    result.mpDamage = this.isMpEffect() ? value : 0;
    result.hpDamage = this.isHpEffect() ? value : 0;
    return value;
};

Game_Action.prototype.evalDamageFormula = function(subject, target, damage, critical) {
    try {
        var a = subject;
        var b = target;
        var v = $gameVariables._data;
        var sign = ([3, 4].contains(damage.type) ? -1 : 1);
        var value = Math.max(eval(damage.formula), 0) * sign;
        if (isNaN(value)) value = 0;
        if (critical) {
            value *= 3;
        }
        return value;
    } catch (e) {
        return 0;
    }
};

Game_Action.prototype.calcElementRate = function(target) {
    if (this.item().damage.elementId < 0) {
        return this.elementsMaxRate(target, this.subject().attackElements());
    } else {
        return target.elementRate(this.item().damage.elementId);
    }
};

Game_Action.prototype.elementsMaxRate = function(target, elements) {
    if (elements.length > 0) {
        return Math.max.apply(null, elements.map(function(elementId) {
            return target.elementRate(elementId);
        }, this));
    } else {
        return 1;
    }
};

Game_Action.prototype.applyGuard = function(damage, target) {
    return damage / (damage > 0 && target.isGuard() ? 2 * target.grd : 1);
};

Game_Action.prototype.applyVariance = function(damage, variance) {
    var amp = Math.floor(Math.max(Math.abs(damage) * variance / 100, 0));
    var v = Math.randomInt(amp + 1) + Math.randomInt(amp + 1) - amp;
    return damage >= 0 ? damage + v : damage - v;
};

Game_Action.prototype.applyCritical = function(damage, critical) {
    return damage > 0 && critical ? damage * 3 : damage;
};

Game_Action.prototype.itemHit = function(target) {
    if (this.isPhysical()) {
        return this.item().successRate * 0.01 * this.subject().hit;
    } else {
        return this.item().successRate * 0.01;
    }
};

Game_Action.prototype.itemEva = function(target) {
    if (this.isPhysical()) {
        return target.eva;
    } else if (this.isMagical()) {
        return target.mev;
    } else {
        return 0;
    }
};

Game_Action.prototype.itemCri = function(target) {
    return this.item().damage.critical ? this.subject().cri * (1 - target.cev) : 0;
};

Game_Action.prototype.applyItemEffect = function(target, effect) {
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

Game_Action.prototype.itemEffectRecoverHp = function(target, effect) {
    var value = (target.mhp * effect.value1 + effect.value2) * target.rec;
    if (this.isItem()) {
        value *= this.subject().pha;
    }
    value = Math.floor(value);
    if (value !== 0) {
        target.gainHp(value);
        target.startDamagePopup();
    }
};

Game_Action.prototype.itemEffectRecoverMp = function(target, effect) {
    var value = (target.mmp * effect.value1 + effect.value2) * target.rec;
    if (this.isItem()) {
        value *= this.subject().pha;
    }
    value = Math.floor(value);
    if (value !== 0) {
        target.gainMp(value);
        target.startDamagePopup();
    }
};

Game_Action.prototype.itemEffectGainTp = function(target, effect) {
    var value = Math.floor(effect.value1);
    if (value !== 0) {
        target.gainTp(value);
        target.startDamagePopup();
    }
};

Game_Action.prototype.itemEffectAddState = function(target, effect) {
    if (effect.dataId === 0) {
        this.itemEffectAddAttackState(target, effect);
    } else {
        this.itemEffectAddNormalState(target, effect);
    }
};

Game_Action.prototype.itemEffectAddAttackState = function(target, effect) {
    this.subject().attackStates().forEach(function(stateId) {
        var chance = effect.value1;
        chance *= target.stateRate(stateId);
        chance *= this.subject().attackStatesRate(stateId);
        chance *= this.lukEffectRate(target);
        if (Math.random() < chance) {
            target.addState(stateId);
            target.startDamagePopup();
        }
    }.bind(this), target);
};

Game_Action.prototype.itemEffectAddNormalState = function(target, effect) {
    var chance = effect.value1;
    if (!this.isCertainHit()) {
        chance *= target.stateRate(effect.dataId);
        chance *= this.lukEffectRate(target);
    }
    if (Math.random() < chance) {
        target.addState(effect.dataId);
        target.startDamagePopup();
    }
};

Game_Action.prototype.itemEffectRemoveState = function(target, effect) {
    var chance = effect.value1;
    if (Math.random() < chance) {
        target.removeState(effect.dataId);
        target.startDamagePopup();
    }
};

Game_Action.prototype.itemEffectAddBuff = function(target, effect) {
    target.addBuff(effect.dataId, effect.value1);
    target.startDamagePopup();
};

Game_Action.prototype.itemEffectAddDebuff = function(target, effect) {
    var chance = target.debuffRate(effect.dataId) * this.lukEffectRate(target);
    if (Math.random() < chance) {
        target.addDebuff(effect.dataId, effect.value1);
        target.startDamagePopup();
    }
};

Game_Action.prototype.itemEffectRemoveBuff = function(target, effect) {
    if (target.isBuffAffected(effect.dataId)) {
        target.removeBuff(effect.dataId);
        target.startDamagePopup();
    }
};

Game_Action.prototype.itemEffectRemoveDebuff = function(target, effect) {
    if (target.isDebuffAffected(effect.dataId)) {
        target.removeBuff(effect.dataId);
        target.startDamagePopup();
    }
};

Game_Action.prototype.itemEffectSpecial = function(target, effect) {
    if (effect.dataId === Game_Action.SPECIAL_EFFECT_ESCAPE) {
        target.escape();
    }
};

Game_Action.prototype.itemEffectGrow = function(target, effect) {
    target.addParam(effect.dataId, Math.floor(effect.value1));
    target.startDamagePopup();
};

Game_Action.prototype.itemEffectLearnSkill = function(target, effect) {
    if (target.isActor()) {
        target.learnSkill(effect.dataId);
    }
};

Game_Action.prototype.itemEffectCommonEvent = function(target, effect) {
};

Game_Action.prototype.lukEffectRate = function(target) {
    return Math.max(1.0 + (this.subject().luk - target.luk) * 0.001, 0.0);
};

Game_Action.prototype.applyItemUserEffect = function(subject) {
    var value = Math.floor(this.item().tpGain * subject.tcr);
    subject.gainSilentTp(value);
};

Game_Action.EFFECT_RECOVER_HP       = 11;
Game_Action.EFFECT_RECOVER_MP       = 12;
Game_Action.EFFECT_GAIN_TP          = 13;
Game_Action.EFFECT_ADD_STATE        = 21;
Game_Action.EFFECT_REMOVE_STATE     = 22;
Game_Action.EFFECT_ADD_BUFF         = 31;
Game_Action.EFFECT_ADD_DEBUFF       = 32;
Game_Action.EFFECT_REMOVE_BUFF      = 33;
Game_Action.EFFECT_REMOVE_DEBUFF    = 34;
Game_Action.EFFECT_SPECIAL          = 41;
Game_Action.EFFECT_GROW             = 42;
Game_Action.EFFECT_LEARN_SKILL      = 43;
Game_Action.EFFECT_COMMON_EVENT     = 44;
Game_Action.HITTYPE_CERTAIN         = 0;
Game_Action.HITTYPE_PHYSICAL        = 1;
Game_Action.HITTYPE_MAGICAL         = 2;
Game_Action.SPECIAL_EFFECT_ESCAPE   = 0;
