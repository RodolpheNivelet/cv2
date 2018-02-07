class TransitionService {
  smoothTo(elem, attr, to, delta) {
    let elemAttr = elem[attr];
    if (elemAttr) {
      const currentPos = elemAttr.clone();
      const sub = to.sub(currentPos);
      elem[attr].set(sub.x * delta * 3, sub.y * delta * 3, sub.z * delta * 3);
    }
  }
}
export default new TransitionService();
