import * as THREE from 'three';

class Starfield extends THREE.Group {
    constructor(radius = 6371) {
        super();

        // TODO: I ported this from somewhere, add where in this comment...
        //
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

            this.add( stars );

        }
    }

    twinkleStep(delta) {
        // TODO: make the stars twinkle
    }
}

export { Starfield };