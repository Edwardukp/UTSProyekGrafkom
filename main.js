class WebGLApp {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl');
        if (!this.gl) {
            alert('WebGL tidak didukung.');
            return;
        }

        const vsSource = document.getElementById('vertex-shader-3d').text;
        const fsSource = document.getElementById('fragment-shader-3d').text;
        const shaderProgram = initShaderProgram(this.gl, vsSource, fsSource);

        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(shaderProgram, 'a_position'),
                vertexNormal: this.gl.getAttribLocation(shaderProgram, 'a_normal'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'u_projectionMatrix'),
                viewMatrix: this.gl.getUniformLocation(shaderProgram, 'u_viewMatrix'),
                modelMatrix: this.gl.getUniformLocation(shaderProgram, 'u_modelMatrix'),
                normalMatrix: this.gl.getUniformLocation(shaderProgram, 'u_normalMatrix'),
                color: this.gl.getUniformLocation(shaderProgram, 'u_color'),
                lightDirection: this.gl.getUniformLocation(shaderProgram, 'u_lightDirection'),
            },
        };

        this.colors = {
            // Horsea Colors
            head: [137/255, 207/255, 240/255, 1.0], 
            snout: [137/255, 207/255, 240/255, 1.0],
            snoutTip: [137/255, 207/255, 240/255, 1.0], 
            snoutTop: [0.2, 0.2, 0.2, 1.0],
            eyeWhite: [1.0, 1.0, 1.0, 1.0],
            eyeIris: [227/255, 66/255, 52/255, 1.0], 
            eyePupil: [0.0, 0.0, 0.0, 1.0],
            headSpike: [137/255, 207/255, 240/255, 1.0],
            belly: [255/255, 253/255, 208/255, 1.0], 
            fin: [255/255, 253/255, 208/255, 1.0], 
            
            // Environment Colors
            seaFloor: [210/255, 180/255, 140/255, 1.0], 
            rock: [128/255, 128/255, 128/255, 1.0],   
            seaweed: [34/255, 139/255, 34/255, 1.0],   
            shell: [255/255, 248/255, 220/255, 1.0],    
            bubble: [173/255, 216/255, 230/255, 1.0],   

            // Kingdra Colors
            kingdraBlue: [0.32, 0.58, 0.78, 1.0],
            kingdraYellow: [0.96, 0.84, 0.44, 1.0],
            kingdraFinWhite: [0.9, 0.88, 0.8, 1.0],
            
            // Seadra Colors
            seadraBlue: [0.1, 0.4, 0.8, 1.0], 
            seadraBelly: [0.9, 0.85, 0.7, 1.0] 
        };

        //model horsea
        this.head = new Head(this.gl, this.colors);
        this.body = new Body(this.gl, this.colors);
        this.fin = new Fin(this.gl, this.colors);

        //model kingdra
        this.kingdra = new KingdraModel(this.gl, this.colors);

        //model seadra
        this.seadra = new SeadraModel(this.gl, this.colors);

        //environment
        this.seaFloor = new SeaFloor(this.gl, this.colors);
        this.rockPrefab = new Rock(this.gl, this.colors);
        this.seaweedPrefab = new Seaweed(this.gl, this.colors);
        this.shellPrefab = new Shell(this.gl, this.colors);

        const floorY = this.seaFloor.yPosition; 
        
        this.rockPositions = [
            [ [-2.0, floorY, -3.0], 0.4, [1.5, 1.0, 1.0] ],
            [ [ 3.0, floorY, -1.0], 1.2, [1.0, 0.8, 1.2] ],
            [ [ 0.5, floorY, -5.0], 0.1, [0.8, 0.6, 0.8] ],
            [ [-4.0, floorY,  1.5], 0.8, [1.2, 0.9, 1.1] ],
            [ [ 2.5, floorY,  3.0], 0.5, [0.7, 0.7, 0.7] ],
            [ [-1.5, floorY,  4.5], 1.5, [1.0, 0.8, 0.8] ],
            
        ];
        this.seaweedPositions = [
            [ [-2.5, floorY, -3.2], 0.2, 0.8 ],
            [ [-2.2, floorY, -2.8], 0.8, 0.7 ],
            [ [ 3.3, floorY, -0.8], 2.5, 1.0 ],
            [ [ 2.8, floorY,  3.3], 1.0, 0.9 ],
            [ [-4.2, floorY,  1.8], 0.1, 0.8 ],
            [ [ 0.2, floorY, -5.3], 0.0, 0.6 ],
            [ [ 5.2, floorY, -3.8], 0.5, 1.1 ],
            [ [-3.0, floorY,  4.0], 1.2, 0.8 ]
        ];
        this.shellPositions = [
            [ [ 1.0, floorY + 0.05, 1.0], 0.5, 1.0 ],
            [ [-1.5, floorY + 0.05, 2.0], -1.5, 1.2 ],
            [ [ 3.5, floorY + 0.05, 0.0], 0.0, 1.0 ],
            [ [-3.0, floorY + 0.05, -2.5], 2.1, 0.9 ],
            [ [ 1.8, floorY + 0.05, 4.0], 3.0, 1.1 ],
            [ [ 0.0, floorY + 0.05, -3.0], 1.0, 1.0 ]
        ];

        this.rockColliders = [];
        const baseRockRadius = 1.0; 
        const baseRockHeight = 0.7; 
        for (const rock of this.rockPositions) {
            const pos = rock[0];    
            const scale = rock[2];  
            const radius = Math.max(scale[0], scale[2]) * baseRockRadius;
            const topOfRock = pos[1] + (scale[1] * baseRockHeight);
            this.rockColliders.push({ x: pos[0], z: pos[2], radius: radius, height: topOfRock });
        }

        this.lastTime = 0;

        this.baseFloatHeight = 1.0; 
        this.modelPosition = [0, this.baseFloatHeight, 0]; // Posisi Horsea

        this.modelYRotation = 0.0;
        this.modelXRotation = 0.0;
        this.modelZRotation = 0.0; 
        this.isJumping = false;
        this.jumpTimer = 0.0;
        this.isFlipping = false;
        this.flipTimer = 0.0;
        this.autoAnimState = 'moving'; 
        this.autoAnimTimer = 0.0;
        this.targetRock = this.rockColliders[1]; 
        this.movementAngle = 0.0;
        this.idleSwayAngle = 0.0;
        this.keys = {};
        this.c_key_pressed = false; 

        this.finSwayAngle = 0.0;    
        this.tailSwayAngle = 0.0;   

        window.addEventListener('keydown', (e) => { 
            this.keys[e.key] = true; 
            const gameKeys = ['Tab', 'Control', 'w', 'a', 's', 'd', 'c', ' '];
            if (gameKeys.includes(e.key)) {
                if (document.pointerLockElement === this.canvas) {
                    e.preventDefault();
                }
            }
        });

        window.addEventListener('keyup', (e) => { 
            this.keys[e.key] = false; 
            if (e.key === 'c') { this.c_key_pressed = false; }
        });

        this.cameraMode = 'follow'; 
        this.camera = {
            eye: [0, 1.0, 6.0],
            front: [0, 0, -1.0],
            up: [0, 1, 0],
            speed: 3.0,
            sensitivity: 0.1,
            yaw: -90.0,
            pitch: 0.0,
        };
        this.lastMouseX = this.canvas.width / 2;
        this.lastMouseY = this.canvas.height / 2;
        this.firstMouse = true;

        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.canvas.addEventListener('click', () => {
            this.canvas.requestPointerLock();
        });
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === this.canvas) {
                document.addEventListener('mousemove', this.handleMouseMove, false);
            } else {
                document.removeEventListener('mousemove', this.handleMouseMove, false);
                this.firstMouse = true;
            }
        });

        this.bubblePrefab = createEllipsoid(this.gl, 0.08, 0.08, 0.08, 8, 8); 
        this.bubbles = []; 
        this.bubbleSpawnTimer = 0.0;

        requestAnimationFrame((now) => this.render(now));
    }

    degToRad(d) {
        return d * Math.PI / 180;
    }

    handleMouseMove(e) {
        if (this.cameraMode !== 'free') return;
        const xoffset = e.movementX;
        const yoffset = e.movementY; 
        this.camera.yaw += xoffset * this.camera.sensitivity;
        this.camera.pitch -= yoffset * this.camera.sensitivity;
        if (this.camera.pitch > 89.0) this.camera.pitch = 89.0;
        if (this.camera.pitch < -89.0) this.camera.pitch = -89.0;
        let front = [0, 0, 0];
        front[0] = Math.cos(this.degToRad(this.camera.yaw)) * Math.cos(this.degToRad(this.camera.pitch));
        front[1] = Math.sin(this.degToRad(this.camera.pitch));
        front[2] = Math.sin(this.degToRad(this.camera.yaw)) * Math.cos(this.degToRad(this.camera.pitch));
        this.camera.front = vec3.normalize(front);
    }
    
    spawnBubble() {
        let horseaMatrix = mat4.create();
        mat4.translate(horseaMatrix, horseaMatrix, this.modelPosition);
        mat4.rotateY(horseaMatrix, horseaMatrix, this.modelYRotation);
        mat4.rotateX(horseaMatrix, horseaMatrix, this.modelXRotation);
        const snoutTipLocalPos = [0, -0.15, 1.05];
        let spawnPos = [0, 0, 0];
        vec3.transformMat4(spawnPos, snoutTipLocalPos, horseaMatrix);
        let zAxis = [horseaMatrix[8], horseaMatrix[9], horseaMatrix[10]];
        vec3.normalize(zAxis, zAxis);

        const initialLifetime = 2.0 + Math.random() * 2.0;
        const initialScale = 0.1 + Math.random() * 0.2;

        let bubble = {
            position: spawnPos,
            velocity: [
                (Math.random() - 0.5) * 0.2 + zAxis[0] * 0.3, 
                0.4 + Math.random() * 0.4,                  
                (Math.random() - 0.5) * 0.2 + zAxis[2] * 0.3  
            ],
            lifetime: initialLifetime, 
            maxLifetime: initialLifetime, 
            wobbleOffset: Math.random() * 2.0 * Math.PI,
            wobbleSpeed: 1.0 + Math.random(),
            wobbleAmount: 0.1 + Math.random() * 0.1,
            initialScale: initialScale, 
            targetScale: 1.0 + Math.random() * 0.5,
            currentScale: initialScale 
        };
        this.bubbles.push(bubble);
    }

    isColliding(newX, newZ, currentHorseaY) {
        return false; 
    }

    update(deltaTime) {
        
        //camera logic
        if (this.keys['c'] && !this.c_key_pressed) {
            this.cameraMode = (this.cameraMode === 'follow') ? 'free' : 'follow';
            this.c_key_pressed = true; 
            
            if (this.cameraMode === 'free') {
                this.camera.eye = [0, 1.0, 6.0]; 
                this.camera.front = [0, 0, -1.0];
                this.camera.yaw = -90.0;
                this.camera.pitch = 0.0;
                this.firstMouse = true;
            }
        }

        if (this.cameraMode === 'free') {
            const moveSpeed = this.camera.speed * deltaTime;
            if (this.keys['w']) {
                this.camera.eye = vec3.add(this.camera.eye, vec3.scale(this.camera.front, moveSpeed));
            }
            if (this.keys['s']) {
                this.camera.eye = vec3.subtract(this.camera.eye, vec3.scale(this.camera.front, moveSpeed));
            }
            const right = vec3.normalize(vec3.cross(this.camera.front, this.camera.up));
            if (this.keys['a']) {
                this.camera.eye = vec3.subtract(this.camera.eye, vec3.scale(right, moveSpeed));
            }
            if (this.keys['d']) {
                this.camera.eye = vec3.add(this.camera.eye, vec3.scale(right, moveSpeed));
            }
            if (this.keys['Tab']) { 
                this.camera.eye[1] += moveSpeed;
            }
            if (this.keys['Control']) { 
                this.camera.eye[1] -= moveSpeed;
            }
        }
        
        //animasi horsea
        switch (this.autoAnimState) {
            
            case 'moving':
                this.autoAnimTimer += deltaTime;
                const turnSpeed = Math.PI;
                const orbitRadius = this.targetRock.radius + 1.5; 
                
                this.movementAngle += (turnSpeed * 0.3) * deltaTime; 
                const newX = this.targetRock.x + Math.sin(this.movementAngle) * orbitRadius;
                const newZ = this.targetRock.z + Math.cos(this.movementAngle) * orbitRadius;
                
                this.modelPosition[0] = newX;
                this.modelPosition[2] = newZ;
                this.modelYRotation = -this.movementAngle; 
                
                this.bubbleSpawnTimer -= deltaTime;
                if (this.bubbleSpawnTimer <= 0.0) {
                    this.spawnBubble();
                    this.bubbleSpawnTimer = 0.05;
                }

                if (this.autoAnimTimer >= 8.0) {
                    this.autoAnimState = 'stopping';
                    this.autoAnimTimer = 0.0;
                }
                break;

            case 'stopping':
                this.autoAnimTimer += deltaTime;
                if (this.autoAnimTimer >= 0.5) {
                    this.autoAnimState = 'jumping1';
                    this.isJumping = true; 
                    this.jumpTimer = 0.0;
                }
                break;
                
            case 'jumping1':
                if (!this.isJumping) {
                    this.autoAnimState = 'jumping2';
                    this.isJumping = true; 
                    this.jumpTimer = 0.0;
                }
                break;

            case 'jumping2':
                if (!this.isJumping) {
                    this.autoAnimState = 'flipping';
                    this.isFlipping = true; 
                    this.flipTimer = 0.0;
                }
                break;

            case 'flipping':
                if (!this.isFlipping) {
                    this.autoAnimState = 'jumpFlipping';
                    this.isJumping = true;  
                    this.isFlipping = true; 
                    this.jumpTimer = 0.0;
                    this.flipTimer = 0.0;
                }
                break;
                
            case 'jumpFlipping':
                if (!this.isJumping && !this.isFlipping) {
                    this.autoAnimState = 'idling';
                    this.autoAnimTimer = 0.0; 
                    this.idleSwayAngle = 0.0;
                }
                break;

            case 'idling':
                this.autoAnimTimer += deltaTime;
                
                const swaySpeed = 2.0;
                const swayAmount = 0.2; 
                this.idleSwayAngle += swaySpeed * deltaTime;
                this.modelZRotation = Math.sin(this.idleSwayAngle) * swayAmount;

                if (this.autoAnimTimer >= 10.0) {
                    this.autoAnimState = 'dizzy'; 
                    this.autoAnimTimer = 0.0;
                    this.modelZRotation = 0.0; 
                }
                break;

            case 'dizzy':
                this.autoAnimTimer += deltaTime;
                const dizzyDuration = 3.0; 
                const dizzyTilt = -Math.PI / 4.0; 

                this.modelXRotation = dizzyTilt; 

                const spinSpeed = 4.0; 
                this.modelYRotation = this.autoAnimTimer * spinSpeed; 

                if (this.autoAnimTimer >= dizzyDuration) {
                    this.autoAnimState = 'moving'; 
                    this.autoAnimTimer = 0.0;
                    this.modelXRotation = 0.0; 
                }
                break;
        }

        //jump & flip horsea
        const jumpDuration = 0.6; const jumpHeight = 1.2;
        if (this.isJumping) {
            this.jumpTimer += deltaTime;
            if (this.jumpTimer >= jumpDuration) {
                this.isJumping = false; this.jumpTimer = 0.0; 
                this.modelPosition[1] = this.baseFloatHeight; 
            } else {
                let phase = this.jumpTimer / jumpDuration;
                this.modelPosition[1] = this.baseFloatHeight + (jumpHeight * Math.sin(phase * Math.PI));
            }
        }

        const flipDuration = 0.7;
        if (this.isFlipping) {
            this.flipTimer += deltaTime;
            if (this.flipTimer >= flipDuration) {
                this.isFlipping = false; this.flipTimer = 0.0; this.modelXRotation = 0.0;
            } else {
                let phase = this.flipTimer / flipDuration;
                this.modelXRotation = -phase * Math.PI * 2.0; 
            }
        }

        //gerakan passive horsea
        const finSwaySpeed = 6.0; 
        const tailSwaySpeed = 4.0; 
        
        this.finSwayAngle += finSwaySpeed * deltaTime;
        this.tailSwayAngle += tailSwaySpeed * deltaTime;

        //update bubble
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            let b = this.bubbles[i];
            b.lifetime -= deltaTime;
            if (b.lifetime <= 0) {
                this.bubbles.splice(i, 1);
            } else {
                b.position[0] += b.velocity[0] * deltaTime;
                b.position[1] += b.velocity[1] * deltaTime;
                b.position[2] += b.velocity[2] * deltaTime;
                let wobble = Math.sin(this.lastTime * b.wobbleSpeed + b.wobbleOffset) * b.wobbleAmount;
                b.position[0] += wobble * deltaTime;

                let lifeProgress = (b.maxLifetime - b.lifetime) / b.maxLifetime;
                b.currentScale = b.initialScale + (b.targetScale - b.initialScale) * lifeProgress;
            }
        }
    }


    render(now) {
        now *= 0.001;
        const deltaTime = now - this.lastTime;
        this.lastTime = now;
        this.update(deltaTime);
        this.drawScene(this.gl, this.programInfo);
        requestAnimationFrame((now) => this.render(now));
    }

    drawScene(gl, programInfo) {
        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0.1, 0.3, 0.5, 1.0); 
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(programInfo.program);

        //setup camera & lighting
        const fov = 45 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1; const zFar = 100.0;
        const projectionMatrix = mat4.perspective(fov, aspect, zNear, zFar);
        
        let viewMatrix;
        if (this.cameraMode === 'free') {
            let target = vec3.add(this.camera.eye, this.camera.front);
            viewMatrix = mat4.lookAt(this.camera.eye, target, this.camera.up);
        } else { 
            const eye = [0, 1.0 + this.baseFloatHeight, 6]; 
            const target = [0, this.baseFloatHeight, 0]; 
            const up = [0, 1, 0];
            viewMatrix = mat4.lookAt(eye, target, up);
        }
        
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix);
        const lightDir = vec3.normalize([-0.5, 0.5, 1.0]);
        gl.uniform3fv(programInfo.uniformLocations.lightDirection, lightDir);
        
        //gambar environment
        this.seaFloor.draw(gl, programInfo, mat4.create());
        for (const p of this.rockPositions) {
            let matrix = mat4.create();
            mat4.translate(matrix, matrix, p[0]); 
            mat4.rotateY(matrix, matrix, p[1]);   
            mat4.scale(matrix, matrix, p[2]);     
            this.rockPrefab.draw(gl, programInfo, matrix);
        }
        for (const p of this.seaweedPositions) {
            let matrix = mat4.create();
            mat4.translate(matrix, matrix, p[0]);
            mat4.rotateY(matrix, matrix, p[1]);
            mat4.scale(matrix, matrix, [p[2], p[2], p[2]]); 
            this.seaweedPrefab.draw(gl, programInfo, matrix);
        }
        for (const p of this.shellPositions) {
            let matrix = mat4.create();
            mat4.translate(matrix, matrix, p[0]);
            mat4.rotateY(matrix, matrix, p[1]);
            mat4.scale(matrix, matrix, [p[2], p[2], p[2]]);
            this.shellPrefab.draw(gl, programInfo, matrix);
        }

        //gambar horsea
        let rootModelMatrix = mat4.create();
        mat4.translate(rootModelMatrix, rootModelMatrix, this.modelPosition);
        mat4.rotateY(rootModelMatrix, rootModelMatrix, this.modelYRotation);
        mat4.rotateX(rootModelMatrix, rootModelMatrix, this.modelXRotation);
        mat4.rotateZ(rootModelMatrix, rootModelMatrix, this.modelZRotation); 

        let headMatrix = mat4.clone(rootModelMatrix);
        if (this.autoAnimState === 'idling') {
             mat4.rotateZ(headMatrix, headMatrix, this.modelZRotation); 
        }
        this.head.draw(gl, programInfo, headMatrix);
        this.fin.draw(gl, programInfo, rootModelMatrix, this.finSwayAngle);
        let bodyMatrix = mat4.clone(rootModelMatrix);
        if (this.autoAnimState !== 'dizzy') {
            const tailSwayAmount = 0.3; 
            let tailSway = Math.cos(this.tailSwayAngle) * tailSwayAmount;
            mat4.rotateY(bodyMatrix, bodyMatrix, tailSway); 
        }
        this.body.draw(gl, programInfo, bodyMatrix);

        //gambar kingdra
        let kingdraRootMatrix = mat4.create();
        mat4.translate(kingdraRootMatrix, kingdraRootMatrix, [-4.0, this.baseFloatHeight + 0.5, 0.0]); 
        mat4.scale(kingdraRootMatrix, kingdraRootMatrix, [0.5, 0.5, 0.5]); 
        mat4.rotateY(kingdraRootMatrix, kingdraRootMatrix, 0.5); 
        this.kingdra.draw(gl, programInfo, kingdraRootMatrix, this.lastTime);
        
        //gambar seadra
        let seadraRootMatrix = mat4.create();
        mat4.translate(seadraRootMatrix, seadraRootMatrix, [9.0, this.baseFloatHeight + 0.3, 2.0]); 
        mat4.scale(seadraRootMatrix, seadraRootMatrix, [0.15, 0.15, 0.15]); 
        mat4.rotateY(seadraRootMatrix, seadraRootMatrix, -0.5); 
        const deltaTime = this.lastTime - (this.previousRenderTime || 0); 
        this.seadra.draw(gl, programInfo, seadraRootMatrix, this.lastTime, deltaTime);
        this.previousRenderTime = this.lastTime;

        //bubble
        for (const bubble of this.bubbles) {
            let bubbleMatrix = mat4.create();
            mat4.translate(bubbleMatrix, bubbleMatrix, bubble.position);
            const scale = bubble.currentScale;
            mat4.scale(bubbleMatrix, bubbleMatrix, [scale, scale, scale]);
            drawShape(gl, programInfo, this.bubblePrefab, bubbleMatrix, this.colors.bubble);
        }
    }
}

window.onload = () => {
    new WebGLApp('glcanvas');
};