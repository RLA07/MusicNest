<!DOCTYPE html>
<html lang="en">
    <head>
        <!-- Head section start -->
        <?php include('head.php'); ?>
        <!-- Head section end -->
        <title>Music Library</title>
        <link rel="stylesheet" href="css/style.css">
    </head>
    <body>
        <!-- Nav section start -->
        <?php include('navbar.php'); ?>
        <!-- Nav section end -->
        <div class="container pt-5 mb-4">
            <h1 class="text-center pb-4">List Musik</h1>
            <div id="music-list" class="list-group list-group-flush mt-4"></div>
            <nav aria-label="Page navigation" class="mt-4">
                <ul id="pagination" class="pagination justify-content-center"></ul>
            </nav>
        </div>

        <!-- Footer start -->
        <footer class="a bg-body-secondary">
            <p class="mb-0 mt-0 text-dark">Create by Rangga Ayi Pratama | &copy; 2024</p>
        </footer>
        <!-- Footer end -->

        <!-- Bootstrap JS -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
        <!-- My script -->
        <script src="js/musics.js"></script>
    </body>
</html>
