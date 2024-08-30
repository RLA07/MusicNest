<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Head section start -->
    <?php include('head.php'); ?>
    <!-- Head section end -->
    <title>MusicNest - All Album</title>
    </head>
<body>
    <!-- Nav section start -->
    <?php include('navbar.php'); ?>
    <!-- Nav section end -->

    <div class="container pt-5">
        <h1 class="text-center pb-4">All Albums</h1>
        <div class="row d-flex justify-content-center align-items-center mb-5">
            <?php
            require_once('getid3/getid3.php');
            $rootDir = 'Music'; // Ganti dengan path ke folder "Music" Anda
            $getID3 = new getID3;

            $artists = glob($rootDir . '/*', GLOB_ONLYDIR);
            foreach ($artists as $artistDir) {
                $albums = array_filter(glob($artistDir . '/*'), 'is_dir');
                foreach ($albums as $album) {
                    $albumName = basename($album);
                    $albumCover = 'https://placehold.jp/300x300.png'; // Placeholder jika tidak ada cover art

                    $m4aFiles = glob($album . '/*.m4a');
                    if (count($m4aFiles) > 0) {
                        $metadata = $getID3->analyze($m4aFiles[0]);
                        if (!empty($metadata['comments']['picture'])) {
                            $imageData = $metadata['comments']['picture'][0]['data'];
                            $mimeType = $metadata['comments']['picture'][0]['image_mime'];
                            $base64 = base64_encode($imageData);
                            $albumCover = 'data:' . $mimeType . ';base64,' . $base64;
                        }
                    }

                    echo '<div class="col-6 col-md-3 d-flex justify-content-center col-custom">';
                    echo '<div class="card artist-card">';
                    echo '<a href="albums.php?artist=' . urlencode(basename($artistDir)) . '">';
                    echo '<img src="' . $albumCover . '" class="card-img artist-img" alt="' . $albumName . '">';
                    echo '<div class="card-img-overlay d-flex align-items-center justify-content-center">';
                    echo '<h4 class="artist-title">' . $albumName . '</h4>';
                    echo '</div>';
                    echo '</a>';
                    echo '</div>';
                    echo '</div>';
                }
            }
            ?>
        </div>
    </div>

    <!-- Footer start -->
    <footer class="a bg-body-secondary">
        <p class="mb-0 mt-0 text-dark">Create by Rangga Ayi Pratama | &copy; 2024</p>
    </footer>
    <!-- Footer end -->

    <script src="js/script.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
