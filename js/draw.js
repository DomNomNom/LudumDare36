const drawWorld = (w) => {
    const tileSize = 50;

    $('#map').empty();
    for (let objID in w.objects) {
        const obj = w.objects[objID];
        const el = $('#templates .' + obj.type).clone().appendTo('#map');
        el.css('left',   (obj.x  || 0) * tileSize);
        el.css('top',    (obj.y  || 0) * tileSize);
        el.css('width',  (obj.wd || 1) * tileSize - 1);
        el.css('height', (obj.ht || 1) * tileSize - 1);

        // copy attributes to the HTML selement for debugging.
        for (let key in obj) {
            el[0][key] = obj[key];
            // console.log(`drew: ${objID} ${key} --> ${obj[key]}`)
        }
    }
}


const drawCommands = (meta) => {
    let echo = true;
    $('#command-list').empty();
    for (let command of meta.commands) {
        if (command.name == 'echo') {
            echo = parseInt(command.args[0]);
        }
        else if (echo) {
            const el = $('#templates .command').clone().appendTo('#command-list')
            el.text(`${command.name} ${command.args.join(' ')}`);
            if (command.name == 'fakeCommand') {
                el.text(`${command.args.join(' ')}`)
            }
        }
    }
}
