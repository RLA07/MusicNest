<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Head section start -->
    <?php include('head.php'); ?>
    <!-- Head section end -->
    <title>MusicNest. - Search Results</title></head>
<body>
    <!-- Nav section start -->
    <?php include('navbar.php'); ?>
    <!-- Nav section end -->

    <!-- Main layout start -->
    <div class="container pt-5">
        <h1 class="text-center pb-4">Search Results</h1>

        <?php
        $query = isset($_GET['query']) ? strtolower($_GET['query']) : '';
        $rootDir = 'Music';

        // Function to search files and directories
        function searchFiles($dir, $query) {
            $results = [];
            $directories = glob($dir . '/*', GLOB_ONLYDIR);
            
            foreach ($directories as $directory) {
                if (stripos(basename($directory), $query) !== false) {
                    $results['artists'][] = $directory;
                }

                $subDirs = glob($directory . '/*', GLOB_ONLYDIR);
                foreach ($subDirs as $subDir) {
                    if (stripos(basename($subDir), $query) !== false) {
                        $results['albums'][] = $subDir;
                    }

                    $musicFiles = glob($subDir . '/*.{mp3,m4a}', GLOB_BRACE);
                    foreach ($musicFiles as $file) {
                        if (stripos(basename($file), $query) !== false) {
                            $results['music'][] = $file;
                        }
                    }
                }
            }
            return $results;
        }

        $results = searchFiles($rootDir, $query);
        ?>

        <!-- Display Search Results -->
        <?php if (!empty($results)): ?>

            <!-- Artists -->
            <?php if (!empty($results['artists'])): ?>
            <h3>Artists</h3>
            <div class="row d-flex justify-content-center align-items-center">
                <?php foreach ($results['artists'] as $artist): ?>
                    <?php
                    $artistName = basename($artist);
                    $imagePaths = glob($artist . '/*.avif');
                    
                    $imagePath = !empty($imagePaths) ? $imagePaths[0] : 'https://placehold.jp/300x300.png';
                    ?>
                    <div class="col-6 col-md-3 d-flex justify-content-center col-custom">
                        <div class="card artist-card">
                            <a href="albums.php?artist=<?php echo urlencode($artistName); ?>">
                                <img src="<?php echo $imagePath; ?>" class="card-img artist-img" alt="<?php echo htmlspecialchars($artistName); ?>">
                                <div class="card-img-overlay d-flex align-items-center justify-content-center">
                                    <h4 class="artist-title"><?php echo htmlspecialchars($artistName); ?></h4>
                                </div>
                            </a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

            <!-- Albums -->
            <?php if (!empty($results['albums'])): ?>
            <h3>Albums</h3>
            <div class="row d-flex justify-content-center align-items-center">
                <?php foreach ($results['albums'] as $album): ?>
                    <?php
                    $albumName = basename($album);
                    $artistName = basename(dirname($album));
                    $albumCover = 'https://placehold.jp/300x300.png';

                    $m4aFiles = glob($album . '/*.m4a');
                    if (count($m4aFiles) > 0) {
                        require_once('getid3/getid3.php');
                        $getID3 = new getID3;
                        $file = $getID3->analyze($m4aFiles[0]);
                        if (!empty($file['comments']['picture'])) {
                            $imageData = $file['comments']['picture'][0]['data'];
                            $mimeType = $file['comments']['picture'][0]['image_mime'];
                            $base64 = base64_encode($imageData);
                            $albumCover = 'data:' . $mimeType . ';base64,' . $base64;
                        }
                    }
                    ?>
                    <div class="col-6 col-md-3 d-flex justify-content-center col-custom">
                        <div class="card artist-card">
                            <a href="albums.php?artist=<?php echo urlencode($artistName); ?>">
                                <img src="<?php echo $albumCover; ?>" class="card-img artist-img" alt="<?php echo htmlspecialchars($albumName); ?>">
                                <div class="card-img-overlay d-flex align-items-center justify-content-center">
                                    <h4 class="artist-title"><?php echo htmlspecialchars($albumName); ?></h4>
                                </div>
                            </a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

            <!-- Music Section -->
            <?php if (!empty($results['music'])): ?>
            <h3>Music</h3>
            <div id="musicListContainer" class="list-group list-group-flush">
                <?php foreach ($results['music'] as $music): ?>
                    <?php
                    $musicName = basename($music, '.m4a');
                    $albumName = basename(dirname($music));
                    $artistName = basename(dirname(dirname($music)));

                    $musicCover = 'https://placehold.jp/300x300.png';
                    $m4aFiles = [$music];
                    if (count($m4aFiles) > 0) {
                        $getID3 = new getID3;
                        $file = $getID3->analyze($m4aFiles[0]);
                        if (!empty($file['comments']['picture'])) {
                            $imageData = $file['comments']['picture'][0]['data'];
                            $mimeType = $file['comments']['picture'][0]['image_mime'];
                            $base64 = base64_encode($imageData);
                            $musicCover = 'data:' . $mimeType . ';base64,' . $base64;
                        }
                    }

                    $duration = !empty($file['playtime_string']) ? $file['playtime_string'] : 'Unknown Duration';
                    ?>
                    <a href="#" class="list-group-item list-group-item-action p-2 m-0">
                        <div class="detail d-flex align-items-center">
                            <img src="<?php echo $musicCover; ?>" alt="<?php echo htmlspecialchars($musicName); ?>" class="music-cover" style="width: 4.2rem; height: 4.2rem;">
                            <div class="music-info d-flex flex-column p-3 pt-0 pb-0 justify-content-center">
                                <h5 class="p-0 m-0 title"><?php echo htmlspecialchars($musicName); ?></h5>
                                <p class="p-0 m-0"><?php echo htmlspecialchars($artistName); ?> ~ <small><?php echo $duration; ?></small></p>
                            </div>
                        </div>
                        <div class="audio mt-2" style="display: none;">
                            <audio controls style="width: 100%;">
                                <source src="<?php echo htmlspecialchars($music); ?>" type="audio/x-m4a">
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    </a>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
            <?php else: ?>
                <p class="text-center">No results found.</p>
            <?php endif; ?>
        <a href="index.php" class="btn btn-secondary mt-5">Back to Home</a>
    </div>
    <!-- Main layout end -->

    <!-- Footer start -->
    <footer class="a bg-body-secondary">
        <p class="mb-0 mt-0 text-dark">Create by Rangga Ayi Pratama | &copy; 2024</p>
    </footer>
    <!-- Footer end -->

    <!-- My Script -->
     <script src="js/search.js"></script>
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>
</html>
