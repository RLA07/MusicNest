document.addEventListener("DOMContentLoaded", function () {
  const listItems = document.querySelectorAll(".list-group-item");

  listItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      // Hapus audio player yang sedang ditampilkan
      const allAudioDivs = document.querySelectorAll(".list-group-item .audio");
      allAudioDivs.forEach((div) => {
        if (div !== item.querySelector(".audio")) {
          div.style.display = "none";
        }
      });

      // Tampilkan atau sembunyikan audio player di dalam item yang diklik
      const audioDiv = this.querySelector(".audio");
      if (audioDiv.style.display === "none" || audioDiv.style.display === "") {
        audioDiv.style.display = "block";
      } else {
        audioDiv.style.display = "none";
      }

      // Memulai pemutaran audio
      const audioPlayer = audioDiv.querySelector("audio");
      if (audioDiv.style.display === "block") {
        audioPlayer.load();
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    });
  });
});
