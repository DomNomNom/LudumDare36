$(() => {


    // puts function from x into y. carefully
    const mergeInto = (x, y) => {
        for (let key in x) {
            console.assert(!(key in y));
            y[key] = x[key];
        }
        return y;
    }

    const initWorld = () => {
        const w = {  // world state
            selected: null, // the currently selected element
            commandIndex : 0,
            currentCommand : null,

            objects: {},
            objects_nextID: 1,

            runCommands: function(commands) {
                with (this) {  // WATAFUCK BAD GREAT IT WORKS
                    for (
                        this.commandIndex = 0;
                        this.commandIndex >= 0 && this.commandIndex < commands.length;
                        ++this.commandIndex
                    ) {
                        const command = commands[this.commandIndex];
                        if (command.startsWith('@')) {
                            continue;
                        }
                        eval(command);
                    }
                }
            },
        };
        mergeInto(Functions, w);
        return w;
    }

    const runWorld = (commands) => {
        const world = initWorld();
        window.world = world;  // for debug.
        world.runCommands(commands);
        return world;
    };


    window.meta = {  // things that persist across multiple evalutions of history.
        commands: [],
        levelIndex: window.startLevel,
        resetCommands: true,
        levels: window.levels,
        run: function() {
            this.world = runWorld(this.commands);
            while (this.resetCommands) {
                this.resetCommands = false;
                let worldGenerator = this.levels[this.levelIndex];
                if (!worldGenerator) {
                    alert('you win!');
                    this.levelIndex = 0;
                    worldGenerator = this.levels[this.levelIndex];
                }
                this.commands = worldGenerator();
                this.world = runWorld(this.commands);
            }
            drawWorld(this.world);
            drawCommands(this.commands);
        },
        world: null,
    };

    meta.run();

    // User input
    window.pushCommand = (commandString) => {
        const command = commandString.trim();
        meta.commands.push(command);
        meta.run();
    }

    window.uniqueCommand = (commandString) => {
        if (meta.commands.indexOf(commandString) < 0) {
            meta.commands.push(commandString);
        }
    }

    console.log('fun2');
})

