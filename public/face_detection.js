const video = document.getElementById("remoteVideo");
const canvas = document.getElementById("canvas");

const MODEL_URL = '/models/face';

Promise.all([
    // tinyfacedetector is just like a normal face detector but it's going to be smaller and quicker
    // faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
]).then(addVideoListener);

function addVideoListener(){
    video.addEventListener('playing', () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        document.getElementById('remoteVideoId').appendChild(canvas);
        const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
        faceapi.matchDimensions(canvas, displaySize);
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options()).withFaceExpressions();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        }, 500)
    })
}
      