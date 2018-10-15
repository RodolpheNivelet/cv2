'use strict';
import * as THREE from 'three';
import HexagonService from '../services/hexagon';
import TextService from '../services/text';
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

    this.text = TextService.getMesh(text, black, 10, 2);

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
