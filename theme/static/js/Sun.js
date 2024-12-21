import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';

class Sun extends THREE.Group {
    constructor(position = new THREE.Vector3(10,0,0)) {
        super();

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

        const lensflare = new Lensflare();

        lensflare.addElement( new LensflareElement( textureFlare0, 1024, 0 ) );
        lensflare.addElement( new LensflareElement( textureFlare1, 1024, 0 ) );

        pointLight.add( lensflare );

        this.pointLight = pointLight;
    }
}

export { Sun };