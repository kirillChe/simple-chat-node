var socket = io.connect();

$(document).ready(function() {
    let chatApp = new Chat(socket);

    // Вывод результатов попытки изменения имени
    socket.on('nameResult', function(result) {
        var message;

        if (result.success) {
            message = 'You are now known as ' + result.name + '.';
        } else {
            message = result.message;
        }
        $('#messages').append(divSystemContentElement(message));
    });

    // Вывод результатов изменения комнаты
    socket.on('joinResult', function(result) {
        $('#room').text(result.room);
        $('#messages').append(divSystemContentElement('Room changed.'));
    });

    // Вывод полученных сообщений
    socket.on('message', function (message) {
        var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);
    });

    // Вывод списка доступных комнат
    socket.on('rooms', function(rooms) {
        $('#room-list').empty();
        for(var room in rooms) {
            room = room.substring(1, room.length);
            if (room != '') {
                $('#room-list').append(divEscapedContentElement(room));
            }
        }

        // Разрешено щелкнуть на имени комнаты, чтобы изменить ее
        $('#room-list div').click(function() {
            chatApp.processCommand('/join ' + $(this).text());
            $('#send-message').focus();
        });
    });

    // Запрос списка поочередно доступных комнат чата
    setInterval(function() {
        socket.emit('rooms');
    }, 1000);
    $('#send-message').focus();
    // Отправка сообщений чата с помощью формы
    $('#send-form').submit(function() {
        processUserInput(chatApp, socket);
        return false;
    });
});


function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
    return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket) {
    let message = $('#send-message').val();
    let systemMessage;
    // Начинающиеся со слеша данные, вводимые пользователем,
    // трактуются как команды
    if (message.charAt(0) == '/') {
        systemMessage = chatApp.processCommand(message);
        if (systemMessage) {
            $('#messages').append(divSystemContentElement(systemMessage));
        }
    } else {
        // Трансляция вводимых пользователем данных другим пользователям
        chatApp.sendMessage($('#room').text(), message);
        $('#messages').append(divEscapedContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    }
    $('#send-message').val('');
}