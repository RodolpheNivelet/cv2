'use strict';
import * as THREE from 'three';
import HexagonService from '../services/hexagon';
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
    const faceMaterial = new THREE.MeshPhongMaterial({
      color: 0x444444
    });
    const backMaterial = new THREE.MeshPhongMaterial({
      color: 0x444444
    });

    let xPos = x * HEXAGON_WIDTH * 1.012 / 2;
    let yPos = y * HEXAGON_RADIUS * 1.012 * 1.5;

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
    this.wrapper = new THREE.Object3D();
    this.container.position.set( xPos, yPos, 0 );

    const lvalue = (Math.abs(x) + Math.abs(y));

    this.faceCap.material.color = new THREE.Color().setHSL(0, 0, Math.max(1 - lvalue / 150, 0));

    this.wrapper.add(this.mesh);
    this.animator.add(this.wrapper);
    this.container.add(this.animator);
    this.mesh.class = this;

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

  addIcon(svg) {
    const mesh = svgMesh3d(svg.icon[4]);

    const geometry = createGeomFrom3dMesh(mesh);

    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: 0xFFFFFF
    });

    const threeMesh = new THREE.Mesh(geometry, material);

    threeMesh.position.z = 1;
    threeMesh.scale.set(3, 3, 3);

    this.icon = threeMesh;

    this.wrapper.add(threeMesh);
  }

  addText(text) {

    const canvas = document.createElement('canvas');
    canvas.height = 256;
    canvas.width = 256;
    const canvasctx = canvas.getContext( '2d' );

    canvasctx.font = '30px Arial';
    canvasctx.textAlign = 'center';
    canvasctx.textBaseline = 'middle';
    canvasctx.fillStyle = '#FFF';
    canvasctx.fillText(text, canvas.width/2, canvas.height/2);
    canvasctx.lineWidth = 1;
    canvasctx.strokeStyle = '#DDD';
    canvasctx.strokeText(text, canvas.width/2, canvas.height/2);

    const texture = new THREE.Texture(canvas);
    const geometry = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      map: texture
    });
		material.map.needsUpdate = true;
    this.text = new THREE.Mesh(geometry, material);

    this.wrapper.add(this.text);

  }

  trailingAnimation(delta) {
    if (this.icon) {
      const vector = new THREE.Vector3(0, 0, this.hover ? 4 : 1.6);
      TransitionService.smoothTo(this.icon, 'position', vector, delta);
    }
    if (this.text) {
      const vector = new THREE.Vector3(0, this.hover ? -6 : -4, this.hover ? 4 : 1);
      TransitionService.smoothTo(this.text, 'position', vector, delta);
      const scaleVal = this.hover ? 2 : 0;
      const scale = new THREE.Vector3(scaleVal, scaleVal, scaleVal);
      TransitionService.smoothTo(this.text, 'scale', scale, delta);
    }
  }

}
