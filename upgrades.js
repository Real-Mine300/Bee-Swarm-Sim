class UpgradeSystem {
    constructor(player, hive) {
        this.player = player;
        this.hive = hive;
        this.upgrades = {
            speed: { level: 1, cost: 100, multiplier: 1.2 },
            capacity: { level: 1, cost: 150, multiplier: 1.5 },
            honeyRate: { level: 1, cost: 200, multiplier: 1.3 }
        };
        
        this.createUpgradeMenu();
    }

    createUpgradeMenu() {
        const menu = document.createElement('div');
        menu.id = 'upgrade-menu';
        menu.style.display = 'none';
        menu.innerHTML = `
            <h2>Upgrades</h2>
            <button id="upgrade-speed">Speed (${this.upgrades.speed.cost} honey)</button>
            <button id="upgrade-capacity">Capacity (${this.upgrades.capacity.cost} honey)</button>
            <button id="upgrade-honeyrate">Honey Rate (${this.upgrades.honeyRate.cost} honey)</button>
        `;
        document.body.appendChild(menu);

        this.setupUpgradeListeners();
    }

    setupUpgradeListeners() {
        document.getElementById('upgrade-speed').onclick = () => this.purchaseUpgrade('speed');
        document.getElementById('upgrade-capacity').onclick = () => this.purchaseUpgrade('capacity');
        document.getElementById('upgrade-honeyrate').onclick = () => this.purchaseUpgrade('honeyRate');
    }

    purchaseUpgrade(type) {
        const upgrade = this.upgrades[type];
        if (this.hive.honey >= upgrade.cost) {
            this.hive.honey -= upgrade.cost;
            upgrade.level++;
            upgrade.cost = Math.floor(upgrade.cost * upgrade.multiplier);

            switch(type) {
                case 'speed':
                    this.player.speed *= 1.2;
                    break;
                case 'capacity':
                    this.player.maxPollen *= 1.5;
                    break;
                case 'honeyRate':
                    this.hive.pollenToHoneyRate *= 1.3;
                    break;
            }

            this.updateUpgradeButtons();
            this.hive.updateHUD();
        }
    }

    updateUpgradeButtons() {
        Object.entries(this.upgrades).forEach(([type, data]) => {
            const button = document.getElementById(`upgrade-${type}`);
            button.textContent = `${type} (${data.cost} honey)`;
        });
    }

    toggleMenu() {
        const menu = document.getElementById('upgrade-menu');
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
} 