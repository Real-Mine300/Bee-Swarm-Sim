class Flower {
    constructor(x, y, z, model, physics) {
        this.position = new THREE.Vector3(x, y, z);
        this.pollen = 100;
        this.maxPollen = 100;
        this.originalHeight = 2;
        this.minHeight = 0.5;
        
        this.createModel();
        if (physics) {
            this.setupPhysics(physics);
        }
    }

    update(deltaTime) {
        // Update height based on pollen amount
        const pollenRatio = this.pollen / this.maxPollen;
        const targetHeight = this.minHeight + (this.originalHeight - this.minHeight) * pollenRatio;
        
        // Update stem height
        this.stem.scale.y = targetHeight / this.originalHeight;
        this.head.position.y = targetHeight;
        
        // Update physics body height if it exists
        if (this.physicsBody) {
            this.physicsBody.shapes[0].height = targetHeight;
            this.physicsBody.updateBoundingSphereRadius();
            
            // Update model position from physics
            this.model.position.copy(new THREE.Vector3(
                this.physicsBody.position.x,
                this.physicsBody.position.y,
                this.physicsBody.position.z
            ));
            this.model.quaternion.copy(new THREE.Quaternion(
                this.physicsBody.quaternion.x,
                this.physicsBody.quaternion.y,
                this.physicsBody.quaternion.z,
                this.physicsBody.quaternion.w
            ));
        }
    }

    setupPhysics(physics) {
        try {
            const shape = new CANNON.Cylinder(0.5, 0.5, this.originalHeight);
            this.physicsBody = new CANNON.Body({
                mass: 0, // Static body
                shape: shape,
                position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z)
            });
            physics.addBody(this.physicsBody);
        } catch (error) {
            console.error("Error setting up flower physics:", error);
        }
    }

    createModel() {
        const geometry = new THREE.Group();
        
        // Create rectangular stem
        this.stem = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, this.originalHeight, 0.3),
            new THREE.MeshPhongMaterial({ color: 0x228B22 })
        );
        this.stem.position.y = this.originalHeight / 2;
        
        // Create rectangular flower head
        this.head = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.4, 0.8),
            new THREE.MeshPhongMaterial({ color: 0xFF69B4 })
        );
        this.head.position.y = this.originalHeight;
        
        geometry.add(this.stem);
        geometry.add(this.head);
        
        this.model = geometry;
        this.model.position.copy(this.position);
        
        // Add shadows
        this.stem.castShadow = true;
        this.stem.receiveShadow = true;
        this.head.castShadow = true;
        this.head.receiveShadow = true;
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