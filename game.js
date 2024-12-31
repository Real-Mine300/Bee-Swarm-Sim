class Game {
    constructor() {
        this.honey = 0;
        this.totalHoney = 0;
        this.bees = [];
        this.upgrades = {};
        
        this.setupThreeJS();
        this.setupPhysics();
        this.setupLighting();
        this.loadModels().then(() => {
            this.createEnvironment();
            this.createGameObjects();
            this.setupParticleSystems();
            this.animate();
        });
    }

    setupThreeJS() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.001);
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Handle window resizing
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.renderer.setSize(width, height);
            if (this.player) {
                this.player.camera.aspect = width / height;
                this.player.camera.updateProjectionMatrix();
            }
        });
    }

    setupPhysics() {
        this.physics = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0)
        });
        this.physics.broadphase = new CANNON.SAPBroadphase(this.physics);
        this.physics.defaultContactMaterial.friction = 0.1;
        this.physics.defaultContactMaterial.restitution = 0.7;
    }

    async loadModels() {
        const loader = new GLTFLoader();
        
        // Load models with promises
        this.models = {
            bee: await loader.loadAsync('models/bee.glb'),
            flower: await loader.loadAsync('models/flower.glb'),
            hive: await loader.loadAsync('models/hive.glb'),
            tree: await loader.loadAsync('models/tree.glb')
        };
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Sun
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.sunLight.position.set(50, 100, 50);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.camera.left = -100;
        this.sunLight.shadow.camera.right = 100;
        this.sunLight.shadow.camera.top = 100;
        this.sunLight.shadow.camera.bottom = -100;
        this.scene.add(this.sunLight);

        // Add some colored point lights for atmosphere
        const colors = [0xff7e6b, 0x7eb1ff, 0x7eff8b];
        colors.forEach((color, i) => {
            const light = new THREE.PointLight(color, 1, 50);
            light.position.set(
                Math.sin(i * Math.PI * 2 / 3) * 30,
                10,
                Math.cos(i * Math.PI * 2 / 3) * 30
            );
            this.scene.add(light);
        });
    }

    setupParticleSystems() {
        // Pollen particle system
        const pollenGeometry = new THREE.BufferGeometry();
        const pollenMaterial = new THREE.PointsMaterial({
            size: 0.1,
            color: 0xffff00,
            transparent: true,
            opacity: 0.6,
            map: new THREE.TextureLoader().load('textures/particle.png'),
            blending: THREE.AdditiveBlending
        });

        this.pollenSystem = new THREE.Points(pollenGeometry, pollenMaterial);
        this.scene.add(this.pollenSystem);
    }

    createEnvironment() {
        // Sky
        const sky = new THREE.Sky();
        sky.scale.setScalar(1000);
        this.scene.add(sky);

        // Ground with realistic grass
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x567d46,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -10;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add ground physics
        const groundBody = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Plane()
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.physics.addBody(groundBody);

        // Add trees and rocks for environment
        for (let i = 0; i < 50; i++) {
            const tree = this.models.tree.scene.clone();
            tree.position.set(
                Math.random() * 200 - 100,
                0,
                Math.random() * 200 - 100
            );
            tree.scale.setScalar(Math.random() * 2 + 1);
            tree.rotation.y = Math.random() * Math.PI * 2;
            tree.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            this.scene.add(tree);
        }
    }

    createGameObjects() {
        // Create player bee with physics
        this.player = new Bee(0, 5, 0, true, this.models.bee, this.physics);
        this.scene.add(this.player.model);

        // Create flowers with physics
        this.flowers = [];
        for (let i = 0; i < 20; i++) {
            const flower = new Flower(
                Math.random() * 100 - 50,
                0,
                Math.random() * 100 - 50,
                this.models.flower,
                this.physics
            );
            this.flowers.push(flower);
            this.scene.add(flower.model);
        }

        // Create hive with physics
        this.hive = new Hive(0, 5, -30, this.models.hive, this.physics);
        this.scene.add(this.hive.model);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = 1/60;
        
        // Update physics
        this.physics.step(deltaTime);

        // Update game objects
        this.player.update(deltaTime);
        this.flowers.forEach(flower => flower.update(deltaTime));
        this.hive.update(deltaTime);

        // Update particle systems
        this.updateParticles();

        // Center camera on player
        if (this.player.camera) {
            const idealOffset = new THREE.Vector3(0, 5, 10);
            idealOffset.applyQuaternion(this.player.model.quaternion);
            idealOffset.add(this.player.position);
            
            this.player.camera.position.lerp(idealOffset, 0.1);
            this.player.camera.lookAt(this.player.position);
        }

        // Render scene
        this.renderer.render(this.scene, this.player.camera);
    }

    updateParticles() {
        // Update pollen particles
        this.flowers.forEach(flower => {
            if (flower.isPollenating) {
                // Add new particles around the flower
                const pollenCount = 10;
                const positions = new Float32Array(pollenCount * 3);
                
                for (let i = 0; i < pollenCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.random() * 0.5;
                    positions[i * 3] = flower.position.x + Math.cos(angle) * radius;
                    positions[i * 3 + 1] = flower.position.y + Math.random() * 0.5;
                    positions[i * 3 + 2] = flower.position.z + Math.sin(angle) * radius;
                }

                this.pollenSystem.geometry.setAttribute(
                    'position',
                    new THREE.BufferAttribute(positions, 3)
                );
            }
        });
    }
} 