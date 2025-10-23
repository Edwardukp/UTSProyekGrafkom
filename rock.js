class Rock {
    constructor(gl, colors) {
        this.gl = gl;
        this.color = colors.rock;
        this.rock = createEllipsoid(gl, 1.0, 0.7, 0.8, 16, 16);
    }

    draw(gl, programInfo, matrix) {
        drawShape(gl, programInfo, this.rock, matrix, this.color);
    }
}