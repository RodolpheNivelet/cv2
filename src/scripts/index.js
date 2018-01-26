'use strict';
import * as THREE from 'three';
import * as Stats from 'stats.js';

export class App {

  constructor() {
    this.init();
    this.animate();
  }

  init() {
    const self = this;
    window.addEventListener('resize', () => {self.onWindowResize();});

    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog( 0xFFFFFF, 0, 750 );

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor( 0xFFFFFF );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderedSize();

    this.stats = new Stats();
    document.body.appendChild( this.stats.dom );

    this.canvas = this.renderer.domElement;
    document.body.appendChild( this.canvas );

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    this.camera.position.set(0, 0, 30);

    this.ambientLight = new THREE.AmbientLight( 0xFFFFFF );

    this.scene.add( this.ambientLight );

    let geometry = new THREE.BoxGeometry(10, 10, 10);
    let material = new THREE.MeshPhongMaterial({
      color: 0x000000,
      emissive: 0x444444,
      wireframe: true
    });

    this.cube = new THREE.Mesh(geometry, material);

    this.scene.add( this.cube );
  }

  animate() {
    const self = this;
    this.cube.rotation.x += .01;
    this.cube.rotation.y += .02;
    requestAnimationFrame( () => {self.animate();});
    const delta = this.clock.getDelta();
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
  };
}
