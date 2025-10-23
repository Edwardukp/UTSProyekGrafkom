class Shell {
    constructor(gl, colors) {
        this.gl = gl;
        this.color = colors.shell;
        const path = [
            [-0.3, 0.0, 0.1],
            [ 0.0, 0.0, 0.0], 
            [ 0.3, 0.0, 0.1]
        ];
        const radii = [0.3, 0.05, 0.3];

        this.fan = createCurvedStrip(gl, path, radii, 5, -Math.PI/2.5, Math.PI/2.5);
    }

    draw(gl, programInfo, matrix) {
        drawShape(gl, programInfo, this.fan, matrix, this.color);
    }
}