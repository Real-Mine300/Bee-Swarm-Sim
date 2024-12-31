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

    setupPhysics(physics) {
        try {
            // Use box shape instead of cylinder for better performance
            const shape = new CANNON.Box(new CANNON.Vec3(0.4, this.originalHeight/2, 0.4));
            this.physicsBody = new CANNON.Body({
                mass: 0, // Static body
                shape: shape,
                position: new CANNON.Vec3(this.position.x, this.position.y + this.originalHeight/2, this.position.z)
            });
            physics.addBody(this.physicsBody);
        } catch (error) {
            console.error("Error setting up flower physics:", error);
        }
    }

    update(deltaTime) {
        if (!this.stem || !this.head) return;

        // Update height based on pollen amount
        const pollenRatio = this.pollen / this.maxPollen;
        const targetHeight = this.minHeight + (this.originalHeight - this.minHeight) * pollenRatio;
        
        // Update stem height
        this.stem.scale.y = targetHeight / this.originalHeight;
        this.head.position.y = targetHeight;
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