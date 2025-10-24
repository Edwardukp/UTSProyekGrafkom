class SeadraModel {
    constructor(gl, colors) {
        this.gl = gl;
        this.colors = colors;
        this.buffers = {};

        this.currentState = 'INITIAL_DELAY'; //states: INITIAL_DELAY, BACKFLIPPING, IDLING
        this.stateTimer = 0.0; //timer general untuk state saat ini
        this.initialDelay = 2.0; //delay awal sebelum backflip pertama
        this.backflipDuration = 2.0; //durasi backflip
        this.idleDuration = 5.0 + Math.random() * 2.0; 

        //body path
        const controlPath2D = [
            [-0.4, -0.1], [-0.55, -0.2], [-0.7, -0.3], [-0.85, -0.32],
            [-1.0, -0.3], [-1.1, -0.28], [-1.2, -0.25], [-1.28, -0.18],
            [-1.35, -0.1], [-1.4, 0.03], [-1.4, 0.15], [-1.38, 0.28],
            [-1.3, 0.4], [-1.2, 0.45], [-1.1, 0.45], [-1.0, 0.4],
            [-0.95, 0.3], [-0.97, 0.22], [-1.0, 0.15], [-1.03, 0.12], [-1.05, 0.1]
        ];
        const controlRadii = [
            0.25, 0.35, 0.4, 0.45, 0.48, 0.50, 0.48, 0.45, 0.4,
            0.35, 0.31, 0.28, 0.25, 0.22, 0.18, 0.15, 0.12, 0.10,
            0.08, 0.06, 0.04
        ];
        const pathDimensionScale = 18.0;
        const pathRadiusScale = 10.0;
        this.pathTranslate = [ 0, 19.2, 1.8 ];
        const controlPoints = controlPath2D.map(p => {
            const scaledP = [0.0, p[0] * pathDimensionScale, p[1] * pathDimensionScale];
            return vec3.add(scaledP, this.pathTranslate);
        });

        //path & radius halus
        const bodyPath = [];
        const bodyRadii = [];
        const segmentsPerCurve = 8;
        const numPoints = controlPoints.length;
        bodyPath.push(controlPoints[0]);
        bodyRadii.push(controlRadii[0] * pathRadiusScale);
        for (let i = 0; i < numPoints - 1; i++) {
            const p0 = controlPoints[i === 0 ? 0 : i - 1]; const p1 = controlPoints[i]; const p2 = controlPoints[i + 1]; const p3 = controlPoints[i + 2 >= numPoints ? numPoints - 1 : i + 2];
            const r1 = controlRadii[i] * pathRadiusScale; const r2 = controlRadii[i + 1] * pathRadiusScale;
            for (let j = 1; j <= segmentsPerCurve; j++) {
                const t = j / segmentsPerCurve;
                bodyPath.push(catmullRomInterpolate(p0, p1, p2, p3, t));
                bodyRadii.push(linearInterpolate(r1, r2, t));
            }
        }
        this.bodyPath = bodyPath;

        //geometry tubuh
        const angle_45  = Math.PI * 0.25; const angle_135 = Math.PI * 0.75;
        this.buffers.bodyBelly = createCurvedStrip(gl, bodyPath, bodyRadii, 14, angle_45, angle_135);
        this.buffers.bodyBack = createCurvedStrip(gl, bodyPath, bodyRadii, 40, angle_135, angle_45 + Math.PI * 2.0);
        this.buffers.dorsalFin = generateNewDorsalFin(gl, bodyPath, bodyRadii);

        //geometry kepala
        this.buffers.headBase = createEllipsoid(gl, 1.2, 1.0, 0.8, 30, 30); this.buffers.neck = createCylinder(gl, 0.95, 0.3, 30); this.buffers.snout = createCylinder(gl, 0.3, 1.5, 20); this.buffers.snoutCap = createCylinder(gl, 0.29, 0.05, 20); this.buffers.snoutRing = createTorus(gl, 0.35, 0.1, 20, 20); this.buffers.spikeTop = createTriangularPyramid(gl, 0.25, 1.0); this.buffers.spikeMid = createTriangularPyramid(gl, 0.2, 1.0); this.buffers.spikeSideR = createTriangularPyramid(gl, 0.15, 0.6); this.buffers.spikeSideL = createTriangularPyramid(gl, 0.15, 0.6); this.buffers.finR = createTriangularPyramid(gl, 0.32, 1.6); this.buffers.finL = createTriangularPyramid(gl, 0.32, 1.6); this.buffers.eyebrowR = createEyebrowShape(gl); this.buffers.eyeWhiteR = createEyeShape(gl); this.buffers.pupilR = createEyePupil(gl); this.buffers.highlightR = createEllipsoid(gl, 0.05, 0.05, 0.05, 10, 10); this.buffers.eyebrowL = createEyebrowShape(gl); this.buffers.eyeWhiteL = createEyeShape(gl); this.buffers.pupilL = createEyePupil(gl); this.buffers.highlightL = createEllipsoid(gl, 0.05, 0.05, 0.05, 10, 10);
    }

    draw(gl, programInfo, parentMatrix, animationTime = 0.0, deltaTime = 0.0) { 

        const C_BELLY = this.colors.seadraBelly || this.colors.belly;
        const C_BACK = this.colors.seadraBlue || this.colors.head;
        const C_BLACK = this.colors.eyePupil;
        const C_WHITE = this.colors.eyeWhite;

        //animasi passive
        const floatOffset = Math.sin(animationTime * 2.0) * 0.5;
        const headPitch = Math.sin(animationTime * 3.0) * 0.3;
        const breathScale = 1.0 + Math.cos(animationTime * 1.5) * 0.15;

        this.stateTimer += deltaTime; 
        let backflipAngle = 0.0;
        let idleSway = 0.0;
        const backflipAxis = vec3.normalize([1.0, 0.5, 0.0]);

        switch(this.currentState) {
            case 'INITIAL_DELAY':
                const initialSwaySpeed = 2.0;
                const initialSwayAmount = 0.2;
                idleSway = Math.sin(animationTime * initialSwaySpeed) * initialSwayAmount;

                if (this.stateTimer >= this.initialDelay) {
                    this.currentState = 'BACKFLIPPING';
                    this.stateTimer = 0.0; 
                }
                break;

            case 'BACKFLIPPING':
                let t_flip = Math.min(1.0, this.stateTimer / this.backflipDuration);
                backflipAngle = t_flip * Math.PI * 2.0; //sudut 0 -> 360 derajat
                if (t_flip >= 1.0) {
                    this.currentState = 'IDLING';
                    this.stateTimer = 0.0; 
                    this.idleDuration = 5.0 + Math.random() * 2.0;
                }
                break;

            case 'IDLING':
                const swaySpeed = 2.0;
                const swayAmount = 0.2;
                idleSway = Math.sin(animationTime * swaySpeed) * swayAmount;
                if (this.stateTimer >= this.idleDuration) {
                    this.currentState = 'BACKFLIPPING';
                    this.stateTimer = 0.0;
                }
                break;
        }

        //root transform
        let rootMatrix = mat4.clone(parentMatrix);
        mat4.translate(rootMatrix, rootMatrix, [0, floatOffset, 0]); 

        if (this.currentState === 'BACKFLIPPING') {
            mat4.rotate(rootMatrix, rootMatrix, backflipAngle, backflipAxis);
        } else { // Termasuk INITIAL_DELAY dan IDLING
            mat4.rotateZ(rootMatrix, rootMatrix, idleSway); //idle sway
        }

        mat4.scale(rootMatrix, rootMatrix, [breathScale, breathScale, breathScale]); //nafas

        //gambar body & fin
        drawShape(gl, programInfo, this.buffers.bodyBelly, rootMatrix, C_BELLY);
        drawShape(gl, programInfo, this.buffers.bodyBack, rootMatrix, C_BACK);
        drawShape(gl, programInfo, this.buffers.dorsalFin, rootMatrix, C_BELLY);

        //perhitungan transformasi kepala
        const neckPosition = this.bodyPath[0]; const neckTangent = vec3.normalize(vec3.subtract(this.bodyPath[0], this.bodyPath[1]));
        const defaultHeadForward = [0, 0, 1]; const headRotationQuat = quat.create(); quat.rotationTo(headRotationQuat, defaultHeadForward, neckTangent); const headRotationMatrix = mat4.create(); mat4.fromQuat(headRotationMatrix, headRotationQuat);
        let headBaseTransform = mat4.create(); mat4.translate(headBaseTransform, headBaseTransform, neckPosition); mat4.multiply(headBaseTransform, headBaseTransform, headRotationMatrix); mat4.rotateX(headBaseTransform, headBaseTransform, 1.2);
        mat4.rotateX(headBaseTransform, headBaseTransform, headPitch); // Terapkan anggukan
        const headScaleFactor = 3.5; mat4.scale(headBaseTransform, headBaseTransform, [headScaleFactor, headScaleFactor, headScaleFactor]);
        let finalHeadBase = mat4.multiply(mat4.create(), rootMatrix, headBaseTransform); // Gabungkan dengan root

        //gambar kepala
        const drawHeadPart = (buffer, transform, color, scaleX = 1.0) => {
            let m = mat4.clone(finalHeadBase); mat4.translate(m, m, transform.translate || [0,0,0]); if (transform.rotate) mat4.rotate(m, m, transform.rotate.angle, transform.rotate.axis); let scale = transform.scale || [1,1,1]; mat4.scale(m, m, [scale[0] * scaleX, scale[1], scale[2]]);
            drawShape(gl, programInfo, buffer, m, color);
        };

        drawHeadPart(this.buffers.headBase, { scale: [1.2, 1.2, 1.0] }, C_BACK); drawHeadPart(this.buffers.neck, { translate: [0, -0.6, 0.1], rotate: { angle: -0.2, axis: [1, 0, 0] } }, C_BELLY); drawHeadPart(this.buffers.snout, { translate: [0, 0.1, 0.8], rotate: { angle: Math.PI / 2, axis: [1, 0, 0] } }, C_BACK); drawHeadPart(this.buffers.snoutCap, { translate: [0, 0.1, 2.25], rotate: { angle: Math.PI / 2, axis: [1, 0, 0] } }, C_BLACK); drawHeadPart(this.buffers.snoutRing, { translate: [0, 0.1, 2.3], rotate: { angle: Math.PI / 2, axis: [1, 0, 0] } }, C_BACK); drawHeadPart(this.buffers.spikeTop, { translate: [0, 0.9, -0.5], rotate: { angle: -0.9, axis: [1, 0, 0] }, scale: [1.5, 1.5, 1.5] }, C_BACK); drawHeadPart(this.buffers.spikeMid, { translate: [0, 0.5, -1.2], rotate: { angle: -1.3, axis: [1, 0, 0] }, scale: [1.5, 1.5, 1.5] }, C_BELLY); drawHeadPart(this.buffers.spikeSideR, { translate: [0.4, 0.6, -0.9], rotate: { angle: 1.2, axis: [-1, 0, 0.5] }, scale: [1.5, 1.5, 1.5] }, C_BACK); drawHeadPart(this.buffers.spikeSideL, { translate: [-0.4, 0.6, -0.9], rotate: { angle: 1.2, axis: [-1, 0, -0.5] }, scale: [1.5, 1.5, 1.5] }, C_BACK); drawHeadPart(this.buffers.finR, { translate: [1.2, -0.1, 0.0], rotate: { angle: 1.57, axis: [-0.8, 0, -1] }, scale: [1.5, 1.5, 1.5] }, C_BACK); drawHeadPart(this.buffers.finL, { translate: [-1.2, -0.1, 0.0], rotate: { angle: 1.57, axis: [-0.8, 0, 1] }, scale: [1.5, 1.5, 1.5] }, C_BACK);
        //mata kanan
        drawHeadPart(this.buffers.eyebrowR, { translate: [0.6, 0.55, 0.75], rotate: { angle: -0.2, axis: [0, 0, 1] } }, C_BACK); drawHeadPart(this.buffers.eyeWhiteR, { translate: [0.6, 0.35, 0.8] }, C_WHITE); drawHeadPart(this.buffers.pupilR, { translate: [0.6, 0.35, 0.85] }, C_BLACK); drawHeadPart(this.buffers.highlightR, { translate: [0.65, 0.40, 0.9] }, C_WHITE);
        //mata kiri
        drawHeadPart(this.buffers.eyebrowL, { translate: [-0.6, 0.55, 0.75], rotate: { angle: -0.2, axis: [0, 0, 1] } }, C_BACK, -1.0); drawHeadPart(this.buffers.eyeWhiteL, { translate: [-0.6, 0.35, 0.8] }, C_WHITE, -1.0); drawHeadPart(this.buffers.pupilL, { translate: [-0.6, 0.35, 0.85] }, C_BLACK, -1.0); drawHeadPart(this.buffers.highlightL, { translate: [-0.65, 0.40, 0.9] }, C_WHITE);
    }
}