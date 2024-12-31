class Hive {
    constructor(x, y, z, model, physics) {
        this.position = new THREE.Vector3(x, y, z);
        this.honey = 0;
        this.storedPollen = 0;
        this.pollenToHoneyRate = 1;
        this.height = 15; // Increased height
        
        this.createModel();
        if (physics) {
            this.setupPhysics(physics);
        }
    }

    createModel() {
        const geometry = new THREE.Group();
        
        // Main body - taller rectangular prism
        const bodyGeometry = new THREE.BoxGeometry(4, this.height, 4);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xD2691E,
            // Removed roughness and metalness for simpler default appearance
        });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        
        // Entrance hole
        const entranceGeometry = new THREE.BoxGeometry(1, 1, 0.5);
        const entranceMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
        entrance.position.set(0, -5, 2);

        // Add details (horizontal stripes)
        for (let i = 0; i < 8; i++) { // More stripes for taller hive
            const stripeGeometry = new THREE.BoxGeometry(4.2, 0.3, 4.2);
            const stripe = new THREE.Mesh(stripeGeometry, bodyMaterial);
            stripe.position.y = -6 + (i * 2);
            geometry.add(stripe);
        }

        geometry.add(this.body);
        geometry.add(entrance);
        
        this.model = geometry;
        this.model.position.copy(this.position);
    }

    setupPhysics(physics) {
        const shape = new CANNON.Box(new CANNON.Vec3(2, 3, 2));
        this.physicsBody = new CANNON.Body({
            mass: 0,
            shape: shape,
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z)
        });
        physics.addBody(this.physicsBody);
    }

    update(deltaTime) {
        // Convert stored pollen to honey
        if (this.storedPollen > 0) {
            const honeyProduced = this.pollenToHoneyRate * deltaTime;
            this.honey += honeyProduced;
            this.storedPollen -= honeyProduced;
            this.updateHUD();
        }
    }

    receivePollen(amount) {
        this.storedPollen += amount;
        this.updateHUD();
    }

    updateHUD() {
        document.getElementById('honey-count').textContent = Math.floor(this.honey);
    }
} 