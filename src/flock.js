import { Boid } from './boid.js';
import { SpatialGrid } from './spatial-grid.js';

export class Flock {
    constructor(width, height) {
        this.boids = [];
        this.width = width;
        this.height = height;
        this.perceptionRadius = 40; // Slightly smaller radius for tighter groups
        this.grid = new SpatialGrid(width, height, this.perceptionRadius);
    }

    addBoid() {
        this.boids.push(new Boid(Math.random() * this.width, Math.random() * this.height));
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.grid = new SpatialGrid(width, height, this.perceptionRadius);
    }

    update(target, repulsionTargets = []) {
        // Rebuild grid
        this.grid.clear();
        for (let boid of this.boids) {
            this.grid.add(boid);
        }

        for (let boid of this.boids) {
            boid.edges(this.width, this.height);
            this.flock(boid, target, repulsionTargets);
            boid.update();
        }
    }

    draw(ctx, isNightMode = false) {
        for (let boid of this.boids) {
            boid.draw(ctx, isNightMode);
        }
    }

    flock(boid, target, repulsionTargets) {
        let alignment = { x: 0, y: 0 };
        let cohesion = { x: 0, y: 0 };
        let separation = { x: 0, y: 0 };
        let mouseForce = { x: 0, y: 0 };
        let avoidForce = { x: 0, y: 0 };
        let total = 0;

        // Query grid for neighbors
        const neighbors = this.grid.getNearby(boid);

        for (let other of neighbors) {
            if (other === boid) continue;

            const dx = other.position.x - boid.position.x;
            const dy = other.position.y - boid.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.perceptionRadius && distance > 0) {
                // Alignment
                alignment.x += other.velocity.x;
                alignment.y += other.velocity.y;

                // Cohesion
                cohesion.x += other.position.x;
                cohesion.y += other.position.y;

                // Separation
                const diff = {
                    x: boid.position.x - other.position.x,
                    y: boid.position.y - other.position.y
                };
                diff.x /= distance; // Weight by distance
                diff.y /= distance;
                separation.x += diff.x;
                separation.y += diff.y;

                total++;
            }
        }

        if (total > 0) {
            // Average alignment
            alignment.x /= total;
            alignment.y /= total;
            alignment = this.steer(boid, alignment);

            // Average cohesion
            cohesion.x /= total;
            cohesion.y /= total;
            cohesion.x -= boid.position.x;
            cohesion.y -= boid.position.y;
            cohesion = this.steer(boid, cohesion);

            // Average separation
            separation.x /= total;
            separation.y /= total;
            separation = this.steer(boid, separation);
        }

        // Mouse attraction (Seek)
        if (target) {
            mouseForce.x = target.x - boid.position.x;
            mouseForce.y = target.y - boid.position.y;
            mouseForce = this.steer(boid, mouseForce);
        }

        // Avoidance (Repulsion)
        if (repulsionTargets && repulsionTargets.length > 0) {
            avoidForce = this.avoid(boid, repulsionTargets);
        }

        // Weights tuned for "murmuration" / fluid cloud look
        // High alignment and cohesion make them move as a single fluid body
        // Separation keeps them from collapsing into a single point
        alignment.x *= 1.2;
        alignment.y *= 1.2;

        cohesion.x *= 1.0;
        cohesion.y *= 1.0;

        separation.x *= 1.3;
        separation.y *= 1.3;

        mouseForce.x *= 0.5; // Gentle attraction so they don't just swarm the cursor
        mouseForce.y *= 0.5;

        avoidForce.x *= 3.0; // Strong avoidance
        avoidForce.y *= 3.0;

        boid.applyForce(alignment);
        boid.applyForce(cohesion);
        boid.applyForce(separation);
        boid.applyForce(mouseForce);
        boid.applyForce(avoidForce);
    }

    steer(boid, target) {
        const mag = Math.sqrt(target.x ** 2 + target.y ** 2);
        if (mag === 0) return { x: 0, y: 0 };

        target.x = (target.x / mag) * boid.maxSpeed;
        target.y = (target.y / mag) * boid.maxSpeed;

        const steer = {
            x: target.x - boid.velocity.x,
            y: target.y - boid.velocity.y
        };

        const steerMag = Math.sqrt(steer.x ** 2 + steer.y ** 2);
        if (steerMag > boid.maxForce) {
            steer.x = (steer.x / steerMag) * boid.maxForce;
            steer.y = (steer.y / steerMag) * boid.maxForce;
        }

        return steer;
    }

    // Avoid repulsion targets (rectangles)
    avoid(boid, targets) {
        let steer = { x: 0, y: 0 };
        let count = 0;

        for (let target of targets) {
            // Simple bounding box check with padding
            const padding = 20;
            if (
                boid.position.x > target.x - padding &&
                boid.position.x < target.x + target.width + padding &&
                boid.position.y > target.y - padding &&
                boid.position.y < target.y + target.height + padding
            ) {
                // Calculate vector away from center of target
                const centerX = target.x + target.width / 2;
                const centerY = target.y + target.height / 2;

                const diff = {
                    x: boid.position.x - centerX,
                    y: boid.position.y - centerY
                };

                // Normalize and weight
                const dist = Math.sqrt(diff.x ** 2 + diff.y ** 2);
                if (dist > 0) {
                    diff.x /= dist;
                    diff.y /= dist;
                    steer.x += diff.x;
                    steer.y += diff.y;
                    count++;
                }
            }
        }

        if (count > 0) {
            steer.x /= count;
            steer.y /= count;

            // Max speed away
            steer.x *= boid.maxSpeed;
            steer.y *= boid.maxSpeed;

            // Steer force
            steer.x -= boid.velocity.x;
            steer.y -= boid.velocity.y;

            // Limit
            const steerMag = Math.sqrt(steer.x ** 2 + steer.y ** 2);
            if (steerMag > boid.maxForce * 2) { // Stronger force for avoidance
                steer.x = (steer.x / steerMag) * boid.maxForce * 2;
                steer.y = (steer.y / steerMag) * boid.maxForce * 2;
            }
        }

        return steer;
    }
}
