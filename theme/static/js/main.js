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

const renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true, canvas } );
renderer.toneMapping = THREE.ReinhardToneMapping;
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setAnimationLoop( animate );

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );
composer.addPass( new UnrealBloomPass( new THREE.Vector2( canvas.clientWidth, canvas.clientHeight ), 1, 1, 1 ) );
composer.addPass( new FilmPass(0.5) );
composer.addPass( new OutputPass() );

resizeRendererToDisplaySize(renderer, camera, composer);

window.addEventListener('scroll', () => {
    document.body.style.setProperty(
        '--scroll',
        window.scrollY / (document.body.offsetHeight - window.innerHeight)
    );
    resizeRendererToDisplaySize(renderer, camera, composer);
}, false);

const clock = new THREE.Clock();

const starfield = new Starfield(6000);
scene.add(starfield);

const earth = new Earth();
scene.add(earth);

const controls = new TrackingCameraControls(camera, canvas, earth.position, scene, true);
controls.enableDamping = true;
controls.update();
controls.addEventListener('change', (e) => {
    // console.log(camera);
});

const sun = new Sun();
scene.add(sun);

const planes = new Planes();
earth.add(planes);

planes.loadPlanes(() => {
    // controls.cursor.set(planes.planes["N563VW"].position);
    // controls.trackTo(planes.planes["N563VW"]);
    // controls.trackTo(planes.planes["N563VW"], () => {
    //     return planes.planes["N563VW"].getPointAtAltitudeAbove(150000);
    // }, 2);
});

controls.addTrackingFinishedListener((controls) => {
    if (controls.targetObject3D.isPlane) {
        const plane = controls.targetObject3D;
        plane.highlight(10);
    }
    // setTimeout(() => {
    //     const newPlane = planes.getRandomPlane();
    //     controls.trackTo(newPlane);
    //     // controls.trackTo(newPlane, () => {
    //     //         return newPlane.getPointAtAltitudeAbove(150000);
    //     // }, 2);
    // }, 5000);
});

const picker = new Picker(camera, scene, renderer);
picker.mouseMoveEvents.push((event, picker) => {
    const intersects = picker.getIntersects();
    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.isPlane) {
            const plane = intersects[i].object;
            plane.highlight();
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
                plane.highlight(10);
                console.log(`clicked on plane: ${plane.name}`);
                // controls.trackTo(plane);
                // controls.trackTo(plane, () => { return plane.getPointAtAltitudeAbove(150000) }, 2);
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
        if (planes.planes["N563VW"] != null) {
            // controls.lookAt(planes.planes["N563VW"]);
        }
    }

    controls.update(delta);

    composer.render(delta);
}