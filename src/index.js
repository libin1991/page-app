// import 'expose-loader?$!jquery';
import 'expose-loader?THREE!three';
import ready from 'domready';
import glslify from 'glslify';
import 'reset-css';
import './css/index.css'

const getImgData = img => {
    const {
        width,
        height
    } = img;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const numPixels = width * height;
    const positionPixels = [];

    canvas.width = width;
    canvas.height = height;
    ctx.scale(1, -1);
    ctx.drawImage(img, 0, 0, width, height * -1);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return {
        width,
        numPixels,
        originalColors: Float32Array.from(imgData.data)
    };
};

const getParticleData = (img, threshold) => {
    const {
        width,
        numPixels,
        originalColors
    } = getImgData(img);

    let numVisible = 0;

    for (let i = 0; i < numPixels; i++) {
        if (originalColors[i * 4 + 0] > threshold) numVisible++;
    }

    const indices = new Uint16Array(numVisible);
    const offsets = new Float32Array(numVisible * 3);
    const angles = new Float32Array(numVisible);

    for (let i = 0, j = 0; i < numPixels; i++) {
        if (originalColors[i * 4 + 0] > threshold) {
            numVisible++;

            offsets[j * 3 + 0] = i % width;
            offsets[j * 3 + 1] = Math.floor(i / width);

            indices[j] = i;
            angles[j] = Math.random() * Math.PI;

            j++;
        }
    }

    return {
        indices,
        offsets,
        angles
    }
}

ready(() => {
    [...document.images].forEach(img => {
        const threshold = 34;
        const {
            indices,
            offsets,
            angles
        } = getParticleData(img, threshold);

        // init webGL
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.z = 300;
        const renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas'),
            antialias: true,
            alpha: true
        });
        const clock = new THREE.Clock(true);

        const loader = new THREE.TextureLoader();

        loader.load('./assets/images/sample-01.png', texture => {
            const {
                image: {
                    width,
                    height
                }
            } = texture;

            const uniforms = {
                uTime: {
                    value: 0
                },
                uRandom: {
                    value: 1.0
                },
                uDepth: {
                    value: 2.0
                },
                uSize: {
                    value: 0.0
                },
                uTextureSize: {
                    value: new THREE.Vector2(width, height)
                },
                uTexture: {
                    value: texture
                },
                uTouch: {
                    value: null
                },
            };

            const material = new THREE.RawShaderMaterial({
                uniforms,
                vertexShader: glslify(require('./assets/shaders/particle.vert')),
                fragmentShader: glslify(require('./assets/shaders/particle.frag')),
                depthTest: false,
                transparent: true
                // blending: THREE.AdditiveBlending
            });


        })
    });
});