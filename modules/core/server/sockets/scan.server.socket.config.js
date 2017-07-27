'use strict';

// Create the chat configuration
module.exports = function (io, socket) {
    // Emit the status event when a new socket client is connected
    io.emit('scanMessage', {
        type: 'status',
        text: 'Is now connected',
        created: Date.now(),
        scan: socket.request.scan
    });

    // Send scan messages to all connected sockets when a message is received
    socket.on('scanMessage', function (scan) {
        scan.type = 'message';
        scan.created = Date.now();
        scan.text = socket.request.scan;

        // Emit the 'scanMessage' event
        io.emit('scanMessage', scan);
    });

    // Emit the status event when a socket client is disconnected
    socket.on('disconnect', function () {
        io.emit('scanMessage', {
            type: 'status',
            text: 'disconnected',
            created: Date.now(),
        });
    });
};
