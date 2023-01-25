navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia || navigator.mediaDevices.getUserMedia

let analyzer = null;

function onClickStartAnalyzer() {
    setTimeout(
        function startAnalyzer(){
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext({ sampleRate: 22050 });
            const voiceVideo = document.getElementById("remoteVideo");
            const audioStream = voiceVideo.captureStream();
            const source = audioContext.createMediaStreamSource(audioStream);
            analyzer = Meyda.createMeydaAnalyzer({
                audioContext: audioContext,
                source: source,
                bufferSize: 512,
                featureExtractors: ["rms"],
                sampleRate: 22050,
                hopSize: 512,
                windowingFunction: "hanning",
                callback: features => {
                    console.log(features);
                },
            });
            analyzer.start();  
        }, 5000);
}

function stopAnalyzer(){
    analyzer.stop();
    analyzer = null;
}