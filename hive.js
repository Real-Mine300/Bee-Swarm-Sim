class Hive {
    constructor(x, y, z, model, physics) {
        this.position = new THREE.Vector3(x, y, z);
        this.honey = 0;
        this.storedPollen = 0;
        this.pollenToHoneyRate = 1;
        
        // Create tall hive model
        this.createTallHiveModel();
        
        // Setup physics
        this.setupPhysics(physics);
    }

    createTallHiveModel() {
        // Create a tall hive structure
        const geometry = new THREE.Group();
        
        // Main tall body
        const bodyGeometry = new THREE.CylinderGeometry(2, 2.5, 8, 8); // Made much taller (8 units)
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xD2691E,
            roughness: 0.7,
            metalness: 0.1
        });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.castShadow = true;
        this.body.receiveShadow = true;

        // Add horizontal rings for detail
        for (let i = 0; i < 5; i++) {
            const ringGeometry = new THREE.TorusGeometry(2.2, 0.2, 8, 16);
            const ring = new THREE.Mesh(ringGeometry, bodyMaterial);
            ring.position.y = -3 + (i * 1.5); // Spread rings along height
            ring.rotation.x = Math.PI / 2;
            geometry.add(ring);
        }

        // Add entrance hole
        const entranceGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 16);
        const entranceMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
        entrance.position.set(0, 0, 2.5);
        entrance.rotation.x = Math.PI / 2;
        
        // Add all parts to the group
        geometry.add(this.body);
        geometry.add(entrance);
        
        this.model = geometry;
        this.model.position.copy(this.position);
    }

    setupPhysics(physics) {
        // Create tall cylindrical physics body
        const shape = new CANNON.Cylinder(2, 2.5, 8, 8); // Match visual dimensions
        this.body = new CANNON.Body({
            mass: 0, // Static body
            shape: shape,
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            material: new CANNON.Material({ friction: 0.5 })
        });
        
        physics.addBody(this.body);
    }

    update(deltaTime) {
        // Convert stored pollen to honey
        if (this.storedPollen > 0) {
            const honeyProduced = this.pollenToHoneyRate * deltaTime;
            this.honey += honeyProduced;
            this.storedPollen -= honeyProduced;
            this.updateHUD();
        }

        // Update model position from physics
        this.model.position.copy(this.body.position);
        this.model.quaternion.copy(this.body.quaternion);
    }

    receivePollen(amount) {
        this.storedPollen += amount;
        this.updateHUD();
    }

    updateHUD() {
        document.getElementById('honey-count').textContent = Math.floor(this.honey);
    }
} 