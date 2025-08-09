//=============================================================================
// JsonEx
//=============================================================================

function JsonEx() {
    throw new Error('This is a static class');
}

JsonEx.maxDepth = 100;

JsonEx.stringify = function(object) {
    var B10000 = '鱀';
    var B100000 = '𩷶';
    var cnt = 0;
    var refs = [];
    var circular = [];
    var replacer = function(key, value) {
        if (cnt++ > Math.pow(10, 5)) {
            throw new Error('JsonEx.stringify: object is too big');
        }
        if (value && typeof value === 'object') {
            if (refs.indexOf(value) > -1) {
                var p = refs.indexOf(value);
                var r = p % 10000;
                var q = Math.floor(p / 10000);
                var s = '';
                if (q > 0) {
                    s += B100000;
                    s += String.fromCharCode(q + 0x20);
                }
                s += B10000;
                s += String.fromCharCode(r + 0x20);
                circular.push(s);
                return s;
            }
            refs.push(value);
        }
        return value;
    };
    var json = JSON.stringify(object, replacer);
    var pos = 0;
    var newJson = '';
    for (var i = 0, n = circular.length; i < n; i++) {
        var s = circular[i];
        var p = json.indexOf(s, pos);
        newJson += json.substring(pos, p);
        newJson += i;
        pos = p + s.length;
    }
    newJson += json.substring(pos);
    return newJson;
};

JsonEx.parse = function(json) {
    var circular = [];
    var registry = [];
    var reviver = function(key, value) {
        if (value && typeof value === 'string') {
            var m;
            if (m = value.match(/^@(\d+)$/)) {
                var id = parseInt(m[1]);
                var obj = registry[id];
                if (!obj) {
                    obj = {};
                    circular.push({key: key, parent: this, id: id});
                    registry[id] = obj;
                }
                return obj;
            }
        }
        return value;
    };
    var obj = JSON.parse(json, reviver);
    for (var i = 0, n = circular.length; i < n; i++) {
        var c = circular[i];
        c.parent[c.key] = registry[c.id];
    }
    return obj;
};

JsonEx.makeDeepCopy = function(object) {
    return this.parse(this.stringify(object));
};
