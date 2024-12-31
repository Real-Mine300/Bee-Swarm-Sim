class CameraController {
    constructor(camera, target) {
        this.camera = camera;
        this.target = target;
        
        // Camera settings
        this.distance = 10;
        this.height = 5;
        this.smoothness = 0.1;
        this.rotationSmooth = 0.1;
        
        // Initialize camera position
        this.updateCamera();
    }

    updateCamera() {
        if (!this.target) return;
        
        // Calculate ideal camera position based on player's rotation
        const idealOffset = new THREE.Vector3(
            0,
            this.height,
            this.distance
        );
        
        // Rotate offset based on player's rotation
        idealOffset.applyEuler(new THREE.Euler(0, this.target.rotation.y, 0));
        idealOffset.add(this.target.position);
        
        // Smoothly move camera
        this.camera.position.lerp(idealOffset, this.smoothness);
        
        // Look at player
        const lookAtPos = this.target.position.clone();
        lookAtPos.y += 2; // Look slightly above player
        this.camera.lookAt(lookAtPos);
    }
} 