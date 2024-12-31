class MobileControls {
    constructor(player) {
        this.player = player;
        this.touchStartPos = { x: 0, y: 0 };
        this.joystickPos = { x: 0, y: 0 };
        this.isTouch = false;
        
        this.createJoystick();
        this.setupEventListeners();
    }

    createJoystick() {
        const joystick = document.createElement('div');
        joystick.id = 'joystick';
        joystick.innerHTML = `
            <div id="joystick-base"></div>
            <div id="joystick-stick"></div>
        `;
        document.body.appendChild(joystick);

        // Add joystick styles
        const style = document.createElement('style');
        style.textContent = `
            #joystick {
                position: fixed;
                bottom: 50px;
                left: 50px;
                display: none;
            }
            #joystick-base {
                width: 100px;
                height: 100px;
                background: rgba(255,255,255,0.5);
                border-radius: 50%;
                position: relative;
            }
            #joystick-stick {
                width: 40px;
                height: 40px;
                background: rgba(255,255,255,0.8);
                border-radius: 50%;
                position: absolute;
                top: 30px;
                left: 30px;
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        const joystick = document.getElementById('joystick');
        
        // Show joystick on mobile devices
        if ('ontouchstart' in window) {
            joystick.style.display = 'block';
        }

        joystick.addEventListener('touchstart', (e) => {
            this.isTouch = true;
            this.handleTouchStart(e);
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isTouch) {
                this.handleTouchMove(e);
            }
        });

        document.addEventListener('touchend', () => {
            this.isTouch = false;
            this.resetJoystick();
        });
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        this.touchStartPos.x = touch.clientX;
        this.touchStartPos.y = touch.clientY;
    }

    handleTouchMove(e) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartPos.x;
        const deltaY = touch.clientY - this.touchStartPos.y;
        
        // Calculate joystick position
        const angle = Math.atan2(deltaY, deltaX);
        const distance = Math.min(50, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
        
        this.joystickPos.x = Math.cos(angle) * distance;
        this.joystickPos.y = Math.sin(angle) * distance;
        
        // Update joystick visual position
        const stick = document.getElementById('joystick-stick');
        stick.style.transform = `translate(${this.joystickPos.x}px, ${this.joystickPos.y}px)`;
        
        // Update player velocity
        this.player.velocity.x = this.joystickPos.x / 50 * this.player.speed;
        this.player.velocity.y = this.joystickPos.y / 50 * this.player.speed;
    }

    resetJoystick() {
        this.joystickPos = { x: 0, y: 0 };
        this.player.velocity = { x: 0, y: 0 };
        const stick = document.getElementById('joystick-stick');
        stick.style.transform = 'translate(0px, 0px)';
    }
} 