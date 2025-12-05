import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

let scene, renderer;
let camera;
let objetos = [];
let recorder,
  stream,
  chunks = [];
let recording = false;
let listener, sound;
let audioloaded = false;

init();
animationLoop();

function init() {
  //Defino cámara
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 10);

  //Audio
  listener = new THREE.AudioListener();
  camera.add(listener);
  sound = new THREE.Audio(listener);

  // Carga de sonido (usa aquí tu MP3)
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load(
    "src/Macarena - Los del Río __ letra Lyrics.mp3",
    function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.7);
      audioloaded = true;
      console.log("Sonido cargado");

      window.addEventListener("click", () => {
        if (sound && audioloaded && !sound.isPlaying) {
          sound.play();
        }
      });
      

      iniciarCoreografia(); // ⬅ Start dance!
    }
  );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //Objetos
  let sz = 1.5;
  let px = -3;
  let py = 3;

  Cubo(-1, 0, 0, sz, sz, 1.5 * sz);
  Cubo(-3, 0, py, sz, sz, 1.5 * sz);
  Cubo(1, 0, 0, sz, sz, 1.5 * sz);
  Cubo(3, 0, py, sz, sz, 1.5 * sz);

  // Evento grabación
  document.addEventListener("keydown", (event) => {
    if (event.key === "r") {
      if (recording) stopRecording();
      else startRecording();
    }
  });
}

function Cubo(px, py, pz, sx, sy, sz) {
  let geometry = new THREE.BoxBufferGeometry(sx, sy, sz);

  let material = new THREE.MeshNormalMaterial();

  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}



function moverArriba() {
  for (let o of objetos) {
    new TWEEN.Tween(o.position)
      .to({ y: o.position.y + 1 }, 250)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  }
}

function moverAbajo() {
  for (let o of objetos) {
    new TWEEN.Tween(o.position)
      .to({ y: o.position.y - 1 }, 250)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  }
}

function moverIzquierda() {
  for (let o of objetos) {
    new TWEEN.Tween(o.position)
      .to({ x: o.position.x - 1 }, 250)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  }
}

function moverDerecha() {
  for (let o of objetos) {
    new TWEEN.Tween(o.position)
      .to({ x: o.position.x + 1 }, 250)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  }
}

function girarDerecha() {
  for (let o of objetos) {
    new TWEEN.Tween(o.rotation)
      .to({ y: o.rotation.y + Math.PI / 2 }, 300)
      .easing(TWEEN.Easing.Back.Out)
      .start();
  }
}

function girarIzquierda() {
  for (let o of objetos) {
    new TWEEN.Tween(o.rotation)
      .to({ y: o.rotation.y - Math.PI / 2 }, 300)
      .easing(TWEEN.Easing.Back.Out)
      .start();
  }
}

function saltar() {
  for (let o of objetos) {
    new TWEEN.Tween(o.position)
      .to({ y: o.position.y + 2 }, 200)
      .yoyo(true)
      .repeat(1)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  }
}

function pausa() {
}


function iniciarCoreografia() {
  if (!audioloaded) return;

  sound.play();

  const beat = 582; 

  const secuencia = [
    () => moverArriba(),
    () => moverAbajo(),
    () => girarDerecha(),
    () => girarIzquierda(),
    () => moverIzquierda(),
    () => moverDerecha(),
    () => saltar(),
    () => pausa(),
  ];

  const ejecutarSecuencia = () => {
    for (let i = 0; i < secuencia.length; i++) {
      setTimeout(() => secuencia[i](), beat * i);
    }
  };

  // Ejecutar primera vez
  ejecutarSecuencia();

  // Repetir siempre
  setInterval(ejecutarSecuencia, beat * 8);
}

function startRecording() {
  if (!recording) {
    stream = renderer.domElement.captureStream(30);
    recorder = new MediaRecorder(stream);

    chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "threejs_video.webm";
      link.click();
    };

    recorder.start();
    recording = true;
    console.log("Grabación iniciada...");
  }
}

function stopRecording() {
  if (recording) {
    recorder.stop();
    recording = false;
    console.log("Grabación detenida...");
  }
}


function animationLoop() {
  requestAnimationFrame(animationLoop);
  TWEEN.update();
  renderer.render(scene, camera);
}
