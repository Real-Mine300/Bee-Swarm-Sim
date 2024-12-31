class Bee {
    constructor(x, y, isPlayer) {
        this.x = x;
        this.y = y;
        this.isPlayer = isPlayer;
        this.speed = 5;
        this.size = 20;
        this.pollen = 0;
        this.maxPollen = 100;
        this.velocity = { x: 0, y: 0 };
        
        if (isPlayer) {
            this.setupControls();
        }
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'w':
                case 'ArrowUp':
                    this.velocity.y = -this.speed;
                    break;
                case 's':
                case 'ArrowDown':
                    this.velocity.y = this.speed;
                    break;
                case 'a':
                case 'ArrowLeft':
                    this.velocity.x = -this.speed;
                    break;
                case 'd':
                case 'ArrowRight':
                    this.velocity.x = this.speed;
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'w':
                case 'ArrowUp':
                case 's':
                case 'ArrowDown':
                    this.velocity.y = 0;
                    break;
                case 'a':
                case 'ArrowLeft':
                case 'd':
                case 'ArrowRight':
                    this.velocity.x = 0;
                    break;
            }
        });
    }

    update(deltaTime) {
        if (this.isPlayer) {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
        } else {
            // AI behavior
            this.aiMovement(deltaTime);
        }
    }

    aiMovement(deltaTime) {
        // Simple AI movement - random wandering
        if (Math.random() < 0.02) {
            this.velocity.x = (Math.random() - 0.5) * this.speed;
            this.velocity.y = (Math.random() - 0.5) * this.speed;
        }
        
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    render(ctx) {
        ctx.fillStyle = this.isPlayer ? '#FFD700' : '#FFA500';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    checkCollision(object) {
        const dx = this.x - object.x;
        const dy = this.y - object.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size / 2 + object.size / 2);
    }

    collectPollen(flower) {
        if (this.pollen < this.maxPollen && flower.pollen > 0) {
            const amount = Math.min(10, flower.pollen);
            this.pollen += amount;
            flower.pollen -= amount;
            this.updateHUD();
        }
    }

    depositPollen(hive) {
        if (this.pollen > 0) {
            hive.receivePollen(this.pollen);
            this.pollen = 0;
            this.updateHUD();
        }
    }

    updateHUD() {
        if (this.isPlayer) {
            document.getElementById('pollen-count').textContent = this.pollen;
        }
    }

    getExportData() {
        return {
            level: this.level,
            cost: this.cost,
            honeyPerSecond: this.honeyPerSecond
        };
    }

    loadFromData(data) {
        this.level = data.level;
        this.cost = data.cost;
        this.honeyPerSecond = data.honeyPerSecond;
        // Update any other necessary properties
    }
} 