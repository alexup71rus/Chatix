<?
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Credentials: true");
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token , Authorization');

if (!$_GET['url']) {
  return json_encode([
    error=>1,
    message=>"invalid request"
  ]);
}
require_once './phpQuery-onefile.php';
$typeContent = null; // image-false/html-true
$ch = curl_init();  
curl_setopt($ch, CURLOPT_URL, $_GET['url']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1667.0 Safari/537.36');
curl_setopt($ch, CURLOPT_HEADERFUNCTION,
  function($curl, $header) use (&$headers)
  {
    $len = strlen($header);
    $header = explode(':', $header, 2);
    if (count($header) < 2) // ignore invalid headers
      return $len;

    $name = strtolower(trim($header[0]));
    if (!array_key_exists($name, $headers))
      $headers[$name] = [trim($header[1])];
    else
      $headers[$name][] = trim($header[1]);

    return $len;
  }
);
$result = curl_exec($ch); 
curl_close($ch); 

if ($result) {
  if($headers) {
    if ($headers['content-type'][0] === "image/jpeg") {
      $typeContent = false;
    } else if($headers['content-type'][0] === "image/png") {
      $typeContent = false;
    } else if(substr($headers['content-type'][0], 0, 9) === "text/html") {
      $typeContent = true;
    }
  }
}

if ($typeContent !== null) {
  if ($typeContent === false) {
    $PPImage;
    $hash = str_replace("/", "", substr(base64_encode($_GET['url']), 0, -2));
    $path = pathinfo($_SERVER['SCRIPT_URI'])['dirname']."/pp/".$hash.".jpg";
    if ( file_exists(realpath("./pp/".$hash.".jpg")) ) {
      $PPImage = $path;
    } else {
      $PPImage = savePP($_GET['url'], $hash, 400, 300);
    }
    echo json_encode([
      url=>$_GET['url'],
      type=>"image",
      url_pp=>$PPImage,
    ]);
  } else if ($typeContent === true) {
    $doc = phpQuery::newDocument($result);
    $title = $doc->find("title");
    $metaItems = array();
    foreach(pq('meta') as $meta) {
      $key = pq($meta)->attr('name');
      $key_ = pq($meta)->attr('property');
      $value = pq($meta)->attr('content');
      if ($key) {
        $metaItems[$key] = $value;
      } else if ($key_) {
        $metaItems[$key_] = $value;
      }
    }
    $linkItems = array();
    $icons = array();
    foreach(pq('link') as $link) {
      $res = pq($link)->attr('rel');
      if ($res == "image_src") {
        $res = pq($link)->attr('href');
        $linkItems[] = $res;
      }
    }
    
    $PPImage;
    if ($metaItems['twitter:image']) {
      $hash = str_replace("/", "", substr(base64_encode($metaItems['twitter:image']), 0, -2));
      $path = pathinfo($_SERVER['SCRIPT_URI'])['dirname']."/pp/".$hash.".jpg";
      if ( file_exists(realpath("./pp/".$hash.".jpg")) ) {
        $PPImage = $path;
      } else {
        $PPImage = savePP($metaItems['twitter:image'], $hash, null, null);
      }
    } else if ($metaItems['og:image']) {
      $hash = str_replace("/", "", substr(base64_encode($metaItems['og:image']), 0, -2));
      $path = pathinfo($_SERVER['SCRIPT_URI'])['dirname']."/pp/".$hash.".jpg";
      if ( file_exists(realpath("./pp/".$hash.".jpg")) ) {
        $PPImage = $path;
      } else {
        $PPImage = savePP($metaItems['og:image'], $hash, null, null);
      }
    } else if ($linkItems[0]) {
      $hash = str_replace("/", "", substr(base64_encode($linkItems[0]), 0, -2));
      $path = pathinfo($_SERVER['SCRIPT_URI'])['dirname']."/pp/".$hash.".jpg";
      if ( file_exists(realpath("./pp/".$hash.".jpg")) ) {
        $PPImage = $path;
      } else {
        $PPImage = savePP($linkItems[0], $hash, null, null);
      }
    }
    
    echo json_encode([
      url=>$_GET['url'],
      type=>"site",
      page_title=>$title->getString()[0],
      site_name=>$metaItems['og:site_name'],
      app_title=>$metaItems['application-name'],
      site_title=>$metaItems['og:title'],
      site_description=>$metaItems['description'],
      description=>$metaItems['og:description'],
      image=>[
        url=>$metaItems['og:image'],
        twitter_url=>$metaItems['twitter:image'],
        url_pp=>$PPImage,
      ],
      icon=>$linkItems,
      locale=>$metaItems['og:locale']
    ]); 
  } 
}

function savePP($url, $hash, $W, $H) {
  if ($image = @imagecreatefromjpeg($url));
  else if ($image = @imagecreatefrompng($url));
  else {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_BINARYTRANSFER, 1);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1667.0 Safari/537.36');
    $img = curl_exec($ch);
    curl_close($ch);
    if ($image = @imagecreatefromstring($img));
    else return;
  }
  $filename = './pp/'.$hash.'.jpg';
  $thumb_width = $W ? $W : 200;
  $thumb_height = $H ? $H : 200;
  $width = imagesx($image);
  $height = imagesy($image);
  $original_aspect = $width / $height;
  $thumb_aspect = $thumb_width / $thumb_height;
  if ( $original_aspect >= $thumb_aspect ) {
    $new_height = $thumb_height;
    $new_width = $width / ($height / $thumb_height);
  }
  else {
    $new_width = $thumb_width;
    $new_height = $height / ($width / $thumb_width);
  }
  $thumb = imagecreatetruecolor( $thumb_width, $thumb_height );
  imagecopyresampled($thumb,
                    $image,
                    0 - ($new_width - $thumb_width) / 2, // Center the image horizontally
                    0 - ($new_height - $thumb_height) / 2, // Center the image vertically
                    0, 0,
                    $new_width, $new_height,
                    $width, $height);
  imagejpeg($thumb, $filename, 80);
  return pathinfo($_SERVER['SCRIPT_URI'])['dirname'].'/pp/'.$hash.'.jpg';
}