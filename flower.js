class Flower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.pollen = 100;
        this.pollenRegenerationRate = 0.1;
    }

    update(deltaTime) {
        if (this.pollen < 100) {
            this.pollen += this.pollenRegenerationRate * deltaTime;
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