/**
 * NOTE: This file is simply for testing this connector and will not
 * be used or packaged with the actual connector when published.
 */
var Arrow = require('arrow'),
    server = new Arrow();

// lifecycle examples
server.on('starting', function(){
    server.logger.debug('server is starting!');
});

server.on('started', function(){
    server.logger.debug('server started!');
});

// create some users programmatically
var users = [
    {name: 'Jeff'},
    {name: 'Nolan'},
    {name: 'Isaac'},
    {name: 'Vasil'},
    {name: 'Rick'},
    {name: 'Dawson'}
];

// start the server
server.start(function () {
    var User = Arrow.Model.extend('appc.redis/base','user',{
        fields: {
            name: { type: String, required: false, validator: /[a-zA-Z]{3,}/ }
        }
    });

    User.create(users, function(err, users){
        server.logger.info('Created some users', users);
    });
});