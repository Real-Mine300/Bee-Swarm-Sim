class Game {
    constructor() {
        this.honey = 0;
        this.totalHoney = 0;
        this.bees = [];
        this.upgrades = {};
        this.isPlaying = false;

        // Setup Three.js first
        this.setupThreeJS();
        
        // Setup event listeners
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
    }

    setupThreeJS() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add renderer to DOM
        const container = document.getElementById('game-container');
        container.appendChild(this.renderer.domElement);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Set initial camera position
        this.camera.position.set(0, 30, 50);
        this.camera.lookAt(0, 0, 0);
        
        // Handle window resizing
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Set sky color
        this.scene.background = new THREE.Color(0x87CEEB);
        
        // Setup other systems
        this.setupLighting();
        this.setupPhysics();
        this.createEnvironment();
    }

    async startGame() {
        if (this.isPlaying) return;
        
        await this.loadModels();
        
        this.isPlaying = true;
        document.getElementById('main-menu').style.display = 'none';
        
        // Create game objects
        this.createGameObjects();
        
        // Setup camera controller after player is created
        this.cameraController = new CameraController(this.camera, this.player);
        
        // Start game loop
        this.animate();
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

    setupPhysics() {
        this.physics = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0)
        });
        this.physics.broadphase = new CANNON.SAPBroadphase(this.physics);
        this.physics.defaultContactMaterial.friction = 0.1;
        this.physics.defaultContactMaterial.restitution = 0.7;
    }

    setupLighting() {
        // Brighter ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Brighter directional light
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
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

        // Add hemisphere light for better ambient lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        this.scene.add(hemiLight);
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
        // Ground with more visible color
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a9648, // Brighter green
            roughness: 0.8,
            metalness: 0.1
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add trees with more spacing
        for (let i = 0; i < 30; i++) {
            const tree = this.createBasicTree();
            tree.position.set(
                Math.random() * 160 - 80, // More spread out
                0,
                Math.random() * 160 - 80
            );
            tree.scale.setScalar(Math.random() * 2 + 1);
            tree.rotation.y = Math.random() * Math.PI * 2;
            this.scene.add(tree);
        }
    }

    createGameObjects() {
        // Create player bee higher up
        this.player = new Bee(0, 10, 0, true, null, this.physics);
        this.scene.add(this.player.model);

        // Create flowers with more spacing
        this.flowers = [];
        for (let i = 0; i < 20; i++) {
            const flower = new Flower(
                Math.random() * 80 - 40,
                0,
                Math.random() * 80 - 40,
                null,
                this.physics
            );
            this.flowers.push(flower);
            this.scene.add(flower.model);
        }

        // Create hive higher up
        this.hive = new Hive(0, 10, -30, null, this.physics);
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
            this.cameraController.updateCamera();
        }

        if (this.flowers) {
            this.flowers.forEach(flower => flower.update(deltaTime));
        }
        if (this.hive) {
            this.hive.update(deltaTime);
        }

        // Render scene
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