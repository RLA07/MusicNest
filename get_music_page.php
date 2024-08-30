<?php
require_once('getid3/getid3.php');

$rootDirectory = 'Music';  // Your root directory
$musicsPerPage = 20;  // Number of music files per page

// Get the page number from the GET parameter
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$offset = ($page - 1) * $musicsPerPage;

function getMusicMetadata($filePath) {
    $getID3 = new getID3;
    $fileInfo = $getID3->analyze($filePath);
    $title = $fileInfo['tags']['quicktime']['title'][0] ?? basename($filePath, ".m4a");
    $artist = $fileInfo['tags']['quicktime']['artist'][0] ?? 'Unknown Artist';
    $duration = $fileInfo['playtime_string'] ?? 'Unknown';

    // Default cover image in case there is no album art
    $albumCover = 'path/to/default/cover/image.jpg'; // Change this to the path of your default image
    if (isset($fileInfo['comments']['picture'][0]['data'])) {
        $imageData = $fileInfo['comments']['picture'][0]['data'];
        $mimeType = $fileInfo['comments']['picture'][0]['image_mime'];
        $base64 = base64_encode($imageData);
        $albumCover = 'data:' . $mimeType . ';base64,' . $base64;
    }

    return [
        'title' => $title,
        'artist' => $artist,
        'duration' => $duration,
        'cover' => $albumCover,
        'path' => $filePath
    ];
}

function getAllMusicFiles($directory) {
    $allMusicFiles = [];
    $directoryIterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory));

    foreach ($directoryIterator as $file) {
        if ($file->isFile() && pathinfo($file, PATHINFO_EXTENSION) === 'm4a') {
            $allMusicFiles[] = getMusicMetadata($file->getPathname());
        }
    }

    return $allMusicFiles;
}

$allMusics = getAllMusicFiles($rootDirectory);
$totalMusics = count($allMusics);
$paginatedMusics = array_slice($allMusics, $offset, $musicsPerPage);

header('Content-Type: application/json');
echo json_encode([
    'totalPages' => ceil($totalMusics / $musicsPerPage),
    'currentPage' => $page,
    'musics' => $paginatedMusics
]);
?>
