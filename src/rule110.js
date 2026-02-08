// Rule 110 cellular automaton
// Lookup table: index = (left << 2) | (center << 1) | right
const RULE_110 = [0, 1, 1, 1, 0, 1, 1, 0];

function isNightMode() {
    return document.body.classList.contains('night-mode');
}

export function initRule110(canvasId, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const cellSize = options.cellSize || 2;
    const tickSpeed = options.tickSpeed || 80;
    const ctx = canvas.getContext('2d');

    let intervalId = null;

    function start() {
        const rect = canvas.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) {
            setTimeout(start, 50);
            return;
        }

        canvas.width = Math.round(rect.width);
        canvas.height = Math.round(rect.height);

        const cols = Math.floor(canvas.width / cellSize);
        const totalRows = Math.floor(canvas.height / cellSize);
        if (cols === 0 || totalRows === 0) return;

        // Random sparse initial row
        let currentRow = new Uint8Array(cols);
        for (let i = 0; i < cols; i++) {
            currentRow[i] = Math.random() < 0.3 ? 1 : 0;
        }
        let rowsDrawn = 0;

        // Reinitialize interval — inject fresh randomness every N rows
        const reinitInterval = Math.floor(totalRows * 0.3);

        function getFillStyle() {
            return isNightMode() ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.13)';
        }

        function nextRow(row) {
            const next = new Uint8Array(cols);
            for (let i = 0; i < cols; i++) {
                const left = row[(i - 1 + cols) % cols];
                const center = row[i];
                const right = row[(i + 1) % cols];
                next[i] = RULE_110[(left << 2) | (center << 1) | right];
            }
            return next;
        }

        function perturbRow(row) {
            // Flip ~15% of cells to break any fixed-point collapse
            for (let i = 0; i < cols; i++) {
                if (Math.random() < 0.15) {
                    row[i] = row[i] ? 0 : 1;
                }
            }
        }

        function drawRow(row, y) {
            ctx.fillStyle = getFillStyle();
            for (let i = 0; i < cols; i++) {
                if (row[i]) {
                    ctx.fillRect(i * cellSize, y, cellSize, cellSize);
                }
            }
        }

        function tick() {
            // Stop once the canvas is full
            if (rowsDrawn >= totalRows) {
                clearInterval(intervalId);
                intervalId = null;
                return;
            }

            // Periodic perturbation to prevent collapse
            if (rowsDrawn > 0 && rowsDrawn % reinitInterval === 0) {
                perturbRow(currentRow);
            }

            drawRow(currentRow, rowsDrawn * cellSize);
            currentRow = nextRow(currentRow);
            rowsDrawn++;
        }

        intervalId = setInterval(tick, tickSpeed);
    }

    setTimeout(start, 100);

    return function cleanup() {
        if (intervalId !== null) clearInterval(intervalId);
    };
}
