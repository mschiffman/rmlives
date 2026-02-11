// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
  // Get references to the elements
  const audioPlayerWindow = document.getElementById('audioPlayerWindow');
  const openAudioBtn = document.getElementById('openAudio');
  const closeAudioBtn = document.getElementById('closeAudio');
  const audioElement = document.getElementById('audioElement');

  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const stopBtn = document.getElementById('stopBtn');

  // Reference to the progress bar element
  const progressBar = document.getElementById('progressBar');

  // Show the audio player window and start playing the audio immediately
  openAudioBtn.addEventListener('click', function () {
    audioPlayerWindow.style.display = 'block';
    // Try playing the audio; browsers may block autoplay unless initiated by a user click
    audioElement.play().catch((e) => console.error('Auto-play prevented:', e));
  });

  // Close the audio player: stop the audio and hide the window
  closeAudioBtn.addEventListener('click', function () {
    audioElement.pause();
    audioElement.currentTime = 0;
    progressBar.value = 0; // reset progress bar
    audioPlayerWindow.style.display = 'none';
  });

  // Play button
  playBtn.addEventListener('click', function () {
    audioElement.play();
  });

  // Pause button
  pauseBtn.addEventListener('click', function () {
    audioElement.pause();
  });

  // Stop button: pause and reset audio to beginning
  stopBtn.addEventListener('click', function () {
    audioElement.pause();
    audioElement.currentTime = 0;
    progressBar.value = 0; // reset progress bar
  });

  // --- Draggable functionality ---
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  
  // Use the header as the "drag handle"
  const header = document.getElementById('audioPlayerHeader');
  
  header.addEventListener('mousedown', function (e) {
    isDragging = true;
    // Get the current position of the window and calculate the offset
    const rect = audioPlayerWindow.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });
  
  document.addEventListener('mousemove', function (e) {
    if (isDragging) {
      // Update the window's position based on mouse movement
      audioPlayerWindow.style.left = (e.clientX - offsetX) + 'px';
      audioPlayerWindow.style.top = (e.clientY - offsetY) + 'px';
      // Reset the right property so left/top positioning takes effect
      audioPlayerWindow.style.right = 'auto';
    }
  });
  
  document.addEventListener('mouseup', function () {
    isDragging = false;
  });

  // --- Progress Bar Functionality ---

  // Update the progress bar as the audio plays.
  audioElement.addEventListener('timeupdate', function () {
    if (audioElement.duration) {
      const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
      progressBar.value = progressPercent;
    }
  });

  // Allow the user to seek by dragging the progress bar.
  // When the slider's value changes, update the audio's current time.
  progressBar.addEventListener('input', function () {
    if (audioElement.duration) {
      audioElement.currentTime = (progressBar.value / 100) * audioElement.duration;
    }
  });
});
