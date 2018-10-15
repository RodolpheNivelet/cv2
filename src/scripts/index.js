'use strict';
import * as THREE from 'three';
import * as Stats from 'stats.js';
import HexagonService from './services/hexagon.js';


import { HEXAGON_RADIUS, HEXAGON_WIDTH, HEXAGON_HEIGHT } from './constants';

export class App {

  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.init();
    this.animate();
  }

  init() {
    const self = this;
    window.addEventListener('resize', () => {self.onWindowResize();}, false);
		document.addEventListener('mousemove', event => {self.onDocumentMouseMove(event);}, false );

    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog( 0xaaaaaa, 150, 300 );

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor( 0xaaaaaa );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderedSize();

    this.stats = new Stats();
    document.body.appendChild( this.stats.dom );

    this.canvas = this.renderer.domElement;
    document.body.appendChild( this.canvas );

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    this.camera.position.set(0, 0, 60);

    this.ambientLight = new THREE.AmbientLight( 0xFFFFFF );

    this.scene.add( this.ambientLight );

    HexagonService.appendGrid(30, 10, this.scene);

    const middleHex = HexagonService.get(0, 0);

    this.canvas.addEventListener( 'mousedown', event => {self.onClick(event);}, false );

    setTimeout(() => {
      HexagonService.animateAllFrom(middleHex, 200, 'Bounce', false, hex => {
        HexagonService.randomAnimation(hex);
      });
    }, 1000);

  }

  animate() {
    const self = this;
    requestAnimationFrame( () => {self.animate();});
    const delta = this.clock.getDelta();

    this.raycaster.setFromCamera( this.mouse, this.camera );

    const target = HexagonService.targetedHexagon(this.raycaster, this.scene);
    if (target) {
      target.hover = true;
      this.canvas.style.cursor = target.clickable ? 'pointer' : 'default';
    }
    for (var i = 0; i < HexagonService.hexagons.length; i++) {
      const hexagon = HexagonService.hexagons[i]
      if (hexagon.faceCap !== target) {
        hexagon.faceCap.hover = false;
      }
      if (hexagon.backCap !== target) {
        hexagon.backCap.hover = false;
      }
    }

    HexagonService.playAnimation(delta);

		this.camera.position.x += ( this.mouse.x * 30 - this.camera.position.x ) * 0.05;
		this.camera.position.y += ( this.mouse.y * 30 - this.camera.position.y ) * 0.05;
		this.camera.lookAt( this.scene.position );

    this.stats.update();
    this.render();
  }

  render() {
    this.renderer.render( this.scene, this.camera );
  }

  renderedSize() {
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  cameraSize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
  }

  onWindowResize() {
    this.renderedSize();
    this.cameraSize();
    this.camera.updateProjectionMatrix();
  }

  onDocumentMouseMove(event) {
    this.mouse.x = ( event.clientX / window.innerWidth * 2 ) - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight * 2 ) + 1;
  }

  onClick(event) {
    const target = HexagonService.targetedHexagon(this.raycaster, this.scene);
    if (target) {
      HexagonService.clicked(target);
    }
  }
}
