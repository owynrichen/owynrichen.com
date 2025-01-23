import * as THREE from 'three';
import { Starfield } from './Starfield.js';
import { Earth } from './Earth.js';
import { Sun } from './Sun.js';
import { Planes, Plane } from './Planes.js';
import { Picker } from './Picker.js';
import { TrackingCameraControls } from './TrackingCameraControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js'
import { gsap } from 'gsap';

const fxaaPass = new ShaderPass(FXAAShader);

function resizeRendererToDisplaySize(renderer, camera, composer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width  = Math.floor( canvas.clientWidth  * pixelRatio );
    const height = Math.floor( canvas.clientHeight * pixelRatio );
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        composer.setSize(width, height);

        fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / width;
        fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / height;
    }
    return needResize;
}

// init

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0x000000, 0.00000025 );

const canvas = document.querySelector('#c');


const camera = new THREE.PerspectiveCamera( 70, canvas.clientWidth / canvas.clientHeight, 0.01, 1e7 );
camera.position.set(-20, 10, -10);
// camera.position.set(-2.5906304864660354, 0.6315778092534803, 1.0078201455690863);
// camera.rotation.set(-1.7502224774749415, -1.257885472271306, -1.7591697371977346, "XYZ");

const renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true, canvas } );
renderer.toneMapping = THREE.ReinhardToneMapping;
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setAnimationLoop( animate );

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );
composer.addPass( new UnrealBloomPass( new THREE.Vector2( canvas.clientWidth, canvas.clientHeight ), 1, 1, 1 ) );
composer.addPass( new OutputPass() );
composer.addPass( fxaaPass );
composer.addPass( new FilmPass(0.1) );

resizeRendererToDisplaySize(renderer, camera, composer);

window.addEventListener('load', () => {
    const topHeader = document.querySelector("#top_header");
    const mainContent = document.querySelector("#main_content");

    const height = 1 * (topHeader.offsetHeight + mainContent.offsetHeight);

    document.body.style.setProperty(
        '--min-height',
        height + "px"
    );
}, false);

// resize on window resize
window.addEventListener('resize', () => {
    resizeRendererToDisplaySize(renderer, camera, composer);
}
, false);

// resize on scroll
window.addEventListener('scroll', () => {
    const scrollHeight = 1 * (document.body.offsetHeight - window.innerHeight);

    document.body.style.setProperty(
        '--scroll',
        window.scrollY / scrollHeight
    );

    resizeRendererToDisplaySize(renderer, camera, composer);
}, false);

const clock = new THREE.Clock();

const starfield = new Starfield();
scene.add(starfield);

const earth = new Earth();
scene.add(earth);

const controls = new TrackingCameraControls(camera, canvas, earth.position, scene, false);
controls.enableDamping = true;
controls.addEventListener('change', (e) => {
    // console.log(camera);
});

const initialTrack = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-20, 10, -10),
    new THREE.Vector3(-5, -2, 1.0078201455690863),
    new THREE.Vector3(-2.5906304864660354, 0.6315778092534803, 1.0078201455690863)
]);

controls.target.copy(earth.position);
controls.update();
controls.trackVia(initialTrack, null, 5);

const sun = new Sun();
scene.add(sun);

const planes = new Planes();
earth.add(planes);

planes.loadPlanes(() => {
    // controls.trackTo(planes.planes["N563VW"], () => {
    //     return planes.planes["N563VW"].getPointAtAltitudeAbove(60000);
    // }, 2);
});

function highlightPlane(plane, duration = 2) {
    const planeDetails = document.querySelector("#plane-details");
    if (planeDetails !== null) {
        planeDetails.style.setProperty("opacity", 0);
        planeDetails.querySelector("#plane-tail-number").innerText = plane.name;
        const startLatLong = plane.getStartingLatLong();
        const currentLatLong = plane.getCurrentLatLong();
        const storedLatLong = { "latitude": plane.data["lat"], "longitude": plane.data["lon"] };
        planeDetails.querySelector("#plane-start-position").innerText = plane.latLongToString(startLatLong);
        planeDetails.querySelector("#plane-current-position").innerText = plane.latLongToString(storedLatLong);
        planeDetails.querySelector("#plane-speed").innerText = plane.velocity + " knots";
        planeDetails.querySelector("#plane-altitude").innerText = plane.altitude + " ft";
        planeDetails.querySelector("#plane-heading").innerText = plane.track + "°";
        gsap.to(planeDetails.style, {opacity: 1, duration: 0.5});
    }
    plane.highlight(duration);
}

controls.addTrackingStartedListener((controls) => {
    // console.log(camera);
});

controls.addTrackingFinishedListener((controls) => {
    if (controls.targetObject3D !== null && controls.targetObject3D.isPlane) {
        const plane = controls.targetObject3D;
        highlightPlane(plane, 10);
    }

    // console.log("tracking finished");
    setTimeout(() => {
        const newPlane = planes.getRandomPlane();
        controls.trackTo(newPlane, () => {
                return newPlane.getPointAtAltitudeAbove(60000);
        }, 2);
    }, 5000);
});

const picker = new Picker(camera, scene, renderer);
picker.mouseMoveEvents.push((event, picker) => {
    const intersects = picker.getIntersects();
    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.isPlane) {
            const plane = intersects[i].object;
            highlightPlane(plane);
            break;
        }
    }
});

picker.clickEvents.push((event, picker) => {
    const intersects = picker.getIntersects();
    if (intersects.length > 0) {
        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.isPlane) {
                const plane = intersects[i].object;
                highlightPlane(plane, 10);
                console.log(`clicked on plane: ${plane.name}`);
                controls.trackTo(plane, () => { return plane.getPointAtAltitudeAbove(60000) }, 2);
                break;
            }
        }
    }
});

// animation

function animate( time ) {
    const delta = clock.getDelta();

    if (resizeRendererToDisplaySize(renderer, camera, composer)) {
        // console.log("resized");
    }

    const earth = scene.getObjectByName("earth");

    if (earth != null) {
        earth.rotationStep(delta);
    }

    if (starfield != null) {
        starfield.twinkleStep(delta);
    }

    if (planes != null) {
        planes.flyHeadings(delta);
    }

    controls.update(delta);

    composer.render(delta);
}