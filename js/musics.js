document.addEventListener("DOMContentLoaded", function () {
  loadMusicPage(1);

  function loadMusicPage(page) {
    fetch(`get_music_page.php?page=${page}`)
      .then((response) => response.json())
      .then((data) => {
        displayMusicList(data.musics);
        setupPagination(data.totalPages, data.currentPage);
      })
      .catch((error) => console.error("Error fetching music:", error));
  }

  function displayMusicList(musics) {
    const musicList = document.getElementById("music-list");
    musicList.innerHTML = "";

    musics.forEach((music) => {
      const musicItem = document.createElement("div");
      musicItem.className = "list-group-item list-group-item-action";
      musicItem.innerHTML = `
              <div class="d-flex align-items-center">
                  <img src="${music.cover}" alt="Cover" class="music-cover mr-3" style="width:4.3rem;">
                  <div class="music-info d-flex flex-column p-3 pt-0 pb-0 justify-content-center">
                      <h5 class="title p-0 m-0 mb-1">${music.title}</h5>
                      <p class="artist p-0 m-0 mb-1">${music.artist} ~ <small>${music.duration}</small></p>
                  </div>
              </div>
          `;

      musicItem.addEventListener("click", function () {
        // Remove existing audio elements from all list items
        const existingAudios = document.querySelectorAll(
          ".list-group-item audio"
        );
        existingAudios.forEach((audio) => audio.remove());

        // Add audio element to the clicked item
        const audioElement = document.createElement("audio");
        audioElement.controls = true;
        audioElement.autoplay = true;
        audioElement.className = "audio mt-2 w-100";
        audioElement.src = music.path;

        // Append the audio element to the clicked item
        musicItem.appendChild(audioElement);
      });

      musicList.appendChild(musicItem);
    });
  }

  function setupPagination(totalPages, currentPage) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const maxVisiblePages = window.innerWidth < 650 ? 3 : 7; // Show fewer pages on small screens
    const halfMax = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfMax);
    let endPage = Math.min(totalPages, currentPage + halfMax);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      const firstPageItem = document.createElement("li");
      firstPageItem.className = "page-item";
      firstPageItem.innerHTML = `<a class="page-link" href="#">1</a>`;
      firstPageItem.addEventListener("click", (event) => {
        event.preventDefault();
        loadMusicPage(1);
      });
      pagination.appendChild(firstPageItem);

      if (startPage > 2) {
        const dots = document.createElement("li");
        dots.className = "page-item disabled";
        dots.innerHTML = `<span class="page-link">...</span>`;
        pagination.appendChild(dots);
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      const pageItem = document.createElement("li");
      pageItem.className = `page-item ${page === currentPage ? "active" : ""}`;
      pageItem.innerHTML = `<a class="page-link" href="#">${page}</a>`;
      pageItem.addEventListener("click", (event) => {
        event.preventDefault();
        loadMusicPage(page);
      });
      pagination.appendChild(pageItem);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = document.createElement("li");
        dots.className = "page-item disabled";
        dots.innerHTML = `<span class="page-link">...</span>`;
        pagination.appendChild(dots);
      }

      const lastPageItem = document.createElement("li");
      lastPageItem.className = "page-item";
      lastPageItem.innerHTML = `<a class="page-link" href="#">${totalPages}</a>`;
      lastPageItem.addEventListener("click", (event) => {
        event.preventDefault();
        loadMusicPage(totalPages);
      });
      pagination.appendChild(lastPageItem);
    }
  }

  window.addEventListener("resize", () => {
    const currentPage = document.querySelector(".page-item.active a").innerText;
    loadMusicPage(parseInt(currentPage));
  });
});
