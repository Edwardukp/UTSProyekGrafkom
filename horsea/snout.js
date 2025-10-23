class Snout {
    constructor(gl, colors) {
        this.gl = gl;
        this.colors = colors;

        this.snout = createFrustum(gl, 0.25, 0.15, 0.7, 32); 
        this.snoutTip = createTorus(gl, 0.12, 0.05, 32, 32);
        this.snoutTopCap = createFrustum(gl, 0.15, 0.15, 0.005, 32); 
    }

    draw(gl, programInfo, parentMatrix) {
        let snoutMatrix = mat4.clone(parentMatrix);
        mat4.translate(snoutMatrix, snoutMatrix, [0, -0.15, 0.35]); 
        mat4.rotateX(snoutMatrix, snoutMatrix, Math.PI / 2); 
        drawShape(gl, programInfo, this.snout, snoutMatrix, this.colors.snout);
        let snoutTopCapMatrix = mat4.clone(snoutMatrix);
        mat4.translate(snoutTopCapMatrix, snoutTopCapMatrix, [0, 0.7, 0]); 
        drawShape(gl, programInfo, this.snoutTopCap, snoutTopCapMatrix, this.colors.snoutTop);
        let tipMatrix = mat4.clone(snoutMatrix);
        mat4.translate(tipMatrix, tipMatrix, [0, 0.7, 0]); 
        mat4.scale(tipMatrix, tipMatrix, [1.3, 1.0, 1.3]);
        drawShape(gl, programInfo, this.snoutTip, tipMatrix, this.colors.snoutTip);
    }
}