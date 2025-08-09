//=============================================================================
// Game_BattlerBase
//=============================================================================

function Game_BattlerBase() {
    this.initialize.apply(this, arguments);
}

Game_BattlerBase.prototype.initialize = function() {
    this.initMembers();
};

Game_BattlerBase.prototype.initMembers = function() {
    this._hp = 1;
    this._mp = 0;
    this._tp = 0;
    this._hidden = false;
    this._paramPlus = [0, 0, 0, 0, 0, 0, 0, 0];
    this._states = [];
    this._stateTurns = {};
    this._buffs = [0, 0, 0, 0, 0, 0, 0, 0];
    this._buffTurns = [0, 0, 0, 0, 0, 0, 0, 0];
};

Game_BattlerBase.prototype.hp = function() {
    return this._hp;
};

Game_BattlerBase.prototype.mhp = function() {
    return this.param(0);
};

Game_BattlerBase.prototype.mp = function() {
    return this._mp;
};

Game_BattlerBase.prototype.mmp = function() {
    return this.param(1);
};

Game_BattlerBase.prototype.tp = function() {
    return this._tp;
};

Game_BattlerBase.prototype.mtp = function() {
    return 100;
};

Game_BattlerBase.prototype.atk = function() {
    return this.param(2);
};

Game_BattlerBase.prototype.def = function() {
    return this.param(3);
};

Game_BattlerBase.prototype.mat = function() {
    return this.param(4);
};

Game_BattlerBase.prototype.mdf = function() {
    return this.param(5);
};

Game_BattlerBase.prototype.agi = function() {
    return this.param(6);
};

Game_BattlerBase.prototype.luk = function() {
    return this.param(7);
};

Game_BattlerBase.prototype.hit = function() {
    return this.xparam(0);
};

Game_BattlerBase.prototype.eva = function() {
    return this.xparam(1);
};

Game_BattlerBase.prototype.cri = function() {
    return this.xparam(2);
};

Game_BattlerBase.prototype.cev = function() {
    return this.xparam(3);
};

Game_BattlerBase.prototype.mev = function() {
    return this.xparam(4);
};

Game_BattlerBase.prototype.mrf = function() {
    return this.xparam(5);
};

Game_BattlerBase.prototype.cnt = function() {
    return this.xparam(6);
};

Game_BattlerBase.prototype.hrg = function() {
    return this.xparam(7);
};

Game_BattlerBase.prototype.mrg = function() {
    return this.xparam(8);
};

Game_BattlerBase.prototype.trg = function() {
    return this.xparam(9);
};

Game_BattlerBase.prototype.tgr = function() {
    return this.sparam(0);
};

Game_BattlerBase.prototype.grd = function() {
    return this.sparam(1);
};

Game_BattlerBase.prototype.rec = function() {
    return this.sparam(2);
};

Game_BattlerBase.prototype.pha = function() {
    return this.sparam(3);
};

Game_BattlerBase.prototype.mcr = function() {
    return this.sparam(4);
};

Game_BattlerBase.prototype.tcr = function() {
    return this.sparam(5);
};

Game_BattlerBase.prototype.pdr = function() {
    return this.sparam(6);
};

Game_BattlerBase.prototype.mdr = function() {
    return this.sparam(7);
};

Game_BattlerBase.prototype.fdr = function() {
    return this.sparam(8);
};

Game_BattlerBase.prototype.exr = function() {
    return this.sparam(9);
};

Game_BattlerBase.prototype.param = function(paramId) {
    var value = this.paramBase(paramId) + this.paramPlus(paramId);
    value *= this.paramRate(paramId) * this.paramBuffRate(paramId);
    var maxValue = this.paramMax(paramId);
    var minValue = this.paramMin(paramId);
    return Math.round(value.clamp(minValue, maxValue));
};

Game_BattlerBase.prototype.paramBase = function(paramId) {
    return 0;
};

Game_BattlerBase.prototype.paramPlus = function(paramId) {
    return this._paramPlus[paramId];
};

Game_BattlerBase.prototype.paramMin = function(paramId) {
    if (paramId === 1) {
        return 0;   // MMP
    } else {
        return 1;
    }
};

Game_BattlerBase.prototype.paramMax = function(paramId) {
    if (paramId === 0) {
        return 999999;  // MHP
    } else if (paramId === 1) {
        return 9999;    // MMP
    } else {
        return 999;
    }
};

Game_BattlerBase.prototype.paramRate = function(paramId) {
    return this.traitsPi(Game_BattlerBase.TRAIT_PARAM, paramId);
};

Game_BattlerBase.prototype.paramBuffRate = function(paramId) {
    return this._buffs[paramId] * 0.25 + 1.0;
};

Game_BattlerBase.prototype.xparam = function(xparamId) {
    return this.traitsSum(Game_BattlerBase.TRAIT_XPARAM, xparamId);
};

Game_BattlerBase.prototype.sparam = function(sparamId) {
    return this.traitsPi(Game_BattlerBase.TRAIT_SPARAM, sparamId);
};

Game_BattlerBase.prototype.elementRate = function(elementId) {
    return this.traitsPi(Game_BattlerBase.TRAIT_ELEMENT_RATE, elementId);
};

Game_BattlerBase.prototype.debuffRate = function(paramId) {
    return this.traitsPi(Game_BattlerBase.TRAIT_DEBUFF_RATE, paramId);
};

Game_BattlerBase.prototype.stateRate = function(stateId) {
    return this.traitsPi(Game_BattlerBase.TRAIT_STATE_RATE, stateId);
};

Game_BattlerBase.prototype.stateResistSet = function() {
    return this.traitsSet(Game_BattlerBase.TRAIT_STATE_RESIST);
};

Game_BattlerBase.prototype.isStateResist = function(stateId) {
    return this.stateResistSet().contains(stateId);
};

Game_BattlerBase.prototype.attackElements = function() {
    return this.traitsSet(Game_BattlerBase.TRAIT_ATTACK_ELEMENT);
};

Game_BattlerBase.prototype.attackStates = function() {
    return this.traitsSet(Game_BattlerBase.TRAIT_ATTACK_STATE);
};

Game_BattlerBase.prototype.attackStatesRate = function(stateId) {
    return this.traitsSum(Game_BattlerBase.TRAIT_ATTACK_STATE, stateId);
};

Game_BattlerBase.prototype.attackSpeed = function() {
    return this.traitsSumAll(Game_BattlerBase.TRAIT_ATTACK_SPEED);
};

Game_BattlerBase.prototype.attackTimesAdd = function() {
    return Math.max(this.traitsSumAll(Game_BattlerBase.TRAIT_ATTACK_TIMES) - 1, 0);
};

Game_BattlerBase.prototype.addedSkillTypes = function() {
    return this.traitsSet(Game_BattlerBase.TRAIT_SKILL_TYPE_ADD);
};

Game_BattlerBase.prototype.isSkillTypeSealed = function(stypeId) {
    return this.traitsSet(Game_BattlerBase.TRAIT_SKILL_TYPE_SEAL).contains(stypeId);
};

Game_BattlerBase.prototype.addedSkills = function() {
    return this.traitsSet(Game_BattlerBase.TRAIT_SKILL_ADD);
};

Game_BattlerBase.prototype.isSkillSealed = function(skillId) {
    return this.traitsSet(Game_BattlerBase.TRAIT_SKILL_SEAL).contains(skillId);
};

Game_BattlerBase.prototype.isEquipWtypeOk = function(wtypeId) {
    return this.traitsSet(Game_BattlerBase.TRAIT_EQUIP_WTYPE).contains(wtypeId);
};

Game_BattlerBase.prototype.isEquipAtypeOk = function(atypeId) {
    return this.traitsSet(Game_BattlerBase.TRAIT_EQUIP_ATYPE).contains(atypeId);
};

Game_BattlerBase.prototype.isEquipTypeFixed = function(etypeId) {
    return this.traitsSet(Game_BattlerBase.TRAIT_EQUIP_FIX).contains(etypeId);
};

Game_BattlerBase.prototype.isEquipTypeSealed = function(etypeId) {
    return this.traitsSet(Game_BattlerBase.TRAIT_EQUIP_SEAL).contains(etypeId);
};

Game_BattlerBase.prototype.slotType = function() {
    var set = this.traitsSet(Game_BattlerBase.TRAIT_SLOT_TYPE);
    return set.length > 0 ? Math.max.apply(null, set) : 0;
};

Game_BattlerBase.prototype.isDualWield = function() {
    return this.slotType() === 1;
};

Game_BattlerBase.prototype.actionPlusSet = function() {
    return this.traits(Game_BattlerBase.TRAIT_ACTION_PLUS).map(function(trait) {
        return trait.value;
    });
};

Game_BattlerBase.prototype.specialFlag = function(flagId) {
    return this.traits(Game_BattlerBase.TRAIT_SPECIAL_FLAG).some(function(trait) {
        return trait.dataId === flagId;
    });
};

Game_BattlerBase.prototype.collapseType = function() {
    var set = this.traitsSet(Game_BattlerBase.TRAIT_COLLAPSE_TYPE);
    return set.length > 0 ? Math.max.apply(null, set) : 0;
};

Game_BattlerBase.prototype.partyAbility = function(abilityId) {
    return this.traits(Game_BattlerBase.TRAIT_PARTY_ABILITY).some(function(trait) {
        return trait.dataId === abilityId;
    });
};

Game_BattlerBase.prototype.isAutoBattle = function() {
    return this.specialFlag(Game_BattlerBase.FLAG_ID_AUTO_BATTLE);
};

Game_BattlerBase.prototype.isGuard = function() {
    return this.specialFlag(Game_BattlerBase.FLAG_ID_GUARD) && this.canMove();
};

Game_BattlerBase.prototype.isSubstitute = function() {
    return this.specialFlag(Game_BattlerBase.FLAG_ID_SUBSTITUTE) && this.canMove();
};

Game_BattlerBase.prototype.isPreserveTp = function() {
    return this.specialFlag(Game_BattlerBase.FLAG_ID_PRESERVE_TP);
};

Game_BattlerBase.prototype.addParam = function(paramId, value) {
    this._paramPlus[paramId] += value;
    this.refresh();
};

Game_BattlerBase.prototype.setHp = function(hp) {
    this._hp = hp;
    this.refresh();
};

Game_BattlerBase.prototype.setMp = function(mp) {
    this._mp = mp;
    this.refresh();
};

Game_BattlerBase.prototype.setTp = function(tp) {
    this._tp = tp;
    this.refresh();
};

Game_BattlerBase.prototype.maxTp = function() {
    return 100;
};

Game_BattlerBase.prototype.refresh = function() {
    this.stateResistSet().forEach(function(stateId) {
        this.eraseState(stateId);
    }, this);
    this._hp = this._hp.clamp(0, this.mhp);
    this._mp = this._mp.clamp(0, this.mmp);
    this._tp = this._tp.clamp(0, this.maxTp());
};

Game_BattlerBase.prototype.recoverAll = function() {
    this.clearStates();
    this._hp = this.mhp;
    this._mp = this.mmp;
};

Game_BattlerBase.prototype.hpRate = function() {
    return this.hp / this.mhp;
};

Game_BattlerBase.prototype.mpRate = function() {
    return this.mmp > 0 ? this.mp / this.mmp : 0;
};

Game_BattlerBase.prototype.tpRate = function() {
    return this.tp / this.maxTp();
};

Game_BattlerBase.prototype.hide = function() {
    this._hidden = true;
};

Game_BattlerBase.prototype.appear = function() {
    this._hidden = false;
};

Game_BattlerBase.prototype.isHidden = function() {
    return this._hidden;
};

Game_BattlerBase.prototype.isAppeared = function() {
    return !this.isHidden();
};

Game_BattlerBase.prototype.isDead = function() {
    return this.isAppeared() && this.isStateAffected(this.deathStateId());
};

Game_BattlerBase.prototype.isAlive = function() {
    return this.isAppeared() && !this.isStateAffected(this.deathStateId());
};

Game_BattlerBase.prototype.isDying = function() {
    return this.isAlive() && this._hp < this.mhp / 4;
};

Game_BattlerBase.prototype.isRestricted = function() {
    return this.isAppeared() && this.restriction() > 0;
};

Game_BattlerBase.prototype.canInput = function() {
    return this.isAppeared() && !this.isRestricted() && !this.isAutoBattle();
};

Game_BattlerBase.prototype.canMove = function() {
    return this.isAppeared() && this.restriction() < 4;
};

Game_BattlerBase.prototype.isConfused = function() {
    return this.isAppeared() && this.restriction() >= 1 && this.restriction() <= 3;
};

Game_BattlerBase.prototype.confusionLevel = function() {
    return this.isConfused() ? this.restriction() : 0;
};

Game_BattlerBase.prototype.isActor = function() {
    return false;
};

Game_BattlerBase.prototype.isEnemy = function() {
    return false;
};

Game_BattlerBase.prototype.sortStates = function() {
    this._states.sort(function(a, b) {
        var p1 = $dataStates[a].priority;
        var p2 = $dataStates[b].priority;
        if (p1 !== p2) {
            return p2 - p1;
        }
        return a - b;
    });
};

Game_BattlerBase.prototype.restriction = function() {
    var restrictions = this.states().map(function(state) {
        return state.restriction;
    });
    return Math.max.apply(null, [0].concat(restrictions));
};

Game_BattlerBase.prototype.addNewState = function(stateId) {
    if (stateId === this.deathStateId()) {
        this.die();
    }
    var restricted = this.isRestricted();
    this._states.push(stateId);
    this.sortStates();
    if (!restricted && this.isRestricted()) {
        this.onRestrict();
    }
};

Game_BattlerBase.prototype.onRestrict = function() {
};

Game_BattlerBase.prototype.mostImportantStateText = function() {
    var states = this.states();
    for (var i = 0; i < states.length; i++) {
        if (states[i].message3) {
            return states[i].message3;
        }
    }
    return '';
};

Game_BattlerBase.prototype.stateMotionIndex = function() {
    var states = this.states();
    if (states.length > 0) {
        return states[0].motion;
    } else {
        return 0;
    }
};

Game_BattlerBase.prototype.stateOverlayIndex = function() {
    var states = this.states();
    if (states.length > 0) {
        return states[0].overlay;
    } else {
        return 0;
    }
};

Game_BattlerBase.prototype.isSkillWtypeOk = function(skill) {
    return true;
};

Game_BattlerBase.prototype.skillMpCost = function(skill) {
    return Math.floor(skill.mpCost * this.mcr);
};

Game_BattlerBase.prototype.skillTpCost = function(skill) {
    return skill.tpCost;
};

Game_BattlerBase.prototype.canPaySkillCost = function(skill) {
    return this._tp >= this.skillTpCost(skill) && this._mp >= this.skillMpCost(skill);
};

Game_BattlerBase.prototype.paySkillCost = function(skill) {
    this._mp -= this.skillMpCost(skill);
    this._tp -= this.skillTpCost(skill);
};

Game_BattlerBase.prototype.isOccasionOk = function(item) {
    if ($gameParty.inBattle()) {
        return item.occasion === 0 || item.occasion === 1;
    } else {
        return item.occasion === 0 || item.occasion === 2;
    }
};

Game_BattlerBase.prototype.meetsUsableItemConditions = function(item) {
    return this.canMove() && this.isOccasionOk(item);
};

Game_BattlerBase.prototype.meetsSkillConditions = function(skill) {
    return (this.meetsUsableItemConditions(skill) &&
            this.isSkillWtypeOk(skill) && this.canPaySkillCost(skill) &&
            !this.isSkillSealed(skill.id) && !this.isSkillTypeSealed(skill.stypeId));
};

Game_BattlerBase.prototype.meetsItemConditions = function(item) {
    return this.meetsUsableItemConditions(item) && $gameParty.hasItem(item);
};

Game_BattlerBase.prototype.canUse = function(item) {
    if (!item) {
        return false;
    } else if (DataManager.isSkill(item)) {
        return this.meetsSkillConditions(item);
    } else if (DataManager.isItem(item)) {
        return this.meetsItemConditions(item);
    } else {
        return false;
    }
};

Game_BattlerBase.prototype.canEquip = function(item) {
    if (!item) {
        return false;
    } else if (DataManager.isWeapon(item)) {
        return this.canEquipWeapon(item);
    } else if (DataManager.isArmor(item)) {
        return this.canEquipArmor(item);
    } else {
        return false;
    }
};

Game_BattlerBase.prototype.canEquipWeapon = function(item) {
    return this.isEquipWtypeOk(item.wtypeId) && !this.isEquipTypeSealed(item.etypeId);
};

Game_BattlerBase.prototype.canEquipArmor = function(item) {
    return this.isEquipAtypeOk(item.atypeId) && !this.isEquipTypeSealed(item.etypeId);
};

Game_BattlerBase.prototype.attackSkillId = function() {
    return 1;
};

Game_BattlerBase.prototype.guardSkillId = function() {
    return 2;
};

Game_BattlerBase.prototype.canAttack = function() {
    return this.canUse($dataSkills[this.attackSkillId()]);
};

Game_BattlerBase.prototype.canGuard = function() {
    return this.canUse($dataSkills[this.guardSkillId()]);
};

Game_BattlerBase.TRAIT_ELEMENT_RATE   = 11;
Game_BattlerBase.TRAIT_DEBUFF_RATE    = 12;
Game_BattlerBase.TRAIT_STATE_RATE     = 13;
Game_BattlerBase.TRAIT_STATE_RESIST   = 14;
Game_BattlerBase.TRAIT_PARAM          = 21;
Game_BattlerBase.TRAIT_XPARAM         = 22;
Game_BattlerBase.TRAIT_SPARAM         = 23;
Game_BattlerBase.TRAIT_ATTACK_ELEMENT = 31;
Game_BattlerBase.TRAIT_ATTACK_STATE   = 32;
Game_BattlerBase.TRAIT_ATTACK_SPEED   = 33;
Game_BattlerBase.TRAIT_ATTACK_TIMES   = 34;
Game_BattlerBase.TRAIT_STYPE_ADD      = 41;
Game_BattlerBase.TRAIT_STYPE_SEAL     = 42;
Game_BattlerBase.TRAIT_SKILL_ADD      = 43;
Game_BattlerBase.TRAIT_SKILL_SEAL     = 44;
Game_BattlerBase.TRAIT_EQUIP_WTYPE    = 51;
Game_BattlerBase.TRAIT_EQUIP_ATYPE    = 52;
Game_BattlerBase.TRAIT_EQUIP_LOCK     = 53;
Game_BattlerBase.TRAIT_EQUIP_SEAL     = 54;
Game_BattlerBase.TRAIT_SLOT_TYPE      = 55;
Game_BattlerBase.TRAIT_ACTION_PLUS    = 61;
Game_BattlerBase.TRAIT_SPECIAL_FLAG   = 62;
Game_BattlerBase.TRAIT_COLLAPSE_TYPE  = 63;
Game_BattlerBase.TRAIT_PARTY_ABILITY  = 64;
Game_BattlerBase.FLAG_ID_AUTO_BATTLE  = 0;
Game_BattlerBase.FLAG_ID_GUARD        = 1;
Game_BattlerBase.FLAG_ID_SUBSTITUTE   = 2;
Game_BattlerBase.FLAG_ID_PRESERVE_TP  = 3;
Game_BattlerBase.ICON_BUFF_START      = 32;
Game_BattlerBase.ICON_DEBUFF_START    = 48;
