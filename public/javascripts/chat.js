const Chat = function(socket) {
    this.socket = socket;
};

Chat.prototype.sendMessage = function(room, text) {
    let message = {
        room: room,
        text: text
    };
    this.socket.emit('message', message);
};

Chat.prototype.changeRoom = function(room) {
    this.socket.emit('join', { newRoom: room });
};

Chat.prototype.processCommand = function(command) {
    let words = command.split(' ');
    command = words[0]
        // Команда синтаксического разбора, начиная с первого слова
        .substring(1, words[0].length)
        .toLowerCase();

    let message = false;

    switch(command) {
        case 'join':
            words.shift();
            let room = words.join(' ');
            // Обработка изменения/создания комнаты чата
            this.changeRoom(room);
            break;

        case 'nick':
            words.shift();
            let name = words.join(' ');
            // Обработка попыток изменения имени пользователя чата
            this.socket.emit('nameAttempt', name);
            break;

        default:
            // Возврат сообщения об ошибке, если команда не распознается
            message = 'Unrecognized command.';
            break;
    }
    return message;
};
