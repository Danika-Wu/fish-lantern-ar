AFRAME.registerComponent("fish-lantern-motion", {
  init() {
    this.tail = this.el.querySelector("#tailPivot");
    this.dorsal = this.el.querySelector("#dorsalPivot");
    this.lower = this.el.querySelector("#lowerPivot");
    this.front = this.el.querySelector("#frontPivot");
    this.head = this.el.querySelector("#headPivot");
    this.eye = this.el.querySelector("#eyeLayer");
  },
  tick(time) {
    const released = document.body.dataset.phase === "released";
    const cracked = document.body.dataset.phase === "cracked";
    const intensity = { restrained: 0.62, poetic: 1, intense: 1.45 }[document.body.dataset.intensity] || 1;
    const wave = Math.sin(time / (released ? 310 : 1050));
    const slow = Math.sin(time / 980);
    const degrees = THREE.MathUtils.degToRad;

    this.tail.object3D.rotation.z = degrees(wave * (released ? 8.5 : 1.2) * intensity);
    this.front.object3D.rotation.z = degrees(-wave * (released ? 11 : 1.1) * intensity);
    this.lower.object3D.rotation.z = degrees(slow * (released ? 8 : 0.8) * intensity);
    this.dorsal.object3D.rotation.z = degrees(slow * (released ? 4.5 : 0.5) * intensity);
    this.head.object3D.rotation.z = degrees(slow * (released ? 1.7 : 0.35) * intensity);
    this.el.object3D.position.y = released ? Math.sin(time / 1150) * 0.015 * intensity : 0;
    this.el.object3D.position.x = released ? Math.sin(time / 1680) * 0.012 * intensity : 0;

    const eyeScale = released ? 1 + (Math.sin(time / 360) + 1) * 0.04 : cracked ? 1.035 : 1;
    this.eye.object3D.scale.set(eyeScale, eyeScale, eyeScale);
  },
});
