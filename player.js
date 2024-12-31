class Player {
    constructor(x, y, z, physics) {
        this.position = new THREE.Vector3(x, y, z);
        this.velocity = new THREE.Vector3();
        this.rotation = new THREE.Euler();
        this.speed = 10;
        this.mouseSensitivity = 0.002;
        this.minHeight = 2; // Minimum height from ground
        
        this.createModel();
        this.setupPhysics(physics);
        this.setupMouseControl();
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

    setupMouseControl() {
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === document.body) {
                this.rotation.y -= e.movementX * this.mouseSensitivity;
                this.model.rotation.y = this.rotation.y;
            }
        });

        document.addEventListener('click', () => {
            document.body.requestPointerLock();
        });
    }

    update(deltaTime) {
        // Get movement input
        const moveDirection = new THREE.Vector3();
        
        if (keys.w) moveDirection.z -= 1;
        if (keys.s) moveDirection.z += 1;
        if (keys.a) moveDirection.x -= 1;
        if (keys.d) moveDirection.x += 1;
        if (keys.space) moveDirection.y += 1;
        
        // Apply rotation to movement
        moveDirection.applyEuler(this.rotation);
        moveDirection.normalize().multiplyScalar(this.speed * deltaTime);
        
        // Update velocity
        this.physicsBody.velocity.x = moveDirection.x;
        this.physicsBody.velocity.z = moveDirection.z;
        
        // Prevent going underground
        if (this.physicsBody.position.y < this.minHeight) {
            this.physicsBody.position.y = this.minHeight;
            this.physicsBody.velocity.y = 0;
        }
        
        // Update model position from physics
        this.model.position.copy(this.physicsBody.position);
        this.position.copy(this.model.position);
    }
}

// Global key state
const keys = {
    w: false,
    s: false,
    a: false,
    d: false,
    space: false
};

// Setup key listeners
document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false); 