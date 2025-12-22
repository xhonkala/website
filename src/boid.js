export class Boid {
    constructor(x, y) {
        this.position = { x, y };
        this.velocity = {
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 4
        };
        this.acceleration = { x: 0, y: 0 };
        this.maxForce = 0.05; // Reduced for smoother turning
        this.maxSpeed = 2.5;  // Reduced speed as requested
        this.size = Math.random() * 1.5 + 0.5; // Variable size for depth effect
        // Grey color with variation (range: 160-210 for lighter greys)
        const greyBase = Math.floor(Math.random() * 50) + 160;
        // Add slight color tint variation
        const rOffset = Math.floor((Math.random() - 0.5) * 20);
        const gOffset = Math.floor((Math.random() - 0.5) * 20);
        const bOffset = Math.floor((Math.random() - 0.5) * 20);
        this.color = {
            r: Math.max(0, Math.min(255, greyBase + rOffset)),
            g: Math.max(0, Math.min(255, greyBase + gOffset)),
            b: Math.max(0, Math.min(255, greyBase + bOffset))
        };
    }

    update() {
        // Update velocity
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;

        // Limit speed
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (speed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
        }

        // Update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Reset acceleration
        this.acceleration.x = 0;
        this.acceleration.y = 0;
    }

    applyForce(force) {
        this.acceleration.x += force.x;
        this.acceleration.y += force.y;
    }

    // Wrap around screen
    edges(width, height) {
        if (this.position.x > width) this.position.x = 0;
        else if (this.position.x < 0) this.position.x = width;
        if (this.position.y > height) this.position.y = 0;
        else if (this.position.y < 0) this.position.y = height;
    }

    draw(ctx, isNightMode = false) {
        if (isNightMode) {
            // Night mode: white/light boids
            const lightness = 255 - Math.floor((this.color.r + this.color.g + this.color.b) / 3 - 80);
            ctx.fillStyle = `rgb(${lightness}, ${lightness}, ${lightness})`;
        } else {
            // Day mode: grey boids with color variation
            ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
        }

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
