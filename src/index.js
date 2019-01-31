// import 'expose-loader?$!jquery';
import ready from 'domready'
import glslify from 'glslify'
// import vertexShader from './assets/shaders/particle.vert';
// import fragmentShader from './assets/shaders/particle.frag';
import { TweenMax } from 'gsap/TweenMax'
import 'expose-loader?THREE!three'
import 'reset-css'
import './css/index.css'

const getImgData = (img) => {
    const { width, height } = img
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const numPixels = width * height

    canvas.width = width
    canvas.height = height
    ctx.scale(1, -1)
    ctx.drawImage(img, 0, 0, width, height * -1)
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    return {
        width,
        numPixels,
        originalColors: Float32Array.from(imgData.data),
    }
}

const getParticleData = (img, threshold) => {
    const { width, numPixels, originalColors } = getImgData(img)

    let numVisible = 0

    for (let i = 0; i < numPixels; i++) {
        if (originalColors[i * 4 + 0] > threshold) numVisible++
    }

    // const indices = new Uint16Array(numVisible)
    const offsets = new Float32Array(numVisible * 3)
    // const angles = new Float32Array(numVisible)

    for (let i = 0, j = 0; i < numPixels; i++) {
        if (originalColors[i * 4 + 0] > threshold) {

            offsets[j * 3 + 0] = i % width
            offsets[j * 3 + 1] = Math.floor(i / width)

            // indices[j] = i
            // angles[j] = Math.random() * Math.PI

            j++
        }
    }

    return {
        // indices,
        offsets
        // angles,
    }
}

ready(() => {
    ;[...document.images].forEach((img) => {
        const threshold = 34
        const { offsets } = getParticleData(img, threshold)

        // init webGL
        const scene = new THREE.Scene()
        const group = new THREE.Group()
        scene.add(group)
        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            10,
            10000
        )
        camera.position.z = 300
        const fovHeight =
            2 * Math.tan(camera.fov * Math.PI / 180 / 2) * camera.position.z
        const renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas'),
            antialias: true,
            alpha: true,
        })
        renderer.setClearColor(0x000000, 1)

        // const textureLoader = new THREE.TextureLoader()
        // const map = textureLoader.load('./assets/images/circle.png')
        // const material = new THREE.SpriteMaterial({
        //     map,
        //     color: 0xffffff,
        //     fog: true,
        // })

        const material = new THREE.RawShaderMaterial({
            uniforms: {
                map: {
                    value: new THREE.TextureLoader().load(
                        './assets/images/circle.png'
                    ),
                },
                time: { value: 0.0 },
            },
            vertexShader: glslify(require('./assets/shaders/particle.vert')),
            fragmentShader: glslify(require('./assets/shaders/particle.frag')),
            depthTest: true,
            depthWrite: true,
        })

        const positions = offsets
        for (let index = 0; index < positions.length; index += 2) {
            const particleMaterial = material
            const particle = new THREE.Sprite(particleMaterial)

            const targetX = positions[index]
            const targetY = positions[index + 1]
            const targetZ = positions[index + 2]

            if (targetX && targetY) {
                particle.position.x = 0
                particle.position.y = 0
                particle.position.z = 0

                TweenMax.to(particle.position, 1, {
                    x: targetX,
                    y: targetY,
                    z: targetZ,
                    delay: Math.random() * 0.1,
                    onComplete: function() {
                        // TweenMax.to(particle.position, Math.random() * 200, {
                        //     x: particle.position.x + Math.random() * 1000,
                        //     y: particle.position.y + Math.random() * 1000,
                        //     z: particle.position.z + Math.random() * 1000,
                        //     repeat: -1,
                        // })
                    },
                })

                group.add(particle)
            }
        }

        function animate() {
            requestAnimationFrame(animate)
            render()
        }
        function render() {
            const scale = fovHeight / 180
            group.scale.set(scale, scale, 1)
            group.position.set(-160 * scale, -90 * scale, 0)

            const time = performance.now() * 0.0005;
			material.uniforms.time.value = time;

            renderer.setSize(window.innerWidth, window.innerHeight)
            renderer.render(scene, camera)
        }
        animate()
    })
})
