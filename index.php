<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Head start -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Streaming Web - Select Artist</title>
    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- My style -->
    <link rel="stylesheet" href="style/style.css">
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Qwitcher+Grypen:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Nav section start -->
    <nav class="navbar sticky-top navbar-expand-lg navbar-light bg-light text-dark p-1 shadow-sm">
        <div class="container-fluid">
            <a class="navbar-brand fs-4" href="./">MusicNest.</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-4 mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link about" href="#">Home</a></li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle other" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Other</a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item contact" href="#">Album</a></li>
                            <li><a class="dropdown-item gallery" href="#">Music</a></li>
                        </ul>
                    </li>
                </ul>
                <form class="d-flex" action="search.php" method="GET">
                    <input class="form-control me-2" type="search" name="query" placeholder="Search" aria-label="Search">
                    <button class="btn btn-primary" type="submit">Search</button>
                </form>
            </div>
        </div>
    </nav>
    <!-- Nav section end -->

    <!-- Main layout start -->
    <div class="container pt-5">
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
