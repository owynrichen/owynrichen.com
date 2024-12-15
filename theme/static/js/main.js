import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';

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
const rotationSpeed = 0.1;
const rotationBase = 110;

const cloudsScale = 1.01;

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

    // const geometry = new THREE.SphereGeometry( 0.5, 32, 32 ); 
    // const material = new THREE.MeshStandardMaterial( { color: 0xffff00 } );
    // material.emissive = new THREE.Color().setHex(0xffffff);
    // const sphere = new THREE.Mesh( geometry, material );
    // sphere.position.set(10,0,0);
    // scene.add( sphere );

    const light = new THREE.AmbientLight( 0x404040 , 0.4); // soft white light
    scene.add( light );

    const pointLight = new THREE.PointLight( 0xffffff, 3, 0, 0.25);
    pointLight.position.set(10,0,0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // const sphereSize = 1;
    // const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
    // scene.add( pointLightHelper );

    console.log("loading earth...");

    const loader = new THREE.TextureLoader();
    const mapTexP = loader.loadAsync('/theme/3d/8081_earthmap4k.jpg');
    const bumpTexP = loader.loadAsync('/theme/3d/8081_earthbump4k.jpg');
    const specTexP = loader.loadAsync('/theme/3d/8081_earthspec4k.png');
    const cloudTexP = loader.loadAsync('https://clouds.matteason.co.uk/images/4096x2048/clouds-alpha.png');

    const loadTexP = Promise.all([mapTexP, bumpTexP, specTexP, cloudTexP]);
    loadTexP.then(([mapTex, bumpTex, specTex, cloudTex]) => {
        const sphere = new THREE.SphereGeometry(1, 64, 64);

        const earthMat = new THREE.MeshPhysicalMaterial({
            map: mapTex,
            bumpMap: bumpTex,
            specularIntensity: 1,
            specularIntensityMap: specTex,
            roughness: 0.5,
            roughnessMap: specTex,
            metalness: 0.2,
            metalnessMap: specTex
        });

        const cloudMat = new THREE.MeshPhysicalMaterial({
            map: cloudTex,
            alphaMap: cloudTex,
            specularIntensityMap: cloudTex,
            transparent: true
        });

        const earth = new THREE.Mesh(sphere, earthMat);
        earth.position.set(-2, 0, 2);
        earth.rotation.y = rotationBase;
        earth.rotation.z = tilt;
        earth.name = 'earth';
        scene.add(earth);

        const clouds = new THREE.Mesh(sphere, cloudMat);
        clouds.position.set(-2, 0, 2);
        clouds.rotation.y = rotationBase;
        clouds.rotation.z = tilt;
        clouds.scale.set(1.005, 1.005, 1.005);
        // clouds.rotation.tilt = 0.41;
        clouds.name = 'clouds';
        scene.add(clouds);

        console.log("loaded earth");
    }
    )

    const textureFlare0 = loader.load( "/theme/3d/flare1.png" );
    const textureFlare1 = loader.load( "/theme/3d/flare2.png" );
    // const textureFlare2 = loader.load( "theme/3d/flare1.png" );

    const lensflare = new Lensflare();

    lensflare.addElement( new LensflareElement( textureFlare0, 1024, 0 ) );
    lensflare.addElement( new LensflareElement( textureFlare1, 1024, 0 ) );
    // lensflare.addElement( new LensflareElement( textureFlare2, 2048, 0.3 ) );

    pointLight.add( lensflare );
}

// animation

function animate( time ) {

    const delta = time / 20000;

    const earth = scene.getObjectByName("earth");
    const clouds = scene.getObjectByName("clouds");

    if (earth != null) {
        earth.rotation.y = rotationBase + (delta * rotationSpeed);
    }

    if (clouds != null) {
        clouds.rotation.y = rotationBase + (delta * rotationSpeed * 1.25);
    }

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    //console.log(camera);

	renderer.render( scene, camera );

}