import * as THREE from 'three';
import Hexagon from '../classes/hexagon.js';
import { HEXAGON_RADIUS } from '../constants';

class HexagonService {

  constructor() {
    this.hexagons = [];

    this.posKeyframes = new THREE.VectorKeyframeTrack( '.position', [0, 1, 2], [0, 0, 0, 0, 0, 14, 0, 0, 0], THREE.InterpolateSmooth );
    const yAxis = new THREE.Vector3( 0, 1, 0 );
    var qInitial = new THREE.Quaternion().setFromAxisAngle( yAxis, 0 );
		var qMiddle = new THREE.Quaternion().setFromAxisAngle( yAxis, Math.PI / 2 );
		var qFinal = new THREE.Quaternion().setFromAxisAngle( yAxis, Math.PI );
    this.flipKeyframes = new THREE.QuaternionKeyframeTrack( '.quaternion',
    [.5, 1, 1.5],
    [
      qInitial.x, qInitial.y, qInitial.z, qInitial.w,
      qMiddle.x, qMiddle.y, qMiddle.z, qMiddle.w,
      qFinal.x, qFinal.y, qFinal.z, qFinal.w
    ],
    THREE.InterpolateSmooth );
    this.flipbackKeyframes = new THREE.QuaternionKeyframeTrack( '.quaternion',
    [.5, 1, 1.5],
    [
      qFinal.x, qFinal.y, qFinal.z, qFinal.w,
      qMiddle.x, qMiddle.y, qMiddle.z, qMiddle.w,
      qInitial.x, qInitial.y, qInitial.z, qInitial.w
    ],
    THREE.InterpolateSmooth );
    this.clips = [
      new THREE.AnimationClip('Bounce', 2, [this.posKeyframes] ),
      new THREE.AnimationClip('Flip', 2, [this.posKeyframes, this.flipKeyframes] ),
      new THREE.AnimationClip('FlipBack', 2, [this.posKeyframes, this.flipbackKeyframes] )
    ];
  }

  getClip(clipName) {
    return THREE.AnimationClip.findByName( this.clips, clipName );
  }

  create(x, y, scene) {
    const hex = new Hexagon(x, y, scene);
    this.hexagons.push( hex );
  }

  getAllMeshs() {
    return this.hexagons.map(d => d.mesh);
  }

  targetedHexagon(raycaster, scene) {
    const intersects = raycaster.intersectObjects( scene.children, true );
    for (var i = 0; i < intersects.length; i++) {
      const intersect = intersects[i];
      if (intersect && intersect.object instanceof THREE.Mesh) {
        const name = intersect.object.name;
        if (name === 'Face' || name === 'Back' || name === 'Side') {
          return intersect.object.parent.class;
        }
      }
    }
  };

  appendGrid(xSize, ySize, scene) {
    for (let i = -xSize; i <= xSize; i++) {
      for (let j = -ySize; j <= ySize; j++) {
        if (Math.abs(i) % 2 === Math.abs(j) % 2) {
          this.create(i, j, scene);
        }
      }
    }
    this.textureBlocks();
  }

  findSurrounding(hex) {
    const toReturn = [];
    for (const hexagon of this.hexagons) {
      const xDist = Math.abs(hex.x - hexagon.x);
      const yDist = Math.abs(hex.y - hexagon.y);
      if ((xDist === 2 && yDist === 0) || xDist === 1 && yDist === 1) {
        toReturn.push(hexagon);
      }
    }
    return toReturn;
  }

  get(x, y) {
    for (const hexagon of this.hexagons) {
      if (hexagon.x === x && hexagon.y === y) {
        return hexagon;
      }
    }
  }

  randomAnimation(hex) {
    const duration = (Math.random() + .5) * 5;
    const whereTo = (Math.random() - .5) * 3;
    const posKeyframes = new THREE.VectorKeyframeTrack(
      '.position',
      [0, duration/2, duration],
      [0, 0, 0, 0, 0, whereTo, 0, 0, 0],
      THREE.InterpolateSmooth );
    const posClip = new THREE.AnimationClip('Random', duration, [posKeyframes] );
    hex.animate(posClip, true, null, null, 'mesh');
  }

  animateAllFrom(hex, speed = 200, clipName, stayAtLastFrame, afterAnimation) {
    this.animateAll([hex], speed, clipName, stayAtLastFrame, afterAnimation);
  }

  animateAll(toAnimate, speed, clipName, stayAtLastFrame, afterAnimation) {
    const animatedHex = [];
    const self = this;
    function animateRecursive(toAnimate) {
      if (self.hexagons > animatedHex && toAnimate.length) {
        let nextToanimate = [];
        for (let hex of toAnimate) {
          if (animatedHex.indexOf(hex) === -1) {
            const clip = self.getClip(clipName);
            hex.animate(clip, false, stayAtLastFrame, afterAnimation);
            animatedHex.push(hex);
            const surrounding = self.findSurrounding(hex);
            nextToanimate = nextToanimate.concat(surrounding);
          }
        }
        setTimeout(() => {
          animateRecursive(nextToanimate);
        }, speed);
      }
    }
    animateRecursive(toAnimate);
  }

  playAnimation(delta) {
    if (this.hexagons) {
      for (const hex of this.hexagons) {
        if (hex.mixers) {
          for (var x in hex.mixers) {
            if (hex.mixers.hasOwnProperty(x)) {
              const mixer = hex.mixers[x];
              mixer.update(delta);
            }
          }
        }
      }
    }
  }

  textureBlocks() {
    var loader = new THREE.TextureLoader();

    const self = this;

    loader.load(
    	// resource URL
    	require('../../assets/me.jpg'),

    	// onLoad callback
      texture => {
        texture.rotation
        self.get(0, 2).faceCap.material = new THREE.MeshPhongMaterial({
          color: 0xFFFFFF,
          emissive: 0x000000,
          map: texture,
          bumpMap: texture
        });

        // self.get(-4, 0).faceCap.material = new THREE.MeshPhongMaterial({
        //   color: 0xEF2e57
        // });
        //
        // self.get(-2, 0).faceCap.material = new THREE.MeshPhongMaterial({
        //   color: 0x2fedc9
        // });
        //
        // self.get(2, 0).faceCap.material = new THREE.MeshPhongMaterial({
        //   color: 0x2f1ce4
        // });
        //
        // self.get(4, 0).faceCap.material = new THREE.MeshPhongMaterial({
        //   color: 0x1dfc9f
        // });
    	},

    	// onProgress callback currently not supported
    	undefined,

    	// onError callback
    	function () {
    		console.error( 'An error happened.' );
    	}
    );
  }

}
export default new HexagonService();
