import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const DEFAULT_DURATION = 4;
const DEFAULT_RADIUS = 1.25;

class TrackingCameraControls extends OrbitControls {
    constructor(camera, canvas, target, scene, enableHelper = false) {
        super(camera, canvas);

        this.sphere = new THREE.Sphere(target, DEFAULT_RADIUS);
        this.scene = scene;
        this.targetObject3D = new THREE.Object3D();
        this.targetObject3D0 = this.targetObject3D.clone();
        this.track = new THREE.CatmullRomCurve3([this.object.position]);
        this.track0 = this.track.clone();
        this.currentTime = 0;
        this.currentTime0 = 0;
        this.duration = DEFAULT_DURATION;
        this.duration0 = 0;
        this.moving = false;
        this.moving0 = false;
        this.rotationMatrix = new THREE.Matrix4();
        this.rotationMatrix0 = this.rotationMatrix.clone();
        this.targetQuaternion = new THREE.Quaternion();
        this.targetQuaternion0 = this.targetQuaternion.clone();

        this.trackingStarted = [];
        this.trackingFinished = [];

        this.enableHelper = enableHelper;
    }

    addTrackingStartedListener(listener) {
        this.trackingStarted.push(listener);
    }

    addTrackingFinishedListener(listener) {
        this.trackingFinished.push(listener);
    }

    drawCameraTrackSphereHelper() {
        if (this.enableHelper && this.cameraTrackSphereHelper === undefined) {
            const geometry = new THREE.SphereGeometry(DEFAULT_RADIUS, 32, 32);
            const wireframe = new THREE.WireframeGeometry(geometry);
            this.cameraTrackSphereHelper = new THREE.LineSegments(wireframe);
            // this.cameraTrackSphereHelper.material.depthTest = false;
            this.cameraTrackSphereHelper.material.opacity = 0.25;
            this.cameraTrackSphereHelper.material.transparent = true;
            this.cameraTrackSphereHelper.material.color.set(0x00ff00);
            this.cameraTrackSphereHelper.position.copy(this.target);
            this.scene.add(this.cameraTrackSphereHelper);
        }
    }

    drawHelper() {
        if (this.enableHelper) {
            this.clearHelper();
            const geometry = new THREE.BufferGeometry().setFromPoints(this.track.getPoints(50));
            const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
            this.trackHelper = new THREE.Line(geometry, material);
            this.scene.add(this.trackHelper);
            // this.drawCameraTrackSphereHelper();
        }
    }

    clearHelper() {
        // if (this.trackHelper)
        //     this.scene.remove(this.trackHelper);

        // if (this.cameraTrackSphereHelper)
        //     this.scene.remove(this.cameraTrackSphereHelper);
    }

    enableHelper() {
        this.enableHelper = true;
        this.drawHelper();
    }

    disableHelper() {
        this.enableHelper = false;
        this.clearHelper();
    }

    saveState() {
        super.saveState();
        this.track0 = this.track.clone();
        this.targetObject3D0 = this.targetObject3D.clone();
        this.currentTime0 = this.currentTime;
        this.duration0 = this.duration;
        this.moving0 = this.moving;
        this.rotationMatrix0 = this.rotationMatrix.clone();
        this.targetQuaternion0 = this.targetQuaternion.clone();
    }

    reset() {
        super.reset();
        this.track = this.track0.clone();
        this.targetObject3D = this.targetObject3D0.clone();
        this.currentTime = this.currentTime0;
        this.duration = this.duration0;
        this.moving = this.moving0;
        this.rotationMatrix = this.rotationMatrix0.clone();
        this.targetQuaternion = this.targetQuaternion0.clone();
    }

    lookAtPosition(targetVector3) {
        this.rotationMatrix.lookAt(targetVector3, this.object.position, this.object.up);
        this.targetQuaternion.setFromRotationMatrix(this.rotationMatrix);
        // this.target.set(targetVector3.x, targetVector3.y, targetVector3.z);
    }

    lookAtObject3D(targetObject3D) {
        this.targetObject3D = targetObject3D;

        if (this.targetObject3D) {
            const worldPosition = this.targetObject3D.getWorldPosition(new THREE.Vector3());
            this.lookAtPosition(worldPosition);
        }
    }

    trackTo(targetObject3D, getOffsetFunction = () => { return new THREE.Vector3() }, duration = 2) {
        if (this.moving) {
            return;
        }

        this.track0 = this.track.clone();
        const start = this.object.position.clone();
        // const end = targetObject3D.getWorldPosition(getOffsetFunction());
        const end = targetObject3D.position.clone();
        const mid = start.clone().lerp(end, 0.5);
        console.log(`trackTo: ${start.toArray()}, ${mid.toArray()} ${end.toArray()}`);
        this.track = new THREE.CatmullRomCurve3([start, mid, end]);
        this.lookAtObject3D(targetObject3D);
        this._startTracking(duration);
    }

    _startTracking(duration = DEFAULT_DURATION) {
        console.log(`startTracking: ${duration}`);
        this.duration = duration;
        this.currentTime = 0;
        this.moving = true;
        this.drawHelper();

        this.trackingStarted.forEach((listener) => {
            listener(this);
        });
    }

    _finishTracking() {
        console.log('finishTracking');
        this.moving = false;
        this.currentTime = this.duration;
        this.target = this.targetCenter.clone();
        // this.target.set(this.targetObject3D.position.x, this.targetObject3D.position.y, this.targetObject3D.position.z);
        this.clearHelper();

        this.trackingFinished.forEach((listener) => {
            listener(this);
        });
    }

    _rotateTowardsTarget(delta) {
        if (this.object === undefined || this.targetQuaternion === undefined)
            return;

        if (delta === undefined)
            delta = 0;

        if (! this.object.quaternion.equals(this.targetQuaternion))
            this.object.quaternion.rotateTowards(this.targetQuaternion, this.duration * delta);
    }

    update(delta) {
        if (delta === undefined)
            delta = 0;

        if (this.moving) {
            this.currentTime += delta;
            if (this.currentTime >= this.duration) {
                this._finishTracking();
            }

            // console.log(`currentTime: ${this.currentTime} delta: ${delta} duration: ${this.duration} object: ${this.object.position.toArray()}`);
            this.object.position.copy(this.track.getPointAt(this.currentTime / this.duration));
        }

        this._rotateTowardsTarget(delta);

        super.update(delta);
    }
}

export { TrackingCameraControls };