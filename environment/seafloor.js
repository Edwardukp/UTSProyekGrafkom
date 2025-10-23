class SeaFloor {
    constructor(gl, colors) {
        this.gl = gl;
        this.color = colors.seaFloor;
        const radius = 15.0;
        const height = 0.1;
        this.floor = createFrustum(gl, radius, radius, height, 64);
        this.yPosition = -1.45; 
    }

    draw(gl, programInfo, parentMatrix) {
        let floorMatrix = mat4.clone(parentMatrix);
        mat4.translate(floorMatrix, floorMatrix, [0, this.yPosition, 0]);
    
        drawShape(gl, programInfo, this.floor, floorMatrix, this.color);
    }
}