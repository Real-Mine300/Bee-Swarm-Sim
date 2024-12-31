class SaveSystem {
    constructor(game) {
        this.game = game;
    }

    save() {
        const gameState = {
            player: {
                pollen: this.game.player.pollen,
                maxPollen: this.game.player.maxPollen,
                speed: this.game.player.speed
            },
            hive: {
                honey: this.game.hive.honey,
                storedPollen: this.game.hive.storedPollen,
                pollenToHoneyRate: this.game.hive.pollenToHoneyRate
            },
            upgrades: this.game.upgradeSystem.upgrades
        };

        localStorage.setItem('beeGameSave', JSON.stringify(gameState));
    }

    load() {
        const savedState = localStorage.getItem('beeGameSave');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            
            // Restore player state
            Object.assign(this.game.player, gameState.player);
            
            // Restore hive state
            Object.assign(this.game.hive, gameState.hive);
            
            // Restore upgrades
            Object.assign(this.game.upgradeSystem.upgrades, gameState.upgrades);
            
            this.game.upgradeSystem.updateUpgradeButtons();
            this.game.hive.updateHUD();
            return true;
        }
        return false;
    }
} 