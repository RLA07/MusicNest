<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Search Results</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
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
<body>
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
                    $imagePaths = glob($artist . '/*.avif'); // Cari semua gambar dengan ekstensi .avif
                    
                    if (!empty($imagePaths)) {
                        $imagePath = $imagePaths[0];
                    } else {
                        $imagePath = 'https://placehold.jp/300x300.png';
                    }
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

            <!-- Music -->
            <?php if (!empty($results['music'])): ?>
            <h3>Music</h3>
            <ul class="list-group">
                <?php foreach ($results['music'] as $music): ?>
                    <li class="list-group-item">
                        <a href="play.php?src=<?php echo urlencode(str_replace($_SERVER['DOCUMENT_ROOT'], '', $music)); ?>"><?php echo htmlspecialchars(basename($music, '.m4a')); ?></a>
                    </li>
                <?php endforeach; ?>
            </ul>
            <?php endif; ?>

        <?php else: ?>
            <p>No results found for "<?php echo htmlspecialchars($query); ?>"</p>
        <?php endif; ?>

        <a href="index.php" class="btn btn-secondary mt-5">Back to Home</a>
    </div>
</body>
</html>
