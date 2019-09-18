// @flow

import * as THREE from 'three';
import { body, getElementById } from './domUtils.js';
import { GUI } from 'dat.gui';
import Stats from 'stats-js';

import FirstPersonControls from './three/FirstPersonControls';
import OrbitControls from './three/OrbitControls';
import PointerLockControls from './three/PointerLockControls';

const getAspect = (): number => window.innerWidth / window.innerHeight;

class ThreeEnvironment {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  clock: THREE.Clock;
  renderer: THREE.WebGLRenderer;
  
  lightHelpers: Array<THREE.SpotLightHelper>;
  shadowCameraHelpers: Array<THREE.shadowCameraHelper>;

  // controls: PointerLockControls;
  controls: OrbitControls;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(75, getAspect(), 0.1, 2000);

    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.setupRenderer();
    this.setupLight();
    // this.setupPointerLockControls();
    this.setupOrbitControls();
    
    this.setupResizeHandler();

    this.setupAnimation();
  }

  setupLight(): void {
    this.lightHelpers = [];
    this.shadowCameraHelpers = [];
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    this.scene.add(ambientLight);
  }

  setupPointerLockControls(): void {
    this.controls = new PointerLockControls(this.camera);

    const blocker:HTMLElement = getElementById('blocker');
		const instructions:HTMLElement = getElementById('instructions');
    
    instructions.addEventListener('click', () => {
      this.controls.lock();
    }, false);
    
    this.controls.addEventListener('lock', () => {
      instructions.style.display = 'none';
      blocker.style.display = 'none';
    });

    this.controls.addEventListener('unlock', () => {
      blocker.style.display = 'block';
      instructions.style.display = '';
    });

    this.scene.add(this.controls.getObject());

    let moveForward:boolean = false;
    let moveBackward:boolean = false;
    let moveLeft:boolean = false;
    let moveRight:boolean = false;

    const velocity:THREE.Vector3 = new THREE.Vector3();
    const direction:THREE.Vector3 = new THREE.Vector3();

    this.controls.update = () => {
      if (this.controls.isLocked === true ) {
        const delta: number = this.clock.getDelta() * 500;
        velocity.x -= velocity.x * 20.0 * delta;
        velocity.z -= velocity.z * 20.0 * delta;
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveLeft) - Number(moveRight);
        direction.normalize(); // this ensures consistent movements in all directions
        
        if (moveForward || moveBackward) {
          velocity.z -= direction.z * 400.0 * delta;
        }
        
        if (moveLeft || moveRight) {
          velocity.x -= direction.x * 400.0 * delta;
        }

        this.controls.getObject().translateX(velocity.x * delta);
        this.controls.getObject().translateZ(velocity.z * delta);
      }
    };

    document.addEventListener('keydown', (event:KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
          moveForward = true;
          break;
        case "ArrowLeft":
        case "a":
          moveLeft = true;
          break;
        case "ArrowDown":
        case "s":
          moveBackward = true;
          break;
        case "ArrowRight":
        case "d":
          moveRight = true;
          break;
      }
    }, false);

    document.addEventListener('keyup', (event:KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
          moveForward = false;
          break;
        case "ArrowLeft":
        case "a":
          moveLeft = false;
          break;
        case "ArrowDown":
        case "s":
          moveBackward = false;
          break;
        case "ArrowRight":
        case "d":
          moveRight = false;
          break;
      }
    }, false);
  }

  setupFirstPersonControls(): void {
    this.controls = new FirstPersonControls(this.camera);
    this.controls.movementSpeed = 1000;
    this.controls.lookSpeed = 30;
    this.controls.lookVertical = true;
  }

  setupOrbitControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();
  }

  setupRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.gammaOutput = true;
    this.renderer.gammaFactor = 2.2;
    body.appendChild(this.renderer.domElement);
  }

  setupAnimation(): void {
    let shouldAnimate = true;
    window.addEventListener('blur', () => shouldAnimate = false);
    window.addEventListener('focus', () => shouldAnimate = true);

    const animate = () => {
      requestAnimationFrame(animate);
      if (shouldAnimate) {
        this.render();
      }
    };

    animate();
  }

  setupGUI(light:THREE.SpotLight): void {
    const render:function = this.render;

    const gui = new GUI();
    const params = {
      'light color': light.color.getHex(),
      intensity: light.intensity,
      distance: light.distance,
      angle: light.angle,
      penumbra: light.penumbra,
      decay: light.decay,
    };
    gui.addColor(params, 'light color').onChange(val => {
      light.color.setHex(val);
      render();
    });
    gui.add(params, 'intensity', 0, 2).onChange(val => {
      light.intensity = val;
      render();
    });
    gui.add(params, 'distance', 10, 100).onChange(val => {
      light.distance = val;
      render();
    });
    gui.add(params, 'angle', 0, Math.PI / 3).onChange(val => {
      light.angle = val;
      render();
    });
    gui.add(params, 'penumbra', 0, 1).onChange(val => {
      light.penumbra = val;
      render();
    });
    gui.add(params, 'decay', 1, 2).onChange(val => {
      light.decay = val;
      render();
    });
    gui.open();
  }

  addLight(x: number, y: number, z: number, targetX: number, targetY: number, targetZ: number): void {
    const light = new THREE.SpotLight(0xeded88, 1);
    light.position.set(x, y, z);
    light.penumbra = 0.4;
    light.decay = 1.5;
    light.distance = 3 * y;

    // light.castShadow = true;
    // light.shadow.mapSize.width = 1024;
    // light.shadow.mapSize.height = 1024;
    // light.shadow.camera.near = 10;
    // light.shadow.camera.far = 200;

    light.target.position.set(targetX, targetY, targetZ);

    this.scene.add(light);
    this.scene.add(light.target);

    // const lightHelper = new THREE.SpotLightHelper(light);
    // this.scene.add(lightHelper);
    // this.lightHelpers.push(lightHelper);

    // const shadowCameraHelper = new THREE.CameraHelper(light.shadow.camera);
    // this.scene.add(shadowCameraHelper);
    // this.shadowCameraHelpers.push(shadowCameraHelper);
  }

  render(): void {
    this.lightHelpers.forEach(helper => helper.update());
    this.shadowCameraHelpers.forEach(helper => helper.update());
    this.controls.update(this.clock.getDelta());
    this.renderer.render(this.scene, this.camera);
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.camera.aspect = getAspect();
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.controls.handleResize();
    }, false);
  }
}

export default new ThreeEnvironment();
