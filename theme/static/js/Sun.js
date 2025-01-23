import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
import { gsap } from 'gsap';

class Sun extends THREE.Group {
    constructor(position = new THREE.Vector3(10,0,0)) {
        super();

        const sun = new THREE.Mesh(
            new THREE.SphereGeometry(1, 16, 16),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xffffdd,
                emissiveIntensity: 3
            }));
        sun.position.copy(position);
        this.add(sun);

        const loader = new THREE.TextureLoader();

        const light = new THREE.AmbientLight( 0x404040 , 0.4); // soft white light
        this.add( light );

        const pointLight = new THREE.PointLight( 0xffffff, 3, 0, 0.25);
        pointLight.position.copy(position);
        pointLight.castShadow = true;

        pointLight.shadow.mapSize.width = 512; // default
        pointLight.shadow.mapSize.height = 512; // default
        pointLight.shadow.camera.near = 1; // default
        pointLight.shadow.camera.far = 100; // default
        this.add(pointLight);

        const textureFlare0 = loader.load( "/theme/3d/flare1.png" );
        const textureFlare1 = loader.load( "/theme/3d/flare2.png" );

        const lensflare = new Lensflare({
            transparent: true,
            opacity: 0
        });

        lensflare.addElement( new LensflareElement( textureFlare0, 1024, 0 ) );
        lensflare.addElement( new LensflareElement( textureFlare1, 1024, 0 ) );

        // pointLight.add( lensflare );

        this.pointLight = pointLight;
        // gsap.to(this.pointLight, {intensity: 3, duration: 2, delay: 4});
        // gsap.to(light, {intensity: 0.4, duration: 5, delay: 4});
        // gsap.to(sun.material, {emissiveIntensity: 1.1, duration: 3, delay: 4});
    }
}

export { Sun };