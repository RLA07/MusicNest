function showMusicList(albumName) {
  const musicListContainer = document.getElementById("musicListContainer");
  const musicList = document.getElementById("musicList");

  // Bersihkan daftar musik sebelumnya
  musicListContainer.innerHTML = "";

  // Lakukan permintaan AJAX untuk mendapatkan daftar musik
  fetch(`get_music.php?artist=${artist}&album=${albumName}`)
    .then((response) => response.json())
    .then((data) => {
      data.forEach((music) => {
        const musicLink = document.createElement("a");
        musicLink.href = "#";
        musicLink.className = "list-group-item list-group-item-action p-2 m-0";

        // Membuat div detail yang berisi cover dan info musik
        const detailDiv = document.createElement("div");
        detailDiv.className = "detail d-flex align-items-center";

        const musicCover = document.createElement("img");
        musicCover.src = music.cover;
        musicCover.alt = music.name;
        musicCover.className = "music-cover";
        musicCover.style.width = "4.2rem";
        musicCover.style.height = "4.2rem";

        const musicInfo = document.createElement("div");
        musicInfo.className =
          "music-info d-flex flex-column p-3 pt-0 pb-0 justify-content-center";
        musicInfo.innerHTML = `
                    <h5 class="p-0 m-0 title">${music.name}</h5>
                    <p class="p-0 m-0">${music.artist} ~ <small>${music.duration}</small></p>
                `;

        const author = "Rangga Ayi Pratama";

        detailDiv.appendChild(musicCover);
        detailDiv.appendChild(musicInfo);
        musicLink.appendChild(detailDiv);

        // Menambahkan event listener untuk mengontrol pemutaran audio
        musicLink.addEventListener("click", function (e) {
          e.preventDefault();

          // Hapus audio player sebelumnya jika ada
          const existingAudioPlayer = document.querySelector(
            ".list-group-item .audio"
          );
          if (existingAudioPlayer) {
            existingAudioPlayer.remove();
          }

          // Membuat div audio baru yang berisi audio player
          const audioDiv = document.createElement("div");
          audioDiv.className = "audio mt-2";

          const audioPlayer = document.createElement("audio");
          audioPlayer.controls = true;
          audioPlayer.style.width = "100%";

          const audioSource = document.createElement("source");
          audioSource.src = music.path;
          audioSource.type = "audio/x-m4a";
          audioPlayer.appendChild(audioSource);

          audioDiv.appendChild(audioPlayer);
          this.appendChild(audioDiv);

          audioPlayer.load();
          audioPlayer.play();
        });

        musicListContainer.appendChild(musicLink);
      });

      musicList.style.display = "block";
      musicList.scrollIntoView({ behavior: "smooth" });
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}
