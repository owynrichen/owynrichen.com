import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import Starfield from './Starfield.js';
import Earth from './Earth.js';
import Sun from './Sun.js';

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width  = Math.floor( canvas.clientWidth  * pixelRatio );
    const height = Math.floor( canvas.clientHeight * pixelRatio );
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

// init

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0x000000, 0.00000025 );

const canvas = document.querySelector('#c');

const camera = new THREE.PerspectiveCamera( 70, canvas.clientWidth / canvas.clientHeight, 0.01, 1e7 );
camera.position.set(-2.5906304864660354, 0.6315778092534803, 1.0078201455690863);
camera.rotation.set(-1.7502224774749415, -1.257885472271306, -1.7591697371977346, "XYZ");

// const helper = new THREE.CameraHelper( camera );
// scene.add( helper );

// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

const renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true, canvas } );
renderer.setAnimationLoop( animate );

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.update();
controls.addEventListener('change', (e) => {
    console.log(camera);
});

const clock = new THREE.Clock();

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

const starfield = new Starfield(6000);
scene.add(starfield);

const earth = new Earth();
scene.add(earth);

const sun = new Sun();
scene.add(sun);

const planeGroup = new THREE.Group();
planeGroup.name = "planes";
earth.add(planeGroup);

const planes = {};


function latLongToVector3(latitude, longitude, radius, height) {
    var phi = (latitude)*Math.PI/180;
    var theta = (longitude-180)*Math.PI/180;

    var x = -(radius+height) * Math.cos(phi) * Math.cos(theta);
    var y = (radius+height) * Math.sin(phi);
    var z = (radius+height) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x,y,z);
}

function addPlane(plane, planegeo, planemat) {
    const planemesh = new THREE.InstancedMesh(planegeo, planemat);
    return addPlaneFromObject3D(planemesh);
}

function addPlaneFromObject3D(plane, planemesh) {
    // planemesh.add(new THREE.AxesHelper(5));
    planemesh.name = plane["tail"];
    planemesh.castShadow = true;
    planemesh.receiveShadow = true;

    const sphere = new THREE.Sphere(new THREE.Vector3(), 1 + plane["alt"] * 0.000005);
    const position = latLongToVector3(plane["lat"], plane["lon"], 1, plane["alt"] * 0.000005);
    planemesh.position.set(position.x, position.y, position.z);
    
    // setup to 'fly' on earth curve
    const normal = planemesh.position.clone().sub(new THREE.Vector3()).normalize(); // calculate normal vector
    let quaternion = new THREE.Quaternion(); // do quaternion math and convert to Euler units
    quaternion.setFromUnitVectors(planemesh.up, normal);
    let euler = new THREE.Euler();
    euler.setFromQuaternion(quaternion);
    planemesh.rotation.setFromVector3(euler);

    // now rotate around the Y axis based on the plane's track
    // Create a quaternion for the rotation
    let track = plane["track"]
    let trackQ = new THREE.Quaternion();
    trackQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), track * Math.PI / 180);

    // // Apply the quaternion to the object
    planemesh.quaternion.multiply(trackQ);

    planes[plane["tail"]] = {
        data: plane,
        mesh: planemesh,
        dist: 0,
        startPosition: position,
        sphere: sphere
    };

    planeGroup.add(planemesh);
    console.log("added " + plane["tail"]);
}

console.log("fetching planes...")
// fetch("http://127.0.0.1:8787/").then((response) => {
fetch("https://api.owynrichen.com/").then((response) => {
    const resp_jsonP = response.json()
    resp_jsonP.then((resp_json) => {
        const p = resp_json["planes"];

        const gltfLoader = new GLTFLoader();
        gltfLoader.load('/theme/3d/low_poly_jet2/scene.gltf', (gltf) => {
            const planeObjectScene = gltf.scene;
            const meshes = planeObjectScene.getObjectsByProperty("isMesh", true);
            // const geometries = []
            // meshes.forEach(mesh => {
            //     mesh.updateMatrixWorld(true);

            //     const geo = mesh.geometry.clone();
            //     geo.applyMatrix4(mesh.matrixWorld);
            //     geometries.push(geo);
            // });
            // const geometry = BufferGeometryUtils.mergeGeometries(geometries);
            // planeObject3D.scale.multiplyScalar(0.0001);
            // const planegeo = new THREE.ConeGeometry( 0.001, 0.002, 8 ); 
            // planegeo.rotateX(90 * Math.PI / 180); // rotate cone to point to Z axis
            const planemat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.4 });
            const n563vwmat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            // const planeObject3D = new THREE.InstancedMesh(geometry, planemat, p.length);
            // const planeObject3D = meshes[0];
            // planeObject3D.material = planemat;
            // planeObject3D.geometry.rotateX(90 * Math.PI/180);
            // planeObject3D.geometry.rotateY(90 * Math.PI / 180);
            const planeObject3D = meshes[0];
            planeObject3D.material = planemat;

            planeObject3D.scale.multiplyScalar(0.00015);
    
            console.log("fetched " + p.length + " planes.");
    
            let n563vw_flying = false;
    
            for(var i = 0; i < p.length; i++) {
                const plane = p[i];
                if (plane["tail"] == "N563VW") {
                    n563vw_flying = true;
                    addPlaneFromObject3D(plane, planeObject3D.clone());
                } else {
                    addPlaneFromObject3D(plane, planeObject3D.clone());
                }
            }
    
            if (!n563vw_flying) {
                console.log("n563vw on the ground");
                addPlaneFromObject3D(n563vw_grounded, planeObject3D.clone());
            }
    
            planes["N563VW"]["mesh"].scale.multiplyScalar(2);
        });
    
        console.log("planes fetched");
    })
}, (error) => {
    console.log("error fetching planes");
    console.log(error);
});

// animation

function animate( time ) {

    // const delta = time / 20000;
    const delta = clock.getDelta();

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    const earth = scene.getObjectByName("earth");

    if (earth != null) {
        // earth.rotation.y += (delta * rotationSpeed);
    }

    for(const [key, data] of Object.entries(planes)) {
        const mesh = data["mesh"];
        const vel = data["data"]["vel"] * 0.00001 * delta;
        let distance = data["distance"];
        distance += vel;
        data["distance"] = distance;
        
        // fly in the direction of the plane heading by
        // setting the rotation to maintain the track direction
        const sphere = data["sphere"]
        const quaternion = new THREE.Quaternion().setFromEuler(mesh.rotation);
        const direction = new THREE.Vector3(0,0,1);
        direction.applyQuaternion(quaternion);

        // set the new position in the direction, clamping
        // to the radius of the altitude
        let newPosition = mesh.position.clone();
        newPosition.add(direction.multiplyScalar(vel));
        mesh.position.copy(sphere.clampPoint(newPosition, newPosition));

        // setup to 'fly' on earth curve
        const normal = mesh.position.clone().sub(new THREE.Vector3()).normalize(); // calculate normal vector
        let normalQ = new THREE.Quaternion(); // do quaternion math and convert to Euler units
        normalQ.setFromUnitVectors(mesh.up, normal);
        let euler = new THREE.Euler();
        euler.setFromQuaternion(normalQ);
        mesh.rotation.setFromVector3(euler);

        // now rotate around the Y axis based on the plane's track
        // Create a quaternion for the rotation
        let track = data["data"]["track"]
        let trackQ = new THREE.Quaternion();
        trackQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), track * Math.PI / 180);

        // // Apply the quaternion to the object
        mesh.quaternion.multiply(trackQ);
        const pos = mesh.position;
        const rot = mesh.rotation;
        // console.log(`${mesh.name} ${pos.x},${pos.y},${pos.z} | ${rot.x},${rot.y},${rot .z} - ${normal.x},${normal.y},${normal.z}`);
    }

    //console.log(camera);

	renderer.render( scene, camera );

}