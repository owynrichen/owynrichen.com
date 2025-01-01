import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { gsap } from 'gsap';

// scale down the altitude to a reasonable size
const ALT_FACTOR = 0.000005;
// scale down the velocity to a reasonable size
const VELOCITY_FACTOR = 0.00001;
// scale down the mesh
const MESH_SCALE = 0.00015;

const gltfLoader = new GLTFLoader();
const planeGLTF = await gltfLoader.loadAsync('/theme/3d/low_poly_jet2/scene.gltf');
const meshes = planeGLTF.scene.getObjectsByProperty("isMesh", true);
const planeMesh = meshes[0];

class Plane extends THREE.Mesh {
    static material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x770033,
        emissiveIntensity: 0.4,
        roughness: 0.5,
        transparent: true,
        opacity: 0
    });

    constructor(data, material = Plane.material) {
        super();
        this.copy(planeMesh, true);
        this.isPlane = true;

        this.material = material;
        this.highlighted = false;

        this.data = data;

        this.tail = data["tail"];
        this.name = data["tail"];
        // this.castShadow = true;
        // this.receiveShadow = true;
        this.visible = false;
        this.distance = 0;
        this.velocity = data["vel"];
        this.track = data["track"];
        this.altitude = data["alt"];

        this.sphere = new THREE.Sphere(new THREE.Vector3(), 1 + this.altitude * ALT_FACTOR);
        const position = this.latLongToVector3(this.data["lat"], this.data["lon"], 1, this.data["alt"] * ALT_FACTOR);
        this.position.set(position.x, position.y, position.z);
        this.scale.multiplyScalar(MESH_SCALE);

        this.startPosition = position.clone();

        this.orientToTrackAndAltitude();

        this.tween = gsap.to(this.material, { opacity: 0, duration: 0, delay: 2, onComplete: () => {
            this.visible = true;
            gsap.to(this.material, {opacity: 1, duration: 4});
        }})
    }

    latLongToVector3(latitude, longitude, radius, height) {
        var phi = (latitude)*Math.PI/180;
        var theta = (longitude-180)*Math.PI/180;

        var x = -(radius+height) * Math.cos(phi) * Math.cos(theta);
        var y = (radius+height) * Math.sin(phi);
        var z = (radius+height) * Math.cos(phi) * Math.sin(theta);

        return new THREE.Vector3(x,y,z);
    }

    vector3ToLatLong(vector3) {
        // TODO: unit test this
        const radius = vector3.length();
        const phi = Math.acos(vector3.y / radius);
        const theta = Math.atan2(vector3.z, vector3.x);

        const latitude = phi * 180 / Math.PI;
        const longitude = (theta * 180 / Math.PI) + 180;

        return { latitude, longitude, radius };
    }

    highlight(duration = 1) {
        if (this.highlighted) return;

        console.log(`highlighted: ${this.data["tail"]} ${this.position.toArray()}`);
        this.highlighted = true;
        this.scaleBackup = this.scale.clone();
        this.scale.multiplyScalar(3);
        this.materialBackup = this.material;
        this.material = this.material.clone();
        this.material.emissive.setHex(0xffffff);
        this.material.emissiveIntensity = 1;
        const bColor = this.materialBackup.emissive;
        gsap.to(this.material.emissive, {r: bColor.r, g: bColor.g, b: bColor.b, duration: duration});
        gsap.to(this.scale, {x: this.scaleBackup.x, y: this.scaleBackup.y, z: this.scaleBackup.z, duration: duration});
        gsap.to(this.material, {emissiveIntensity: this.materialBackup.emissiveIntensity, duration: duration});
        gsap.to(this, {highlighted: false, duration: duration, delay: 1, onComplete: () => {
            console.log(`highlighted complete ${this.data["tail"]}`) ;
            this.material = this.materialBackup;
            this.highlighted = false;
        }});
    }

    getPointAtAltitudeAbove(altitude) {
        const normal = this.position.clone().sub(new THREE.Vector3()).normalize();
        return normal.multiplyScalar(altitude * ALT_FACTOR);
    }

    orientToTrackAndAltitude() {
        // setup to 'fly' on earth curve
        const normal = this.position.clone().sub(new THREE.Vector3()).normalize(); // calculate normal vector from the unit sphere
        let quaternion = new THREE.Quaternion(); // do quaternion math and convert to Euler units
        quaternion.setFromUnitVectors(this.up, normal);
        let euler = new THREE.Euler();
        euler.setFromQuaternion(quaternion);
        this.rotation.setFromVector3(euler);

        // now rotate around the Y axis based on the plane's track
        // Create a quaternion for the rotation
        let trackQ = new THREE.Quaternion();
        trackQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.track * Math.PI / 180);

        // // Apply the quaternion to the object
        this.quaternion.multiply(trackQ);
    }

    flyHeading(delta) {
        const vel = this.velocity * VELOCITY_FACTOR * delta;
        this.distance += vel;

        // fly in the direction of the plane heading by
        // setting the rotation to maintain the track direction
        const quaternion = new THREE.Quaternion().setFromEuler(this.rotation);
        const direction = new THREE.Vector3(0,0,1);
        direction.applyQuaternion(quaternion);

        // set the new position in the direction, clamping
        // to the radius of the altitude
        let newPosition = this.position.clone();
        newPosition.add(direction.multiplyScalar(vel));
        this.position.copy(this.sphere.clampPoint(newPosition, newPosition));

        this.orientToTrackAndAltitude();
    }
}

class PlaneN563VW extends Plane {
    static material = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.4,
        roughness: 0.5,
        transparent: true,
        opacity: 0
    });

    constructor(data) {
        super(data, PlaneN563VW.material);
        this.scale.multiplyScalar(3);
    }
}

class PlaneN563VWGrounded extends PlaneN563VW {
    constructor() {
        const khio = { "lat": 45.5348093, "lon": -122.9498132 }
        const n563vw_grounded = {
            "tail" : "N563VW",
            "lat" : khio["lat"],
            "lon" : khio["lon"],
            "alt" : 250,
            "vel" : 0,
            "track" : 180,
            "vvel" : 0
        }

        super(n563vw_grounded);
    }
}

class Planes extends THREE.Group {
    constructor() {
        super();

        this.planes = {};
    }

    loadPlanes(onComplete = () => {}) {
        const scope = this;

        console.log("fetching planes...")
        // fetch("http://127.0.0.1:8787/").then((response) => {
        fetch("https://api.owynrichen.com/").then((response) => {
            const resp_jsonP = response.json()
            resp_jsonP.then((resp_json) => {
                const p = resp_json["planes"];
                let n563vw_flying = false;

                for(var i = 0; i < p.length; i++) {
                    const planeData = p[i];
                    if (planeData["tail"] == "N563VW") {
                        n563vw_flying = true;
                        scope.addPlane(new PlaneN563VW(planeData));
                    } else {
                        scope.addPlane(new Plane(planeData))
                    }
                }

                if (!n563vw_flying) {
                    console.log("n563vw on the ground");
                    scope.addPlane(new PlaneN563VWGrounded());
                }

                console.log("planes fetched");
                onComplete();
            });
        }, (error) => {
            console.log("error fetching planes");
            console.log(error);
        });
    }

    addPlane(plane) {
        this.planes[plane.tail] = plane;
        this.add(plane);
    }

    flyHeadings(delta) {
        for (const [tail,plane] of Object.entries(this.planes)) {
            plane.flyHeading(delta);
        }
    }

    getRandomPlane() {
        const keys = Object.keys(this.planes);
        return this.planes[keys[ keys.length * Math.random() << 0]];
    }
}

export { Planes, Plane, PlaneN563VW, PlaneN563VWGrounded };