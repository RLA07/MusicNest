<?php
require_once('getid3/getid3.php'); // Mengimpor library getID3 untuk membaca metadata file musik

$artist = $_GET['artist']; // Mendapatkan nama artis dari parameter URL
$albums = $_GET['album']; // Mendapatkan nama album dari parameter URL
$rootDir = 'Music'; // Path root ke folder musik
$albumDir = $rootDir . '/' . $artist . '/' . $albums; // Path lengkap ke folder album
$files = glob($albumDir . '/*.m4a'); // Mendapatkan semua file .m4a di dalam folder album

$musicList = []; // Array untuk menyimpan daftar musik

if (!empty($files)) {
    $getID3 = new getID3;
    foreach ($files as $file) {
        $fileData = $getID3->analyze($file); // Menganalisis file musik
        $title = isset($fileData['tags']['quicktime']['title'][0]) ? $fileData['tags']['quicktime']['title'][0] : 'Unknown Title'; // Mendapatkan judul lagu
        $relativePath = str_replace($_SERVER['DOCUMENT_ROOT'], '', $file); // Mendapatkan path relatif file | Create by Rangga Ayi Pratama | &copy 2024
        $duration = gmdate("i:s", $fileData['playtime_seconds']); // Menghitung durasi file

        $cover = 'https://placehold.jp/50x50.png'; // Default cover image
        if (!empty($fileData['comments']['picture'])) {
            $imageData = $fileData['comments']['picture'][0]['data'];
            $mimeType = $fileData['comments']['picture'][0]['image_mime'];
            $cover = 'data:' . $mimeType . ';base64,' . base64_encode($imageData); // Mengubah gambar menjadi base64
        }

        // Metadata file yang diperkecil
        $reducedMetadata = [
            'playtime_seconds' => $fileData['playtime_seconds'] ?? null,
            'bitrate' => $fileData['bitrate'] ?? null,
            'fileformat' => $fileData['fileformat'] ?? null,
        ];

        // Menambahkan informasi musik ke array
        $musicList[] = [
            'name' => $title,
            'artist' => $artist,
            'duration' => $duration,
            'cover' => $cover,
            'metadata' => $reducedMetadata, // Metadata tambahan opsional
            'path' => $relativePath
        ];
    }
}

error_reporting(E_ALL);   // Menampilkan semua error untuk debugging
ini_set('display_errors', 1);

header('Content-Type: application/json'); // Menetapkan header konten sebagai JSON

if (empty($musicList)) {
    echo json_encode([]); // Mengirimkan array kosong jika tidak ada musik
    exit();
}

echo json_encode($musicList); // Mengirimkan daftar musik sebagai JSON
?>
