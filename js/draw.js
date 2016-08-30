const drawWorld = (w) => {
    const tileSize = 50;

    $('#map').empty();
    $('#action-bar').empty();
    $('.popover').popover('hide');

    for (let objID in w.objects) {
        const obj = w.objects[objID];
        const el = $('#templates .' + obj.type).clone()

        if (obj.isAction) {
            el.appendTo('#action-bar');
            el.click(() => window.pushCommand(obj.id));
            $('.action-text', el).text(obj.id);
        }
        else if(!obj.hidden) {
            el.appendTo('#map');
            el.css('left',   ((obj.x || 0) + 2) * tileSize);
            el.css('top',    ((obj.y || 0) + 1) * tileSize + 0);
            el.css('width',  (obj.wd || 1) * tileSize + 1);
            el.css('height', (obj.ht || 1) * tileSize + 1);

            if (obj.saying) {
                // el.popover('show');
                $('.text', el)
                    .attr('data-toggle', 'popover')
                    .attr('data-content', obj.saying)
                    .attr('data-placement', obj.speechPlacement || 'top')
                    // .attr('data-original-title', obj.saying)
                    // .popover({                    title: obj.saying,                })
                    .popover({container: 'body'})
                    // .popover({content: obj.saying})
                    .popover('show')
            }
            if (obj.broken) {
                $('.text', el).css('text-decoration', 'line-through')
            }
        }

        // copy attributes to the HTML selement for debugging.
        for (let key in obj) {
            el[0][key] = obj[key];
        }
    }
}


const drawCommand = (command) => {
    const el = $('#templates .command').clone().appendTo('#command-list');
    el.text(`${command.name} ${command}`);
    el.text(`${command}`);
}

const drawCommands = (commands) => {
    $('#command-list').empty();

    let echo = true;
    for (let command of commands) {
        if (command.startsWith('@echo ')) {
            echo = parseInt(command.split(' ').slice(1).join(' '));
        }
        else if (command.startsWith('@fake ')) {
            drawCommand(command.split(' ').slice(1).join(' '))
        }
        else if (echo) {
            drawCommand(command);
        }
    }
}
