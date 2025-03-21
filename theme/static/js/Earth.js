import * as THREE from 'three';
import { MeshFresnelMaterial } from './MeshFresnelMaterial.js';
import { gsap } from 'gsap';

class Earth extends THREE.Group {
    constructor(
        rotationBase = 130,
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
        const mapTexP = loader.loadAsync('/theme/3d/8081_earthmap4k.webp');
        const bumpTexP = loader.loadAsync('/theme/3d/8081_earthbump4k.webp');
        const specTexP = loader.loadAsync('/theme/3d/8081_earthspec4k.webp');
        const mapNightTexP = loader.loadAsync('/theme/3d/8081_earthlights4k.webp');
        const emissiveMapTexP = loader.loadAsync('/theme/3d/8081_earthlights10k_mask.webp');
        const cloudTexP = loader.loadAsync('https://clouds.matteason.co.uk/images/1024x512/clouds-alpha.png');

        const loadTexP = Promise.all([mapTexP, bumpTexP, specTexP, mapNightTexP, cloudTexP, emissiveMapTexP]);
        loadTexP.then(([mapTex, bumpTex, specTex, mapNightTex, cloudTex, emissiveMapTex]) => {
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
                transparent: true,
                emissiveMap: emissiveMapTex,
                emissive: new THREE.Color(0xffffaa),
                emissiveIntensity: 0.5,
            });

            earthMat.onBeforeCompile = (shader) => {
                shader.uniforms.nightMap = { value: mapNightTex };
                shader.fragmentShader = shader.fragmentShader.replace("#include <map_pars_fragment>", `
#ifdef USE_MAP

	uniform sampler2D map;
    uniform sampler2D nightMap;
#endif`);
                shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", `
#ifdef USE_MAP

    vec3 sunPos = pointLights[0].position;
    vec3 lVector = sunPos - vViewPosition;

	vec3 sunDir = normalize( lVector );
    vec3 transformedNormal = normalize(vNormal);
    float intensity = dot(transformedNormal, sunDir);
    intensity = 1. / (1. + (exp(-20. * intensity)));  // sigmoid function to increase the contrast
    intensity = clamp(intensity, -0.05, 1.0);
    vec4 dayColor = texture2D(map, vMapUv);
    vec4 nightColor = texture2D(nightMap, vMapUv);
    vec4 sampledDiffuseColor = mix(nightColor, dayColor, intensity);

	#ifdef DECODE_VIDEO_TEXTURE

		// use inline sRGB decode until browsers properly support SRGB8_ALPHA8 with video textures (#26516)

		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );

	#endif

	diffuseColor *= sampledDiffuseColor;

#endif`);

                shader.fragmentShader = shader.fragmentShader.replace("#include <emissivemap_fragment>", `
#ifdef USE_EMISSIVEMAP

	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );

	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE

		// use inline sRGB decode until browsers properly support SRGB8_ALPHA8 with video textures (#26516)

		emissiveColor = sRGBTransferEOTF( emissiveColor );

	#endif
    vec4 lightsColor = mix(emissiveColor, vec4(0), intensity);

	totalEmissiveRadiance *= lightsColor.rgb;

#endif
`);
                console.log("compiled shader");
                console.log(shader);
            };


            const cloudMat = new THREE.MeshPhysicalMaterial({
                map: cloudTex,
                alphaMap: cloudTex,
                // specularIntensityMap: cloudTex,
                transparent: true,
                opacity: 0,
                // blending: THREE.AdditiveBlending
            });

            const earth = new THREE.Mesh(sphere, earthMat);
            this.add(earth);

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
            gsap.to(cloudMat, {opacity: 0.9, duration: 2});
            gsap.to(atmosMat, {opacity: 0.7, duration: 2});
        }
        )
    }

    rotationStep(delta) {
        this.rotation.y += (delta * this.rotationSpeed);
        const clouds = this.getObjectByName("clouds");
        clouds.rotation.y -= (delta * this.rotationSpeed * 1.5);
        clouds.rotation.z += (delta * this.rotationSpeed * 1.3);
    }
}

export { Earth };