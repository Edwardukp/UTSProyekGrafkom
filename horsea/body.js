class Body {
    constructor(gl, colors) {
        this.gl = gl;
        this.colors = colors;

        //body control point
        const controlPath2D = [
            [-0.4, -0.1],   
            [-0.55, -0.2],  
            [-0.7, -0.3],   
            [-0.85, -0.32], 
            [-1.0, -0.3],   
            [-1.1, -0.28],  
            [-1.2, -0.25],  
            [-1.28, -0.18], 
            [-1.35, -0.1],  
            [-1.4, 0.03],   
            [-1.4, 0.15],   
            [-1.38, 0.28],  
            [-1.3, 0.4],    
            [-1.2, 0.45],   
            [-1.1, 0.45],   
            [-1.0, 0.4],    
            [-0.95, 0.3],   
            [-0.97, 0.22], 
            [-1.0, 0.15],   
            [-1.03, 0.12],  
            [-1.05, 0.1]   
        ];
        const controlPoints = controlPath2D.map(p => [0.0, p[0], p[1]]);
        
        //radii body
        const controlRadii = [
            0.25, 0.35, 0.4, 0.45, 0.48, 0.50, 0.48, 0.45, 0.4, 
            0.35, 0.31, 0.28, 0.25, 0.22, 0.18, 0.15, 0.12, 0.10, 
            0.08, 0.06, 0.04
        ];

        const bodyPath = [];
        const bodyRadii = [];
        const segmentsPerCurve = 8; 
        const numPoints = controlPoints.length;

        bodyPath.push(controlPoints[0]);
        bodyRadii.push(controlRadii[0]);

        for (let i = 0; i < numPoints - 1; i++) {
            const p0 = controlPoints[i === 0 ? 0 : i - 1];
            const p1 = controlPoints[i];
            const p2 = controlPoints[i + 1];
            const p3 = controlPoints[i + 2 >= numPoints ? numPoints - 1 : i + 2];
            const r1 = controlRadii[i];
            const r2 = controlRadii[i + 1];

            for (let j = 1; j <= segmentsPerCurve; j++) {
                const t = j / segmentsPerCurve;
                const newPoint = catmullRomInterpolate(p0, p1, p2, p3, t);
                bodyPath.push(newPoint);
                const newRadius = linearInterpolate(r1, r2, t);
                bodyRadii.push(newRadius);
            }
        }
        
        //geometri punggung dan perut
        const radialSegments = 40; 
        const angle = Math.PI * 0.75; 
        this.bodyBack = createCurvedStrip(gl, bodyPath, bodyRadii, radialSegments, -angle, angle);
        this.bodyBelly = createCurvedStrip(gl, bodyPath, bodyRadii, Math.ceil(radialSegments / 3), angle, Math.PI * 2.0 - angle);
    }

    draw(gl, programInfo, parentMatrix) {
        //gambar badan
        let bodyMatrix = mat4.clone(parentMatrix);
        mat4.scale(bodyMatrix, bodyMatrix, [0.8, 1.0, 1.0]); 
        
        drawShape(gl, programInfo, this.bodyBack, bodyMatrix, this.colors.head);
        drawShape(gl, programInfo, this.bodyBelly, bodyMatrix, this.colors.belly);
    }
}