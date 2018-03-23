import * as THREE from 'three';
import HexagonService from './hexagon';

class PageService {

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

}
export default new PageService();
