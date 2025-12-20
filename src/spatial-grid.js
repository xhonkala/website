export class SpatialGrid {
    constructor(width, height, cellSize) {
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = new Map();
    }

    clear() {
        this.grid.clear();
    }

    add(boid) {
        const col = Math.floor(boid.position.x / this.cellSize);
        const row = Math.floor(boid.position.y / this.cellSize);
        const key = `${col},${row}`;

        if (!this.grid.has(key)) {
            this.grid.set(key, []);
        }
        this.grid.get(key).push(boid);
    }

    getNearby(boid) {
        const col = Math.floor(boid.position.x / this.cellSize);
        const row = Math.floor(boid.position.y / this.cellSize);
        const nearby = [];

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const key = `${col + i},${row + j}`;
                if (this.grid.has(key)) {
                    const cellBoids = this.grid.get(key);
                    for (let k = 0; k < cellBoids.length; k++) {
                        nearby.push(cellBoids[k]);
                    }
                }
            }
        }
        return nearby;
    }
}
