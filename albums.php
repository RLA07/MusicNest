<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Head section start -->
    <?php include('head.php'); ?>
    <!-- Head section end -->
    <title>MusicNest. - Select Album & Music</title></head>
<body>
    <!-- Nav section start -->
    <?php include('navbar.php'); ?>
    <!-- Nav section end -->

    <div class="container pt-5">
        <h1 class="text-center pb-4">Pilih Album</h1>
        <div class="row d-flex justify-content-center align-items-center mb-5">
            <?php
            require_once('getid3/getid3.php'); // Library getID3 untuk membaca metadata file musik

            $artist = $_GET['artist']; // Mendapatkan nama artis dari parameter URL
            $rootDir = 'Music';  // Ganti dengan path ke folder "Music" Anda
            $artistDir = $rootDir . '/' . $artist; // Path lengkap ke folder artis
            $albums = array_filter(glob($artistDir . '/*'), 'is_dir'); // Mendapatkan semua folder album di dalam folder artis

            foreach ($albums as $album) {
                $albumName = basename($album); // Nama album
                $albumCover = 'https://placehold.jp/300x300.png'; // Placeholder jika tidak ada cover art

                // Mencari file m4a di dalam folder album
                $m4aFiles = glob($album . '/*.m4a');
                if (count($m4aFiles) > 0) {
                    // Mengambil metadata dari file m4a pertama di dalam album
                    $getID3 = new getID3;
                    $file = $getID3->analyze($m4aFiles[0]);
                    if (!empty($file['comments']['picture'])) {
                        $imageData = $file['comments']['picture'][0]['data'];
                        $mimeType = $file['comments']['picture'][0]['image_mime'];
                        $base64 = base64_encode($imageData);
                        $albumCover = 'data:' . $mimeType . ';base64,' . $base64; // Mengubah gambar menjadi base64 untuk ditampilkan
                    }
                }

                // Menampilkan card album
                echo '<div class="col-6 col-md-3 d-flex justify-content-center col-custom">';
                echo '<div class="card artist-card">';
                echo '<a href="#" onclick="showMusicList(\'' . $albumName . '\')">'; // Onclick untuk menampilkan daftar musik
                echo '<img src="' . $albumCover . '" class="card-img artist-img" alt="' . $albumName . '">';
                echo '<div class="card-img-overlay d-flex align-items-center justify-content-center">';
                echo '<h4 class="artist-title">' . $albumName . '</h4>';
                echo '</div>';
                echo '</a>';
                echo '</div>';
                echo '</div>';
            }
            ?>
        </div>

        <!-- Daftar Musik -->
        <div id="musicList" class="music-list mt-5 mb-5 pt-5 pb-4">
            <h2 class="text-center">Pilih Musik</h2>
            <div class="list-group list-group-flush" id="musicListContainer">
                <!-- Daftar musik akan diisi melalui JavaScript -->
            </div>
            <a href="index.php" class="btn btn-secondary mt-5 mb-6">Kembali</a>
        </div>
    </div>

    <!-- Footer start -->
    <footer class="a bg-body-secondary">
      <p class="mb-0 mt-0 text-dark">
        Create by Rangga Ayi Pratama | &copy 2024
      </p>
    </footer>
    <!-- Footer end -->

    <!-- Js inline start -->
    <script>
      const artist = "<?php echo $artist; ?>"; // Menginisialisasi variable artist // Tidak bisa diletakkan didalam js/scripts.js
    </script>
    <!-- Js inline end -->

    <!-- Js External start -->
    <script src="js/scripts.js"></script>
    <!-- Js External end -->

    <!-- Js bootstrap start -->
    <script
    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
    crossorigin="anonymous"
    ></script>
    <!-- Js bootstrap end -->
</body>
</html>
