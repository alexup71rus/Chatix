<?
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Credentials: true");
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token , Authorization');

require_once './functions.helpers.php';
require_once './bd.php';
require_once './api.bd.php';

$_db = mysqli_connect("app.comet-server.ru", "2450", "zYhjBtKeTXOlCItOsioRTLeLUXaFPPwj90WZIh5TFiJbGUsgJPJoddmnp2fBZNnz", "CometQL_v1");

$_POST = json_decode(file_get_contents('php://input'), true);

$_POST['request'] = formatstr($_POST['request']);
$_POST['response'] = formatstr($_POST['response']);
$_POST['id'] = formatstr($_POST['id']);
$_POST['first_name'] = formatstr($_POST['first_name']);
$_POST['mail'] = formatstr($_POST['mail']);
$_POST['login'] = formatstr($_POST['login']);
$_POST['pass'] = formatstr($_POST['pass']);
$_POST['hash'] = formatstr($_POST['hash']);
// $_POST['text'] = formatstr($_POST['text']);
$_POST['attach'] = formatstr($_POST['attach']);
$_POST['forward'] = formatstr($_POST['forward']);
$_POST['date'] = formatstr($_POST['date']);
$_POST['settings'] = formatstr($_POST['settings']);
$_POST['fetch'] = formatstr($_POST['fetch']);
$_POST['fetch_end'] = formatstr($_POST['fetch_end']);
$_POST['data'] = formatstr($_POST['data']);

switch ($_POST['request']) {
    case "AUTH": // АВТОРИЗАЦИЯ
        if (strlen($_POST['login']) < 1) {
            echo json_encode([ error => 1, message => "invalid `login` param" ]);
            break;
        }
        if (strlen($_POST['pass']) < 4) {
            echo json_encode([ error => 2, message => "invalid `pass` param" ]);
            break;
        }
        $response = auth($_POST['login'], $_POST['pass']);
        if ($response['error'] > 0) {
            echo json_encode($response);
        } else {
            mysqli_query (  $_db, "INSERT INTO users_auth (id, hash )VALUES (".$response['data']['id'].", '".$response['data']['hash']."');" );
            echo json_encode([ error => 0, message => [
                hash => $response['data']['hash'],
                data => $response['data']
            ] ]);
        }
    break;

    case "REGISTER": // РЕГИСТРАЦИЯ
        if (strlen($_POST['login']) < 1) {
            echo json_encode([ error => 1, message => "invalid `login` param" ]);
            break;
        }
        if (strlen($_POST['pass']) < 4) {
            echo json_encode([ error => 2, message => "invalid `pass` param" ]);
            break;
        }
        if (strlen($_POST['mail']) < 1) {
            echo json_encode([ error => 3, message => "invalid `mail` param" ]);
            break;
        }
        if (strlen($_POST['first_name']) < 1) {
            echo json_encode([ error => 4, message => "invalid `first_name` param" ]);
            break;
        }
        $hash = makeRandomString(32);
        $response = register($_POST['first_name'], $_POST['mail'], $_POST['login'], $_POST['pass'], $hash);
        if ($response['error'] > 0) {
            echo json_encode($response);
        } else {
            mysqli_query (  $_db, "INSERT INTO users_auth (id, hash )VALUES (".$response['message'].", '$hash');" );
            echo json_encode([ error => 0, message => [
                id => $response['message'],
                hash => $hash
            ] ]);
        }
    break;

    case "FORGOTTEN": // ВОССТАНОВЛЕНИЕ АККАУНТА
        echo json_encode([ error => 0, message => "ok" ]);
    break;
    
    case "CREATE_PIPE": // создать общий чат
        echo json_encode([ error => 0, message => "ok" ]);
    break;
    
    case "PIPE_SEND_MESSAGE": // отправить сообщение в общий чат
        mysqli_query (  $_db, "INSERT INTO pipes_messages (name, event, message)VALUES('".mysqli_real_escape_string($_db,htmlspecialchars($_POST['channel']))."', '', '".mysqli_real_escape_string($_db,htmlspecialchars($_POST['text']))."' );" );
    break;
    
    case "ADD_USER": // дообавить пользователя в список контактов
        echo json_encode([ error => 0, message => "ok" ]);
    break;
    
    case "CHECK_ONLINE_STATUS":  // получить время последнего захода на сайт всех пользователей
        if (strlen($_POST['data']) < 1) {
            echo json_encode([ error => 4, message => "invalid `data` param" ]);
            break;
        }
        $response = checkOnlineStatus($_db, $_POST['data']);
        echo json_encode($response);
    break;

    case "CHECK_ONLINE_STATUS_ID":  // получить время последнего захода на сайт конкретного пользователя
        if (strlen($_POST['id']) < 1) {
            echo json_encode([ error => 4, message => "invalid `id` param" ]);
            break;
        }
        $response = checkOnlineStatusId($_db, $_POST['id']);
        echo json_encode($response);
    break;

    case "GET_USERS_INFO": // получить информацию о пользователях по id
        if (strlen($_POST['id']) < 1) {
            echo json_encode([ error => 4, message => "invalid `id` param" ]);
            break;
        }
        $response = getUserInfo($_db, $_POST['id']);
        echo json_encode($response);
    break;
    
    case "COUNT_NEW_MESSAGES_SUM": // количество непрочитанных сообщений
        echo json_encode([ error => 0, message => "ok" ]);
    break;
    
    case "COUNT_NEW_MESSAGES": // количество непрочитанных сообщений от id
        echo json_encode([ error => 0, message => "ok" ]);
    break;
    
    case "CONVERSATION_LIST": // список диалогов
        if (strlen($_POST['hash']) < 1) {
            echo json_encode([ error => 3, message => "invalid `hash` param" ]);
            break;
        }
        $response = conversationList($_POST['hash']);
        echo json_encode($response);
    break;
    
    case "GET_MESSAGES": // получить сообщения по id
        if (strlen($_POST['hash']) < 1) {
            echo json_encode([ error => 3, message => "invalid `hash` param" ]);
            break;
        }
        if (strlen($_POST['id']) < 1) {
            echo json_encode([ error => 3, message => "invalid `id` param" ]);
            break;
        }
        if (strlen($_POST['fetch']) < 1) {
            echo json_encode([ error => 3, message => "invalid `fetch` param" ]);
            break;
        }
        $response = getMessages($_POST['id'], $_POST['hash'], $_POST['fetch'], $_POST['fetch_end']);
        echo json_encode($response);
    break;

    case "SEND_PRIVATE_MESSAGE": // отправить личное сообщение пользователю
        if (strlen($_POST['id']) < 1) {
            echo json_encode([ error => 1, message => "invalid `id` param" ]);
            break;
        }
        if (strlen($_POST['text']) < 1) {
            echo json_encode([ error => 2, message => "invalid `text` param" ]);
            break;
        }
        if (strlen($_POST['text']) > 500) {
            echo json_encode([ error => 3, message => "you have reached the limit of characters in the text" ]);
            break;
        }
        if (strlen($_POST['hash']) < 1) {
            echo json_encode([ error => 4, message => "invalid `hash` param" ]);
            break;
        }
        $info_result = mysqli_fetch_assoc(mysqli_query($db, 'SELECT `id`,`avatar`,`first_name`,`last_name` FROM `users` WHERE `hash`="'.$_POST['hash'].'" '));
        if (!$info_result) {
            echo json_encode([ error => 5, message => "Invalid `hash`" ]);
            break;
        }
        $isFound = true; // если пользователя нет в контактах, то добавляю его и отправляю его данные отправителю
        $isMe = $_POST['id'] == $info_result['id'] ? true : false; // если пользователя нет в контактах, то добавляю его и отправляю его данные отправителю
        $myTitle = "";
        $relation_type = 0; //тип связи пользователей: в контактах, избранное, забанен
        $relations_result = mysqli_query($db, "SELECT `id` FROM `users_relations` where (user_id = ".$info_result['id']." and to_user_id = ".$_POST['id'].") limit 1 ");
        if(!mysqli_num_rows($relations_result) && $_POST['id'] != 0) {
            $find_result = mysqli_fetch_assoc(mysqli_query($db, "SELECT `avatar`,`first_name`,`last_name` FROM `users` where (id = ".$_POST['id'].")  limit 1 "));
            $myTitle = $isMe ? "Избранное" : $find_result['first_name']." ".$find_result['last_name'];
            $anyTitle = $isMe ? "Избранное" : $info_result['first_name']." ".$info_result['last_name'];
            $isFound = false;
            if ($myTitle) {
                mysqli_query($db,"INSERT INTO `users_relations` (`user_id`, `to_user_id`, `type`, `title`, `image`) VALUES ('".$info_result['id']."', '".$_POST['id']."', '0', '".$myTitle."', '".$find_result['avatar']."'),  ('".$_POST['id']."', '".$info_result['id']."', '0', '".$anyTitle."', '".$find_result['avatar']."');");
            } else {
                echo json_encode([ error => 6, message => "Invalid `user`" ]);
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
            to_id=>$_POST['id'],
            avatar=>$info_result['avatar'],
            first_name=>$info_result['first_name'],
            last_name=>$info_result['last_name'],
            message=>[
                text=>$_POST['text'],
                forward=>$_POST['forward'],
                attach=>$_POST['attach'],
                read_state=>0,
            ],
        ];
        $response = addslashes(json_encode($response));
        if (!$isMe) {
            mysqli_query (  $_db, "INSERT INTO users_messages (id, event, message) VALUES (".$_POST['id'].", 'private_user_message', '$response');" );
        }
        $userAgent = "";
        if(isset($_SERVER['HTTP_USER_AGENT'])) { $userAgent = mysqli_real_escape_string($db, $_SERVER['HTTP_USER_AGENT']); }
        $addMessage = mysqli_query($db, "INSERT INTO `messages` (`id`, `from_user_id`, `to_user_id`, `time`, `message`, `userAgent`) VALUES ($messageId, '".$from_id."', '".$_POST['id']."', '$date', '$response', '$userAgent');");
        $relations_result = mysqli_fetch_assoc(mysqli_query($db, "SELECT * FROM `users_relations` where (user_id = ".$_POST['id']." and to_user_id = ".$info_result['id'].") limit 1 "));
        if($relations_result && !$isMe) {
            $unread_count = $relations_result['unread_count'] < 100 ? $relations_result['unread_count']+=1 : 100;
            mysqli_query($db, "UPDATE `users_relations` SET `unread_count` = '$unread_count' WHERE `users_relations`.`id` = ".$relations_result['id'].";"); // пометить как непрочитанное
        }
        if ($isFound) {
            echo json_encode([ error => 0, message => "ok", id => $messageId, date => $date, to_id => $_POST['id'] ]);
        } else if ($_POST['id'] == $info_result['id']) {
            echo json_encode([ error => 0, info => 1, message => "Новый пользователь добавлен в контакты", id => $_POST['id'], title => "Избранное", mes => [
                id => $messageId, date => $date, to_id => $_POST['id']
            ] ]);
        } else {
            echo json_encode([ error => 0, info => 1, message => "Новый пользователь добавлен в контакты", id => $_POST['id'], title => $myTitle, mes => [
                id => $messageId, date => $date, to_id => $_POST['id']
            ] ]);
        }
    break;

    case "MARK_AS_READ": // пометить как прочитанные
        if (strlen($_POST['hash']) < 1) {
            echo json_encode([ error => 3, message => "invalid `hash` param" ]);
            break;
        }
        if (strlen($_POST['id']) < 1) {
            echo json_encode([ error => 3, message => "invalid `id` param" ]);
            break;
        }
        $response = markAsRead($_POST['id'], $_POST['hash']);
        echo json_encode($response);
    break;

    case "FIND_MESSAGES": // найти сообщения к диалоге
        if (strlen($_POST['hash']) < 1) {
            echo json_encode([ error => 3, message => "invalid `hash` param" ]);
            break;
        }
        if (strlen($_POST['id']) < 1) {
            echo json_encode([ error => 3, message => "invalid `id` param" ]);
            break;
        }
        if (strlen($_POST['text']) < 1) {
            echo json_encode([ error => 3, message => "invalid `id` param" ]);
            break;
        }
        $response = findMessages($_POST['id'], $_POST['text'], $_POST['hash']);
        echo json_encode($response);
    break;

    default:
    echo json_encode([ error => 403, message => "Access denied!" ]);
}