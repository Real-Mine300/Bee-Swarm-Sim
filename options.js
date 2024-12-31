class GameOptions {
    constructor() {
        this.settings = {
            graphics: {
                shadows: false,
                reflections: false
            },
            ui: {
                fontSize: 14,
                messageBubbleColor: '#ffffff',
                messageTimestampFormat: '24h',
                chatWindowWidth: 300,
                chatWindowHeight: 400
            },
            player: {
                bodyColor: '#00ff00',
                headColor: '#00ff00',
                headCurveness: 0,
                armsColor: '#00ff00',
                legsColor: '#00ff00',
                limbCurveness: 0
            }
        };

        this.setupOptionsMenu();
    }

    setupOptionsMenu() {
        const optionsMenu = document.createElement('div');
        optionsMenu.id = 'options-menu';
        optionsMenu.style.display = 'none';
        optionsMenu.innerHTML = `
            <div class="options-content">
                <h2>Game Options</h2>
                
                <section>
                    <h3>Graphics</h3>
                    <label>
                        <input type="checkbox" id="shadows" ${this.settings.graphics.shadows ? 'checked' : ''}>
                        Enable Shadows
                    </label>
                    <label>
                        <input type="checkbox" id="reflections" ${this.settings.graphics.reflections ? 'checked' : ''}>
                        Enable Reflections
                    </label>
                </section>

                <section>
                    <h3>UI Settings</h3>
                    <label>
                        Font Size:
                        <input type="range" id="font-size" min="10" max="24" value="${this.settings.ui.fontSize}">
                        <span>${this.settings.ui.fontSize}px</span>
                    </label>
                    <label>
                        Message Bubble Color:
                        <input type="color" id="bubble-color" value="${this.settings.ui.messageBubbleColor}">
                    </label>
                    <label>
                        Timestamp Format:
                        <select id="timestamp-format">
                            <option value="12h" ${this.settings.ui.messageTimestampFormat === '12h' ? 'selected' : ''}>12-hour</option>
                            <option value="24h" ${this.settings.ui.messageTimestampFormat === '24h' ? 'selected' : ''}>24-hour</option>
                        </select>
                    </label>
                </section>

                <section>
                    <h3>Player Appearance</h3>
                    <label>
                        Body Color:
                        <input type="color" id="body-color" value="${this.settings.player.bodyColor}">
                    </label>
                    <label>
                        Head Color:
                        <input type="color" id="head-color" value="${this.settings.player.headColor}">
                    </label>
                    <label>
                        Head Curveness:
                        <input type="range" id="head-curveness" min="0" max="8" value="${this.settings.player.headCurveness}">
                    </label>
                    <label>
                        Arms/Legs Color:
                        <input type="color" id="limbs-color" value="${this.settings.player.armsColor}">
                    </label>
                    <label>
                        Limb Curveness:
                        <input type="range" id="limb-curveness" min="0" max="8" value="${this.settings.player.limbCurveness}">
                    </label>
                </section>

                <button id="save-options">Save Changes</button>
                <button id="close-options">Close</button>
            </div>
        `;

        document.body.appendChild(optionsMenu);
        this.addEventListeners();
    }

    addEventListeners() {
        document.getElementById('options').addEventListener('click', () => {
            document.getElementById('options-menu').style.display = 'block';
        });

        document.getElementById('close-options').addEventListener('click', () => {
            document.getElementById('options-menu').style.display = 'none';
        });

        document.getElementById('save-options').addEventListener('click', () => {
            this.saveSettings();
        });
    }

    saveSettings() {
        // Update settings object with new values
        this.settings.graphics.shadows = document.getElementById('shadows').checked;
        this.settings.graphics.reflections = document.getElementById('reflections').checked;
        this.settings.ui.fontSize = document.getElementById('font-size').value;
        this.settings.ui.messageBubbleColor = document.getElementById('bubble-color').value;
        this.settings.ui.messageTimestampFormat = document.getElementById('timestamp-format').value;
        this.settings.player.bodyColor = document.getElementById('body-color').value;
        this.settings.player.headColor = document.getElementById('head-color').value;
        this.settings.player.headCurveness = document.getElementById('head-curveness').value;
        this.settings.player.armsColor = document.getElementById('limbs-color').value;
        this.settings.player.limbCurveness = document.getElementById('limb-curveness').value;

        // Apply settings
        this.applySettings();
        
        // Hide menu
        document.getElementById('options-menu').style.display = 'none';
    }

    applySettings() {
        if (window.game) {
            // Apply graphics settings
            window.game.renderer.shadowMap.enabled = this.settings.graphics.shadows;
            
            // Update player appearance
            if (window.game.player) {
                window.game.player.updateAppearance(this.settings.player);
            }
        }

        // Apply UI settings
        document.documentElement.style.setProperty('--font-size', `${this.settings.ui.fontSize}px`);
        document.documentElement.style.setProperty('--message-bubble-color', this.settings.ui.messageBubbleColor);
    }
} 