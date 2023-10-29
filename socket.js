import {
  fadeToAction,
  addSide,
  createGUI,
  updateData,
  init,
  animate,
  model,
  scene,
  camera
} from "./scene.js";

import * as THREE from "three";

const socket = io("http://185.204.2.233:3030/");

let animationsObjects = [];

function connectToStation() {
  console.log("Connecting to station...");
  const host = document.getElementById("host").value;
  socket.emit("connectToStation", host);
}

function disconnectFromStation() {
  console.log("Disconnecting from station...");
  socket.emit("disconnectFromStation");
}

function moveForward() {
  console.log("move Forward...");
  socket.emit("moveForward");
  // let angle = Math.round(getCurrentRobotRotationDegrees());
  // if(angle == 0)moveRobotForward(stepSize, 1000, "север");
  // if(angle == 90)moveRobotForward(stepSize, 1000, "восток");
  // if(angle == 180)moveRobotForward(stepSize, 1000, "юг");
  // if(angle == 270)moveRobotForward(stepSize, 1000, "запад");
}

function moveRight() {
  console.log("move Right...");
  socket.emit("moveRight");
  moveRobotForwardAndRotate(-90, stepSize, 1000);
}

function moveLeft() {
  console.log("move Left...");
  socket.emit("moveLeft");
  moveRobotForwardAndRotate(90, stepSize, 1000);
}

function moveBack() {
  console.log("move back...");
  socket.emit("moveBack");
  moveRobotForwardAndRotate(180, stepSize, 1000);
}

function turnRight() {
  console.log("turn right...");
  socket.emit("turnRight");
  // rotateRobotSmoothly(90, 1000);
}

function turnLeft() {
  console.log("turn left...");
  socket.emit("turnLeft");
  rotateRobotSmoothly(-90, 1000);
}

function heal() {
  fadeToAction("ThumbsUp", 0.2);
  console.log("healing");
  socket.emit("heal");
}

function changeMode() {
  console.log("changing mode");
  socket.emit("changeMode");
}

function fixCriticalError() {
  socket.emit("fixing CriticalError");
  socket.emit("fixCriticalError");
}

function restart() {
  console.log("restarting...");
  socket.emit("restart");
}

socket.on("allInfo", (state) => {
  if (!state.coordinates) {
    return;
  }
  document.getElementById("health").innerHTML = "Здоровье: " + state.health;
  console.log("allinfo", state);
  updateData(state);
  init();
  animate();
});

socket.on("state", (state) => {
  if (!model) {
    updateData(state);
    init();
    animate();
  } else {
    const newXPosition = state.coordinates[0] * 100;
    const newYPosition = state.coordinates[1] * 100;
    const newZPosition = state.coordinates[2] * 100;
    // camera.lookAt(newXPosition, newYPosition+800, newZPosition);
    // camera.position.set(newXPosition+800, newYPosition+800, newZPosition+800);
    const initialPosition = new THREE.Vector3(model.position.x, model.position.y, model.position.z);
    const targetPosition = new THREE.Vector3(state.coordinates[0] * 100, state.coordinates[1] * 100, state.coordinates[2] * 100 );

    moveRobotForward(stepSize, 1000, state.direction, initialPosition, targetPosition );
    model.position.set(newXPosition, newYPosition, newZPosition);
    updateData(state);
    addSide();
  }
  document.getElementById("health").innerHTML = "Здоровье: " + state.health;
  console.log(state);
});

socket.on("connect", () => console.log("connected to ЦУП"));

socket.on("message", (data) => console.log("Message received: " + data));

socket.on("temperature", (temperature) => {
  document.getElementById("temperature").innerHTML = "Температура: " + parseFloat(temperature).toFixed(3);
});

socket.on("health", (health) => {
  document.getElementById("health").innerHTML = "Здоровье: " + health;
});

socket.on("dead", () => {});

socket.on("criticalError", (criticalError) => {});

socket.on("fixCriticalError", () => {});

socket.on("action", (action) => {
  console.log(action)
  fadeToAction(action, 0.2);
});

socket.on("emote", (emote) => {
  console.log(emote)
  fadeToAction(emote, 0.2);
});

socket.on("expression", (expression) => {});

socket.on("mode", (mode) => {});

document
  .getElementById("moveForwardButton")
  .addEventListener("click", moveForward);

document.getElementById("moveBackButton").addEventListener("click", moveBack);

document.getElementById("moveRightButton").addEventListener("click", moveRight);

document.getElementById("moveLeftButton").addEventListener("click", moveLeft);

document.getElementById("turnRightButton").addEventListener("click", turnLeft);

document.getElementById("turnLeftButton").addEventListener("click", turnRight);

document.getElementById("healButton").addEventListener("click", heal);

document.getElementById("connect").addEventListener("click", connectToStation);

document
  .getElementById("disconnect")
  .addEventListener("click", disconnectFromStation);

document.getElementById("changeMode").addEventListener("click", changeMode);

// smooth animation
let robotPosition = new THREE.Vector3();
let stepSize = 100;
let robotRotationAngle = 0; 

function createMoveAnimation({
    mesh,
    startPosition,
    endPosition
  }) {
    mesh.userData.mixer = new THREE.AnimationMixer(mesh);
    let track = new THREE.VectorKeyframeTrack(
      '.position', [0, 1, 2], [
      startPosition.x,
      startPosition.y,
      startPosition.z,
      endPosition.x,
      endPosition.y,
      endPosition.z,
      ]
    );
    const animationClip = new THREE.AnimationClip(null, 5, [track]);
    const animationAction = mesh.userData.mixer.clipAction(animationClip);
    animationAction.setLoop(THREE.LoopOnce);
    animationAction.play();
    mesh.userData.clock = new THREE.Clock();
    animationsObjects.push(mesh);
  };

  // model
  
  // robotPosition.set(model.position.x, model.position.y, model.position.z )


  function updateRobotPosition() {
    model.position.set(robotPosition.x, robotPosition.y, robotPosition.z);
  }

  function rotateRobot(degrees) {
    if (model) {
      const radians = (degrees * Math.PI) / 180; // Переводим градусы в радианы
      model.rotateY(radians);
      robotRotationAngle += radians; // Обновляем угол поворота
    }
  }

  function getCurrentRobotRotationDegrees() {
    var radians = robotRotationAngle;

    // Преобразуем радианы в градусы
    var degrees = (radians * 180) / Math.PI;

    // Преобразуем отрицательные значения в положительные и ограничиваем в пределах 0-359 градусов
    degrees = (degrees % 360 + 360) % 360;

    return degrees;
  }

  function moveRobotForward(distance, duration, direction, initialPosition, targetPosition) {
    if (model) {
      const start = performance.now();
      const end = start + duration;
      
      console.log("initialPosition");
      console.log(initialPosition);
      console.log("targetPosition");
      console.log(targetPosition);
      if (direction == 'север') {
        targetPosition.z += distance;
      } else if (direction == 'восток') {
        targetPosition.x += distance;
      } else if (direction == 'юг') {
        targetPosition.z -= distance;
      } else if (direction == 'запад') {
        targetPosition.x -= distance;
      }

      function animate(currentTime) {
      const elapsedTime = currentTime - start;
      const progress = elapsedTime / duration;

      if (progress < 1) {
        model.position.lerpVectors(initialPosition, targetPosition, progress);
        requestAnimationFrame(animate);
      } else {
        model.position.copy(targetPosition);
      }
      }
      fadeToAction("Walking", 0);
      fadeToAction("Idle", 4);
      requestAnimationFrame(animate);

      // Создайте анимацию для данной функции перемещения
      createMoveAnimation({
      mesh: model,
      startPosition: initialPosition,
      endPosition: targetPosition,
      duration: duration
      });
    }
  }

  function createRotateAnimation({ mesh, startRotation, endRotation, duration }) {
    // Создайте анимацию для разворота робота
    if (mesh) {
      const clock = new THREE.Clock();
      const mixer = new THREE.AnimationMixer(mesh);
      const rotationTrack = new THREE.NumberKeyframeTrack(
      '.rotation[y]', // Анимация вращения вокруг оси Y
      [0, duration],
      [startRotation, endRotation]
      );
      const rotationClip = new THREE.AnimationClip('RotateAnimation', duration, [rotationTrack]);
      const rotationAction = mixer.clipAction(rotationClip);
      rotationAction.setLoop(THREE.LoopOnce);
      rotationAction.play();
      mixer.update(0); // Начальное обновление
      mesh.userData.mixer = mixer;
    }
  }


  function rotateRobotSmoothly(degrees, duration) {
    return new Promise((resolve) => {
      if (model) {
      const start = performance.now();
      const end = start + duration;
      const initialRotation = robotRotationAngle;
      const targetRotation = robotRotationAngle + (degrees * Math.PI / 180);

      function animate(currentTime) {
        const elapsedTime = currentTime - start;
        const progress = elapsedTime / duration;

        if (progress < 1) {
        const currentRotation = initialRotation + (progress * (targetRotation - initialRotation));
        fadeToAction("Walking", 0);
        model.rotateY(currentRotation - robotRotationAngle);
        robotRotationAngle = currentRotation;
        
        fadeToAction("Idle", 4);
        requestAnimationFrame(animate);
        } else {
        model.rotateY(targetRotation - robotRotationAngle);
        robotRotationAngle = targetRotation;
        resolve(); // Разрешить обещание после завершения анимации
        }
      }

      requestAnimationFrame(animate);

      // Создайте анимацию для данной функции разворота
      createRotateAnimation({
        mesh: model,
        startRotation: initialRotation,
        endRotation: targetRotation,
        duration: duration
      });
      }
    });
    }

    function moveRobotForwardAndRotate(degrees, distance, duration) {
      rotateRobotSmoothly(degrees, duration).then(() => {
        let angle = Math.round(getCurrentRobotRotationDegrees());
        if (angle === 0) moveRobotForward(distance, duration, "север");
        else if (angle === 90) moveRobotForward(distance, duration, "восток");
        else if (angle === 180) moveRobotForward(distance, duration, "юг");
        else if (angle === 270) moveRobotForward(distance, duration, "запад");
      }).catch(error => alert(error))
    }