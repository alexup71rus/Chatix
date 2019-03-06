<?
function makeRandomString($max=20) {
    $i = 0; //Reset the counter.
    $possible_keys = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $keys_length = strlen($possible_keys);
    $str = ""; //Let's declare the string, to add later.
    while($i<$max) {
        $rand = mt_rand(1,$keys_length-1);
        $str.= $possible_keys[$rand];
        $i++;
    }
    return $str;
}

function formatstr($str) { global $db;
    $str = trim($str);
    $str = stripslashes($str);
    $str = htmlspecialchars($str);
    $str = mysqli_real_escape_string($db, $str);
    return $str;
}