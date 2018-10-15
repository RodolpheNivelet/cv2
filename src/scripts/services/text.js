'use strict';
import * as THREE from 'three';

class TextService {
  constructor() {

  }

  getMesh(text, black, width, height, textSize = 44) {
    const canvas = document.createElement('canvas');
    canvas.width = width*32;
    canvas.height = height*32;
    const canvasctx = canvas.getContext( '2d' );

    canvasctx.font = `${textSize}px Arial`;
    canvasctx.textAlign = 'center';
    canvasctx.textBaseline = 'middle';
    if (black) {
      canvasctx.fillStyle = '#444';
    } else {
      canvasctx.fillStyle = '#FFF';
      canvasctx.lineWidth = 3;
      canvasctx.strokeStyle = '#BBB';
    }
    canvasctx.strokeText(text, canvas.width/2, canvas.height/2);
    canvasctx.fillText(text, canvas.width/2, canvas.height/2);

    const texture = new THREE.Texture(canvas);
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      map: texture
    });
    material.map.needsUpdate = true;
    return new THREE.Mesh(geometry, material);
  }
}

export default new TextService();
