'use strict';
import * as THREE from 'three';
import HexagonService from '../services/hexagon';
import { HEXAGON_RADIUS, HEXAGON_WIDTH, HEXAGON_HEIGHT } from '../constants';

export default class {

  constructor(x, y, scene) {
    this.x = x;
    this.y = y;

    const depth = 3;

    if (!HexagonService.cylinderBG) {
      HexagonService.cylinderBG = new THREE.CylinderBufferGeometry(HEXAGON_RADIUS, HEXAGON_RADIUS, depth, 6, null, true);
    }
    const cylinderGeo = HexagonService.cylinderBG;

    if (!HexagonService.capBG) {
      let geo = HexagonService.capBG = new THREE.Geometry();
      var r = HEXAGON_RADIUS;

      for (var i=0; i<6; i++) {
        var a = (i+.5) * 1/6 * Math.PI * 2;
        var z = Math.sin(a);
        var x = Math.cos(a);
        var a1 = (i+1.5) * 1/6 * Math.PI * 2;
        var z1 = Math.sin(a1);
        var x1 = Math.cos(a1);
        geo.vertices.push(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(x*r, 0, z*r),
          new THREE.Vector3(x1*r, 0, z1*r)
        );
        geo.faces.push(new THREE.Face3(i*3, i*3+1, i*3+2));
        geo.faceVertexUvs[0].push([
          new THREE.Vector2(0.5, 0.5),
          new THREE.Vector2(x/2+0.5, z/2+0.5),
          new THREE.Vector2(x1/2+0.5, z1/2+0.5)
        ]);
      }
      geo.computeFaceNormals();

    }
    const capGeo = HexagonService.capBG;

    const sideMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      emissive: 0x444444
    });
    const faceMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      emissive: 0x444444
    });
    const backMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      emissive: 0x444444
    });

    let xPos = x * 1.05 * HEXAGON_WIDTH / 2;
    let yPos = y * 1.05 * HEXAGON_RADIUS * 1.5;

    this.cylinder = new THREE.Mesh(cylinderGeo, sideMaterial);
    this.cylinder.name = 'Side';
    this.faceCap = new THREE.Mesh(capGeo, faceMaterial);
    this.faceCap.name = 'Face';
    this.faceCap.position.y = depth / 2;
    this.faceCap.rotation.x = Math.PI;
    this.backCap = new THREE.Mesh(capGeo, backMaterial);
    this.backCap.name = 'Back';
    this.backCap.position.y = - depth / 2;

    this.mesh = new THREE.Object3D();
    this.mesh.rotation.set(Math.PI / 2, 0, 0);

    this.mesh.add(this.cylinder, this.faceCap, this.backCap);

    this.container = new THREE.Object3D();
    this.animator = new THREE.Object3D();
    this.container.position.set( xPos, yPos, 0 );

    const lvalue = (Math.abs(x) + Math.abs(y));

    this.faceCap.material.color = new THREE.Color().setHSL(0, 0, lvalue / 100);

    this.animator.add(this.mesh);
    this.container.add(this.animator);
    this.mesh.class = this;

    scene.add( this.container );
  }

  animate(clip, infinite, stayAtLastFrame, afterAnimation) {
    this.mixer = new THREE.AnimationMixer( this.animator );
    if (this.clipAction && this.clipAction.isRunning()) {
      this.clipAction.stop();
    }
    this.clipAction = this.mixer.clipAction( clip );
    if (!infinite) {
      this.clipAction.setLoop(THREE.LoopOnce);
    }
    if (stayAtLastFrame) {
      this.clipAction.clampWhenFinished = true;
    }
    this.clipAction.play();
    this.mixer.addEventListener('finished', () => {
      if (afterAnimation) {
        afterAnimation(this);
      }
    });
  }

}