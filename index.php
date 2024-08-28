<!-- index.php -->
<!DOCTYPE html>
<html lang="en">
<!-- Head start -->
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Streaming Web - Select Artist</title>
    <!-- bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- My style -->
    <link rel="stylesheet" href="style/style.css">
    <!-- Font start-->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Pacifico&family=Qwitcher+Grypen:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <!-- Font end-->
</head>
<!-- head end -->
<body>
    <!-- Nav section start -->
    <nav
      class="navbar sticky-top navbar-expand-lg navbar-light bg-light text-dark p-1 shadow-sm"
    >
      <div class="container-fluid">
        <a class="navbar-brand fs-4" href="./"> MusicNest.</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-4 mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link about" href="#">Home</a>
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle other"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Other
              </a>
              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item contact" href="./contact/">Album</a>
                </li>
                <li>
                  <a class="dropdown-item gallery" href="./gallery/">Music</a>
                </li>
              </ul>
            </li>
          </ul>
          <form class="d-flex" action="search.php" method="GET">
            <input
              class="form-control me-2"
              type="search"
              name="query"
              placeholder="Search"
              aria-label="Search"
            />
            <button class="btn btn-primary" type="submit">Search</button>
          </form>
        </div>
      </div>
    </nav>
    <!-- Nav sectio end -->
     <!-- Layout utama start -->
     <div class="container pt-5">
       <h1 class="text-center pb-4">Pilih Artis</h1>
       <!-- Card artist start -->
       <div class="row d-flex justify-content-center align-items-center">
         <?php
            $rootDir = 'Music';  // Path ke folder "Music"
            $artists = array_filter(glob($rootDir . '/*'), 'is_dir');
            foreach ($artists as $artist) {
                $artistName = basename($artist);
                $imagePaths = glob($artist . '/*.avif'); // Cari semua gambar dengan ekstensi .avif
                
                // Jika ada gambar yang cocok, gunakan yang pertama
                if (!empty($imagePaths)) {
                    $imagePath = $imagePaths[0];
                } else {
                    $imagePath = 'https://placehold.jp/300x300.png'; // Placeholder jika tidak ada gambar yang ditemukan
                }

                echo '<div class="col-6 col-md-3 d-flex justify-content-center col-custom">';
                echo '<div class="card artist-card">';
                echo '<a href="albums.php?artist=' . $artistName . '">';
                echo '<img src="' . $imagePath . '" class="card-img artist-img" alt="' . $artistName . '">';
                echo '<div class="card-img-overlay d-flex align-items-center justify-content-center">';
                echo '<h4 class="artist-title">' . $artistName . '</h4>';
                echo '</div>';
                echo '</a>';
                echo '</div>';
                echo '</div>';
            }
            ?>
        </div>
       <!-- Card artist end -->
    </div>
    <!-- Layout utama end -->

    <!-- Footer start -->
    <footer class="a bg-body-secondary">
      <p class="mb-0 mt-0 text-dark">
        Create by Rangga Ayi Pratama | &copy 2024
      </p>
    </footer>
    <!-- Footer end -->

    <!-- Js bootstrap start -->
    <script
    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
    crossorigin="anonymous"
    ></script>
    <!-- Js bootstrap end -->
</body>

</html>
