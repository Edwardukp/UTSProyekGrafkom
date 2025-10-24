class KingdraModel {
    constructor(gl, colors) {
        this.gl = gl;
        this.colors = colors;

        //inisalisasi buffer
        this.ellipsoidBuffers = createEllipsoid(gl, 1.0, 1.0, 1.0, 32, 24);
        this.hyperboloidBuffers = createHyperboloidOneSheet(gl, 0.4, 0.4, 0.5, 1.0, 32, 16);
        this.cheekBuffers = createEllipticParaboloid(gl, 0.5, 0.5, 0.5, 32, 16);
        this.featherFinBuffers = createFeatherFin(gl, 1.2, 0.6, 0.05, 16);
        this.dropletBuffers = createCurvedDropletHead(gl, 0.5, 1.2, 0.18, 32, 24);
        this.craniumBuffers = createVerticalHalfEllipsoid(gl, 0.9, 0.6, 1.0, 32, 24);
        this.cylinderBuffers = createCylinder(gl, 0.5, 1.0, 16);
        this.bellyPlateBuffers = createBellyPlate(gl, 1.0, 1.0, 1.0, 0, Math.PI / 4, Math.PI / 2, Math.PI / 3, 16, 12, 0.02);
        this.eyeBuffers = createEyeShape(gl, 1.2, 0.3, 0.3, 0.8, 16, 12);
        this.highlightBuffer = createEllipsoid(gl, 0.05, 0.05, 0.05, 8, 8);
    }

    draw(gl, programInfo, parentMatrix, animationTime = 0.0) {
        const now = animationTime; 
        
        //parameter kingdra
        const swimSpeed = 0.8;
        const bodyRotationAmplitude = 0.3;
        const featherFlapSpeed = 3.0;
        const backFinSwaySpeedFactor = 1.5;
        const backFinSwaySpeed = swimSpeed * backFinSwaySpeedFactor;
        const featherFlapAmplitude = 0.15;
        const featherYawAmplitude = 0.2; 
        const backFinSwayAmplitude = 0.4;
        const blinkInterval = 2.0;
        const blinkDuration = 0.2;
        const blinkTransition = 0.1;
        const tailRotationForward = -3.0;
        const tailRotationBackward = -2.0;

        //cycle value
        const swimCycleValue = Math.sin(now * swimSpeed * 2 * Math.PI);
        const featherCycleValue = Math.sin(now * featherFlapSpeed * 2 * Math.PI);
        const backFinCycleValue = Math.sin(now * backFinSwaySpeed * 2 * Math.PI);

        //perhitungan gerakan body & ekor
        const rotationAmount = (swimCycleValue + 1) / 2; 
        const initialBodyRotationX = 0.4; 
        const currentBodyRotationX = initialBodyRotationX - (rotationAmount * bodyRotationAmplitude);
        const currentTailRotationX = tailRotationBackward * (1 - rotationAmount) + tailRotationForward * rotationAmount;

        //perhitungan gerakan feather
        const initialLeftPivotRotY = 1.8;
        const initialLeftPivotRotZ = -1.7;
        const initialRightPivotRotY = -1.8;
        const initialRightPivotRotZ = 1.7;
        const currentLeftPivotRotZ = initialLeftPivotRotZ + featherCycleValue * featherFlapAmplitude;
        const currentRightPivotRotZ = initialRightPivotRotZ - featherCycleValue * featherFlapAmplitude;
        const currentLeftPivotRotY = initialLeftPivotRotY - featherCycleValue * featherYawAmplitude;
        const currentRightPivotRotY = initialRightPivotRotY + featherCycleValue * featherYawAmplitude;
        
        //perhitungan sirip belakang body
        const initialBackFinRotY = 0.0;
        const currentBackFinRotY = initialBackFinRotY + backFinCycleValue * backFinSwayAmplitude;

        //perhitungan mata berkedip
        let currentEyeScaleY = 1.0; //default
        const timeInBlinkCycle = now % blinkInterval;
        if (timeInBlinkCycle < blinkTransition) {
            const t = timeInBlinkCycle / blinkTransition;
            const scaleFactor = Math.cos(t * Math.PI / 2);
            currentEyeScaleY = 1.0 * scaleFactor;
        } else if (timeInBlinkCycle < blinkTransition + blinkDuration) {
            currentEyeScaleY = 0.01;
        } else if (timeInBlinkCycle < blinkTransition * 2 + blinkDuration) {
            const t = (timeInBlinkCycle - (blinkTransition + blinkDuration)) / blinkTransition; //0 to 1
            const scaleFactor = Math.sin(t * Math.PI / 2);
            currentEyeScaleY = 1.0 * scaleFactor;
        }
        currentEyeScaleY = Math.max(0.01, currentEyeScaleY); 
        const kingdraBlue = this.colors.kingdraBlue || [0.32, 0.58, 0.78, 1.0];
        const kingdraYellow = this.colors.kingdraYellow || [0.96, 0.84, 0.44, 1.0];
        const kingdraFinWhite = this.colors.kingdraFinWhite || [0.9, 0.88, 0.8, 1.0];
        const eyeWhite = this.colors.eyeWhite || [1.0, 1.0, 1.0, 1.0];
        const eyeRed = this.colors.eyeIris || [0.8, 0.1, 0.1, 1.0];
        const eyeBlack = this.colors.eyePupil || [0.1, 0.1, 0.1, 1.0];

        //helper untuk menerapkan transform local
        const applyLocalTransform = (parent, transform) => {
            const m = mat4.clone(parent);
            mat4.translate(m, m, transform.position);
            mat4.rotate(m, m, transform.rotation[0], [1, 0, 0]);
            mat4.rotate(m, m, transform.rotation[1], [0, 1, 0]);
            mat4.rotate(m, m, transform.rotation[2], [0, 0, 1]);
            mat4.scale(m, m, transform.scale);
            return m;
        };

        //body
        const bodyTransform = {
            position: [0.0, -1.0, 0.0],
            rotation: [currentBodyRotationX, 0.0, 0.0], //update
            scale: [1.0, 1.5, 1.0],
        };
        const bodyMatrix = applyLocalTransform(parentMatrix, bodyTransform);
        drawShape(gl, programInfo, this.ellipsoidBuffers, bodyMatrix, kingdraBlue);

        //leher
        const neckTransform = {
            position: [0.0, 1.1, 0.1],
            rotation: [0.1, 0.0, 0.0],
            scale: [1.2, 0.7, 1.2],
        };
        const neckMatrix = applyLocalTransform(bodyMatrix, neckTransform);
        drawShape(gl, programInfo, this.hyperboloidBuffers, neckMatrix, kingdraBlue);

        //kepala
        const headTransform = {
            position: [0.0, 0.9, 0.0],
            rotation: [-0.9, 0.0, 0.0],
            scale: [0.65, 0.7, 0.75],
        };
        const headMatrix = applyLocalTransform(neckMatrix, headTransform);
        drawShape(gl, programInfo, this.ellipsoidBuffers, headMatrix, kingdraBlue);

        //pipi kiri
        const leftCheekTransform = {
            position: [-0.95, -0.6, -0.1],
            rotation: [0.75, 0.16, -0.4],
            scale: [0.6, 0.95, 1.8],
        };
        const leftCheekMatrix = applyLocalTransform(headMatrix, leftCheekTransform);
        drawShape(gl, programInfo, this.cheekBuffers, leftCheekMatrix, kingdraBlue);

        const leftCheekCoverTransform = {
            position: [0.0, 0.6, 0.0], rotation: [0.0, 0.0, 0.0], scale: [0.5, 0.4, 0.5],
        };
        const leftCheekCoverMatrix = applyLocalTransform(leftCheekMatrix, leftCheekCoverTransform);
        drawShape(gl, programInfo, this.ellipsoidBuffers, leftCheekCoverMatrix, kingdraBlue);

        const leftFinTransform = {
            position: [0.1, 0.6, -0.5], rotation: [1.4, 0.3, -0.8], scale: [0.05, 0.8, 0.75]
        };
        const leftFinMatrix = applyLocalTransform(leftCheekMatrix, leftFinTransform);
        drawShape(gl, programInfo, this.hyperboloidBuffers, leftFinMatrix, kingdraBlue);

        //pipi kanan
        const rightCheekTransform = {
            position: [0.95, -0.6, -0.1],
            rotation: [0.75, -0.16, 0.4],
            scale: [0.6, 0.95, 1.8],
        };
        const rightCheekMatrix = applyLocalTransform(headMatrix, rightCheekTransform);
        drawShape(gl, programInfo, this.cheekBuffers, rightCheekMatrix, kingdraBlue);
        const rightCheekCoverTransform = {
            position: [0.0, 0.6, 0.0], rotation: [0.0, 0.0, 0.0], scale: [0.5, 0.4, 0.5],
        };
        const rightCheekCoverMatrix = applyLocalTransform(rightCheekMatrix, rightCheekCoverTransform);
        drawShape(gl, programInfo, this.ellipsoidBuffers, rightCheekCoverMatrix, kingdraBlue);
        const rightFinTransform = {
            position: [-0.1, 0.6, -0.5], rotation: [1.4, -0.3, 0.8], scale: [0.05, 0.8, 0.75]
        };
        const rightFinMatrix = applyLocalTransform(rightCheekMatrix, rightFinTransform);
        drawShape(gl, programInfo, this.hyperboloidBuffers, rightFinMatrix, kingdraBlue);
        const leftNoseTransform = {
            position: [-0.62, -1.15, 0.9], rotation: [0.55, 0.46, -0.5], scale: [0.4, 0.65, 1.2],
        };
        const leftNoseMatrix = applyLocalTransform(headMatrix, leftNoseTransform);
        drawShape(gl, programInfo, this.cheekBuffers, leftNoseMatrix, kingdraBlue);
        const leftNoseCoverMatrix = applyLocalTransform(leftNoseMatrix, leftCheekCoverTransform); // Re-use cover transform
        drawShape(gl, programInfo, this.ellipsoidBuffers, leftNoseCoverMatrix, kingdraBlue);

        const rightNoseTransform = {
            position: [0.62, -1.15, 0.9], rotation: [0.55, -0.46, 0.5], scale: [0.4, 0.65, 1.2],
        };
        const rightNoseMatrix = applyLocalTransform(headMatrix, rightNoseTransform);
        drawShape(gl, programInfo, this.cheekBuffers, rightNoseMatrix, kingdraBlue);

        const rightNoseCoverMatrix = applyLocalTransform(rightNoseMatrix, rightCheekCoverTransform); // Re-use cover transform
        drawShape(gl, programInfo, this.ellipsoidBuffers, rightNoseCoverMatrix, kingdraBlue);
        
        //blowhole
        const blowholeTransform = {
            position: [0.0, -0.4, 0.5], rotation: [2.2, 0.0, 0.0], scale: [1.6, 1.8, 1.3],
        };
        const blowholeMatrix = applyLocalTransform(headMatrix, blowholeTransform);
        drawShape(gl, programInfo, this.dropletBuffers, blowholeMatrix, kingdraBlue);
        
        const noseHoleTransform = {
            position: [0.0, 1.05, 0.0], rotation: [0.0, 0.0, 0.0], scale: [0.1, 0.1, 0.1],
        };
        const noseHoleMatrix = applyLocalTransform(blowholeMatrix, noseHoleTransform);
        drawShape(gl, programInfo, this.ellipsoidBuffers, noseHoleMatrix, [0,0,0,0.8]);

        //cranium
        const craniumTransform = {
            position: [0.0, -0.25, 0.07], rotation: [-0.9, 0.0, 0.0], scale: [1.1, 2.0, 1.3],
        };
        const craniumMatrix = applyLocalTransform(headMatrix, craniumTransform);
        drawShape(gl, programInfo, this.craniumBuffers, craniumMatrix, kingdraBlue);

        //tanduk
        const hornAssemblyTransform = {
            position: [0.0, 0.7, -0.2], rotation: [0.2, 0.0, 0.0], scale: [1.0, 1.0, 1.0],
        };
        const hornAssemblyMatrix = applyLocalTransform(headMatrix, hornAssemblyTransform);

        //tanduk kiri
        const mainLeftHornTransform = {
            position: [-0.3, 0.0, 0.5], rotation: [0.3, 0.0, 0.1], scale: [0.2, 1.5, 0.2]
        };
        const mainLeftHornMatrix = applyLocalTransform(hornAssemblyMatrix, mainLeftHornTransform);
        drawShape(gl, programInfo, this.cylinderBuffers, mainLeftHornMatrix, kingdraBlue);

        //tanduk kanan
        const mainRightHornTransform = {
            position: [0.3, 0.0, 0.5], rotation: [0.3, 0.0, -0.1], scale: [0.2, 1.5, 0.2]
        };
        const mainRightHornMatrix = applyLocalTransform(hornAssemblyMatrix, mainRightHornTransform);
        drawShape(gl, programInfo, this.cylinderBuffers, mainRightHornMatrix, kingdraBlue);
        
        //kurva tanduk kiri
        const clh1 = applyLocalTransform(mainLeftHornMatrix, { position: [-0.0, 0.6, -2.0], rotation: [1.6, 0.0, 0.0], scale: [1.0, 2.0, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, clh1, kingdraBlue);
        const clh2 = applyLocalTransform(mainLeftHornMatrix, { position: [-0.0, 0.475, -3.7], rotation: [1.5, 0.0, 0.0], scale: [1.0, 1.8, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, clh2, kingdraBlue);
        const clh3 = applyLocalTransform(mainLeftHornMatrix, { position: [-0.0, 0.53, -5.4], rotation: [1.6, 0.0, 0.0], scale: [1.0, 1.8, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, clh3, kingdraBlue);
        const clh4 = applyLocalTransform(mainLeftHornMatrix, { position: [-0.0, 0.53, -5.4], rotation: [-1.45, 0.0, 0.0], scale: [1.0, 1.0, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, clh4, kingdraBlue);
        const clh5 = applyLocalTransform(mainLeftHornMatrix, { position: [-0.0, 0.71, -8.2], rotation: [1.6, 0.0, 0.0], scale: [1.0, 1.8, 0.145] });
        drawShape(gl, programInfo, this.cylinderBuffers, clh5, kingdraBlue);
        
        //kurva tanduk kanan
        const crh1 = applyLocalTransform(mainRightHornMatrix, { position: [-0.0, 0.6, -2.0], rotation: [1.6, 0.0, 0.0], scale: [1.0, 2.0, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, crh1, kingdraBlue);
        const crh2 = applyLocalTransform(mainRightHornMatrix, { position: [-0.0, 0.475, -3.7], rotation: [1.5, 0.0, 0.0], scale: [1.0, 1.8, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, crh2, kingdraBlue);
        const crh3 = applyLocalTransform(mainRightHornMatrix, { position: [-0.0, 0.53, -5.4], rotation: [1.6, 0.0, 0.0], scale: [1.0, 1.8, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, crh3, kingdraBlue);
        const crh4 = applyLocalTransform(mainRightHornMatrix, { position: [-0.0, 0.53, -5.4], rotation: [-1.45, 0.0, 0.0], scale: [1.0, 1.0, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, crh4, kingdraBlue);
        const crh5 = applyLocalTransform(mainRightHornMatrix, { position: [-0.0, 0.71, -8.2], rotation: [1.6, 0.0, 0.0], scale: [1.0, 1.8, 0.145] });
        drawShape(gl, programInfo, this.cylinderBuffers, crh5, kingdraBlue);

        //sirip belakang
        const backFinAssemblyTransform = {
            position: [0.0, 0.4, -1.2], 
            rotation: [0.2, currentBackFinRotY, 0.0], //update
            scale: [0.8, 0.8, 0.8],
        };
        const backFinAssemblyMatrix = applyLocalTransform(bodyMatrix, backFinAssemblyTransform);

        const fb1 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, -0.2, 0.15], rotation: [1.0, 0.0, 0.0], scale: [0.15, 0.8, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, fb1, kingdraBlue);
        const fb2 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, -0.65, -0.85], rotation: [1.15, 0.0, 0.0], scale: [0.15, 1.1, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, fb2, kingdraBlue);
        const fb3 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, -0.9, -1.12], rotation: [0.85, 0.0, 0.0], scale: [0.15, 0.4, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, fb3, kingdraBlue);
        const fb4 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, -1.35, -1.3], rotation: [0.4, 0.0, 0.0], scale: [0.15, 0.5, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, fb4, kingdraBlue);
        const ft1 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, 0.25, 0.45], rotation: [-1.3, 0.0, 0.0], scale: [0.15, 0.8, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, ft1, kingdraBlue);
        const ft2 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, 0.45, -0.28], rotation: [-1.4, 0.0, 0.0], scale: [0.15, 0.8, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, ft2, kingdraBlue);
        const ft3 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, 0.575, -1.05], rotation: [-1.65, 0.0, 0.0], scale: [0.15, 0.6, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, ft3, kingdraBlue);
        const ft4 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, 0.55, -1.48], rotation: [-1.7, 0.0, 0.0], scale: [0.15, 1.0, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, ft4, kingdraBlue);
        const fu1 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, 0.55, -1.08], rotation: [-0.3, 0.0, 0.0], scale: [0.15, 0.25, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, fu1, kingdraBlue);
        const fu2 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, 0.75, -1.11], rotation: [-1.3, 0.0, 0.0], scale: [0.15, 0.4, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, fu2, kingdraBlue);
        const fu3 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, 0.85, -1.45], rotation: [-1.7, 0.0, 0.0], scale: [0.15, 0.8, 0.15] });
        drawShape(gl, programInfo, this.cylinderBuffers, fu3, kingdraBlue);

        //ekor
        const tailAssemblyTransform = {
            position: [0.0, -0.3, 0.1], 
            rotation: [currentTailRotationX, -1.55, 0.0], //update
            scale: [1.0, 1.0, 1.0],
        };
        let currentTailMatrix = applyLocalTransform(bodyMatrix, tailAssemblyTransform);
        const numTailSegments = 8;
        const initialTailScale = [0.8, 0.9, 0.6];
        const segmentLengthFactor = 0.8;
        const curlPerSegment = 0.66;
        const taperFactor = 0.99;
        let parentYRadius = 0;

        for (let i = 1; i <= numTailSegments; i++) {
            const scaleMultiplier = Math.pow(taperFactor, i + 1);
            const currentScale = [
                initialTailScale[0] * scaleMultiplier + (0.00 * i),
                initialTailScale[1] * scaleMultiplier,
                initialTailScale[2] * scaleMultiplier + (0.07 * i)
            ];
            const currentYRadius = currentScale[1] * 0.5;
            const segmentTransform = {
                position: [0.0, (parentYRadius + currentYRadius) * segmentLengthFactor, 0.0],
                rotation: [0.0, 0.0, curlPerSegment],
                scale: currentScale
            };
            
            const segmentMatrix = applyLocalTransform(currentTailMatrix, segmentTransform);
            drawShape(gl, programInfo, this.ellipsoidBuffers, segmentMatrix, kingdraBlue);
            
            currentTailMatrix = segmentMatrix; 
            parentYRadius = currentYRadius;
        }

        const leftFeatherPivotTransform = {
            position: [-0.84, -0.1, -0.3], 
            rotation: [0.0, currentLeftPivotRotY, currentLeftPivotRotZ], //update
            scale: [1.0, 1.0, 1.0]
        };
        const leftFeatherPivotMatrix = applyLocalTransform(headMatrix, leftFeatherPivotTransform);
        
        const leftHeadFeatherTransform = {
            position: [0, 1.2 / 2, 0], rotation: [0, 0, 0], scale: [0.7, 0.9, 1.0]
        };
        const leftHeadFeatherMatrix = applyLocalTransform(leftFeatherPivotMatrix, leftHeadFeatherTransform);
        drawShape(gl, programInfo, this.featherFinBuffers, leftHeadFeatherMatrix, kingdraFinWhite);
        
        const rightFeatherPivotTransform = {
            position: [0.84, -0.1, -0.3], 
            rotation: [0.0, currentRightPivotRotY, currentRightPivotRotZ], //update
            scale: [1.0, 1.0, 1.0]
        };
        const rightFeatherPivotMatrix = applyLocalTransform(headMatrix, rightFeatherPivotTransform);
        
        const rightHeadFeatherTransform = {
            position: [0, 1.2 / 2, 0], rotation: [0, 0, 0], scale: [0.7, 0.9, 1.0]
        };
        const rightHeadFeatherMatrix = applyLocalTransform(rightFeatherPivotMatrix, rightHeadFeatherTransform);
        drawShape(gl, programInfo, this.featherFinBuffers, rightHeadFeatherMatrix, kingdraFinWhite);
        
        //bulu
        const w1 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, 0.2, -0.7], rotation: [0.0, -1.6, -1.8], scale: [1.3, 2.1, 1.2] });
        drawShape(gl, programInfo, this.featherFinBuffers, w1, kingdraFinWhite);
        const w2 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, -0.25, -0.66], rotation: [0.0, -1.6, -1.5], scale: [0.9, 1.2, 1.0] });
        drawShape(gl, programInfo, this.featherFinBuffers, w2, kingdraFinWhite);
        const w3 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, -0.0, -0.0], rotation: [-0.2, -1.6, -1.2], scale: [0.9, 0.9, 1.0] });
        drawShape(gl, programInfo, this.featherFinBuffers, w3, kingdraFinWhite);
        const we1 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, 0.25, -1.4], rotation: [0.2, -0.0, -0.0], scale: [0.03, 0.3, 0.8] });
        drawShape(gl, programInfo, this.ellipsoidBuffers, we1, kingdraFinWhite);
        const we2 = applyLocalTransform(backFinAssemblyMatrix, { position: [0.0, -0.05, -1.2], rotation: [-2.1, -0.0, -0.0], scale: [0.03, 0.3, 0.4] });
        drawShape(gl, programInfo, this.ellipsoidBuffers, we2, kingdraFinWhite);

        const bellyPlateTransform = {
            position: [0.0, 0.06, 0.04], rotation: [0.0, -1.5, 0.0], scale: [1.01, 0.96, 0.8]
        };
        const bellyPlateMatrix = applyLocalTransform(bodyMatrix, bellyPlateTransform);
        drawShape(gl, programInfo, this.bellyPlateBuffers, bellyPlateMatrix, kingdraYellow);

        //mata kiri
        const leftEyeAssemblyTransform = {
            position: [-0.83, -0.45, 0.85], 
            rotation: [1, 3.3, 0.2], 
            scale: [0.1, currentEyeScaleY, 1.0] //update
        };
        const leftEyeAssemblyMatrix = applyLocalTransform(headMatrix, leftEyeAssemblyTransform);
        
        const leftEyeWhiteMatrix = applyLocalTransform(leftEyeAssemblyMatrix, { position: [0, 0, 0], rotation: [0, 0, 0], scale: [0.6, 0.6, 0.6] });
        drawShape(gl, programInfo, this.eyeBuffers, leftEyeWhiteMatrix, eyeWhite);
        
        const leftEyeRedMatrix = applyLocalTransform(leftEyeAssemblyMatrix, { position: [0, 0, 0], rotation: [0, 0, 0], scale: [0.6 * 0.8, 0.6 * 0.8, 0.6 * 0.8] });
        drawShape(gl, programInfo, this.eyeBuffers, leftEyeRedMatrix, eyeRed);
        
        const leftEyeBlackMatrix = applyLocalTransform(leftEyeRedMatrix, { position: [0, 0, 0.02], rotation: [0, 0, 0], scale: [0.7 * 0.8, 0.7 * 0.8, 0.7 * 0.8] });
        drawShape(gl, programInfo, this.eyeBuffers, leftEyeBlackMatrix, eyeBlack);

        //mata kanan
        const rightEyeAssemblyTransform = {
            position: [0.83, -0.45, 0.85], 
            rotation: [1, -3.3, -0.2], 
            scale: [0.1, currentEyeScaleY, 1.0] //update
        };
        const rightEyeAssemblyMatrix = applyLocalTransform(headMatrix, rightEyeAssemblyTransform);
        
        const rightEyeWhiteMatrix = applyLocalTransform(rightEyeAssemblyMatrix, { position: [0, 0, 0], rotation: [0, 0, 0], scale: [0.6, 0.6, 0.6] });
        drawShape(gl, programInfo, this.eyeBuffers, rightEyeWhiteMatrix, eyeWhite);
        
        const rightEyeRedMatrix = applyLocalTransform(rightEyeAssemblyMatrix, { position: [0, 0, 0], rotation: [0, 0, 0], scale: [0.6 * 0.8, 0.6 * 0.8, 0.6 * 0.8] });
        drawShape(gl, programInfo, this.eyeBuffers, rightEyeRedMatrix, eyeRed);
        
        const rightEyeBlackMatrix = applyLocalTransform(rightEyeRedMatrix, { position: [0, 0, 0.02], rotation: [0, 0, 0], scale: [0.7 * 0.8, 0.7 * 0.8, 0.7 * 0.8] });
        drawShape(gl, programInfo, this.eyeBuffers, rightEyeBlackMatrix, eyeBlack);
    }
}