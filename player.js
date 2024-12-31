class Player {
    constructor(x, y, z, physics) {
        this.position = new THREE.Vector3(x, y, z);
        this.velocity = new THREE.Vector3();
        this.rotation = new THREE.Euler();
        this.speed = 15;
        this.jumpForce = 7;
        this.mouseSensitivity = 0.002;
        this.minHeight = 2;
        this.canJump = true;
        this.pollenCapacity = 100;
        this.currentPollen = 0;
        this.collectionRate = 20; // Pollen per second
        this.collectionRange = 2; // How close player needs to be to collect
        
        this.createModel();
        this.setupPhysics(physics);
        this.setupControls();
    }

    createModel() {
        // Create tall rectangular player
        const geometry = new THREE.BoxGeometry(1, 3, 1);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8
        });
        
        this.model = new THREE.Mesh(geometry, material);
        this.model.castShadow = true;
    }

    setupPhysics(physics) {
        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 1.5, 0.5));
        this.physicsBody = new CANNON.Body({
            mass: 1,
            shape: shape,
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            material: new CANNON.Material({ friction: 0.1 })
        });
        
        physics.addBody(this.physicsBody);
    }

    setupControls() {
        // Mouse controls
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === document.body) {
                this.rotation.y -= e.movementX * this.mouseSensitivity;
                this.model.rotation.y = this.rotation.y;
                if (window.game && window.game.cameraController) {
                    window.game.cameraController.handleMouseMove(e);
                }
            }
        });

        document.addEventListener('click', () => {
            document.body.requestPointerLock();
        });

        // Keyboard controls
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        };

        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.keys.forward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.keys.backward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.keys.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.keys.right = true;
                    break;
                case 'Space':
                    this.keys.jump = true;
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.keys.forward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.keys.backward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.keys.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.keys.right = false;
                    break;
                case 'Space':
                    this.keys.jump = false;
                    break;
            }
        });
    }

    update(deltaTime) {
        // Movement direction
        const moveDirection = new THREE.Vector3();
        
        if (this.keys.forward) moveDirection.z -= 1;
        if (this.keys.backward) moveDirection.z += 1;
        if (this.keys.left) moveDirection.x -= 1;
        if (this.keys.right) moveDirection.x += 1;
        
        // Apply rotation to movement
        moveDirection.applyEuler(this.rotation);
        moveDirection.normalize().multiplyScalar(this.speed);
        
        // Update physics body velocity
        this.physicsBody.velocity.x = moveDirection.x;
        this.physicsBody.velocity.z = moveDirection.z;

        // Handle jumping
        if (this.keys.jump && this.canJump && this.physicsBody.position.y <= this.minHeight + 0.1) {
            this.physicsBody.velocity.y = this.jumpForce;
            this.canJump = false;
            setTimeout(() => this.canJump = true, 1000); // Jump cooldown
        }

        // Prevent going underground
        if (this.physicsBody.position.y < this.minHeight) {
            this.physicsBody.position.y = this.minHeight;
            this.physicsBody.velocity.y = 0;
            this.canJump = true;
        }

        // Check for nearby flowers and collect pollen
        this.collectPollenFromNearbyFlowers(deltaTime);

        // Deposit pollen if near hive
        this.depositPollenToHive();

        // Update model position from physics
        this.model.position.copy(this.physicsBody.position);
        this.position.copy(this.model.position);

        // Update HUD
        this.updateHUD();
    }

    collectPollenFromNearbyFlowers(deltaTime) {
        if (this.currentPollen >= this.pollenCapacity) return;

        if (window.game && window.game.flowers) {
            window.game.flowers.forEach(flower => {
                const distance = this.position.distanceTo(flower.position);
                if (distance <= this.collectionRange && flower.pollen > 0) {
                    const collectionAmount = this.collectionRate * deltaTime;
                    const collected = flower.collectPollen(collectionAmount);
                    this.currentPollen = Math.min(this.pollenCapacity, this.currentPollen + collected);
                }
            });
        }
    }

    depositPollenToHive() {
        if (this.currentPollen <= 0) return;

        if (window.game && window.game.hive) {
            const distance = this.position.distanceTo(window.game.hive.position);
            if (distance <= 3) { // Deposit range
                window.game.hive.receivePollen(this.currentPollen);
                this.currentPollen = 0;
            }
        }
    }

    updateHUD() {
        const pollenCount = document.getElementById('pollen-count');
        if (pollenCount) {
            pollenCount.textContent = Math.floor(this.currentPollen);
        }
    }
} 