class Bee {
    constructor(x, y, z, physics) {
        this.position = new THREE.Vector3(x, y, z);
        this.velocity = new THREE.Vector3();
        this.speed = 3;
        this.followDistance = 5;
        this.height = 1;
        this.pollenCapacity = 50;
        this.currentPollen = 0;
        this.collectionRate = 10;
        this.targetFlower = null;
        
        this.createModel();
        if (physics) {
            this.setupPhysics(physics);
        }
    }

    update(deltaTime, playerPosition) {
        // Find nearest flower if not carrying max pollen
        if (this.currentPollen < this.pollenCapacity && !this.targetFlower) {
            this.targetFlower = this.findNearestFlower();
        }

        // If we have a target flower and aren't full, collect pollen
        if (this.targetFlower && this.currentPollen < this.pollenCapacity) {
            const distance = this.position.distanceTo(this.targetFlower.position);
            if (distance < 1) {
                const collected = this.targetFlower.collectPollen(this.collectionRate * deltaTime);
                this.currentPollen += collected;
                if (this.currentPollen >= this.pollenCapacity || this.targetFlower.pollen <= 0) {
                    this.targetFlower = null;
                }
            } else {
                // Move towards flower
                const direction = this.targetFlower.position.clone().sub(this.position).normalize();
                this.position.add(direction.multiplyScalar(this.speed * deltaTime));
            }
        } else if (this.currentPollen > 0) {
            // Return to hive
            const hive = window.game.hive;
            const distance = this.position.distanceTo(hive.position);
            if (distance < 1) {
                hive.receivePollen(this.currentPollen);
                this.currentPollen = 0;
            } else {
                const direction = hive.position.clone().sub(this.position).normalize();
                this.position.add(direction.multiplyScalar(this.speed * deltaTime));
            }
        } else {
            // Follow player
            const toPlayer = playerPosition.clone().sub(this.position);
            const distance = toPlayer.length();
            if (distance > this.followDistance) {
                toPlayer.normalize().multiplyScalar(this.speed * deltaTime);
                this.position.add(toPlayer);
            }
        }

        // Update model position
        this.model.position.copy(this.position);
        
        // Animate wings
        if (this.leftWing && this.rightWing) {
            const wingAngle = Math.sin(Date.now() * 0.02) * 0.5;
            this.leftWing.rotation.x = wingAngle;
            this.rightWing.rotation.x = wingAngle;
        }
    }

    findNearestFlower() {
        let nearest = null;
        let minDistance = Infinity;
        
        window.game.flowers.forEach(flower => {
            if (flower.pollen > 0) {
                const distance = this.position.distanceTo(flower.position);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = flower;
                }
            }
        });
        
        return nearest;
    }

    createModel() {
        const geometry = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFA500,
            shininess: 100,
            emissive: 0x331100
        });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.castShadow = true;

        // Wings
        const wingGeometry = new THREE.PlaneGeometry(0.75, 0.3);
        const wingMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
            emissive: 0x666666
        });
        
        this.leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        this.rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        
        this.leftWing.position.set(-0.4, 0.2, 0);
        this.rightWing.position.set(0.4, 0.2, 0);
        
        geometry.add(this.body);
        geometry.add(this.leftWing);
        geometry.add(this.rightWing);
        
        this.model = geometry;
        this.model.position.copy(this.position);
    }

    setupPhysics(physics) {
        try {
            const shape = new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25));
            this.physicsBody = new CANNON.Body({
                mass: 1,
                shape: shape,
                position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
                material: new CANNON.Material({ friction: 0.1 })
            });
            
            // Allow flying by reducing gravity effect
            this.physicsBody.gravity.set(0, -2, 0);
            
            physics.addBody(this.physicsBody);
        } catch (error) {
            console.error("Error setting up bee physics:", error);
        }
    }
} 