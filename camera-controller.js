class CameraController {
    constructor(camera, target) {
        this.camera = camera;
        this.target = target;
        
        // Camera settings
        this.distance = 10;
        this.height = 5;
        this.smoothness = 0.1;
        this.rotationSmooth = 0.1;
        this.verticalAngle = 0;
        this.minVerticalAngle = -Math.PI / 3; // -60 degrees
        this.maxVerticalAngle = Math.PI / 3;  // 60 degrees
        
        // Initialize camera position
        this.updateCamera();
    }

    updateCamera() {
        if (!this.target) return;
        
        // Calculate ideal camera position based on player's rotation and vertical angle
        const idealOffset = new THREE.Vector3(
            0,
            this.height,
            this.distance
        );
        
        // Apply vertical rotation
        idealOffset.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.verticalAngle);
        
        // Apply player's horizontal rotation
        idealOffset.applyEuler(new THREE.Euler(0, this.target.rotation.y, 0));
        idealOffset.add(this.target.position);
        
        // Smoothly move camera
        this.camera.position.lerp(idealOffset, this.smoothness);
        
        // Look at player
        const lookAtPos = this.target.position.clone();
        lookAtPos.y += 2;
        this.camera.lookAt(lookAtPos);
    }

    handleMouseMove(event) {
        if (document.pointerLockElement === document.body) {
            // Vertical movement (pitch)
            this.verticalAngle += event.movementY * 0.002;
            this.verticalAngle = Math.max(this.minVerticalAngle, 
                                        Math.min(this.maxVerticalAngle, this.verticalAngle));
        }
    }
} 