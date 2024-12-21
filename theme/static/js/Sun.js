import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';

export default function Sun(
    { position = new THREE.Vector3(10,0,0) } = {}
) {
    const loader = new THREE.TextureLoader();
    const sun = new THREE.Group();

    const light = new THREE.AmbientLight( 0x404040 , 0.4); // soft white light
    sun.add( light );

    const pointLight = new THREE.PointLight( 0xffffff, 3, 0, 0.25);
    pointLight.position.copy(position);
    pointLight.castShadow = true;
    sun.add(pointLight);

    const textureFlare0 = loader.load( "/theme/3d/flare1.png" );
    const textureFlare1 = loader.load( "/theme/3d/flare2.png" );

    const lensflare = new Lensflare();

    lensflare.addElement( new LensflareElement( textureFlare0, 1024, 0 ) );
    lensflare.addElement( new LensflareElement( textureFlare1, 1024, 0 ) );

    pointLight.add( lensflare );

    return sun;
}