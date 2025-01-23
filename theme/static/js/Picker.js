import * as THREE from 'three';

class Picker {
    constructor(camera, scene, renderer, enableHelper = false) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.intersects = [];
        this.enableHelper = enableHelper;

        if (enableHelper) {
            this.enableHelper();
        }

        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        this.renderer.domElement.addEventListener('click', this.onClick.bind(this), false);

        this.mouseMoveEvents = [];
        this.clickEvents = [];
    }

    enableHelper() {
        this.arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 1, 0xff0000);
        this.scene.add(this.arrowHelper);
        this.enableHelper = true;
    }

    disableHelper() {
        this.scene.remove(this.arrowHelper);
        this.enableHelper = false;
    }

    castRay() {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        if (this.enableHelper) {
            this.arrowHelper.setDirection(this.raycaster.ray.direction);
            this.arrowHelper.position.copy(this.raycaster.ray.origin);
        }
    }

    getIntersects() {
        this.intersects = this.raycaster.intersectObjects(this.scene.children, true);
        return this.intersects;
    }

    onMouseMove(event) {
        this.mouse.x = (event.offsetX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = - (event.offsetY / this.renderer.domElement.clientHeight) * 2 + 1;
        this.castRay();
        this.mouseMoveEvents.forEach((fn) => fn(event, this));
    }

    onClick(event) {
        this.castRay();
        this.getIntersects();
        this.clickEvents.forEach((fn) => fn(event, this));
    }
}

export { Picker };