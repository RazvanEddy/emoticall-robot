import { InferenceSession, Tensor } from "onnxruntime-web";

navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia || navigator.mediaDevices.getUserMedia

// const InferenceSession = window.ort.InferenceSession;
// const Tensor = window.ort.Tensor;

let analyzer = null;
let audioBuffer = [];
let detections = [];
const THRESHOLD_RMS = 0.002;
const SAMPLE_RATE = 22050;

window.onClickStartAnalyzer = () => {
    // const onnxSession = new onnx.InferenceSession({ executionProviders: ["wasm"] });
    setTimeout(
        async function startAnalyzer(){

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });

            const voice_video = document.getElementById("localVideo");
            const audioStream = voice_video.captureStream();

            // await onnxSession.loadModel("/models/speech/voice_emotion_cnn.onnx");
            
            const onnxSession = await InferenceSession.create(
                "/models/speech/voice_emotion_cnn.onnx",
                { executionProviders: ["wasm"] }
            );

            const source = audioContext.createMediaStreamSource(audioStream);

            analyzer = Meyda.createMeydaAnalyzer({
                audioContext: audioContext,
                source: source,
                bufferSize: 512,
                featureExtractors: ["rms", "buffer"],
                sampleRate: SAMPLE_RATE,
                hopSize: 512,
                windowingFunction: "hanning",
                callback: features => {
                    // console.log(features);
                    predictEmotionsFromFeatures(features, onnxSession);
                },
            });
            analyzer.start();  
        }, 5000);
}

window.stopAnalyzer = () => {
    analyzer.stop();
    analyzer = null;
}

async function predictEmotionsFromFeatures(features, onnxSession) {
    if(features.rms > THRESHOLD_RMS){
        audioBuffer.push(...features.buffer);
    } else {
        audioBuffer.push(...new Array(512).fill(0));
    }

    if(audioBuffer.length >= SAMPLE_RATE * 2.1){
        let data = rmsNormalize(
            audioBuffer.slice(0, SAMPLE_RATE * 2.1)
        );
        audioBuffer = [];

        if(Math.min(...data) === 0 && Math.max(...data) === 0){
            detections = [1, 0, 0, 0, 0, 0, 0, 0];
        } else {
            const input = new Tensor(new Float32Array.from(data), "float32", [
                1,
                SAMPLE_RATE * 2.1
            ]);

            const results = await onnxSession.run({ input });

            detections = softmax(Array.from(results.output.data));
            console.log(detections);
            data = [];
        }
    }
}

function softmax(arr) {
        const C = Math.max(...arr);
        const d = arr.map(y => Math.exp(y - C)).reduce((a, b) => a + b);
        return arr.map(value => {
            return Math.exp(value - C) / d;
        })
}

function rmsNormalize(arr, rmsLevel = 0.0) {
    const r = 10 ** (rmsLevel / 10.0);
    const squaredSum = arr.reduce((prev, curr) => prev + curr ** 2, 0);
    const a = Math.sqrt((arr.length * r ** 2) / squaredSum);
    return arr.map(val => val * a || 0);
}
