const parseLevel = (str) => {
    const commands = str.trim()
                        .split(/\n/)
                        .map(c => c.trim())
                        // .filter(c => c)
                        // .map(commandFromString)
    // commands.map((c) => console.assert(c.name in commandFunctions, 'no commandFunction for: ' + c.name));
    return commands;
}

window.startLevel = 0;
window.levels = [

    () => parseLevel(`
        @fake create(WORLD)
        X = create('human').move(2,2);

        @echo 0
        checkWalkable = function(dx,dy) {  return objectsAtLocation(this.x+dx, this.y+dy).length > 0;  }
        respond = function(response) { uniqueCommand("C.say('" + response + "')") }
        for (let x=0; x<=5; ++x) { for (let y=0; y<=3; ++y) { create('floor').move(x,y) }}
        F = create('finish').move(5,2);
        X.move.triggers_after.push(() => { if (sameLocation(X,F)) endWorld(); })
        // createAction('X.move(-1, 0)');

        create('wormhole').move(4, 0);
        create('wormhole').move(5, 3);

        C = create('chrobar').move(1,1);
        C.voicelineIndex = 0;
        C.voicelines = ['How did you get in here?', 'You look shattered.', 'Are you able to say something other than hello?', "Shakrax! This should allow you to at least stand up straight.", "...", "Try walking and see if you feel better"]
        X.say.triggers_after.push(function(msg) { respond(C.voicelines[C.voicelineIndex++] || '...'); })
        C.say.triggers_after.push(function(msg) { if (C.voicelineIndex == 4) uniqueCommand("createAction('X.move(-1, 0)')"); })
        X.move.triggers_after.push(() => { X.saying = ''; C.saying = ''; })
        X.move.triggers_before.push((dx) => { if (dx<0 && X.x == 0) { respond('You sure like stumbling into walls. Shakrax! This should allow you to move more easily'); uniqueCommand("createAction('X.move(+1, 0)')"); } return true; })
        X.move.triggers_before.push(checkWalkable)

        createAction("X.say('Hello.')")
        @echo 1

    `),

    // move to win
    () => parseLevel(`
        @fake create(WORLD)
        X = create('human').move(1,2);
        C = create('chrobar').move(0,1);
        F = create('finish').move(5, 2);

        @echo 0
        checkWalkable = function(dx,dy) {  return objectsAtLocation(this.x+dx, this.y+dy).length > 0;  }
        respond = function(response) { uniqueCommand("C.say('" + response + "')") }
        for (let x=0; x<=5; ++x) { for (let y=0; y<=3; ++y) { create('floor').move(x,y) }}

        create('wormhole').move(0, 0);
        W = create('wormhole').move(1, 3);

        speech1 = create('invisible').move(1, 1)
        speech2 = create('invisible').move(2, 2)
        speech3 = create('invisible').move(2, 0)
        reset = create('invisible').move(5,3);

        X.move.triggers_before.push(checkWalkable)
        X.move.triggers_after.push(() => { X.saying = ''; C.saying = ''; })
        X.move.triggers_after.push(() => { if (sameLocation(X,W)) { X.move(0, -3); } })
        X.move.triggers_after.push(() => { if (sameLocation(X,speech1) || sameLocation(X,speech2) || sameLocation(X,speech3)) { respond("Do not bump my ancient vases of plain sight hiding!"); } })
        X.move.triggers_after.push(() => { if (sameLocation(X,F) && !F.hidden) endWorld(); })
        X.move.triggers_after.push(() => { if (sameLocation(X,reset)) createAction('restart()'); })
        vaseLocs = [[2,1], [4,0], [3,2], [3,3], [5,1], [4,3]]
        initVase = (v) => { v.hidden=true; X.move.triggers_after.push(() => { if (sameLocation(X, v)) { v.broken = true; C.say("YOU UNGAINLY FOOL! Now go sit in the corner."); F.hidden = true; vases.map(v=>v.hidden = false) } });  return v; }
        vases = []
        for (let [x,y] of vaseLocs) { vases.push(initVase(create('vase').move(x,y))) }


        createAction('X.move(1, 0)');

        @echo 1

        C.say('You are adapting quicky. Shakray! Yet there is much for you to see...');
        createAction('X.move(0, 1)');


    `),

]
