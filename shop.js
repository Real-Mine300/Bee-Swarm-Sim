class Shop {
    constructor(x, y, z) {
        this.position = new THREE.Vector3(x, y, z);
        this.upgrades = {
            BEE_SPEED: {
                name: "Faster Bees",
                cost: 100,
                level: 0,
                maxLevel: 5,
                effect: (level) => level * 0.5
            },
            POLLEN_CAPACITY: {
                name: "Bigger Pollen Bags",
                cost: 150,
                level: 0,
                maxLevel: 5,
                effect: (level) => level * 25
            },
            BEE_COUNT: {
                name: "More Bees",
                cost: 500,
                level: 0,
                maxLevel: 3,
                effect: (level) => level * 2
            }
        };
        
        this.createModel();
    }

    createModel() {
        const geometry = new THREE.Group();
        
        // Main building - make it taller
        const buildingGeometry = new THREE.BoxGeometry(8, 10, 20);
        const buildingMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B4513
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.castShadow = true;
        building.receiveShadow = true;
        
        // Roof - make it bigger
        const roofGeometry = new THREE.ConeGeometry(6, 6, 4);
        const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 8;
        roof.castShadow = true;
        
        geometry.add(building);
        geometry.add(roof);
        
        this.model = geometry;
        this.model.position.copy(this.position);
    }

    purchaseUpgrade(type) {
        const upgrade = this.upgrades[type];
        if (!upgrade || upgrade.level >= upgrade.maxLevel) return false;
        
        const cost = upgrade.cost * (upgrade.level + 1);
        if (window.game.honey >= cost) {
            window.game.honey -= cost;
            upgrade.level++;
            this.applyUpgrade(type);
            return true;
        }
        return false;
    }

    applyUpgrade(type) {
        const upgrade = this.upgrades[type];
        switch(type) {
            case 'BEE_SPEED':
                window.game.bees.forEach(bee => {
                    bee.speed = 3 + upgrade.effect(upgrade.level);
                });
                break;
            case 'POLLEN_CAPACITY':
                window.game.bees.forEach(bee => {
                    bee.pollenCapacity = 50 + upgrade.effect(upgrade.level);
                });
                break;
            case 'BEE_COUNT':
                const newBees = upgrade.effect(upgrade.level) - window.game.bees.length;
                for (let i = 0; i < newBees; i++) {
                    window.game.createBee();
                }
                break;
        }
    }
} 