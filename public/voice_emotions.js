navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia || navigator.mediaDevices.getUserMedia

let analyzer = null;

function onClickStartAnalyzer() {
    setTimeout(
        function startAnalyzer(){
            // const audioContext = new AudioContext();

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext({ sampleRate: 22050 });

            const voice_video = document.getElementById("localVideo");
            const audioStream = voice_video.captureStream();

            const source = audioContext.createMediaStreamSource(audioStream);

            // source.connect(audioContext.destination);

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

