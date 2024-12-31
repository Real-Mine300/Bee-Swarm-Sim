class AudioManager {
    constructor() {
        this.sounds = {
            buzz: new Audio('sounds/buzz.mp3'),
            collectPollen: new Audio('sounds/collect.mp3'),
            depositPollen: new Audio('sounds/deposit.mp3'),
            background: new Audio('sounds/background.mp3')
        };

        // Set background music to loop
        this.sounds.background.loop = true;
        this.setupVolumeControls();
    }

    setupVolumeControls() {
        const volumeControl = document.createElement('div');
        volumeControl.id = 'volume-control';
        volumeControl.innerHTML = `
            <label>
                Volume: <input type="range" min="0" max="1" step="0.1" value="0.5">
            </label>
        `;
        document.getElementById('hud').appendChild(volumeControl);

        volumeControl.querySelector('input').addEventListener('change', (e) => {
            this.setVolume(e.target.value);
        });
    }

    setVolume(value) {
        Object.values(this.sounds).forEach(sound => {
            sound.volume = value;
        });
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
        }
    }

    startBackgroundMusic() {
        this.sounds.background.play();
    }
} 