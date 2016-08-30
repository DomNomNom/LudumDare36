const triggerWrap = function(func) {
    const wrapper = function(...args) {
        for (let trigger of wrapper.triggers_before) {
            const shouldContinue = trigger.apply(this, args);
            if (!shouldContinue) {
                // console.log(`action cancled`);
                return false;
            }
        }

        const result = func.apply(this, args);

        for (let trigger of wrapper.triggers_after) {
            trigger.apply(this, args);  // pass result as arg? allow modification to result?
        }
        if (result === undefined) {
            return this;
        }
        return result;
    }
    wrapper.triggers_before = [];  // functions to take the same args
    wrapper.triggers_after = [];
    return wrapper;
}

const wrapFunctionsWithTriggers = function(obj) {
    for (let key in obj) {
        if ($.isFunction(obj[key])) {
            obj[key] = triggerWrap(obj[key]);
        }
    }
    return obj;
}



// these all become part of the world object
const Functions = wrapFunctionsWithTriggers({
    // this == world_state in here

    create: function(type, id)  {
        if (!id) {
            id = 'obj_' + this.objects_nextID++;
        }
        console.assert(!this[id]);
        const obj = wrapFunctionsWithTriggers({
            type,
            id,
            x: 0,
            y: 0,
            move: function(dx, dy)  {
                this.x = this.x + parseInt(dx);
                this.y = this.y + parseInt(dy);
            },

            saying: '',
            say: function(message) {
                this.saying = message;
            },

        });
        this.objects[id] = obj;
        return obj;
    },
    createAction: function(evalString) {
        const obj = this.create('action-button', evalString);
        obj.isAction = true;
        return obj;
    },

    sameLocation: function(A, B) {
        return A.x == B.x && A.y == B.y;
    },

    objectsAtLocation: function(x, y) {
        // TODO: optimize
        const out = [];
        for (let id in this.objects) {
            const obj = this.objects[id];
            if (obj.x==x && obj.y==y) {
                out.push(obj);
            }
        }
        return out;
    },

    '//': function() {},
    noop: function() {},
    // Things with special for seeing history
    '@echo': function(onoff)  {},
    '@fakeCommand': function() {},


    endWorld: function() {
        meta.levelIndex += 1;
        meta.resetCommands = true;
    },
    restart: function() {
        meta.resetCommands = true;
    }

});
