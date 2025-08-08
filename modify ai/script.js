const video = document.getElementById('video');
const moodDisplay = document.getElementById('mood');
const spotifyIframe = document.getElementById('spotify');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => console.error("Camera Error:", err));
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video,
      new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();

    const resized = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resized);

    if (detections.length > 0) {
      const expr = detections[0].expressions;
      const mood = getTopExpression(expr);
      moodDisplay.textContent = mood;
      updateUIAndMusic(mood);
    }
  }, 3000);
});

function getTopExpression(expressions) {
  return Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0];
}

function updateUIAndMusic(mood) {
  let music = '';
  switch (mood) {
    case 'happy':
      document.body.style.background = '#ffe600';
      music = 'https://open.spotify.com/embed/track/60nZcImufyMA1MKQY3dcCH'; // Happy - Pharrell
      break;
    case 'sad':
      document.body.style.background = '#4b79a1';
      music = 'https://open.spotify.com/embed/track/4sPmO7WMQUAf45kwMOtONw'; // Sad - Billie Eilish
      break;
    case 'angry':
      document.body.style.background = '#d32f2f';
      music = 'https://open.spotify.com/embed/track/3G69wW0tDFm0Am2mQzlONw'; // Angry song
      break;
    case 'surprised':
      document.body.style.background = '#ba68c8';
      music = 'https://open.spotify.com/embed/track/2takcwOaAZWiXQijPHIx7B'; // Surprise
      break;
    case 'neutral':
      document.body.style.background = '#888';
      music = 'https://open.spotify.com/embed/track/1rfofaqEpACxVEHIZBJe6W'; // Neutral
      break;
    default:
      document.body.style.background = '#333';
      music = '';
  }
  if (spotifyIframe.src !== music) {
    spotifyIframe.src = music;
  }
}
