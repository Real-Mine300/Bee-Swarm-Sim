class Game {
    constructor() {
        this.honey = 0;
        this.totalHoney = 0;
        this.bees = [];
        this.upgrades = {};
        this.isPlaying = false;

        // Setup Three.js first
        this.setupThreeJS();
        
        // Setup physics
        this.setupPhysics();
        
        // Setup lighting and environment
        this.setupLighting();
        this.createEnvironment();
        
        // Setup event listeners
        document.getElementById('start-game').addEventListener('click', () => this.startGame());

        this.gridSize = 10; // Size of each grid square
        this.createGrid();
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
        try {
            this.physics = new CANNON.World();
            this.physics.gravity.set(0, -9.82, 0);
            this.physics.broadphase = new CANNON.NaiveBroadphase();
            this.physics.solver.iterations = 10;
            this.physics.defaultContactMaterial = new CANNON.ContactMaterial(
                new CANNON.Material(),
                new CANNON.Material(),
                {
                    friction: 0.1,
                    restitution: 0.7
                }
            );
        } catch (error) {
            console.error("Error initializing physics:", error);
            alert("Error loading physics engine. Please refresh the page.");
        }
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
        // Ground with darker green and shadows
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5a27,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add walls
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.7
        });
        
        const wallGeometry = new THREE.BoxGeometry(2, 20, 200);
        const wallGeometry2 = new THREE.BoxGeometry(200, 20, 2);
        
        // Create walls
        const walls = [
            { pos: [-100, 10, 0], rot: [0, 0, 0], geo: wallGeometry },
            { pos: [100, 10, 0], rot: [0, 0, 0], geo: wallGeometry },
            { pos: [0, 10, -100], rot: [0, 0, 0], geo: wallGeometry2 },
            { pos: [0, 10, 100], rot: [0, 0, 0], geo: wallGeometry2 }
        ];

        walls.forEach(wall => {
            const mesh = new THREE.Mesh(wall.geo, wallMaterial);
            mesh.position.set(...wall.pos);
            mesh.rotation.set(...wall.rot);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            
            // Add physics
            const shape = new CANNON.Box(new CANNON.Vec3(
                wall.geo.parameters.width / 2,
                wall.geo.parameters.height / 2,
                wall.geo.parameters.depth / 2
            ));
            const body = new CANNON.Body({ mass: 0 });
            body.addShape(shape);
            body.position.set(...wall.pos);
            this.physics.addBody(body);
        });
    }

    createGameObjects() {
        try {
            // Create player first
            this.player = new Player(0, 5, 0, this.physics);
            this.scene.add(this.player.model);

            // Create bees that follow the player
            this.bees = [];
            for (let i = 0; i < 5; i++) {
                const bee = new Bee(
                    Math.random() * 40 - 20,
                    5,
                    Math.random() * 40 - 20,
                    this.physics
                );
                this.bees.push(bee);
                this.scene.add(bee.model);
            }

            // Create flower fields
            this.flowers = [];
            this.createFlowerFields();

            // Create scattered flowers
            for (let i = 0; i < 10; i++) {
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

            // Create hive on the ground
            this.hive = new Hive(0, 0, -30, null, this.physics);
            this.scene.add(this.hive.model);

            // Add trees around the map
            this.createTrees();
        } catch (error) {
            console.error("Error creating game objects:", error);
            alert("Error creating game objects. Please refresh the page.");
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const deltaTime = 1/60;
        
        // Update physics
        this.physics.step(deltaTime);

        // Update player and camera
        if (this.player) {
            this.player.update(deltaTime);
            this.cameraController.updateCamera();
        }

        // Update bees to follow player
        if (this.bees) {
            this.bees.forEach(bee => {
                bee.update(deltaTime, this.player.position);
            });
        }

        // Update other objects
        if (this.flowers) {
            this.flowers.forEach(flower => flower.update(deltaTime));
        }
        if (this.hive) {
            this.hive.update(deltaTime);
        }

        // Update coordinates display
        this.updateCoordinates();
        
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

    createFlowerFields() {
        const fields = [
            { x: -40, z: -40, type: 'sunflower', color: 0xFFD700 },
            { x: 40, z: -40, type: 'rose', color: 0xFF0000 },
            { x: -40, z: 40, type: 'lavender', color: 0x9370DB },
            { x: 40, z: 40, type: 'daisy', color: 0xFFFFFF }
        ];

        fields.forEach(field => {
            // Create 25 flowers in a 5x5 grid for each field
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    const flower = new Flower(
                        field.x + (i * 4) - 8,  // Spread flowers 4 units apart
                        0,
                        field.z + (j * 4) - 8,
                        null,
                        this.physics
                    );
                    // Customize flower appearance based on type
                    flower.head.material.color.setHex(field.color);
                    flower.pollen = 150;  // More pollen in flower fields
                    flower.maxPollen = 150;
                    this.flowers.push(flower);
                    this.scene.add(flower.model);
                }
            }
        });
    }

    createGrid() {
        // Create grid on the ground
        const gridGeometry = new THREE.PlaneGeometry(200, 200);
        const gridMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        
        const grid = new THREE.Mesh(gridGeometry, gridMaterial);
        grid.rotation.x = -Math.PI / 2;
        grid.position.y = 0.01; // Slightly above ground to prevent z-fighting
        this.scene.add(grid);

        // Add coordinate markers every 10 units
        for (let x = -100; x <= 100; x += 10) {
            for (let z = -100; z <= 100; z += 10) {
                const marker = this.createCoordinateMarker(x, z);
                this.scene.add(marker);
            }
        }
    }

    createCoordinateMarker(x, z) {
        const markerGeometry = new THREE.PlaneGeometry(1, 1);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.rotation.x = -Math.PI / 2;
        marker.position.set(x, 0.02, z);

        // Add text sprite for coordinates
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        
        context.fillStyle = 'white';
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.fillText(`${x},${z}`, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(0, 0.5, 0);
        sprite.scale.set(2, 1, 1);
        
        marker.add(sprite);
        return marker;
    }

    updateCoordinates() {
        if (this.player) {
            const pos = this.player.position;
            const coordDisplay = document.getElementById('coord-display');
            coordDisplay.textContent = `${Math.round(pos.x)}, ${Math.round(pos.y)}, ${Math.round(pos.z)}`;
            
            // Highlight nearest grid square
            const gridX = Math.round(pos.x / this.gridSize) * this.gridSize;
            const gridZ = Math.round(pos.z / this.gridSize) * this.gridSize;
            
            // Update grid highlight effect (optional)
            if (this.highlightedSquare) {
                this.highlightedSquare.material.opacity = 0.5;
            }
            
            // Find and highlight the current grid square
            this.scene.traverse((object) => {
                if (object.isMarker && 
                    object.position.x === gridX && 
                    object.position.z === gridZ) {
                    object.material.opacity = 1.0;
                    this.highlightedSquare = object;
                }
            });
        }
    }
} 