import * as THREE from 'three';


class TransitionService {
  smoothTo(elem, attr, to, delta) {
    let elemAttr = elem[attr];
    if (elemAttr) {
      const currentPos = elemAttr.clone();
      to.sub(currentPos);
      const multiplayValue = delta * 4;
      to.multiply(new THREE.Vector3(multiplayValue, multiplayValue, multiplayValue));
      currentPos.add(to);
      elem[attr].set(currentPos.x, currentPos.y, currentPos.z);
    }
  }
}
export default new TransitionService();
