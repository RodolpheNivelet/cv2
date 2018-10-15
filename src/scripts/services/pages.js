import * as THREE from 'three';
import HexagonService from './hexagon';
import App from '../../';

class PageService {

  constructor() {
    this.currentPage = 'home';
  }

  loadPage(page) {
    if (page) {

      const loader = new THREE.FileLoader();

      loader.load(
      	// resource URL
      	`/pages/${page}.json`,
      	// onLoad callback
      	text => {
          const data = JSON.parse(text);
          for (var i = 0; i < data.length; i++) {
            const entry = data[i];
            const hexagon = HexagonService.get(entry.x, entry.y);
            hexagon.backCap.addText(entry.text, true);
            hexagon.backCap.addImage(`/assets/icons/${entry.image}.png`);
          }
      	},

      	// onProgress callback
      	xhr => {

      	},

      	// onError callback
      	err => {
      		console.error( 'An error happened' );
      	}
      );
    }
  }

  changePage(target) {
    this.currentPage = target.link;

    if (target.link !== 'home') {
      this.loadPage(target.link);
    }

    const afterAnim = target.link === 'home' ? hex => {hex.cleanBack()} : undefined;

    HexagonService.animateAllFrom(target.hexagon, 200, HexagonService.flipped ? 'FlipBack': 'Flip', true, afterAnim);
    HexagonService.flipped = !HexagonService.flipped;

    const textMesh = App.textMesh;
    let animationName;
    let delay;
    if (target.link === 'home') {
      animationName = 'FadeIn';
      delay = 3000;
    } else {
      animationName = 'FadeOut';
      delay = 1;
    }
    setTimeout(() => {
      textMesh.clipAction.stop();
      textMesh.clipAction = textMesh.mixer.clipAction(THREE.AnimationClip.findByName(textMesh.animations, animationName));
      textMesh.clipAction.setLoop(THREE.LoopOnce);
      textMesh.clipAction.clampWhenFinished = true;
      textMesh.clipAction.play();
    }, delay);
  }

}
export default new PageService();
