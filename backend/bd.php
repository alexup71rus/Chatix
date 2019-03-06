<?php

$db = mysqli_connect("localhost", "gochsale_admintaudio", "9997813689DANTe", "gochsale_chatix");

if (!$db) {echo "Ошибка: Невозможно установить соединение с MySQL." . PHP_EOL;echo "Код ошибки errno: " . mysqli_connect_errno() . PHP_EOL;echo "Текст ошибки error: " . mysqli_connect_error() . PHP_EOL;exit;}

?>