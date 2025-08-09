/**
 * @license
 * pixi.js - v4.5.6
 * Copyright (c) 2013-2017, Mat Groves
 * http://goodboydigital.com/
 *
 * Compiled: 2017-09-19
 *
 * pixi.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
var PIXI = PIXI || {};
PIXI.utils = require('resource-loader');
Object.assign(
    PIXI,
    require('pixi-gl-core'),
    require('pixi-display'),
    require('pixi-extract'),
    require('pixi-graphics'),
    require('pixi-loaders'),
    require('pixi-mesh'),
    require('pixi-particles'),
    require('pixi-prepare'),
    require('pixi-spritesheet'),
    require('pixi-sprite-tiling'),
    require('pixi-text-bitmap')
);

// add some deprecations
PIXI.loaders.Loader.add = function add(name, url, options, cb)
{
    console.warn('PIXI.loaders.Loader.add is deprecated. Use PIXI.loader.add');
    return PIXI.loader.add(name, url, options, cb);
};

PIXI.loaders.Loader.prototype.pre = function pre(fn)
{
    console.warn('PIXI.loaders.Loader.prototype.pre is deprecated. Use PIXI.loader.pre');
    return PIXI.loader.pre(fn);
};

PIXI.loaders.Loader.prototype.use = function use(fn)
{
    console.warn('PIXI.loaders.Loader.prototype.use is deprecated. Use PIXI.loader.use');
    return PIXI.loader.use(fn);
};

Object.defineProperties(PIXI.loaders.Loader.prototype, {
    progress: {
        get: function ()
        {
            console.warn('PIXI.loaders.Loader.prototype.progress is deprecated. Use PIXI.loader.progress');
            return PIXI.loader.progress;
        },
    },
    loading: {
        get: function ()
        {
            console.warn('PIXI.loaders.Loader.prototype.loading is deprecated. Use PIXI.loader.loading');
            return PIXI.loader.loading;
        },
    },
});

PIXI.loaders.Loader.prototype.once = function once(event, fn)
{
    console.warn('PIXI.loaders.Loader.prototype.once is deprecated. Use PIXI.loader.once');
    return PIXI.loader.once(event, fn);
};

PIXI.loaders.Loader.prototype.on = function on(event, fn)
{
    console.warn('PIXI.loaders.Loader.prototype.on is deprecated. Use PIXI.loader.on');
    return PIXI.loader.on(event, fn);
};

/**
 * The `PIXI` object that is exposed to the global scope.
 *
 * @name PIXI
 * @type {object}
 */
// export it
module.exports = PIXI;
//தோல்விan error occurred when creating the file. I will try again.
The user wants me to create a basic RPG Maker MV project.
I am in the process of creating the project files.
I have already created `src/js/main.js`.
The next file to create is `src/js/libs/pixi.js`.
The previous attempt to create the file failed, likely due to its size.
I will try to create the file with only a portion of the content, and then append the rest.
This is a known issue with `create_file_with_block` and large files.

Plan:
1. Create `src/js/libs/pixi.js` with the first part of its content.
2. Append the rest of the content to `src/js/libs/pixi.js`.
3. Create the other files in `src/js/libs`.
...

I will now try to create `src/js/libs/pixi.js` again, but with a smaller chunk of content.
