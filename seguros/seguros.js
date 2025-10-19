document.addEventListener('DOMContentLoaded', function() {
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const carousel = document.getElementById('media-carousel');

  if (prevBtn && nextBtn && carousel) {
    // Vamos rolar 300px de cada vez
    const scrollAmount = 300; 

    nextBtn.addEventListener('click', function() {
      carousel.scrollLeft += scrollAmount;
    });

    prevBtn.addEventListener('click', function() {
      carousel.scrollLeft -= scrollAmount;
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  
  // Encontra todos os nossos botões de áudio
  const audioPlayers = document.querySelectorAll('.audio-placeholder');
  
  // Cria UM player de áudio para a página inteira
  const masterAudio = new Audio();
  
  let currentlyPlayingBox = null;

  audioPlayers.forEach(box => {
    const playIcon = box.querySelector('.play-icon');
    const audioSrc = box.getAttribute('data-src');

    box.addEventListener('click', function() {
      // Se este áudio já está tocando, pause-o
      if (currentlyPlayingBox === box && !masterAudio.paused) {
        masterAudio.pause();
        playIcon.textContent = '▶';
        box.classList.remove('playing');
        currentlyPlayingBox = null;
      } else {
        // Se outro áudio estava tocando, pare-o
        if (currentlyPlayingBox) {
          currentlyPlayingBox.classList.remove('playing');
          currentlyPlayingBox.querySelector('.play-icon').textContent = '▶';
        }

        // Toca o novo áudio
        masterAudio.src = audioSrc;
        masterAudio.play();
        playIcon.textContent = '❚❚'; // Ícone de Pause
        box.classList.add('playing');
        currentlyPlayingBox = box;
      }
    });
  });

  // Quando o áudio terminar, resete o ícone
  masterAudio.addEventListener('ended', function() {
    if (currentlyPlayingBox) {
      currentlyPlayingBox.classList.remove('playing');
      currentlyPlayingBox.querySelector('.play-icon').textContent = '▶';
      currentlyPlayingBox = null;
    }
  });

});