'use strict';
import * as THREE from 'three';
import HexagonService from '../services/hexagon';
import TransitionService from '../services/transition';
import { HEXAGON_RADIUS, HEXAGON_WIDTH, HEXAGON_HEIGHT } from '../constants';

import * as svgMesh3d from 'svg-mesh-3d';
import * as simplicialComplex from 'three-simplicial-complex';
const createGeomFrom3dMesh = simplicialComplex(THREE);

export default class {

  constructor(geo, material, depth, side, parent) {
    this.wrapper = new THREE.Object3D();
    this.mesh = new THREE.Mesh(geo, material);
    this.mesh.name = side;
    this.mesh.position.z = depth / 2;
    this.mesh.rotation.x = -Math.PI / 2;
    if (side === 'Back') {
      this.wrapper.rotation.y = Math.PI
    }
    this.mesh.face = this;
    this.wrapper.add(this.mesh);
    this.hexagon = parent;
  }

  addImage(imagePath) {
    const loader = new THREE.TextureLoader();

    const self = this;

    return new Promise(function(resolve, reject) {
      loader.load(

        imagePath,

        texture => {
          const geometry = new THREE.PlaneGeometry(8, 8);
          const material = new THREE.MeshBasicMaterial({
            transparent: true,
            map: texture
          });
          self.icon = new THREE.Mesh(geometry, material);
          self.wrapper.add(self.icon);
          resolve(texture);
        },
        progress => {

        },
        error => {
          console.error('Error on loading texture');
          reject('Error');
        }
      );
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

  addText(text, black) {

    const canvas = document.createElement('canvas');
    canvas.height = 128;
    canvas.width = 512;
    const canvasctx = canvas.getContext( '2d' );

    canvasctx.font = '50px Arial';
    canvasctx.textAlign = 'center';
    canvasctx.textBaseline = 'middle';
    if (black) {
      canvasctx.fillStyle = '#444';
    } else {
      canvasctx.fillStyle = '#FFF';
      canvasctx.lineWidth = 2;
      canvasctx.strokeStyle = '#DDD';
    }
    canvasctx.fillText(text, canvas.width/2, canvas.height/2);
    canvasctx.strokeText(text, canvas.width/2, canvas.height/2);

    const texture = new THREE.Texture(canvas);
    const geometry = new THREE.PlaneGeometry(10, 2.5);
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
      const vector = new THREE.Vector3(0, 0, this.hover ? 4.2 : 2);
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

  clean() {
    if (this.icon) {
      this.wrapper.remove(this.icon);
      delete this.icon;
    }

    if (this.text) {
      this.wrapper.remove(this.text);
      delete this.text;
    }
  }
}
