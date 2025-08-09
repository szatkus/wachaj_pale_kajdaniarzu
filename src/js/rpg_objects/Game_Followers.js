//=============================================================================
// Game_Followers
//=============================================================================

function Game_Followers() {
    this.initialize.apply(this, arguments);
}

Game_Followers.prototype.initialize = function() {
    this._visible = $dataSystem.optFollowers;
    this._gathering = false;
    this._data = [];
    for (var i = 1; i < $gameParty.maxBattleMembers(); i++) {
        this._data.push(new Game_Follower(i));
    }
};

Game_Followers.prototype.isVisible = function() {
    return this._visible;
};

Game_Followers.prototype.show = function() {
    this._visible = true;
};

Game_Followers.prototype.hide = function() {
    this._visible = false;
};

Game_Followers.prototype.follower = function(index) {
    return this._data[index];
};

Game_Followers.prototype.forEach = function(callback, thisObject) {
    this._data.forEach(callback, thisObject);
};

Game_Followers.prototype.reverseEach = function(callback, thisObject) {
    this._data.reverse().forEach(callback, thisObject);
};

Game_Followers.prototype.refresh = function() {
    this.forEach(function(follower) {
        follower.refresh();
    });
};

Game_Followers.prototype.update = function() {
    if (this.areGathering()) {
        this.updateGather();
    }
    this.forEach(function(follower) {
        follower.update();
    });
};

Game_Followers.prototype.updateMove = function() {
    for (var i = this._data.length - 1; i >= 0; i--) {
        var precedingCharacter = (i > 0 ? this._data[i - 1] : $gamePlayer);
        this.follower(i).chaseCharacter(precedingCharacter);
    }
};

Game_Followers.prototype.jumpAll = function() {
    if ($gamePlayer.isJumping()) {
        for (var i = 0; i < this._data.length; i++) {
            var follower = this.follower(i);
            var sx = $gamePlayer.deltaXFrom(follower.x);
            var sy = $gamePlayer.deltaYFrom(follower.y);
            follower.jump(sx, sy);
        }
    }
};

Game_Followers.prototype.synchronize = function(x, y, d) {
    this.forEach(function(follower) {
        follower.locate(x, y);
        follower.setDirection(d);
    });
};

Game_Followers.prototype.gather = function() {
    this._gathering = true;
};

Game_Followers.prototype.areGathering = function() {
    return this._gathering;
};

Game_Followers.prototype.areMoving = function() {
    return this.some(function(follower) {
        return follower.isMoving();
    });
};

Game_Followers.prototype.areAllGathered = function() {
    return this.every(function(follower) {
        return !follower.isMoving() && follower.pos($gamePlayer.x, $gamePlayer.y);
    });
};

Game_Followers.prototype.updateGather = function() {
    if (!this.areMoving()) {
        this._gathering = false;
    }
};

Game_Followers.prototype.visibleFollowers = function() {
    return this._data.filter(function(follower) {
        return follower.isVisible();
    });
};

Game_Followers.prototype.areCollied = function(x, y) {
    return this.visibleFollowers().some(function(follower) {
        return follower.pos(x, y);
    });
};
