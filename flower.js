class Flower {
    constructor(x, y, z, model, physics) {
        this.position = new THREE.Vector3(x, y, z);
        this.pollen = 100;
        this.maxPollen = 100;
        this.originalHeight = 1.5;
        this.minHeight = 0.3;
        this.isInRange = false;
        this.flowerType = this.constructor.TYPES.DAISY;
        
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

    collectPollen(amount) {
        const collectedAmount = Math.min(this.pollen, amount);
        this.pollen -= collectedAmount;
        
        // Update visual state immediately when pollen is collected
        if (this.pollen <= 0) {
            this.head.rotation.x = Math.PI / 6;
            this.head.material.color.multiplyScalar(0.8);
        }
        
        return collectedAmount;
    }

    // Add flower types
    static TYPES = {
        SUNFLOWER: {
            color: 0xFFD700,
            pollenValue: 15,
            regrowthRate: 0.1
        },
        ROSE: {
            color: 0xFF0000,
            pollenValue: 25,
            regrowthRate: 0.05
        },
        LAVENDER: {
            color: 0x9370DB,
            pollenValue: 20,
            regrowthRate: 0.08
        },
        DAISY: {
            color: 0xFFFFFF,
            pollenValue: 10,
            regrowthRate: 0.15
        }
    };

    update(deltaTime) {
        if (!this.stem || !this.head) return;

        // Check if player is in range
        if (window.game && window.game.player) {
            const distance = this.position.distanceTo(window.game.player.position);
            this.isInRange = distance <= window.game.player.collectionRange;
            
            // Visual feedback when in range
            if (this.isInRange && this.pollen > 0) {
                this.head.material.emissive.setHex(0x444444);
            } else {
                this.head.material.emissive.setHex(0x000000);
            }
        }

        // Regrow pollen slowly
        if (this.pollen < this.maxPollen) {
            this.pollen += this.flowerType.regrowthRate * deltaTime;
            this.pollen = Math.min(this.pollen, this.maxPollen);
        }

        // Update height based on pollen amount
        const pollenRatio = this.pollen / this.maxPollen;
        const targetHeight = this.minHeight + (this.originalHeight - this.minHeight) * pollenRatio;
        
        // Update stem height
        this.stem.scale.y = targetHeight / this.originalHeight;
        
        // Update head position and scale
        this.head.position.y = targetHeight;
        
        // Make head droop slightly when empty
        if (this.pollen <= 0) {
            this.head.rotation.x = Math.PI / 6; // Tilt forward when empty
            this.head.material.color.multiplyScalar(0.8); // Darken color when empty
        } else {
            this.head.rotation.x = 0;
            this.head.material.color.copy(new THREE.Color(this.flowerType.color));
        }
    }

    createModel() {
        const geometry = new THREE.Group();
        
        // Create rectangular stem (thinner)
        this.stem = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, this.originalHeight, 0.2),
            new THREE.MeshPhongMaterial({ color: 0x228B22 })
        );
        this.stem.position.y = this.originalHeight / 2;
        
        // Create rectangular flower head (slightly smaller)
        this.head = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.3, 0.6),
            new THREE.MeshPhongMaterial({ 
                color: 0xFF69B4,
                emissive: 0x000000
            })
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