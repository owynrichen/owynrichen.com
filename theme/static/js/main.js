import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
import MeshFresnelMaterial from './MeshFresnelMaterial.js';

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
camera.position.set(-2.406457594935275, 0.9889572753700573, 1.1905678273701874);
camera.rotation.set(-0.7629815913278136, -1.0011452978707258, -0.6778778144120242, "XYZ");

// const helper = new THREE.CameraHelper( camera );
// scene.add( helper );

// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

const renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true, canvas } );
renderer.setAnimationLoop( animate );

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.update();

const clock = new THREE.Clock();

const radius = 6371;
const tilt = 0.41;
const rotationSpeed = 0.01;
const rotationBase = 110;

const cloudsScale = 1.01;

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

const earth = new THREE.Group();
const planeGroup = new THREE.Group();
planeGroup.name = "planes";
earth.add(planeGroup);

const planes = {};

{
    const starsGeometry = [ new THREE.BufferGeometry(), new THREE.BufferGeometry() ];

    const vertices1 = [];
    const vertices2 = [];

    const vertex = new THREE.Vector3();

    for ( let i = 0; i < 250; i ++ ) {

        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar( radius );

        vertices1.push( vertex.x, vertex.y, vertex.z );

    }

    for ( let i = 0; i < 1500; i ++ ) {

        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar( radius );

        vertices2.push( vertex.x, vertex.y, vertex.z );

    }

    starsGeometry[ 0 ].setAttribute( 'position', new THREE.Float32BufferAttribute( vertices1, 3 ) );
    starsGeometry[ 1 ].setAttribute( 'position', new THREE.Float32BufferAttribute( vertices2, 3 ) );

    const starsMaterials = [
        new THREE.PointsMaterial( { color: 0x9c9c9c } ),
        new THREE.PointsMaterial( { color: 0x838383 } ),
        new THREE.PointsMaterial( { color: 0x5a5a5a } )
    ];

    for ( let i = 10; i < 30; i ++ ) {

        const stars = new THREE.Points( starsGeometry[ i % 2 ], starsMaterials[ i % 3 ] );

        stars.rotation.x = Math.random() * 6;
        stars.rotation.y = Math.random() * 6;
        stars.rotation.z = Math.random() * 6;
        stars.scale.setScalar( i * 10 );

        stars.matrixAutoUpdate = false;
        stars.updateMatrix();

        scene.add( stars );

    }

    const light = new THREE.AmbientLight( 0x404040 , 0.4); // soft white light
    scene.add( light );

    const pointLight = new THREE.PointLight( 0xffffff, 3, 0, 0.25);
    pointLight.position.set(10,0,0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    console.log("loading earth...");

    const loader = new THREE.TextureLoader();
    const mapTexP = loader.loadAsync('/theme/3d/8081_earthmap4k.jpg');
    const bumpTexP = loader.loadAsync('/theme/3d/8081_earthbump4k.jpg');
    const specTexP = loader.loadAsync('/theme/3d/8081_earthspec4k.png');
    const mapNightTexP = loader.loadAsync('/theme/3d/8081_earthlights10k.jpg');
    const cloudTexP = loader.loadAsync('https://clouds.matteason.co.uk/images/4096x2048/clouds-alpha.png');

    const loadTexP = Promise.all([mapTexP, bumpTexP, specTexP, mapNightTexP, cloudTexP]);
    loadTexP.then(([mapTex, bumpTex, specTex, mapNightTex, cloudTex]) => {
        const sphere = new THREE.SphereGeometry(1, 64, 64);

        const earthMat = new THREE.MeshPhysicalMaterial({
            map: mapTex,
            bumpMap: bumpTex,
            bumpScale: 1.1,
            specularIntensity: 1,
            specularIntensityMap: specTex,
            roughness: 0.5,
            roughnessMap: specTex,
            metalness: 0.2,
            metalnessMap: specTex
        });

        // TODO: figure out the best way to show this on the dark side
        // probably a custom shader...
        const earthNightMat = new THREE.MeshBasicMaterial({
            map: mapNightTex,
            blending: THREE.AdditiveBlending
        })


        const cloudMat = new THREE.MeshPhysicalMaterial({
            map: cloudTex,
            alphaMap: cloudTex,
            // specularIntensityMap: cloudTex,
            transparent: true,
            opacity: 0.8,
            // blending: THREE.AdditiveBlending
        });

        const earthDay = new THREE.Mesh(sphere, earthMat);
        const earthNight = new THREE.Mesh(sphere, earthNightMat);
        earth.add(earthDay);
        // earth.add(earthNight);

        const clouds = new THREE.Mesh(sphere, cloudMat);
        clouds.scale.set(1.005, 1.005, 1.005);
        clouds.name = 'clouds';
        clouds.castShadow = true;
        earth.add(clouds);

        const atmosMat = new MeshFresnelMaterial();
        const earthAtmos = new THREE.Mesh(sphere, atmosMat);
        earthAtmos.scale.set(1.01, 1.01, 1.01);
        earth.add(earthAtmos);

        earth.position.set(-2, 0, 2);
        earth.rotation.y = rotationBase;
        earth.rotation.z = tilt;
        earth.name = 'earth';
        earth.receiveShadow = true;
        scene.add(earth);

        console.log("loaded earth");
    }
    )

    const textureFlare0 = loader.load( "/theme/3d/flare1.png" );
    const textureFlare1 = loader.load( "/theme/3d/flare2.png" );

    const lensflare = new Lensflare();

    lensflare.addElement( new LensflareElement( textureFlare0, 1024, 0 ) );
    lensflare.addElement( new LensflareElement( textureFlare1, 1024, 0 ) );

    pointLight.add( lensflare );
}


function latLongToVector3(latitude, longitude, radius, height) {
    var phi = (latitude)*Math.PI/180;
    var theta = (longitude-180)*Math.PI/180;

    var x = -(radius+height) * Math.cos(phi) * Math.cos(theta);
    var y = (radius+height) * Math.sin(phi);
    var z = (radius+height) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x,y,z);
}

function addPlane(plane, planegeo, planemat) {
    const planemesh = new THREE.Mesh(planegeo, planemat);
    planemesh.add(new THREE.AxesHelper(0.005));
    planemesh.name = plane["tail"];
    planemesh.castShadow = true;
    // planegeo.rotateX(90 * Math.PI / 180); // rotate cone to point to Z axis

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

    // Apply the quaternion to the object
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
fetch("https://api.owynrichen.com/").then((response) => {
    const resp_jsonP = response.json()
    resp_jsonP.then((resp_json) => {
        const p = resp_json["planes"];

        const planegeo = new THREE.ConeGeometry( 0.001, 0.002, 8 ); 
        const planemat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.4 });
        const n563vwmat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        console.log("fetched " + p.length + " planes.");

        let n563vw_flying = false;

        for(var i = 0; i < p.length; i++) {
            const plane = p[i];
            if (plane["tail"] == "N563VW") {
                n563vw_flying = true;
                addPlane(plane, planegeo, n563vwmat);
            } else {
                addPlane(plane, planegeo, planemat);
            }
        }

        if (!n563vw_flying) {
            console.log("n563vw on the ground");
            addPlane(n563vw_grounded, planegeo, n563vwmat)
        }

        planes["N563VW"]["mesh"].scale.multiplyScalar(2);
    
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
    // const planes = scene.getObjectByName("planes");

    if (earth != null) {
        // earth.rotation.y += (delta * rotationSpeed);
    }

    for(const [key, data] of Object.entries(planes)) {
        const mesh = data["mesh"];
        const vel = data["data"]["vel"] * 0.00001 * delta;
        let distance = data["distance"];
        distance += vel;
        const sphere = data["sphere"]
        const quaternion = new THREE.Quaternion().setFromEuler(mesh.rotation);
        const direction = new THREE.Vector3(0,0,1);
        direction.applyQuaternion(quaternion);

        // TODO: offset to 'hug' earth
        let newPosition = mesh.position.clone();
        newPosition.add(direction.multiplyScalar(vel));
        mesh.position.copy(sphere.clampPoint(newPosition, newPosition));

        const normal = mesh.position.clone().sub(new THREE.Vector3()).normalize(); // calculate normal vector
        const angle = mesh.position.angleTo(normal);
        mesh.rotateOnAxis(new THREE.Vector3(1,0,0), angle);
    }

    //console.log(camera);

	renderer.render( scene, camera );

}