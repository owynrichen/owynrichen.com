import * as THREE from 'three';
import { gsap } from 'gsap';

class Starfield extends THREE.Group {
    constructor(radius = 6371) {
        super();

        // TODO: I ported this from somewhere, add where in this comment...
        //
        this.starsGeometry = [ new THREE.BufferGeometry(), new THREE.BufferGeometry() ];

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

        this.starsGeometry[ 0 ].setAttribute( 'position', new THREE.Float32BufferAttribute( vertices1, 3 ) );
        this.starsGeometry[ 1 ].setAttribute( 'position', new THREE.Float32BufferAttribute( vertices2, 3 ) );

        this.starsMaterials = [
            new THREE.PointsMaterial( { color: 0x9c9c9c, transparent: true, opacity: 0 } ),
            new THREE.PointsMaterial( { color: 0x838383, transparent: true, opacity: 0 } ),
            new THREE.PointsMaterial( { color: 0x5a5a5a, transparent: true, opacity: 0 } )
        ];

        for ( let i = 10; i < 30; i ++ ) {

            const stars = new THREE.Points( this.starsGeometry[ i % 2 ], this.starsMaterials[ i % 3 ] );
            stars.name = `${i}`;

            stars.rotation.x = Math.random() * 6;
            stars.rotation.y = Math.random() * 6;
            stars.rotation.z = Math.random() * 6;
            stars.scale.setScalar( i * 10 );

            stars.matrixAutoUpdate = false;
            stars.updateMatrix();

            this.add( stars );

        }

        gsap.to(this.starsMaterials[0], {opacity: 1, duration: 5});
        gsap.to(this.starsMaterials[1], {opacity: 1, duration: 5});
        gsap.to(this.starsMaterials[2], {opacity: 1, duration: 5});
    }

    updateStarBrightness(star, delta) {
        const time = Date.now() * 0.0005;
        let hsl = {};
        star.material.color.getHSL(hsl);
        const h = hsl.h;
        const s = hsl.s;
        const l = 0.8 + 0.2 * Math.sin(time + star.position.x + star.position.y); // Lightness oscillates between 0.6 and 1.0
        star.material.color.setHSL(h, s, l);
    }

    resetStarBrightness(star) {
        star.material.color = this.starsMaterials[parseInt(star.name) % 3].color;
    }

    twinkleStep(delta) {
        this.children.forEach(star => {
            this.updateStarBrightness(star, delta);
        });
    }
}

export { Starfield };