<!-- Nav section start -->
<nav class="navbar sticky-top navbar-expand-lg navbar-light bg-light text-dark p-1 shadow-sm">
        <div class="container-fluid">
            <a class="navbar-brand fs-4" href="./">MusicNest.</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-4 mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link nav-hover" href="index.php">Home</a></li>
                    <li class="nav-item"><a class="nav-link nav-hover" href="about.php">About</a></li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle nav-hover" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">List</a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item nav-hover" href="all_albums.php">Album</a></li>
                            <li><a class="dropdown-item nav-hover" href="musics.php">Music</a></li>
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