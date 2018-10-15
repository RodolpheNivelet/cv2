'use strict';
import * as THREE from 'three';
import HexagonService from '../services/hexagon';
import HexagonfaceClass from './hexagonface';
import TransitionService from '../services/transition';
import { HEXAGON_RADIUS, HEXAGON_WIDTH, HEXAGON_HEIGHT } from '../constants';

import * as svgMesh3d from 'svg-mesh-3d';
import * as simplicialComplex from 'three-simplicial-complex';
const createGeomFrom3dMesh = simplicialComplex(THREE);

export default class {

  constructor(x, y, scene) {
    this.mixers = {};
    this.clipActions = {};
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
      color: 0xDDDDDD
    });
    const material = new THREE.MeshPhongMaterial({
      color: 0xF5F5F5
    });

    let xPos = x * HEXAGON_WIDTH * 1.012 / 2;
    let yPos = y * HEXAGON_RADIUS * 1.012 * 1.5;

    this.cylinder = new THREE.Mesh(cylinderGeo, sideMaterial);
    this.cylinder.name = 'Side';
    this.faceCap = new HexagonfaceClass(capGeo, material.clone(), depth, 'Face', this);
    this.backCap = new HexagonfaceClass(capGeo, material.clone(), depth, 'Back', this);

    this.mesh = new THREE.Object3D();
    this.cylinder.rotation.set(Math.PI / 2, 0, 0);

    this.mesh.add(this.cylinder, this.faceCap.wrapper, this.backCap.wrapper);

    this.container = new THREE.Object3D();
    this.animator = new THREE.Object3D();
    this.wrapper = new THREE.Object3D();
    this.container.position.set( xPos, yPos, 0 );

    const lvalue = (Math.abs(x) + Math.abs(y));

    this.faceCap.mesh.material.color = new THREE.Color().setHSL(0, 0, Math.max(1 - lvalue / 150, 0));

    this.wrapper.add(this.mesh);
    this.animator.add(this.wrapper);
    this.container.add(this.animator);

    this.cylinder.hexagon = this;
    this.faceCap.mesh.hexagon = this;
    this.backCap.mesh.hexagon = this;

    scene.add( this.container );
  }

  animate(clip, infinite, stayAtLastFrame, afterAnimation, element = 'animator') {
    const mixer = this.mixers[element] = new THREE.AnimationMixer( this[element] );
    let clipAction = this.clipActions[element];
    if (clipAction && clipAction.isRunning()) {
      clipAction.stop();
    }
    clipAction = this.clipActions[element] = mixer.clipAction( clip );
    if (!infinite) {
      clipAction.setLoop(THREE.LoopOnce);
    }
    if (stayAtLastFrame) {
      clipAction.clampWhenFinished = true;
    }
    clipAction.play();
    mixer.addEventListener('finished', () => {
      delete this.mixers[element];
      if (afterAnimation) {
        afterAnimation(this);
      }
    });
  }

  cleanBack() {
    if (!this.noBackClean) {
      this.backCap.clean();
    }
  }

}
