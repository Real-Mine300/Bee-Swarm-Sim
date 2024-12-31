class Game {
    constructor() {
        this.honey = 0;
        this.totalHoney = 0;
        this.bees = [];
        this.upgrades = {};
        this.isPlaying = false;
        
        // Setup event listeners
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        
        this.setupThreeJS();
        this.setupPhysics();
        this.setupLighting();
        this.createEnvironment();  // Create environment immediately
        
        // Add initial camera until player is created
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 15, 30);
        this.camera.lookAt(0, 0, 0);
    }

    async loadModels() {
        try {
            const loader = new THREE.GLTFLoader();
            
            // For now, let's skip loading models and create basic shapes
            this.models = {
                bee: null,
                flower: null,
                hive: null,
                tree: this.createBasicTree()
            };
            return true;
        } catch (error) {
            console.error("Error loading models:", error);
            return false;
        }
    }

    createBasicTree() {
        const tree = new THREE.Group();
        
        // Create trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 5, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        
        // Create leaves
        const leavesGeometry = new THREE.ConeGeometry(2, 4, 8);
        const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 4;
        leaves.castShadow = true;
        
        tree.add(trunk);
        tree.add(leaves);
        
        return tree;
    }

    async startGame() {
        if (this.isPlaying) return;
        
        // Load models before starting
        await this.loadModels();
        
        this.isPlaying = true;
        document.getElementById('main-menu').style.display = 'none';
        
        this.createGameObjects();
        this.setupParticleSystems();
        this.animate();
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
        // Set sky color
        this.scene.background = new THREE.Color(0x87CEEB);

        // Ground with realistic grass
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x567d46,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;  // Moved up from -10
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add ground physics
        const groundBody = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Plane()
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.physics.addBody(groundBody);

        // Add trees
        for (let i = 0; i < 50; i++) {
            const tree = this.createBasicTree();
            tree.position.set(
                Math.random() * 200 - 100,
                0,
                Math.random() * 200 - 100
            );
            tree.scale.setScalar(Math.random() * 2 + 1);
            tree.rotation.y = Math.random() * Math.PI * 2;
            this.scene.add(tree);
        }
    }

    createGameObjects() {
        // Create player bee with physics
        this.player = new Bee(0, 5, 0, true, null, this.physics);
        this.scene.add(this.player.model);

        // Create flowers with physics
        this.flowers = [];
        for (let i = 0; i < 20; i++) {
            const flower = new Flower(
                Math.random() * 100 - 50,
                0,
                Math.random() * 100 - 50,
                null,
                this.physics
            );
            this.flowers.push(flower);
            this.scene.add(flower.model);
        }

        // Create hive with physics
        this.hive = new Hive(0, 5, -30, null, this.physics);
        this.scene.add(this.hive.model);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = 1/60;
        
        // Update physics
        this.physics.step(deltaTime);

        // Update game objects
        if (this.player) {
            this.player.update(deltaTime);
            
            // Update camera to follow player
            const idealOffset = new THREE.Vector3(0, 10, 20);
            idealOffset.applyQuaternion(this.player.model.quaternion);
            idealOffset.add(this.player.position);
            
            this.camera.position.lerp(idealOffset, 0.1);
            this.camera.lookAt(this.player.position);
        }

        if (this.flowers) {
            this.flowers.forEach(flower => flower.update(deltaTime));
        }
        if (this.hive) {
            this.hive.update(deltaTime);
        }

        // Update particle systems
        this.updateParticles();

        // Render scene with the appropriate camera
        this.renderer.render(this.scene, this.camera);
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