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
    // Gather all relevant game state
    const gameState = {
        honey: honey,
        totalHoney: totalHoney,
        bees: bees.map(bee => ({
            level: bee.level,
            cost: bee.cost,
            honeyPerSecond: bee.honeyPerSecond
        })),
        upgrades: upgrades,
        // Add any other important game state here
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
        // Decode and parse the save string
        const gameState = JSON.parse(atob(saveString));

        // Restore game state
        honey = gameState.honey;
        totalHoney = gameState.totalHoney;
        
        // Restore bees
        bees = gameState.bees.map(beeData => {
            return {
                level: beeData.level,
                cost: beeData.cost,
                honeyPerSecond: beeData.honeyPerSecond
            };
        });
        
        upgrades = gameState.upgrades;
        
        // Update UI
        updateDisplay();
        alert('Game restored successfully!');
    } catch (error) {
        alert('Invalid save data!');
        console.error(error);
    }
} 