class Flower {
    constructor(x, y, z, model, physics) {
        this.position = new THREE.Vector3(x, y, z);
        this.pollen = 100;
        this.maxPollen = 100;
        this.originalHeight = 2; // Starting height
        this.minHeight = 0.5;   // Minimum height when empty
        
        this.createModel();
        if (physics) {
            this.setupPhysics(physics);
        }
    }

    createModel() {
        const geometry = new THREE.Group();
        
        // Stem
        this.stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, this.originalHeight, 8),
            new THREE.MeshPhongMaterial({ color: 0x228B22 })
        );
        this.stem.position.y = this.originalHeight / 2;
        
        // Flower head
        this.head = new THREE.Mesh(
            new THREE.ConeGeometry(0.5, 0.5, 8),
            new THREE.MeshPhongMaterial({ color: 0xFF69B4 })
        );
        this.head.position.y = this.originalHeight;
        
        geometry.add(this.stem);
        geometry.add(this.head);
        
        this.model = geometry;
        this.model.position.copy(this.position);
    }

    update(deltaTime) {
        // Update height based on pollen amount
        const pollenRatio = this.pollen / this.maxPollen;
        const targetHeight = this.minHeight + (this.originalHeight - this.minHeight) * pollenRatio;
        
        // Update stem height
        this.stem.scale.y = targetHeight / this.originalHeight;
        this.head.position.y = targetHeight;
        
        // Update physics body height
        if (this.body) {
            this.body.shapes[0].height = targetHeight;
            this.body.updateBoundingSphereRadius();
        }
        
        // Update model position from physics
        this.model.position.copy(this.body.position);
        this.model.quaternion.copy(this.body.quaternion);
    }

    setupPhysics(physics) {
        try {
            const shape = new CANNON.Cylinder(0.5, 0.5, this.originalHeight);
            this.physicsBody = new CANNON.Body({
                mass: 0,
                shape: shape,
                position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z)
            });
            physics.addBody(this.physicsBody);
        } catch (error) {
            console.error("Error setting up flower physics:", error);
        }
    }

    render(ctx) {
        // Draw flower petals
        ctx.fillStyle = '#FF69B4';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const angle = (i * 72) * Math.PI / 180;
            const petalX = this.x + Math.cos(angle) * 15;
            const petalY = this.y + Math.sin(angle) * 15;
            ctx.arc(petalX, petalY, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw center
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
    }
} 