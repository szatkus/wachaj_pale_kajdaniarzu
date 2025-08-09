//=============================================================================
// TextManager
//=============================================================================

function TextManager() {
    throw new Error('This is a static class');
}

TextManager.basic = function(basicId) {
    return $dataSystem.terms.basic[basicId] || '';
};

TextManager.param = function(paramId) {
    return $dataSystem.terms.params[paramId] || '';
};

TextManager.command = function(commandId) {
    return $dataSystem.terms.commands[commandId] || '';
};

TextManager.message = function(messageId) {
    return $dataSystem.terms.messages[messageId] || '';
};

TextManager.getter = function(method, param) {
    return {
        get: function() {
            return this[method](param);
        },
        configurable: true
    };
};

Object.defineProperty(TextManager, 'level',           TextManager.getter('basic', 0));
Object.defineProperty(TextManager, 'levelA',          TextManager.getter('basic', 1));
Object.defineProperty(TextManager, 'hp',              TextManager.getter('basic', 2));
Object.defineProperty(TextManager, 'hpA',             TextManager.getter('basic', 3));
Object.defineProperty(TextManager, 'mp',              TextManager.getter('basic', 4));
Object.defineProperty(TextManager, 'mpA',             TextManager.getter('basic', 5));
Object.defineProperty(TextManager, 'tp',              TextManager.getter('basic', 6));
Object.defineProperty(TextManager, 'tpA',             TextManager.getter('basic', 7));
Object.defineProperty(TextManager, 'exp',             TextManager.getter('basic', 8));
Object.defineProperty(TextManager, 'expA',            TextManager.getter('basic', 9));
Object.defineProperty(TextManager, 'fight',           TextManager.getter('command', 0));
Object.defineProperty(TextManager, 'escape',          TextManager.getter('command', 1));
Object.defineProperty(TextManager, 'attack',          TextManager.getter('command', 2));
Object.defineProperty(TextManager, 'guard',           TextManager.getter('command', 3));
Object.defineProperty(TextManager, 'item',            TextManager.getter('command', 4));
Object.defineProperty(TextManager, 'skill',           TextManager.getter('command', 5));
Object.defineProperty(TextManager, 'equip',           TextManager.getter('command', 6));
Object.defineProperty(TextManager, 'status',          TextManager.getter('command', 7));
Object.defineProperty(TextManager, 'formation',       TextManager.getter('command', 8));
Object.defineProperty(TextManager, 'save',            TextManager.getter('command', 9));
Object.defineProperty(TextManager, 'gameEnd',         TextManager.getter('command', 10));
Object.defineProperty(TextManager, 'options',         TextManager.getter('command', 11));
Object.defineProperty(TextManager, 'weapon',          TextManager.getter('command', 12));
Object.defineProperty(TextManager, 'armor',           TextManager.getter('command', 13));
Object.defineProperty(TextManager, 'keyItem',         TextManager.getter('command', 14));
Object.defineProperty(TextManager, 'equip2',          TextManager.getter('command', 15));
Object.defineProperty(TextManager, 'optimize',        TextManager.getter('command', 16));
Object.defineProperty(TextManager, 'clear',           TextManager.getter('command', 17));
Object.defineProperty(TextManager, 'newGame',         TextManager.getter('command', 18));
Object.defineProperty(TextManager, 'continue_',       TextManager.getter('command', 19));
Object.defineProperty(TextManager, 'toTitle',         TextManager.getter('command', 21));
Object.defineProperty(TextManager, 'cancel',          TextManager.getter('command', 22));
Object.defineProperty(TextManager, 'buy',             TextManager.getter('command', 24));
Object.defineProperty(TextManager, 'sell',            TextManager.getter('command', 25));
Object.defineProperty(TextManager, 'alwaysDash',      TextManager.getter('message', 'alwaysDash'));
Object.defineProperty(TextManager, 'commandRemember', TextManager.getter('message', 'commandRemember'));
Object.defineProperty(TextManager, 'bgmVolume',       TextManager.getter('message', 'bgmVolume'));
Object.defineProperty(TextManager, 'bgsVolume',       TextManager.getter('message', 'bgsVolume'));
Object.defineProperty(TextManager, 'meVolume',        TextManager.getter('message', 'meVolume'));
Object.defineProperty(TextManager, 'seVolume',        TextManager.getter('message', 'seVolume'));
Object.defineProperty(TextManager, 'possession',      TextManager.getter('message', 'possession'));
Object.defineProperty(TextManager, 'expTotal',        TextManager.getter('message', 'expTotal'));
Object.defineProperty(TextManager, 'expNext',         TextManager.getter('message', 'expNext'));
Object.defineProperty(TextManager, 'saveMessage',     TextManager.getter('message', 'saveMessage'));
Object.defineProperty(TextManager, 'loadMessage',     TextManager.getter('message', 'loadMessage'));
Object.defineProperty(TextManager, 'file',            TextManager.getter('message', 'file'));
Object.defineProperty(TextManager, 'partyName',       TextManager.getter('message', 'partyName'));
Object.defineProperty(TextManager, 'emerge',          TextManager.getter('message', 'emerge'));
Object.defineProperty(TextManager, 'preemptive',      TextManager.getter('message', 'preemptive'));
Object.defineProperty(TextManager, 'surprise',        TextManager.getter('message', 'surprise'));
Object.defineProperty(TextManager, 'escapeStart',     TextManager.getter('message', 'escapeStart'));
Object.defineProperty(TextManager, 'escapeFailure',   TextManager.getter('message', 'escapeFailure'));
Object.defineProperty(TextManager, 'victory',         TextManager.getter('message', 'victory'));
Object.defineProperty(TextManager, 'defeat',          TextManager.getter('message', 'defeat'));
Object.defineProperty(TextManager, 'obtainExp',       TextManager.getter('message', 'obtainExp'));
Object.defineProperty(TextManager, 'obtainGold',      TextManager.getter('message', 'obtainGold'));
Object.defineProperty(TextManager, 'obtainItem',      TextManager.getter('message', 'obtainItem'));
Object.defineProperty(TextManager, 'levelUp',         TextManager.getter('message', 'levelUp'));
Object.defineProperty(TextManager, 'obtainSkill',     TextManager.getter('message', 'obtainSkill'));
Object.defineProperty(TextManager, 'useItem',         TextManager.getter('message', 'useItem'));
Object.defineProperty(TextManager, 'criticalToEnemy', TextManager.getter('message', 'criticalToEnemy'));
Object.defineProperty(TextManager, 'criticalToActor', TextManager.getter('message', 'criticalToActor'));
Object.defineProperty(TextManager, 'actorDamage',     TextManager.getter('message', 'actorDamage'));
Object.defineProperty(TextManager, 'actorRecovery',   TextManager.getter('message', 'actorRecovery'));
Object.defineProperty(TextManager, 'actorGain',       TextManager.getter('message', 'actorGain'));
Object.defineProperty(TextManager, 'actorLoss',       TextManager.getter('message', 'actorLoss'));
Object.defineProperty(TextManager, 'actorDrain',      TextManager.getter('message', 'actorDrain'));
Object.defineProperty(TextManager, 'actorNoDamage',   TextManager.getter('message', 'actorNoDamage'));
Object.defineProperty(TextManager, 'actorNoHit',      TextManager.getter('message', 'actorNoHit'));
Object.defineProperty(TextManager, 'enemyDamage',     TextManager.getter('message', 'enemyDamage'));
Object.defineProperty(TextManager, 'enemyRecovery',   TextManager.getter('message', 'enemyRecovery'));
Object.defineProperty(TextManager, 'enemyGain',       TextManager.getter('message', 'enemyGain'));
Object.defineProperty(TextManager, 'enemyLoss',       TextManager.getter('message', 'enemyLoss'));
Object.defineProperty(TextManager, 'enemyDrain',      TextManager.getter('message', 'enemyDrain'));
Object.defineProperty(TextManager, 'enemyNoDamage',   TextManager.getter('message', 'enemyNoDamage'));
Object.defineProperty(TextManager, 'enemyNoHit',      TextManager.getter('message', 'enemyNoHit'));
Object.defineProperty(TextManager, 'evasion',         TextManager.getter('message', 'evasion'));
Object.defineProperty(TextManager, 'magicEvasion',    TextManager.getter('message', 'magicEvasion'));
Object.defineProperty(TextManager, 'magicReflection', TextManager.getter('message', 'magicReflection'));
Object.defineProperty(TextManager, 'counterAttack',   TextManager.getter('message', 'counterAttack'));
Object.defineProperty(TextManager, 'substitute',      TextManager.getter('message', 'substitute'));
Object.defineProperty(TextManager, 'buffAdd',         TextManager.getter('message', 'buffAdd'));
Object.defineProperty(TextManager, 'debuffAdd',       TextManager.getter('message', 'debuffAdd'));
Object.defineProperty(TextManager, 'buffRemove',      TextManager.getter('message', 'buffRemove'));
Object.defineProperty(TextManager, 'actionFailure',   TextManager.getter('message', 'actionFailure'));
