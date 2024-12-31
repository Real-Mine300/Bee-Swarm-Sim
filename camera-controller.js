class CameraController {
    constructor(camera, target) {
        this.camera = camera;
        this.target = target;
        
        // Camera settings
        this.distance = 25;
        this.height = 15;
        this.smoothness = 0.1;
        
        // Initialize camera position
        this.updateCamera();
    }

    updateCamera() {
        if (!this.target) return;
        
        // Calculate ideal camera position
        const idealOffset = new THREE.Vector3(
            0,
            this.height,
            this.distance
        );
        
        // Rotate offset based on target's rotation
        idealOffset.applyQuaternion(this.target.model.quaternion);
        idealOffset.add(this.target.position);
        
        // Smoothly move camera
        this.camera.position.lerp(idealOffset, this.smoothness);
        this.camera.lookAt(this.target.position);
    }
} 