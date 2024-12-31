class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setCanvasSize();

        this.player = null;
        this.flowers = [];
        this.aiBees = [];
        this.hive = null;
        
        this.isRunning = false;
        this.lastTime = 0;
        
        this.init();
    }

    setCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        // Initialize player bee
        this.player = new Bee(
            this.canvas.width / 2,
            this.canvas.height / 2,
            true
        );

        // Initialize hive
        this.hive = new Hive(100, 100);

        // Initialize game systems after player and hive are created
        this.upgradeSystem = new UpgradeSystem(this.player, this.hive);
        this.saveSystem = new SaveSystem(this);
        this.mobileControls = new MobileControls(this.player);

        // Create some flowers
        for (let i = 0; i < 10; i++) {
            this.flowers.push(new Flower(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            ));
        }

        // Create AI bees
        for (let i = 0; i < 5; i++) {
            this.aiBees.push(new Bee(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                false
            ));
        }

        // Event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.setCanvasSize());
        
        const startButton = document.getElementById('start-game');
        if (startButton) {
            startButton.addEventListener('click', () => {
                console.log('Start button clicked'); // Debug log
                this.start();
            });
        } else {
            console.error('Start button not found!'); // Debug log
        }
    }

    start() {
        console.log('Game starting...'); // Debug log
        document.getElementById('main-menu').style.display = 'none';
        this.isRunning = true;
        this.saveSystem.load();  // Load any saved game
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    update(deltaTime) {
        this.player.update(deltaTime);
        
        // Update AI bees
        this.aiBees.forEach(bee => bee.update(deltaTime));

        // Check collisions
        this.checkCollisions();
    }

    checkCollisions() {
        // Check flower collisions
        this.flowers.forEach(flower => {
            if (this.player.checkCollision(flower)) {
                this.player.collectPollen(flower);
            }
        });

        // Check hive collision
        if (this.player.checkCollision(this.hive)) {
            this.player.depositPollen(this.hive);
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render flowers
        this.flowers.forEach(flower => flower.render(this.ctx));

        // Render hive
        this.hive.render(this.ctx);

        // Render AI bees
        this.aiBees.forEach(bee => bee.render(this.ctx));

        // Render player
        this.player.render(this.ctx);
    }

    autoSave() {
        setInterval(() => {
            this.saveSystem.save();
        }, 60000);
    }
} 