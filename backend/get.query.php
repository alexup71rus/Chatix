<?
header('Access-Control-Allow-Origin: *');

$_GET['request'] = formatstr($_GET['request']);
$_GET['response'] = formatstr($_GET['response']);
$_GET['id'] = formatstr($_GET['id']);
$_GET['first_name'] = formatstr($_GET['first_name']);
$_GET['mail'] = formatstr($_GET['mail']);
$_GET['login'] = formatstr($_GET['login']);
$_GET['pass'] = formatstr($_GET['pass']);
$_GET['hash'] = formatstr($_GET['hash']);
$_GET['text'] = formatstr($_GET['text']);
$_GET['attach'] = formatstr($_GET['attach']);
$_GET['forward'] = formatstr($_GET['forward']);
$_GET['date'] = formatstr($_GET['date']);
$_GET['settings'] = formatstr($_GET['settings']);
$_GET['fetch'] = formatstr($_GET['fetch']);
$_GET['data'] = formatstr($_GET['data']);

switch ($_GET['request']) {
    case "AUTH": // АВТОРИЗАЦИЯ
        if (strlen($_GET['login']) < 1) {
            echo json_encode([ error => 1, message => "invalid `login` param" ]);
            break;
        }
        if (strlen($_GET['pass']) < 4) {
            echo json_encode([ error => 2, message => "invalid `pass` param" ]);
            break;
        }
        $response = auth($_GET['login'], $_GET['pass']);
        if ($response['error'] > 0) {
            echo json_encode($response);
        } else {
            echo json_encode([ error => 0, message => [
                hash => $response['data']['hash'],
                data => $response['data']
            ] ]);
        }
    break;

    case "REGISTER": // РЕГИСТРАЦИЯ
        if (strlen($_GET['login']) < 1) {
            echo json_encode([ error => 1, message => "invalid `login` param" ]);
            break;
        }
        if (strlen($_GET['pass']) < 4) {
            echo json_encode([ error => 2, message => "invalid `pass` param" ]);
            break;
        }
        if (strlen($_GET['mail']) < 1) {
            echo json_encode([ error => 3, message => "invalid `mail` param" ]);
            break;
        }
        if (strlen($_GET['first_name']) < 1) {
            echo json_encode([ error => 4, message => "invalid `first_name` param" ]);
            break;
        }
        $hash = makeRandomString(32);
        $response = register($_GET['first_name'], $_GET['mail'], $_GET['login'], $_GET['pass'], $hash);
        if ($response['error'] > 0) {
            echo json_encode($response);
        } else {
            mysqli_query (  $_db, "INSERT INTO users_auth (id, hash )VALUES (".$response['message'].", '$hash');" );
            echo json_encode([ error => 0, message => [
                id => $response['message'],
                hash => $hash
            ] ], JSON_UNESCAPED_UNICODE);
        }
    break;

    case "FORGOTTEN": // ВОССТАНОВЛЕНИЕ АККАУНТА
        echo json_encode([ error => 0, message => "ok" ]);
    break;
    
    case "CREATE_PIPE": // создать общий чат
        echo json_encode([ error => 0, message => "ok" ]);
    break;
    
    case "PIPE_SEND_MESSAGE": // отправить сообщение в общий чат
        mysqli_query (  $_db, "INSERT INTO pipes_messages (name, event, message)VALUES('".mysqli_real_escape_string($_db,htmlspecialchars($_GET['channel']))."', '', '".mysqli_real_escape_string($_db,htmlspecialchars($_GET['text']))."' );" );
    break;
    
    case "ADD_USER": // одобавить пользователя в список контактов
        echo json_encode([ error => 0, message => "ok" ]);
    break;
    
    case "GET_USERS_INFO": // получить информацию о пользователях по id
        echo json_encode([ error => 0, message => "ok" ]);
    break;
    
    case "COUNT_NEW_MESSAGES_SUM": // количество непрочитанных сообщений
        echo json_encode([ error => 0, message => "ok" ]);
    break;
    
    case "COUNT_NEW_MESSAGES": // количество непрочитанных сообщений от id
        echo json_encode([ error => 0, message => "ok" ]);
    break;
    
    case "CONVERSATION_LIST": // список диалогов
        if (strlen($_GET['hash']) < 1) {
            echo json_encode([ error => 3, message => "invalid `hash` param" ]);
            break;
        }
        $response = conversationList($_GET['hash']);
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
    break;
    
    case "GET_MESSAGES": // получить сообщения по id
        if (strlen($_GET['hash']) < 1) {
            echo json_encode([ error => 3, message => "invalid `hash` param" ]);
            break;
        }
        if (strlen($_GET['id']) < 1) {
            echo json_encode([ error => 3, message => "invalid `id` param" ]);
            break;
        }
        if (strlen($_GET['fetch']) < 1) {
            echo json_encode([ error => 3, message => "invalid `fetch` param" ]);
            break;
        }
        $response = getMessages($_GET['id'], $_GET['hash'], $_GET['fetch']);
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
    break;

    case "SEND_PRIVATE_MESSAGE": // отправить личное сообщение пользователю
        if (strlen($_GET['id']) < 1) {
            echo json_encode([ error => 1, message => "invalid `id` param" ]);
            break;
        }
        if (strlen($_GET['text']) < 1) {
            echo json_encode([ error => 2, message => "invalid `text` param" ]);
            break;
        }
        if (strlen($_GET['hash']) < 1) {
            echo json_encode([ error => 3, message => "invalid `hash` param" ]);
            break;
        }
        $info_result = mysqli_fetch_assoc(mysqli_query($db, 'SELECT `id`,`avatar`,`first_name`,`last_name` FROM `users` WHERE `hash`="'.$_GET['hash'].'" '));
        if (!$info_result) {
            echo json_encode([ error => 4, message => "Invalid `hash`" ]);
            break;
        }
        $relation_type = 0; //тип связи пользователей: в контактах, избранное, забанен
        $relations_result = mysqli_query($db, "SELECT id FROM `users_relations` where (user_id = ".$info_result['id']." and to_user_id = ".$_GET['id'].") limit 1 ");
        if(!mysqli_num_rows($relations_result) && $_GET['id'] != 0) {
            $find_result = mysqli_fetch_assoc(mysqli_query($db, "SELECT `avatar`,`first_name`,`last_name` FROM `users` where (id = ".$_GET['id'].")  limit 1 "));
            $title = $find_result['first_name']." ".$find_result['last_name'];
            if ($title) {
                mysqli_query($db,"INSERT INTO `users_relations` (`user_id`, `to_user_id`, `type`, `title`, `image`) VALUES ('".$info_result['id']."', '".$_GET['id']."', '0', '".$title."', '".$find_result['avatar']."'),  ('".$_GET['id']."', '".$info_result['id']."', '0', '".$title."', '".$find_result['avatar']."');");
            } else {
                echo json_encode([ error => 4, message => "Invalid `user`" ]);
                break;
            }
        }
        $messageId = floor(microtime(true)*1000);
        $date = strtotime("now");
        $from_id = $info_result['id'];
        $response = [
            id=>$messageId,
            date=>$date,
            from_id=>$from_id,
            to_id=>$_GET['id'],
            avatar=>$info_result['avatar'],
            first_name=>$info_result['first_name'],
            last_name=>$info_result['last_name'],
            message=>[
                text=>$_GET['text'],
                forward=>$_GET['forward'],
                attach=>$_GET['attach'],
                read_state=>0,
            ],
        ];
        $response = json_encode($response, JSON_UNESCAPED_UNICODE);
        $userAgent = "";
        if(isset($_SERVER['HTTP_USER_AGENT'])) { $userAgent = mysqli_real_escape_string($db, $_SERVER['HTTP_USER_AGENT']); }
        $addMessage = mysqli_query($db, "INSERT INTO `messages` (`id`, `from_user_id`, `to_user_id`, `time`, `read_time`, `message`, `userAgent`) VALUES ($messageId, '".$from_id."', '".$_GET['id']."', '$date', '0', '$response', '$userAgent');");
        mysqli_query (  $_db, "INSERT INTO users_messages (id, event, message)VALUES (".$_GET['id'].", 'private_user_message', '$response');" );
        echo json_encode([ error => 0, message => "ok", id => $messageId, date => $date, to_id => $_GET['id'] ]);
    break;

    default:
    echo json_encode([ error => 403, message => "Access denied" ]);
}