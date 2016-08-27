$(() => {


    const triggerCreators = {  // functions that create
        samePos: function(otherType, callbackName, ...argumentEval) {
            const A = this.selected;
            console.assert(callbackName in this, 'callback not in world: ' + callbackName);
            return (w) => {
                // find objects at the same location
                for (let B of w.objectsAtLocation(A.x, A.y)) {
                    if (B.type == otherType) {
                        const args = eval(argumentEval.join(' ')) || [];
                        this[callbackName](...args);  // meta as fuck
                    }
                }
            }
        },

        impassable: function(callbackName, ...argumentEval) {
            const A = this.selected;
            return (w) => {
                const command = w.currentCommand;
                console.assert(command.name == 'move');
                const projectedX = (parseInt(w.selected.x) || 0) + parseInt(command.args[0]);
                const projectedY = (parseInt(w.selected.y) || 0) + parseInt(command.args[1]);

                let passable = false;
                for (let b of w.objectsAtLocation(projectedX, projectedY)) {
                    if (b.type == 'floor') {
                        passable = true;
                    }
                }

                if (!passable) {
                    // console.log("IMASSABLE!");
                    const args = eval(argumentEval.join(' ')) || [];
                    this[callbackName](...args);
                    return true;
                }
                return false;
            };
        },
    };


    const commandFunctions = {
        // this == world_state in here
        create: function(type, id)  {
            if (!id) {
                id = this.objects_nextID++;
            }
            const obj = { type, id, };
            this.objects[id] = obj;
            this.selected = obj;
        },
        move: function(dx, dy)  {
            // const selected = this.objects[this.selected]; // assert w.selected?
            const selected = this.selected;
            selected.x = (parseInt(selected.x) || 0) + parseInt(dx);
            selected.y = (parseInt(selected.y) || 0) + parseInt(dy);
        },
        triggerAfter: function(commandName, triggerFunctionName, ...triggerArgs) {
            const trigger = this[triggerFunctionName](...triggerArgs);
            this.triggers_after[commandName].push(trigger);
        },
        triggerBefore: function(commandName, triggerFunctionName, ...triggerArgs) {
            const trigger = this[triggerFunctionName](...triggerArgs);
            this.triggers_before[commandName].push(trigger);
        },

        noop: function() {},

        // Things with special for seeing history
        echo: function(onoff)  {
            this.echoOn = onoff;
        },
        fakeCommand: function() {},

        endWorld: function() {
            meta.levelIndex += 1;
            meta.resetCommands = true;
        }
    }

    // puts function from x into y. carefully
    const mergeInto = (x, y) => {
        for (let key in x) {
            console.assert(!(key in y));
            y[key] = x[key];
        }
        return y;
    }

    const evalWorld = (meta) => {
        const w = {  // world state
            selected: null, // the currently selected element
            commandIndex : 0,
            currentCommand : null,

            objects: {},
            objects_nextID: 1,
            triggers_before: {},
            triggers_after: {},  // command.name --> [ triggerfunction]

            eval: function() {
                // apply html changes
                for (
                    this.commandIndex=0;
                    this.commandIndex >= 0 && this.commandIndex < meta.commands.length;
                    ++this.commandIndex
                ) {
                    this.currentCommand = meta.commands[this.commandIndex];

                    let gotTriggeredBefore = false;
                    for (let trigger of this.triggers_before[this.currentCommand.name]) {
                        gotTriggeredBefore = gotTriggeredBefore || trigger(this);
                    }
                    if (gotTriggeredBefore) continue;  // yeah, whatever.

                    this[this.currentCommand.name](...this.currentCommand.args);  // :D
                    for (let trigger of this.triggers_after[this.currentCommand.name]) {
                        trigger(this);  // lol triggered.
                    }
                }
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
        };
        mergeInto(triggerCreators, w);
        mergeInto(commandFunctions, w);
        for (let commandName in commandFunctions) {
            w.triggers_before[commandName] = [];
            w.triggers_after[ commandName] = [];
        }
        w.eval();

        return w;
    };



    const commandFromString = (commandString) => {
        const parts = commandString.split(' ');
        return {
            name: parts[0],
            args: parts.slice(1),
        }
    }
    const parseLevel = (str) => {
        const commands = str.split(/\;|\n/)
                            .map(c => c.trim())
                            .filter(c => c)
                            .map(commandFromString)
        commands.map((c) => console.assert(c.name in commandFunctions, 'no commandFunction for: ' + c.name));
        return commands;
    }

    const meta = {  // things that persist across multiple evalutions of history.
        commands: [],
        levelIndex: 0,
        resetCommands: true,
        levels: [
            () => parseLevel(`
                echo 0
                create floor; move 1 1; create floor; move 1 2; create floor; move 1 3;
                create floor; move 2 1; create floor; move 2 2; create floor; move 2 3;
                create floor; move 3 1; create floor; move 3 2; create floor; move 3 3;
                create floor; move 4 1; create floor; move 4 2; create floor; move 4 3;
                create floor; move 5 2;
                echo 1
                fakeCommand create world
                create finish; move +5 +2
                triggerAfter move samePos human endWorld
                create human bob; move +2 +2; triggerBefore move impassable noop;
            `),
            () => parseLevel(`
                echo 0
                create floor; move 2 1; create floor; move 2 2; create floor; move 2 3;
                create floor; move 3 1; create floor; move 3 2; create floor; move 3 3;
                create floor; move 4 1; create floor; move 4 2; create floor; move 4 3;
                create floor; move 5 1; create floor; move 5 2; create floor; move 5 3;
                create floor; move 6 2;
                echo 1
                fakeCommand create world

                create finish;
                triggerAfter move samePos human endWorld
                move +6 +2

                create wormhole;
                triggerAfter move samePos human move [-2,+2]
                move +5 +1

                create wormhole;
                triggerAfter move samePos human move [-3,-1]
                move +5 +3

                create human bob; move +2 +1; triggerBefore move impassable noop;
            `),
        ],
        run: function() {
            this.world = evalWorld(this);
            while (this.resetCommands) {
                this.resetCommands = false;
                let worldGenerator = this.levels[this.levelIndex];
                if (!worldGenerator) {
                    alert('you win!');
                    this.levelIndex = 0;
                    worldGenerator = this.levels[this.levelIndex];
                    // return;
                }
                this.commands = worldGenerator();
                this.world = evalWorld(this);
            }
            drawWorld(this.world);
            drawCommands(this);
        },
        world: null,
    };

    meta.run();

    // User input
    window.pushCommand = (commandString) => {
        const command = commandFromString(commandString);
        meta.commands.push(command);
        meta.run();
    }

    console.log('fun2');
})

