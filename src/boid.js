// Viriditas palette — each species has a day color (deepened so it reads on the
// paper-white background) and a night color (the true pastel, on forest-ink).
// Gold is the accent thread woven through the greens (~1 in GOLD_EVERY boids).
const PALETTE = [
    { day: { r: 143, g: 188, b: 143 }, night: { r: 191, g: 216, b: 184 } }, // sage
    { day: { r: 109, g: 174, b: 143 }, night: { r: 168, g: 213, b: 186 } }, // celadon
    { day: { r: 163, g: 197, b: 133 }, night: { r: 205, g: 235, b: 216 } }, // moss
];
const GOLD = { day: { r: 201, g: 180, b: 88 }, night: { r: 228, g: 217, b: 160 } };
const GOLD_EVERY = 8;

function jitter(color, amount) {
    const off = () => Math.floor((Math.random() - 0.5) * amount);
    const r = off(), g = off(), b = off();
    return {
        r: Math.max(0, Math.min(255, color.r + r)),
        g: Math.max(0, Math.min(255, color.g + g)),
        b: Math.max(0, Math.min(255, color.b + b)),
    };
}

let boidCounter = 0;

export class Boid {
    constructor(x, y) {
        this.position = { x, y };
        this.velocity = {
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 4
        };
        this.acceleration = { x: 0, y: 0 };
        this.maxForce = 0.05; // Reduced for smoother turning

        // Depth ∈ [0,1] drives size, opacity, and speed for a parallax volume.
        this.depth = Math.random();
        this.size = 0.5 + this.depth * 2.0;        // ~0.5–2.5px
        this.alpha = 0.35 + this.depth * 0.65;     // far = faint, near = solid
        this.maxSpeed = 2.5 * (0.75 + this.depth * 0.4); // near boids move quicker

        // Pick a species; every GOLD_EVERY-th boid gets the gold accent.
        const isGold = boidCounter % GOLD_EVERY === 0;
        boidCounter++;
        const base = isGold ? GOLD : PALETTE[Math.floor(Math.random() * PALETTE.length)];
        this.dayColor = jitter(base.day, 20);
        this.nightColor = jitter(base.night, 20);
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
        const c = isNightMode ? this.nightColor : this.dayColor;
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
