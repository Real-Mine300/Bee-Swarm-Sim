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

function exportSave() {
    // Get the game instance
    const game = window.game;
    
    // Gather all relevant game state
    const gameState = {
        honey: game.honey,
        totalHoney: game.totalHoney,
        bees: game.bees.map(bee => ({
            level: bee.level,
            cost: bee.cost,
            honeyPerSecond: bee.honeyPerSecond
        })),
        upgrades: game.upgrades,
    };

    // Convert to string and encode
    const saveString = btoa(JSON.stringify(gameState));
    
    // Copy to clipboard
    navigator.clipboard.writeText(saveString).then(() => {
        alert('Save data copied to clipboard!');
    }).catch(err => {
        // Fallback for clipboard failure
        prompt('Copy this save data:', saveString);
    });
}

function importSave() {
    const saveString = prompt('Paste your save data:');
    if (!saveString) return;

    try {
        // Get the game instance
        const game = window.game;
        
        // Decode and parse the save string
        const gameState = JSON.parse(atob(saveString));

        // Restore game state
        game.honey = gameState.honey;
        game.totalHoney = gameState.totalHoney;
        
        // Restore bees
        game.bees = gameState.bees.map(beeData => {
            return {
                level: beeData.level,
                cost: beeData.cost,
                honeyPerSecond: beeData.honeyPerSecond
            };
        });
        
        game.upgrades = gameState.upgrades;
        
        // Update UI
        game.updateDisplay();
        alert('Game restored successfully!');
    } catch (error) {
        alert('Invalid save data!');
        console.error(error);
    }
} 