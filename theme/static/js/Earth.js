import * as THREE from 'three';
import { MeshFresnelMaterial } from './MeshFresnelMaterial.js';
import { gsap } from 'gsap';

class Earth extends THREE.Group {
    constructor(
        rotationBase = 110,
        rotationSpeed = 0.005,
        tilt = 0.41,
        position = new THREE.Vector3(-2,0,2)
    ) {
        super();

        this.rotationBase = rotationBase;
        this.rotationSpeed = rotationSpeed;
        this.tilt = tilt;

        this.position.copy(position);

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
                bumpScale: 10,
                specularIntensity: 1,
                specularIntensityMap: specTex,
                roughness: 0.5,
                roughnessMap: specTex,
                metalness: 0.2,
                metalnessMap: specTex,
                opacity: 0,
                transparent: true
            });

            // TODO: figure out the best way to show this on the dark side
            // probably a custom shader...
            const earthNightMat = new THREE.MeshBasicMaterial({
                map: mapNightTex,
                blending: THREE.AdditiveBlending,
                opacity: 0,
                transparent: true
            })


            const cloudMat = new THREE.MeshPhysicalMaterial({
                map: cloudTex,
                alphaMap: cloudTex,
                // specularIntensityMap: cloudTex,
                transparent: true,
                opacity: 0,
                // blending: THREE.AdditiveBlending
            });

            const earthDay = new THREE.Mesh(sphere, earthMat);
            const earthNight = new THREE.Mesh(sphere, earthNightMat);
            this.add(earthDay);
            // earth.add(earthNight);

            const clouds = new THREE.Mesh(sphere, cloudMat);
            clouds.scale.set(1.005, 1.005, 1.005);
            clouds.name = 'clouds';
            //clouds.castShadow = true;
            //clouds.receiveShadow = true;
            this.add(clouds);

            const atmosMat = new MeshFresnelMaterial();
            atmosMat.opacity = 0;
            atmosMat.transparent = true;
            const earthAtmos = new THREE.Mesh(sphere, atmosMat);
            earthAtmos.scale.set(1.01, 1.01, 1.01);
            this.add(earthAtmos);

            this.rotation.y = rotationBase;
            this.rotation.z = tilt;
            this.name = 'earth';
            this.receiveShadow = true;
            this.castShadow = true;

            console.log("loaded earth");
            gsap.to(earthMat, {opacity: 1, duration: 2});
            gsap.to(earthNightMat, {opacity: 1, duration: 2});
            gsap.to(cloudMat, {opacity: 0.8, duration: 2});
            gsap.to(atmosMat, {opacity: 0.8, duration: 2});
            gsap.to(atmosMat.uniforms.fresnelBias, {value: 0.1, duration: 2});
        }
        )
    }

    rotationStep(delta) {
        this.rotation.y += (delta * this.rotationSpeed);
        const clouds = this.getObjectByName("clouds")
        clouds.rotation.y -= (delta * this.rotationSpeed * 1.5);
        clouds.rotation.z += (delta * this.rotationSpeed * 1.3);
    }
}

export { Earth };