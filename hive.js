class Hive {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 50;
        this.honey = 0;
        this.pollenToHoneyRate = 0.5;
        this.storedPollen = 0;
    }

    update(deltaTime) {
        if (this.storedPollen > 0) {
            const honeyProduced = this.pollenToHoneyRate * deltaTime;
            this.honey += honeyProduced;
            this.storedPollen -= honeyProduced;
            this.updateHUD();
        }
    }

    render(ctx) {
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    receivePollen(amount) {
        this.storedPollen += amount;
        this.updateHUD();
    }

    updateHUD() {
        document.getElementById('honey-count').textContent = Math.floor(this.honey);
    }
} 