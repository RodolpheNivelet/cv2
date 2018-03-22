import * as THREE from 'three';

class PageService {

  loadPage(page) {
    if (page) {

      const loader = new THREE.FileLoader();

      loader.load(
      	// resource URL
      	`/pages/${page}.json`,
      	// onLoad callback
      	data => {
      		// output the text to the console
      		console.log( data )
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
