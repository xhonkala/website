import { Boid } from './boid.js';
import { SpatialGrid } from './spatial-grid.js';

export class Flock {
    constructor(width, height) {
        this.boids = [];
        this.width = width;
        this.height = height;
        this.perceptionRadius = 40;
        this.perceptionRadiusSq = this.perceptionRadius * this.perceptionRadius;
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
        let ax = 0, ay = 0; // alignment
        let cx = 0, cy = 0; // cohesion
        let sx = 0, sy = 0; // separation
        let total = 0;

        const neighbors = this.grid.getNearby(boid);
        const prSq = this.perceptionRadiusSq;

        for (let i = 0; i < neighbors.length; i++) {
            const other = neighbors[i];
            if (other === boid) continue;

            const dx = other.position.x - boid.position.x;
            const dy = other.position.y - boid.position.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < prSq && distSq > 0) {
                // Alignment
                ax += other.velocity.x;
                ay += other.velocity.y;

                // Cohesion
                cx += other.position.x;
                cy += other.position.y;

                // Separation — inverse-square weighting (no sqrt needed)
                const invDistSq = 1 / distSq;
                sx += (boid.position.x - other.position.x) * invDistSq;
                sy += (boid.position.y - other.position.y) * invDistSq;

                total++;
            }
        }

        if (total > 0) {
            // Average and steer alignment
            let alignment = this.steer(boid, { x: ax / total, y: ay / total });

            // Average and steer cohesion
            let cohesion = this.steer(boid, { x: cx / total - boid.position.x, y: cy / total - boid.position.y });

            // Average and steer separation
            let separation = this.steer(boid, { x: sx / total, y: sy / total });

            // Apply with weights
            boid.applyForce({ x: alignment.x * 1.2, y: alignment.y * 1.2 });
            boid.applyForce({ x: cohesion.x * 1.0, y: cohesion.y * 1.0 });
            boid.applyForce({ x: separation.x * 1.3, y: separation.y * 1.3 });
        }

        // Mouse attraction
        if (target) {
            let mouseForce = this.steer(boid, { x: target.x - boid.position.x, y: target.y - boid.position.y });
            boid.applyForce({ x: mouseForce.x * 0.5, y: mouseForce.y * 0.5 });
        }

        // Avoidance
        if (repulsionTargets && repulsionTargets.length > 0) {
            let avoidForce = this.avoid(boid, repulsionTargets);
            boid.applyForce({ x: avoidForce.x * 3.0, y: avoidForce.y * 3.0 });
        }
    }

    steer(boid, target) {
        const mag = Math.sqrt(target.x ** 2 + target.y ** 2);
        if (mag === 0) return { x: 0, y: 0 };

        target.x = (target.x / mag) * boid.maxSpeed;
        target.y = (target.y / mag) * boid.maxSpeed;

        const steerX = target.x - boid.velocity.x;
        const steerY = target.y - boid.velocity.y;

        const steerMag = Math.sqrt(steerX * steerX + steerY * steerY);
        if (steerMag > boid.maxForce) {
            const scale = boid.maxForce / steerMag;
            return { x: steerX * scale, y: steerY * scale };
        }

        return { x: steerX, y: steerY };
    }

    avoid(boid, targets) {
        let steerX = 0, steerY = 0;
        let count = 0;

        for (let target of targets) {
            const padding = 20;
            if (
                boid.position.x > target.x - padding &&
                boid.position.x < target.x + target.width + padding &&
                boid.position.y > target.y - padding &&
                boid.position.y < target.y + target.height + padding
            ) {
                const centerX = target.x + target.width / 2;
                const centerY = target.y + target.height / 2;
                const diffX = boid.position.x - centerX;
                const diffY = boid.position.y - centerY;
                const dist = Math.sqrt(diffX * diffX + diffY * diffY);
                if (dist > 0) {
                    steerX += diffX / dist;
                    steerY += diffY / dist;
                    count++;
                }
            }
        }

        if (count > 0) {
            steerX = (steerX / count) * boid.maxSpeed - boid.velocity.x;
            steerY = (steerY / count) * boid.maxSpeed - boid.velocity.y;

            const steerMag = Math.sqrt(steerX * steerX + steerY * steerY);
            const maxAvoid = boid.maxForce * 2;
            if (steerMag > maxAvoid) {
                const scale = maxAvoid / steerMag;
                steerX *= scale;
                steerY *= scale;
            }
        }

        return { x: steerX, y: steerY };
    }
}
