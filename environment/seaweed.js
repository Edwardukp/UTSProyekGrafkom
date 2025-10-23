class Seaweed {
    constructor(gl, colors) {
        this.gl = gl;
        this.color = colors.seaweed;
        const path = [
            [0.0, 0.0, 0.0],
            [0.1, 0.5, 0.0],
            [0.0, 1.0, 0.1],
            [-0.1, 1.5, 0.0],
            [0.0, 2.0, -0.1]
        ];
        const radii = [0.1, 0.09, 0.08, 0.07, 0.06];
        this.strip = createCurvedStrip(gl, path, radii, 1, -Math.PI/2, Math.PI/2);
    }

    draw(gl, programInfo, matrix) {
        drawShape(gl, programInfo, this.strip, matrix, this.color);
    }
}