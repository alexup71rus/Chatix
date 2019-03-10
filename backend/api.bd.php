<?

function findMeForHash ($db, $hash) { // 
    $info_result = mysqli_fetch_assoc(mysqli_query($db, 'SELECT `id`,`avatar`,`first_name`,`last_name` FROM `users` WHERE `hash`="'.$hash.'" '));
    if ($info_result) {
        return $info_result;
    }
}

function auth ($login, $pass) { global $db;
    $queryFind = mysqli_fetch_assoc(mysqli_query($db, 'SELECT `hash`,`id`,`first_name`,`last_name`,`status`,`storage`,`avatar`,`advanced_settings` FROM `users` WHERE `login`="'.$login.'" AND `password`="'.$pass.'" '));
    if ($queryFind) {
        return [error=> 0, data=> $queryFind ];
    } else {
        return [ error => 5, message => "Неверный логин или пароль" ];
    }
}

function register ($name, $mail, $login, $pass, $hash) { global $db;
    $queryFind = mysqli_fetch_assoc(mysqli_query($db, 'SELECT `id` FROM `users` WHERE `login`="'.$login.'" '));
    if ($queryFind['id']) {
        return [ error => 5, message => "Такой пользователь уже зарегистрирован" ];
    }
    $queryAdd = mysqli_query($db, "INSERT INTO `users` (`id`, `mail`, `login`, `password`, `avatar`, `status`, `first_name`, `last_name`, `last_visit`, `conversations`, `storage`, `advanced_settings`, `hash`) VALUES (NULL, '$mail', '$login', '$pass', '', '', '$name', '', '', '', '', '', '$hash');");
    if ($queryAdd) {
        mysqli_query($db,"INSERT INTO `users_relations` (`user_id`, `to_user_id`, `type`) VALUES ('".$queryFind['id']."', '0', '0');");
        return [ error => 0, message => mysqli_insert_id($db) ];
    } else {
        return [ error => 6, message => "Ошибка при добавлении в базу" ];
    }
}

function forgotten ($mail) { global $db;
    
}

function changeProfileInfo () { global $db;
    
}

function checkOnlineStatus ($_db, $data) { // получить время последнего захода на сайт всех пользователей
    $users_result = mysqli_query($_db, "SELECT * FROM users_time WHERE id IN( $data ); ");
    $response = [];
    while( $result = mysqli_fetch_assoc($users_result) ){
        $response[] = $result;
    }
    return $response;
}

function checkOnlineStatusId ($_db, $id) {// получить время последнего захода на сайт конкретного пользователя
    $response = mysqli_fetch_assoc(mysqli_query($_db, "SELECT * FROM users_time WHERE id IN( $id ); "));
    return $response;
}

function pipeSendMessage () { global $db;
    
}

function conversationList ($hash) { global $db;  // получение контактов
    if ($info_result = findMeForHash($db, $hash)) {
        $relations_result = mysqli_query($db, "SELECT * FROM `users_relations` where (user_id = ".$info_result['id'].") limit 20 ");
        $response = [];
        $isMe = false;
        while( $result = mysqli_fetch_assoc($relations_result) ){
            if ($result['to_user_id'] == $info_result['id'] && !$isMe) {
                $isMe = true;
            } else {
                $isMe = false;
            }
            if (!$isMe) { // чтобы 2 раза не парсился чат ссамим собой
                $result['unread_time'] = $result['read_time'];
                $result['last_message'] = mysqli_fetch_assoc(mysqli_query($db, "SELECT `message` FROM messages WHERE (from_user_id = ".$info_result['id']." and to_user_id = ".$result['to_user_id'].") or (to_user_id = ".$info_result['id']." and from_user_id = ".$result['to_user_id'].") order by time desc limit 1 " ))['message'];
                $response[] = $result;
            }
        }
        return $response;
    } else {
        return [ error => 1, message => "Invalid `hash`" ];
    }
}

function getMessages ($id, $hash, $fetch_start, $fetch_end) { global $db;
    if ($info_result = findMeForHash($db, $hash)) {
        $fetch_end = $fetch_end ? $fetch_end : 20;  // выборка
        $messages_result = mysqli_query($db, "SELECT `message` FROM messages WHERE (from_user_id = ".$info_result['id']." and to_user_id = ".$id.") or (to_user_id = ".$info_result['id']." and from_user_id = ".$id.") order by time desc limit $fetch_start, $fetch_end " );
        $response = [];
        while( $result = mysqli_fetch_assoc($messages_result) ){
            $response[] = json_decode($result['message'], TRUE);
        }
        return $response;
    } else {
        return [ error => 1, message => "Invalid `hash`" ];
    }
}

function sendMessage () { global $db;
    
}

function markAsRead ($id, $hash) { global $db;
    if ($info_result = findMeForHash($db, $hash)) {
        $relations_result = mysqli_fetch_assoc(mysqli_query($db, "SELECT `id` FROM `users_relations` where (user_id = ".$info_result['id']." and to_user_id = ".$id.") limit 1 "));
        if($relations_result) {
            mysqli_query($db, "UPDATE `users_relations` SET `unread_count` = '0' WHERE `users_relations`.`id` = ".$relations_result['id'].";"); // пометить как непрочитанное
            return [ error => 0, message => "ok" ];
        }
        return [ error => 2, message => "Cannot mark as read" ];
    } else {
        return [ error => 1, message => "Invalid `hash`" ];
    }
}

function getUserInfo ($_db, $id) { global $db;
    if ($id) {
        $result = mysqli_fetch_assoc(mysqli_query($db, "SELECT `id`,`avatar`,`first_name`,`last_name` FROM `users` where (id = ".$id.") limit 1 "));
        $_result = mysqli_fetch_assoc(mysqli_query($_db, "SELECT * FROM users_time WHERE id IN( $id ); "));
        if($result && $_result) {
            return [
                id=>$result['id'],
                first_name=>$result['first_name'],
                last_name=>$result['last_name'],
                last_visit=>$_result['time'],
            ];
        }
        return [ error => 2, message => "Cannot find user" ];
    } else {
        return [ error => 1, message => "Invalid `id`" ];
    }
}