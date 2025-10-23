class Head {
    constructor(gl, colors) {
        this.gl = gl;
        this.colors = colors;

        //geometri kepala
        this.head = createEllipsoid(gl, 0.5, 0.6, 0.5, 32, 32);
        
        //geometri mata
        this.eyeBase = createEllipsoid(gl, 0.5, 0.5, 0.5, 16, 16); 

        //geometri duri
        const spikeHeight = 0.3;
        const spikeBaseRadius = 0.1;
        const spikeTopRadius = 0.07;
        this.spikeBase = createFrustum(gl, spikeBaseRadius, spikeTopRadius, spikeHeight, 16);
        this.spikeTip = createEllipsoid(gl, spikeTopRadius, spikeTopRadius, spikeTopRadius, 16, 16);
        this.snout = new Snout(gl, colors);
    }

    draw(gl, programInfo, parentMatrix) {
        let headMatrix = mat4.clone(parentMatrix);
        drawShape(gl, programInfo, this.head, headMatrix, this.colors.head);
        this._drawEyes(gl, programInfo, headMatrix);
        this._drawSpikes(gl, programInfo, headMatrix);
        this.snout.draw(gl, programInfo, headMatrix);
    }

    _drawEyes(gl, programInfo, modelMatrix) {
        const a = 0.5, b = 0.6, c = 0.5;
        const eyeX = 0.36; const eyeY = 0.05; 
        const eyeZ = c * Math.sqrt(1.0 - Math.pow(eyeX / a, 2) - Math.pow(eyeY / b, 2));
        const eyePosL = [eyeX, eyeY, eyeZ]; const eyePosR = [-eyeX, eyeY, eyeZ];
        const eyeTarget = [0, 0, 0]; const eyeUp = [0, 1, 0];
        const zFlattenScale = 0.1; const zPlantOffset = -0.02; 
        const zLayerOffset = 0.01; const eyeYRotation = -20.5; 
        
        let eyeL_localTransform = mat4.targetTo(mat4.create(), eyePosL, eyeTarget, eyeUp);
        let eyeLBaseMatrix = mat4.multiply(mat4.create(), modelMatrix, eyeL_localTransform);
        mat4.translate(eyeLBaseMatrix, eyeLBaseMatrix, [0, 0, zPlantOffset]);
        mat4.rotateY(eyeLBaseMatrix, eyeLBaseMatrix, -eyeYRotation); 
        
        let eyeWhiteLMatrix = mat4.clone(eyeLBaseMatrix);
        mat4.scale(eyeWhiteLMatrix, eyeWhiteLMatrix, [0.3, 0.36, zFlattenScale]); 
        drawShape(gl, programInfo, this.eyeBase, eyeWhiteLMatrix, this.colors.eyeWhite);
        
        let irisLMatrix = mat4.clone(eyeLBaseMatrix);
        mat4.translate(irisLMatrix, irisLMatrix, [-0.03, 0, zLayerOffset]); 
        mat4.scale(irisLMatrix, irisLMatrix, [0.25, 0.3, zFlattenScale]); 
        drawShape(gl, programInfo, this.eyeBase, irisLMatrix, this.colors.eyeIris);
        
        let pupilLMatrix = mat4.clone(eyeLBaseMatrix);
        mat4.translate(pupilLMatrix, pupilLMatrix, [-0.05, 0, zLayerOffset * 2]); 
        mat4.scale(pupilLMatrix, pupilLMatrix, [0.09, 0.16, zFlattenScale]); 
        drawShape(gl, programInfo, this.eyeBase, pupilLMatrix, this.colors.eyePupil);

        let eyeR_localTransform = mat4.targetTo(mat4.create(), eyePosR, eyeTarget, eyeUp);
        let eyeRBaseMatrix = mat4.multiply(mat4.create(), modelMatrix, eyeR_localTransform);
        mat4.translate(eyeRBaseMatrix, eyeRBaseMatrix, [0, 0, zPlantOffset]);
        mat4.rotateY(eyeRBaseMatrix, eyeRBaseMatrix, eyeYRotation); 
        
        let eyeWhiteRMatrix = mat4.clone(eyeRBaseMatrix);
        mat4.scale(eyeWhiteRMatrix, eyeWhiteRMatrix, [0.3, 0.36, zFlattenScale]);
        drawShape(gl, programInfo, this.eyeBase, eyeWhiteRMatrix, this.colors.eyeWhite);
        
        let irisRMatrix = mat4.clone(eyeRBaseMatrix);
        mat4.translate(irisRMatrix, irisRMatrix, [0.03, 0, zLayerOffset]);
        mat4.scale(irisRMatrix, irisRMatrix, [0.25, 0.3, zFlattenScale]);
        drawShape(gl, programInfo, this.eyeBase, irisRMatrix, this.colors.eyeIris);
        
        let pupilRMatrix = mat4.clone(eyeRBaseMatrix);
        mat4.translate(pupilRMatrix, pupilRMatrix, [0.05, 0, zLayerOffset * 2]);
        mat4.scale(pupilRMatrix, pupilRMatrix, [0.09, 0.16, zFlattenScale]);
        drawShape(gl, programInfo, this.eyeBase, pupilRMatrix, this.colors.eyePupil);
    }

    _drawSpikes(gl, programInfo, modelMatrix) {
        const spikeHeight = 0.3; 
        const spikeBaseScale = [1.0, 1.2, 1.0]; 
        const tipYOffset = spikeHeight * spikeBaseScale[1]; 
        
        const headA = 0.5, headB = 0.6, headC = 0.5; 
        const spikeZ_pos = -0.1; 
        const spikeY_positions = [0.27, 0.08, -0.1]; 
        const globalUp = [0, 1, 0]; 

        const drawOneSpike = (P, N) => {
            let spikeTransform = mat4.alignYTo(mat4.create(), P, N, globalUp);
            let finalTransform = mat4.multiply(mat4.create(), modelMatrix, spikeTransform);

            let spikeBaseMatrix = mat4.clone(finalTransform);
            mat4.scale(spikeBaseMatrix, spikeBaseMatrix, spikeBaseScale);
            drawShape(gl, programInfo, this.spikeBase, spikeBaseMatrix, this.colors.headSpike);

            let spikeTipMatrix = mat4.clone(finalTransform);
            mat4.translate(spikeTipMatrix, spikeTipMatrix, [0, tipYOffset, 0]); 
            drawShape(gl, programInfo, this.spikeTip, spikeTipMatrix, this.colors.headSpike);
        }

        for (const Y of spikeY_positions) {
            const X = headA * Math.sqrt(1.0 - Math.pow(Y / headB, 2) - Math.pow(spikeZ_pos / headC, 2));
            if (isNaN(X)) continue;
            const P = [X, Y, spikeZ_pos];
            const N = vec3.normalize([P[0]/(headA*headA), P[1]/(headB*headB), P[2]/(headC*headC)]);
            drawOneSpike(P, N);
        }

        for (const Y of spikeY_positions) {
            const X = -headA * Math.sqrt(1.0 - Math.pow(Y / headB, 2) - Math.pow(spikeZ_pos / headC, 2));
            if (isNaN(X)) continue;
            const P = [X, Y, spikeZ_pos];
            const N = vec3.normalize([P[0]/(headA*headA), P[1]/(headB*headB), P[2]/(headC*headC)]);
            drawOneSpike(P, N);
        }
    }
}