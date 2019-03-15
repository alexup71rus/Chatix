<?
require_once './phpQuery-onefile.php';

$ch = curl_init();  
curl_setopt($ch, CURLOPT_URL, 'https://radio.yandex.ru/mood/spring'); 
// curl_setopt($ch, CURLOPT_URL, 'http://forum.antichat.ru/'); 
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
$result = curl_exec($ch); 
curl_close($ch); 

$doc = phpQuery::newDocument($result);
$title = $doc->find("title");
$metaItems = array();
foreach(pq('meta') as $meta) {
  $key = pq($meta)->attr('name');
  $value = pq($meta)->attr('content');
  $metaItems[$key] = $value;
}
$linkItems = array();
foreach(pq('link') as $link) {
  $res = pq($link)->attr('rel');
  $linkItems[] = $res;
}
echo json_encode([
    title=>$title->getString()[0],
    description=>$metaItems['description'],
    icon=>$linkItems
]);