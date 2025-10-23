class Fin {
    constructor(gl, colors) {
        this.gl = gl;
        this.color = colors.fin;
        const finPath = [
            [0.0, 0.0, 0.0],  
            [0.2, 0.05, 0.0], 
            [0.4, 0.0, 0.0],   
            [0.5, -0.2, 0.0]  
        ];
        const finRadii = [0.15, 0.25, 0.2, 0.1]; 
        this.fin = createCurvedStrip(gl, finPath, finRadii, 1, Math.PI / 2, -Math.PI / 2);
    }

    draw(gl, programInfo, parentMatrix, swayAngle = 0.0) { 
        let finMatrix = mat4.clone(parentMatrix);

        const swayAmount = 0.4; 
        let finSway = Math.sin(swayAngle) * swayAmount;

        mat4.translate(finMatrix, finMatrix, [0.0, -0.85, -0.35]); 

        mat4.rotateY(finMatrix, finMatrix, finSway);

        mat4.rotateY(finMatrix, finMatrix, Math.PI / 2.0);
        mat4.rotateX(finMatrix, finMatrix, -Math.PI / 6.0); 
        
        drawShape(gl, programInfo, this.fin, finMatrix, this.color);
    }
}