<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Head section start -->
    <?php include('head.php'); ?>
    <!-- Head section end -->
    <title>MusicNest.</title>
</head>
<body>
    <!-- Nav section start -->
    <?php include('navbar.php'); ?>
    <!-- Nav section end -->

    <!-- Main layout start -->
    <div class="container pt-5 mb-4">
        <h1 class="text-center pb-4">Pilih Artis</h1>
        <div class="row d-flex justify-content-center align-items-center">
            <?php
                $rootDir = 'Music';
                $artists = array_filter(glob($rootDir . '/*'), 'is_dir');
                foreach ($artists as $artist) {
                    $artistName = basename($artist);
                    $imagePaths = glob($artist . '/*.avif'); // Cari semua gambar dengan ekstensi .avif
                    $imagePath = !empty($imagePaths) ? $imagePaths[0] : 'https://placehold.jp/300x300.png'; // Placeholder jika tidak ada gambar
                    echo '
                    <div class="col-6 col-md-3 d-flex justify-content-center col-custom">
                        <div class="card artist-card">
                            <a href="albums.php?artist=' . $artistName . '">
                                <img src="' . $imagePath . '" class="card-img artist-img" alt="' . $artistName . '">
                                <div class="card-img-overlay d-flex align-items-center justify-content-center">
                                    <h4 class="artist-title">' . $artistName . '</h4>
                                </div>
                            </a>
                        </div>
                    </div>';
                }
            ?>
        </div>
    </div>
    <!-- Main layout end -->

    <!-- Footer start -->
    <footer class="a bg-body-secondary">
        <p class="mb-0 mt-0 text-dark">Create by Rangga Ayi Pratama | &copy; 2024</p>
    </footer>
    <!-- Footer end -->

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>
</html>
