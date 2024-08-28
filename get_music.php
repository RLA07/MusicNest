<?php
require_once('getid3/getid3.php');

$artist = $_GET['artist'];
$albums = $_GET['album'];
$rootDir = 'Music';
$albumDir = $rootDir . '/' . $artist . '/' . $albums;
$files = glob($albumDir . '/*.m4a');

$musicList = [];

if (!empty($files)) {
    $getID3 = new getID3;
    foreach ($files as $file) {
        $fileData = $getID3->analyze($file);
        $title = isset($fileData['tags']['quicktime']['title'][0]) ? $fileData['tags']['quicktime']['title'][0] : 'Unknown Title';
        $relativePath = str_replace($_SERVER['DOCUMENT_ROOT'], '', $file);
        $duration = gmdate("i:s", $fileData['playtime_seconds']);

        $cover = 'https://placehold.jp/50x50.png'; // Default cover
        if (!empty($fileData['comments']['picture'])) {
            $imageData = $fileData['comments']['picture'][0]['data'];
            $mimeType = $fileData['comments']['picture'][0]['image_mime'];
            $cover = 'data:' . $mimeType . ';base64,' . base64_encode($imageData);
        }

        $reducedMetadata = [
            'playtime_seconds' => $fileData['playtime_seconds'] ?? null,
            'bitrate' => $fileData['bitrate'] ?? null,
            'fileformat' => $fileData['fileformat'] ?? null,
        ];

        $musicList[] = [
            'name' => $title,
            'artist' => $artist,
            'duration' => $duration,
            'cover' => $cover,
            'metadata' => $reducedMetadata, // Optional: reduced version of fileData
            'path' => $relativePath
        ];
    }
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

if (empty($musicList)) {
    echo json_encode([]);
    exit();
}

echo json_encode($musicList);
?>