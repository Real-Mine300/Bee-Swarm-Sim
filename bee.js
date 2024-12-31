class Bee {
    constructor(x, y, z, isPlayer, model, physics) {
        this.position = new THREE.Vector3(x, y, z);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.isPlayer = isPlayer;
        this.speed = 5;
        this.pollen = 0;
        this.maxPollen = 100;
        this.velocity = new THREE.Vector3();
        
        // Create tall rectangular bee model instead of using loaded model
        this.createTallModel();
        
        // Setup physics
        this.setupPhysics(physics);
        
        if (isPlayer) {
            this.setupControls();
            this.setupCamera();
        }
    }

    createTallModel() {
        const geometry = new THREE.Group();
        
        // Different sizes for player vs regular bees
        const height = this.isPlayer ? 3 : 1;
        const width = this.isPlayer ? 1 : 0.5;
        
        // Body - brighter colors
        const bodyGeometry = new THREE.BoxGeometry(width, height, width);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: this.isPlayer ? 0xFFD700 : 0xFFA500,
            shininess: 100,
            emissive: this.isPlayer ? 0x332200 : 0x331100 // Add some emissive light
        });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.castShadow = true;

        // Wings - more visible
        const wingGeometry = new THREE.PlaneGeometry(width * 1.5, height * 0.3);
        const wingMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.7, // Increased opacity
            side: THREE.DoubleSide,
            emissive: 0x666666 // Add some emissive light
        });
        
        this.leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        this.rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        
        // Position wings relative to body size
        this.leftWing.position.set(-width, height * 0.3, 0);
        this.rightWing.position.set(width, height * 0.3, 0);
        
        geometry.add(this.body);
        geometry.add(this.leftWing);
        geometry.add(this.rightWing);
        
        this.model = geometry;
        this.model.position.copy(this.position);
    }

    setupPhysics(physics) {
        // Physics body matches visual size
        const height = this.isPlayer ? 1.5 : 0.5; // Half-height for physics
        const width = this.isPlayer ? 0.5 : 0.25; // Half-width for physics
        
        const shape = new CANNON.Box(new CANNON.Vec3(width, height, width));
        this.body = new CANNON.Body({
            mass: 1,
            shape: shape,
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            material: new CANNON.Material({ friction: 0.1, restitution: 0.7 })
        });
        
        physics.addBody(this.body);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Position camera behind and slightly above the bee
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(this.position);
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'w':
                case 'ArrowUp':
                    this.velocity.z = -this.speed;
                    break;
                case 's':
                case 'ArrowDown':
                    this.velocity.z = this.speed;
                    break;
                case 'a':
                case 'ArrowLeft':
                    this.velocity.x = -this.speed;
                    break;
                case 'd':
                case 'ArrowRight':
                    this.velocity.x = this.speed;
                    break;
                case 'Space':
                case ' ':
                    this.velocity.y = this.speed; // Up
                    break;
                case 'Shift':
                    this.velocity.y = -this.speed; // Down
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'w':
                case 's':
                case 'ArrowUp':
                case 'ArrowDown':
                    this.velocity.z = 0;
                    break;
                case 'a':
                case 'd':
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.velocity.x = 0;
                    break;
                case 'Space':
                case ' ':
                case 'Shift':
                    this.velocity.y = 0;
                    break;
            }
        });
    }

    update(deltaTime) {
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.model.position.copy(this.position);
        
        // Animate wings
        if (this.leftWing && this.rightWing) {
            const wingAngle = Math.sin(Date.now() * 0.02) * 0.5;
            this.leftWing.rotation.x = wingAngle;
            this.rightWing.rotation.x = wingAngle;
        }

        // Update camera if player
        if (this.isPlayer && this.camera) {
            const cameraOffset = new THREE.Vector3(0, 5, 10);
            this.camera.position.copy(this.position).add(cameraOffset);
            this.camera.lookAt(this.position);
        }
    }

    checkCollision(object) {
        const distance = this.position.distanceTo(object.position);
        return distance < (this.size + object.size);
    }

    collectPollen(flower) {
        if (this.pollen < this.maxPollen && flower.pollen > 0) {
            const amount = Math.min(10, flower.pollen);
            this.pollen += amount;
            flower.pollen -= amount;
            this.updateHUD();
        }
    }

    depositPollen(hive) {
        if (this.pollen > 0) {
            hive.receivePollen(this.pollen);
            this.pollen = 0;
            this.updateHUD();
        }
    }

    updateHUD() {
        if (this.isPlayer) {
            document.getElementById('pollen-count').textContent = this.pollen;
        }
    }

    getExportData() {
        return {
            level: this.level,
            cost: this.cost,
            honeyPerSecond: this.honeyPerSecond
        };
    }

    loadFromData(data) {
        this.level = data.level;
        this.cost = data.cost;
        this.honeyPerSecond = data.honeyPerSecond;
        // Update any other necessary properties
    }
} 