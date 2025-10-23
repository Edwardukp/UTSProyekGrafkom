"use strict";

// ===============================================
// FUNGSI UTAMA (GABUNGAN)
// ===============================================
function main() {
    const canvas = document.getElementById('glcanvas');
    const gl = canvas.getContext('webgl');
    if (!gl) { alert('WebGL tidak didukung!'); return; }

    // ... (inisialisasi shaderProgram dan programInfo SAMA seperti sebelumnya) ...
    const vsSource = document.getElementById('vertex-shader').text;
    const fsSource = document.getElementById('fragment-shader').text;
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            position: gl.getAttribLocation(shaderProgram, 'a_position'),
            normal: gl.getAttribLocation(shaderProgram, 'a_normal'),
            colorWeight: gl.getAttribLocation(shaderProgram, 'a_colorWeight'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'u_projectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'u_modelViewMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'u_normalMatrix'),
            lightDirection: gl.getUniformLocation(shaderProgram, 'u_lightDirection'),
            cameraPosition: gl.getUniformLocation(shaderProgram, 'u_cameraPosition'),
        },
    };


    // ===============================================
    // VARIABEL ANIMASI BARU
    // ===============================================
    let then = 0;
    let rotationY = 0;      // Rotasi Y global
    let floatOffset = 0;    // Translasi Y melayang
    let headPitch = 0;      // Rotasi X (pitch) kepala

    // VARIABEL KONTROL TRANSLASI 🆕
    let translateX = 0;     // Posisi X saat ini
    let translateZ = 0;     // Posisi Z saat ini
    const movementSpeed = 0.2; // Kecepatan pergerakan per frame (DeltaTime)

    // KONTROL SKALA BERNAFAS BARU 🆕
    let breathScale = 1.0; 
    const breathSpeed = 1.5; // Frekuensi pernapasan (radian per detik)
    const breathAmplitude = 0.15; // Seberapa besar perubahan skala (3%)

    // Status Tombol yang ditekan 🆕
    const keys = {
        w: false, // Maju (Z negatif)
        s: false, // Mundur (Z positif)
        a: false, // Kiri (X negatif)
        d: false  // Kanan (X positif)
    };

    // KONTROL BACKFLIP 🆕
    let isBackflipping = false;
    let backflipStartTime = 0;
    const backflipDuration = 1.0; // 1 detik untuk satu putaran penuh (360 derajat)

    // Inisialisasi semua buffer (Kepala + Badan + Ekor)
    // Sekarang initBuffers MENGEMBALIKAN DATA MENTAH, BUKAN buffer WebGL.
    const meshData = initMeshData(); 
    const buffers = createBuffersFromMeshData(gl, meshData);
    
    // ... (Setup Interaksi Kamera SAMA seperti sebelumnya) ...
    let cameraDistance = 45.0;
    let cameraAngleX = 0.5;
    let cameraAngleY = -0.5;
    let dragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    setupMouseInteraction(canvas);

    // SETUP TOMBOL BACKFLIP 🆕
    document.getElementById('backflip-btn').addEventListener('click', () => {
        if (!isBackflipping) {
            isBackflipping = true;
            backflipStartTime = then; // 'then' menyimpan waktu terakhir yang dihitung
        }
    });

    // SETUP KEYBOARD EVENT LISTENERS 🆕
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) {
            keys[key] = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) {
            keys[key] = false;
        }
    });

    function render(now) {
        now *= 0.001; // konversi ke detik
        const deltaTime = now - then;
        then = now;
        
        // --- LOGIKA ANIMASI ---
        rotationY += 0.5 * deltaTime; // Rotasi 0.5 radian/detik
        floatOffset = Math.sin(now * 2.0) * 0.5; // Melayang, frekuensi 2.0
        headPitch = Math.sin(now * 3.0) * 0.3; // Kepala mengangguk, frekuensi 3.0
        // ----------------------

        // --- LOGIKA PERHITUNGAN POSISI BARU DARI KEYBOARD --- 🆕
        const moveAmount = movementSpeed * deltaTime * 60; // Dikalikan 60 agar kecepatan konsisten
                                                           // (asumsi target FPS 60)
        
        // Pergerakan Z (Maju/Mundur)
        if (keys.w) { translateZ -= moveAmount; } 
        if (keys.s) { translateZ += moveAmount; }

        // Pergerakan X (Kiri/Kanan)
        if (keys.a) { translateX -= moveAmount; }
        if (keys.d) { translateX += moveAmount; }
        // ----------------------------------------------------

        // --- LOGIKA SKALA BERNAFAS BARU --- 🆕
        // Menggunakan Cosinus agar nilai dimulai dari 1 (tidak ada perubahan)
        // Skala akan berosilasi antara (1 - 0.03) dan (1 + 0.03)
        breathScale = 1.0 + Math.cos(now * breathSpeed) * breathAmplitude;

        // --- LOGIKA BACKFLIP 🆕 ---
        let backflipAngle = 0;
        if (isBackflipping) {
            const elapsedTime = now - backflipStartTime;
            let t = Math.min(1.0, elapsedTime / backflipDuration); // Interpolasi 0.0 ke 1.0
            
            // Backflip 360 derajat (2 * Math.PI)
            backflipAngle = t * 2.0 * Math.PI; 

            if (t >= 1.0) {
                isBackflipping = false;
            }
        }
        // ----------------------

        drawScene(gl, programInfo, buffers, cameraDistance, cameraAngleX, cameraAngleY, 
            rotationY, floatOffset, headPitch, backflipAngle, translateX, translateZ, breathScale); // Tambahkan parameter animasi
        
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // ... (Fungsi setupMouseInteraction SAMA seperti sebelumnya) ...
    function setupMouseInteraction(canvas) {
        canvas.onmousedown = (e) => {
            dragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        };
        canvas.onmouseup = () => dragging = false;
        canvas.onmouseout = () => dragging = false;
        canvas.onmousemove = (e) => {
            if (!dragging) return;
            const dx = e.clientX - lastMouseX;
            const dy = e.clientY - lastMouseY;
            
            cameraAngleY += dx * 0.01;
            cameraAngleX += dy * 0.01;
            cameraAngleX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, cameraAngleX));

            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        };
        canvas.onwheel = (e) => {
            e.preventDefault();
            cameraDistance += e.deltaY * 0.05;
            cameraDistance = Math.max(10.0, Math.min(100.0, cameraDistance));
        };
    }
}

// ===============================================
// FUNGSI RENDER (DRAW SCENE) - DIUBAH
// ===============================================
function drawScene(gl, programInfo, buffers, cameraDistance, cameraAngleX, cameraAngleY, 
    rotationY, floatOffset, headPitch,backflipAngle,translateX,translateZ, breathScale) 
{
    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.1, 0.1, 0.15, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1, zFar = 200.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Hitung posisi kamera (orbit)
    const cameraPosition = vec3.create();
    const camX = cameraDistance * Math.sin(cameraAngleY) * Math.cos(cameraAngleX);
    const camY = cameraDistance * Math.sin(cameraAngleX);
    const camZ = cameraDistance * Math.cos(cameraAngleY) * Math.cos(cameraAngleX);
    vec3.set(cameraPosition, camX, camY, camZ);
    
    // ** 1. TRANSFORMASI ANIMASI GLOBAL **
    const baseModelMatrix = mat4.create();
    
    // Translasi untuk "Melayang"
    mat4.translate(baseModelMatrix, baseModelMatrix, [0, floatOffset, 0]);



    // **B. Translasi X dan Z (Gerak Bolak-balik BARU) ** 🆕
    // PENTING: Lakukan translasi ini sebelum rotasi,
    // agar rotasi global Y diterapkan pada posisi baru.
    mat4.translate(baseModelMatrix, baseModelMatrix, [translateX, 0, translateZ]);

    // Rotasi Global (Y)
    mat4.rotateY(baseModelMatrix, baseModelMatrix, rotationY);

// ** C. Rotasi Backflip SUMBU SEMBARANG (Ganti Rotasi X)** 🆕
    
    // 1. Definisikan Sumbu Sembarang
    // Contoh Sumbu: Sumbu X=1 (untuk backflip) ditambah sedikit Z=0.2 (untuk kemiringan)
    const backflipAxis = vec3.fromValues(1.0, 1.0, 0.0);
    vec3.normalize(backflipAxis, backflipAxis); // Penting: Sumbu harus dinormalisasi (panjang = 1)

    // 2. Aplikasikan Rotasi Sumbu Sembarang
    // mat4.rotate(matriks, matriks_sumber, sudut_radian, sumbu_vektor)
    mat4.rotate(baseModelMatrix, baseModelMatrix, backflipAngle, backflipAxis);

        // ** C. SKALA UNTUK EFEK BERNAFAS BARU ** 🆕
    // Skala X (lebar) dikecilkan/dilebarkan sedikit (misal: 1.0)
    // Skala Y (tinggi) dan Z (kedalaman) divariasikan menggunakan breathScale
    mat4.scale(baseModelMatrix, baseModelMatrix, [
        1.0, 
        breathScale, // Membesar/Mengecil di sumbu Y
        breathScale  // Membesar/Mengecil di sumbu Z
    ]);

    // Matriks Pandangan (Kamera)
    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, cameraPosition, [0, 0, 0], [0, 1, 0]);
    
    // ModelViewMatrix Akhir
    const modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, viewMatrix, baseModelMatrix); 
    
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Bind buffer gabungan (SAMA seperti sebelumnya)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.position);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(programInfo.attribLocations.normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.normal);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorWeight);
    gl.vertexAttribPointer(programInfo.attribLocations.colorWeight, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.colorWeight);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.useProgram(programInfo.program);

    // Set uniforms (SAMA seperti sebelumnya)
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix); 
    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);
    gl.uniform3f(programInfo.uniformLocations.lightDirection, 0.85, 0.8, 0.75);
    gl.uniform3f(programInfo.uniformLocations.cameraPosition, cameraPosition[0], cameraPosition[1], cameraPosition[2]);

    gl.drawElements(gl.TRIANGLES, buffers.vertexCount, gl.UNSIGNED_SHORT, 0);
}


// ===============================================
// FUNGSI INITI DATA MENTAH (BARU: initMeshData)
// ===============================================
// Catatan: Fungsi ini MENGGANTIKAN initBuffers
function initMeshData() { // DIUBAH MENJADI MENGEMBALIKAN DATA MENTAH
    
    // KUMPULAN MESH
    const meshes = [];
    // HANYA TERAPKAN TRANSFORMASI BASE DI SINI. TRANSFORMASI ANIMASI GLOBAL DI drawScene.
    const bodyTransform = mat4.create(); 

    // Warna
    const C_BELLY = 0.0;
    const C_BACK = 1.0;
    const C_BLACK = 2.0;
    const C_WHITE = 3.0;

    // ... (Path Tubuh, Radii Tubuh, Skala & Posisi SAMA seperti sebelumnya) ...
    // --- Path Tubuh (Titik Kontrol 2D dari referensi) ---
    // Ini [Y, Z]
    const controlPath2D = [
        [-0.4, -0.1],   // 1. Bawah kepala
        [-0.55, -0.2],  
        [-0.7, -0.3],   // 2. Punggung atas
        [-0.85, -0.32], 
        [-1.0, -0.3],   // 3. Perut buncit
        [-1.1, -0.28],  // <-- Mulai maju
        [-1.2, -0.25],  // 4. Awal ekor
        [-1.28, -0.18], 
        [-1.35, -0.1],  // 5. Ekor ke bawah
        [-1.4, 0.03],   
        [-1.4, 0.15],   // 6. Ekor melengkung keluar (MAJU)
        [-1.38, 0.28],  
        [-1.3, 0.4],    // 7. Puncak spiral luar (MAJU, Z=0.4)
        [-1.2, 0.45],   // (MAJU, Z=0.45)
        [-1.1, 0.45],   // 8. Spiral mulai masuk (atas)
        [-1.0, 0.4],    
        [-0.95, 0.3],   // 9. Spiral masuk (tengah)
        [-0.97, 0.22],  
        [-1.0, 0.15],   // 10. Pusat spiral
        [-1.03, 0.12],  
        [-1.05, 0.1]    // 11. Ujung ekor
    ];
    // --- Radii Tubuh (Titik Kontrol dari referensi) ---
    const controlRadii = [
        0.25, 0.35, 0.4, 0.45, 
        0.48, 0.50, 0.48, // <-- Bagian buncit
        0.45, 0.4, 
        0.35, 0.31, 0.28, 0.25, 0.22, 0.18, 0.15, 0.12, 0.10, 
        0.08, 0.06, 0.04
    ];

    // --- Penyesuaian Skala & Posisi ---
    const pathDimensionScale = 18.0; // Mengatur PANJANG/POSISI body
    const pathRadiusScale = 10.0;    // <--- INI UNTUK MENGATUR DIAMETER

    // Hitung translate berdasarkan pathDimensionScale
    const pathTranslate = vec3.fromValues(0, 
        19.2, // Ini dihitung dari 18.0 ( (12 - (-0.4 * 18)) )
        1.8   // Ini dihitung dari 18.0 ( (0 - (-0.1 * 18)) )
    );

    // Ubah 2D [Y, Z] menjadi 3D [X, Y, Z] dan terapkan skala/posisi
    const controlPoints = controlPath2D.map(p => {
        // Gunakan 'pathDimensionScale' untuk mengatur posisi
        const scaledP = vec3.fromValues(0.0, p[0] * pathDimensionScale, p[1] * pathDimensionScale);
        vec3.add(scaledP, scaledP, pathTranslate);
        return scaledP;
    });

    // --- GENERASI PATH & RADIUS HALUS ---
    const bodyPath = [];
    const bodyRadii = [];
    const segmentsPerCurve = 8; 
    const numPoints = controlPoints.length;

    bodyPath.push(controlPoints[0]);
    // Gunakan 'pathRadiusScale' untuk radius
    bodyRadii.push(controlRadii[0] * pathRadiusScale); 

    for (let i = 0; i < numPoints - 1; i++) {
        const p0 = controlPoints[i === 0 ? 0 : i - 1];
        const p1 = controlPoints[i];
        const p2 = controlPoints[i + 1];
        const p3 = controlPoints[i + 2 >= numPoints ? numPoints - 1 : i + 2];
        
        // Gunakan 'pathRadiusScale' untuk radius
        const r1 = controlRadii[i] * pathRadiusScale;
        const r2 = controlRadii[i + 1] * pathRadiusScale;

        for (let j = 1; j <= segmentsPerCurve; j++) {
            const t = j / segmentsPerCurve;
            const newPoint = catmullRomInterpolate(p0, p1, p2, p3, t);
            bodyPath.push(newPoint);
            const newRadius = linearInterpolate(r1, r2, t);
            bodyRadii.push(newRadius);
        }
    }
    
    // Buat geometri punggung dan perut menggunakan fungsi baru (SAMA)
    const radialSegmentsBack = 40;
    const radialSegmentsBelly = 14; 
    
    // Sirip Punggung
    meshes.push(generateNewDorsalFin(bodyPath, bodyRadii, bodyTransform));

    // PEMBAGIAN WARNA BARU (DEPAN/BELAKANG/SAMPING) (SAMA)
    const angle_45  = Math.PI * 0.25; 
    const angle_135 = Math.PI * 0.75; 
    const angle_225 = Math.PI * 1.25; 
    const angle_315 = Math.PI * 1.75; 

    // 1. Perut Krem (Depan, 90 derajat, center di 90)
    meshes.push(generateCurvedStrip(
        bodyPath, bodyRadii, radialSegmentsBelly, angle_45, angle_135, C_BELLY, bodyTransform
    ));
    
    // 2. Punggung Biru (Belakang, 90 derajat, center di 270)
    meshes.push(generateCurvedStrip(
        bodyPath, bodyRadii, radialSegmentsBack, angle_225, angle_315, C_BACK, bodyTransform
    ));

    // 3. Samping Kanan Biru (90 derajat, center di 0)
    meshes.push(generateCurvedStrip(
        bodyPath, bodyRadii, radialSegmentsBack, angle_315, angle_45 + Math.PI*2.0, C_BACK, bodyTransform
    ));
    
    // 4. Samping Kiri Biru (90 derajat, center di 180)
    meshes.push(generateCurvedStrip(
        bodyPath, bodyRadii, radialSegmentsBack, angle_135, angle_225, C_BACK, bodyTransform
    ));

    
    // ----------------------------------------------------
    // 2. BUAT KEPALA (DENGAN MARKER UNTUK HIERARKI)
    // ----------------------------------------------------
    
    const neckPosition = bodyPath[0]; 
    const neckTangent = vec3.create();
    vec3.subtract(neckTangent, bodyPath[0], bodyPath[1]); 
    vec3.normalize(neckTangent, neckTangent);

    // Transformasi untuk MENGARAHKAN kepala sesuai leher (SAMA)
    const defaultHeadForward = vec3.fromValues(0, 0, 1);
    const headRotationQuat = quat.create();
    quat.rotationTo(headRotationQuat, defaultHeadForward, neckTangent);
    const headRotationMatrix = mat4.create();
    mat4.fromQuat(headRotationMatrix, headRotationQuat);

    // Transformasi dasar kepala (posisi + orientasi leher)
    const headBaseTransform = mat4.create();
    mat4.translate(headBaseTransform, headBaseTransform, neckPosition); 
    mat4.multiply(headBaseTransform, headBaseTransform, headRotationMatrix); 
    mat4.rotateX(headBaseTransform, headBaseTransform, 1.2); 

    const headScaleFactor = 3.5; 
    mat4.scale(headBaseTransform, headBaseTransform, [headScaleFactor, headScaleFactor, headScaleFactor]);

    // ** FUNGSI TRANSFORMASI KEPALA YANG MENGAPLIKASIKAN ROTASI ANIMASI **
    // Kita perlu mendapatkan 'headPitch' dari luar, tapi karena ini hanya inisialisasi, 
    // kita akan membiarkan nilai rotasi statis DULU.
    // TRANSFORMASI ANIMASI AKAN DIAPLIKASIKAN DI DRAW SCENE DENGAN OFFSET INDEX.

    function getHeadTransform(translate, rotate, scale) {
        const m = mat4.create();
        mat4.translate(m, m, translate || [0, 0, 0]);
        if (rotate) mat4.rotate(m, m, rotate.angle, rotate.axis);
        mat4.scale(m, m, scale || [1, 1, 1]);
        const finalTransform = mat4.create();
        mat4.multiply(finalTransform, headBaseTransform, m);
        return finalTransform;
    }
    
    // Batas akhir vertex Body
    const bodyVertexCount = meshes.reduce((acc, mesh) => acc + (mesh.vertexCount || 0), 0);

    // ----- Definisi Objek Kepala (SAMA seperti sebelumnya) -----
    meshes.push(createEllipsoid(getHeadTransform(
        [0, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1.2, 1.2, 1.0]
    ), 1.0, 0.8, 1.2, 30, 30, C_BACK));
    meshes.push(createCylinder(getHeadTransform(
        [0, -0.6, 0.1], { angle: -0.2, axis: [1, 0, 0] }, [1.0, 1.0, 1.0]
    ), 0.95, 0.3, 30, C_BELLY));
    // ... (Semua elemen kepala lainnya SAMA) ...

    meshes.push(createCylinder(getHeadTransform(
        [0, 0.1, 1.5], { angle: Math.PI / 2, axis: [1, 0, 0] }, [1.0, 1.0, 1.0]
    ), 0.3, 1.5, 20, C_BACK));
    meshes.push(createCylinder(getHeadTransform(
        [0, 0.1, 2.25], { angle: Math.PI / 2, axis: [1, 0, 0] }, [1.0, 1.0, 1.0]
    ), 0.29, 0.05, 20, C_BLACK));
    meshes.push(createTorus(getHeadTransform(
        [0, 0.1, 2.3], { angle: Math.PI / 2, axis: [1, 0, 0] }, [1.0, 1.0, 1.0]
    ), 0.35, 0.1, 20, 20, C_BACK)); // <-- DIUBAH MENJADI C_BACK
    meshes.push(createTriangularPyramid(getHeadTransform(
        [0, 0.9, -0.5], { angle: -0.9, axis: [1, 0, 0] }, [1.5, 1.5, 1.5]
    ), 0.25, 1.0, C_BACK));
    meshes.push(createTriangularPyramid(getHeadTransform(
        [0, 0.5, -1.2], { angle: -1.3, axis: [1, 0, 0] }, [1.5, 1.5, 1.5]
    ), 0.2, 1.0, C_BELLY)); 
    meshes.push(createTriangularPyramid(getHeadTransform(
        [0.4, 0.6, -0.9], { angle: 1.2, axis: [-1, 0, 0.5] }, [1.5, 1.5, 1.5]
    ), 0.15, 0.6, C_BACK));
    meshes.push(createTriangularPyramid(getHeadTransform(
        [-0.4, 0.6, -0.9], { angle: 1.2, axis: [-1, 0, -0.5] }, [1.5, 1.5, 1.5]
    ), 0.15, 0.6, C_BACK));
    meshes.push(createTriangularPyramid(getHeadTransform(
        [1.2, -0.1, 0.0], { angle: 1.57, axis: [-0.8, 0, -1] }, [1.5, 1.5, 1.5]
    ), 0.32, 1.6, C_BACK)); // <-- baseRadius & height DIUBAH

    meshes.push(createTriangularPyramid(getHeadTransform(
        [-1.2, -0.1, 0.0], { angle: 1.57, axis: [-0.8, 0, 1] }, [1.5, 1.5, 1.5]
    ), 0.32, 1.6, C_BACK)); // <-- baseRadius & height DIUBAH
    meshes.push(createEyebrowShape(getHeadTransform(
        [0.6, 0.55, 0.75], { angle: -0.2, axis: [0, 0, 1] }, [1.0, 1.0, 1.0]
    ), C_BACK));
    meshes.push(createEyeShape(getHeadTransform(
        [0.6, 0.35, 0.8], { angle: 0, axis: [0, 1, 0] }, [1.0, 1.0, 1.0]
    ), C_WHITE)); 
    meshes.push(createEyePupil(getHeadTransform(
        [0.6, 0.35, 0.85], { angle: 0, axis: [0, 1, 0] }, [1.0, 1.0, 1.0]
    ), C_BLACK)); 
    meshes.push(createEllipsoid(getHeadTransform(
        [0.65, 0.40, 0.9], { angle: 0, axis: [0, 1, 0] }, [1.0, 1.0, 1.0] // <-- Posisi highlight mata kanan diubah
    ), 0.05, 0.05, 0.05, 10, 10, C_WHITE));
    meshes.push(createEyebrowShape(getHeadTransform(
        [-0.6, 0.55, 0.75], { angle: 0.2, axis: [0, 0, 1] }, [-1.0, 1.0, 1.0]
    ), C_BACK));
    meshes.push(createEyeShape(getHeadTransform(
        [-0.6, 0.35, 0.8], { angle: 0, axis: [0, 1, 0] }, [-1.0, 1.0, 1.0]
    ), C_WHITE));
    meshes.push(createEyePupil(getHeadTransform(
        [-0.6, 0.35, 0.85], { angle: 0, axis: [0, 1, 0] }, [-1.0, 1.0, 1.0]
    ), C_BLACK));
    meshes.push(createEllipsoid(getHeadTransform(
        [-0.65, 0.40, 0.9], { angle: 0, axis: [0, 1, 0] }, [1.0, 1.0, 1.0] // <-- Posisi highlight mata kiri diubah
    ), 0.05, 0.05, 0.05, 10, 10, C_WHITE));

    // -------------------
    // 3. GABUNGKAN SEMUA MESH (SAMA)
    // -------------------
    const allVertices = [];
    const allNormals = [];
    const allColorWeights = [];
    const allIndices = [];
    let vertexOffset = 0;

    for (const mesh of meshes) {
        if (!mesh || !mesh.vertices || !mesh.normals || !mesh.colorWeights || !mesh.indices) {
            console.error("Mesh tidak valid ditemukan:", mesh);
            continue; 
        }
        allVertices.push(...mesh.vertices);
        allNormals.push(...mesh.normals);
        allColorWeights.push(...mesh.colorWeights);
        for (const index of mesh.indices) {
            allIndices.push(index + vertexOffset);
        }
        vertexOffset += mesh.vertexCount;
    }

    return { 
        vertices: allVertices, 
        normals: allNormals, 
        colorWeights: allColorWeights, 
        indices: allIndices, 
        vertexCount: allIndices.length,
    };
}

// ===============================================
// FUNGSI UNTUK MEMBUAT BUFFER WEBL (BARU)
// ===============================================
function createBuffersFromMeshData(gl, meshData) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshData.vertices), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshData.normals), gl.STATIC_DRAW);

    const colorWeightBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorWeightBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshData.colorWeights), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(meshData.indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normal: normalBuffer,
        colorWeight: colorWeightBuffer,
        indices: indexBuffer,
        vertexCount: meshData.vertexCount,
    };
}


// ===============================================
// FUNGSI BANTU SHADER
// ===============================================
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { alert('Gagal me-link program shader: ' + gl.getProgramInfoLog(shaderProgram)); return null; }
    return shaderProgram;
}
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { alert('Gagal meng-kompilasi shader: ' + gl.getShaderInfoLog(shader)); gl.deleteShader(shader); return null; }
    return shader;
}
function resizeCanvasToDisplaySize(canvas) {
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width  !== displayWidth || canvas.height !== displayHeight) {
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
        return true;
    }
    return false;
}

// ===============================================
// FUNGSI BANTU MATEMATIKA (REFACTORED DENGAN GL-MATRIX)
// ===============================================

// Helper untuk transformasi vertex
function transformVertex(v, matrix) {
    const out = vec3.create();
    vec3.transformMat4(out, v, matrix);
    return out;
}
// Helper untuk transformasi normal
function transformNormal(v, matrix) {
    const out = vec3.create();
    // Gunakan normal matrix (inverse transpose) untuk normal
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, matrix);
    mat4.transpose(normalMatrix, normalMatrix);
    vec3.transformMat4(out, v, normalMatrix);
    vec3.normalize(out, out);
    return out;
}

// --- FUNGSI HELPER BARU DARI REFERENSI ---
function linearInterpolate(a, b, t) {
    return a + (b - a) * t;
}

function catmullRomInterpolate(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;

    const out = vec3.create();
    
    // Rumus Catmull-Rom
    // v = 0.5 * ( (2*P1) + (-P0+P2)*t + (2*P0-5*P1+4*P2-P3)*t2 + (-P0+3*P1-3*P2+P3)*t3 )
    
    const temp = vec3.create();

    // 0.5 * (2*P1)
    vec3.scale(out, p1, 1.0); // (2 * 0.5)

    // 0.5 * (-P0+P2)*t
    vec3.subtract(temp, p2, p0);
    vec3.scaleAndAdd(out, out, temp, t * 0.5);
    
    // 0.5 * (2*P0-5*P1+4*P2-P3)*t2
    vec3.scale(temp, p0, 2.0);
    vec3.scaleAndAdd(temp, temp, p1, -5.0);
    vec3.scaleAndAdd(temp, temp, p2, 4.0);
    vec3.scaleAndAdd(temp, temp, p3, -1.0);
    vec3.scaleAndAdd(out, out, temp, t2 * 0.5);

    // 0.5 * (-P0+3*P1-3*P2+P3)*t3
    vec3.scale(temp, p0, -1.0);
    vec3.scaleAndAdd(temp, temp, p1, 3.0);
    vec3.scaleAndAdd(temp, temp, p2, -3.0);
    vec3.scaleAndAdd(temp, temp, p3, 1.0);
    vec3.scaleAndAdd(out, out, temp, t3 * 0.5);
    
    return out;
}
// --- AKHIR FUNGSI HELPER BARU ---


// Fungsi Bézier (Ditulis ulang untuk GL-MATRIX) - (DIPERTAHANKAN UNTUK SIRIP)
function getCubicBezierPoint(t, p0, p1, p2, p3) {
    const out = vec3.create();
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    vec3.scale(out, p0, uuu); // p0 * uuu
    
    const temp = vec3.create();
    vec3.scale(temp, p1, 3 * uu * t); // p1 * 3 * uu * t
    vec3.add(out, out, temp);
    
    vec3.scale(temp, p2, 3 * u * tt); // p2 * 3 * u * tt
    vec3.add(out, out, temp);
    
    vec3.scale(temp, p3, ttt); // p3 * ttt
    vec3.add(out, out, temp);
    
    return out;
}

function getCubicBezierTangent(t, p0, p1, p2, p3) {
    const out = vec3.create();
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
  _body
    const temp1 = vec3.create();
    const temp2 = vec3.create();

    vec3.subtract(temp1, p1, p0); // p1 - p0
    vec3.scale(out, temp1, 3 * uu); // 3 * uu * (p1 - p0)

    vec3.subtract(temp1, p2, p1); // p2 - p1
    vec3.scale(temp2, temp1, 6 * u * t); // 6 * u * t * (p2 - p1)
    vec3.add(out, out, temp2);

    vec3.subtract(temp1, p3, p2); // p3 - p2
    vec3.scale(temp2, temp1, 3 * tt); // 3 * tt * (p3 - p2)
    vec3.add(out, out, temp2);

    return out;
}

function getQuadraticBezierPoint(t, p0, p1, p2) {
    const out = vec3.create();
    const u = 1 - t;
    const uu = u * u;
    const tt = t * t;
    
    vec3.scale(out, p0, uu); // p0 * uu

    const temp = vec3.create();
    vec3.scale(temp, p1, 2 * u * t); // p1 * 2 * u * t
    vec3.add(out, out, temp);

    vec3.scale(temp, p2, tt); // p2 * tt
    vec3.add(out, out, temp);
    
    return out;
}

function transformLocalToWorld(localPoint, origin, binormal, normal, tangent, side) {
    const out = vec3.create();
    const temp = vec3.create();

    const sideBinormal = vec3.create();
    vec3.scale(sideBinormal, binormal, side * localPoint[0]);
    
    const sideNormal = vec3.create();
    vec3.scale(sideNormal, normal, localPoint[1]);
    
    vec3.add(out, origin, sideBinormal);
    vec3.add(out, out, sideNormal);
    
    return out;
}

// FUNGSI HELPER BARU untuk sirip punggung
// Memetakan (x,y) lokal ke (tangent, normal) dunia
function transformDorsalFinLocalToWorld(localPoint, origin, binormal, normal, tangent) {
    const out = vec3.create();
    
    // localPoint[0] (x) dipetakan ke TANGENT (mengikuti aliran punggung)
    const scaledTangent = vec3.create();
    vec3.scale(scaledTangent, tangent, localPoint[0]); 
    
    // localPoint[1] (y) dipetakan ke NORMAL (tinggi sirip)
    const scaledNormal = vec3.create();
    vec3.scale(scaledNormal, normal, localPoint[1]);
    
    // Gabungkan
    vec3.add(out, origin, scaledTangent);
    vec3.add(out, out, scaledNormal);
    
    return out;
}


// ===============================================
// FUNGSI GEOMETRI BADAN (BARU - CATMULL-ROM)
// ===============================================

function generateCurvedStrip(path, radii, radialSegments, startAngle, endAngle, colorWeight, transform) {
    const vertices = [], normals = [], indices = [], colorWeights = [];
    
    let lastNormal = vec3.fromValues(0, 0, 1); // Awalnya, normal menunjuk ke Z+
    let lastBinormal = vec3.fromValues(1, 0, 0); // Awalnya, binormal menunjuk ke X+
    
    const spineSegments = path.length - 1;
    
    for (let i = 0; i <= spineSegments; i++) {
        const p = path[i];
        const radius = radii[i];
        
        // Hitung Tangent
        const tangent = vec3.create();
        if (i === 0) {
            vec3.subtract(tangent, path[i + 1], p);
        } else if (i === spineSegments) {
            vec3.subtract(tangent, p, path[i - 1]);
        } else {
            vec3.subtract(tangent, path[i + 1], path[i - 1]);
        }
        vec3.normalize(tangent, tangent);

        // Hitung Normal dan Binormal (Metode Frame Paralel)
        let binormal = vec3.create();
        vec3.cross(binormal, tangent, lastNormal);
        vec3.normalize(binormal, binormal);
        
        // Cek degenerasi (jika tangent sejajar dengan lastNormal)
        if (vec3.length(binormal) < 0.001) {
            vec3.copy(binormal, lastBinormal);
        }

        let normal = vec3.create();
        vec3.cross(normal, binormal, tangent);
        vec3.normalize(normal, normal);

        // Simpan untuk iterasi berikutnya
        vec3.copy(lastNormal, normal);
        vec3.copy(lastBinormal, binormal);

        // Buat segmen lingkaran
        for (let j = 0; j <= radialSegments; j++) {
            const t = j / radialSegments;
            const angle = linearInterpolate(startAngle, endAngle, t);
            
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            
            // Hitung posisi vertex
            const pos = vec3.create();
            const temp1 = vec3.create();
            const temp2 = vec3.create();
            
            vec3.scale(temp1, normal, sinA * radius);
            vec3.scale(temp2, binormal, cosA * radius);
            vec3.add(pos, p, temp1);
            vec3.add(pos, pos, temp2);
            
            // Terapkan transformasi (jika ada)
            const v = transformVertex(pos, transform);
            vertices.push(v[0], v[1], v[2]);
            
            // Hitung normal vertex
            const norm = vec3.create();
            vec3.subtract(norm, pos, p); // Vektor dari pusat ke vertex
            vec3.normalize(norm, norm);
            
            const n = transformNormal(norm, transform);
            normals.push(n[0], n[1], n[2]);
            
            colorWeights.push(colorWeight);
        }
    }

    // Buat Indices
    const vertexCount = (spineSegments + 1) * (radialSegments + 1);
    for (let i = 0; i < spineSegments; i++) {
        for (let j = 0; j < radialSegments; j++) {
            const v1 = (i * (radialSegments + 1)) + j;
            const v2 = v1 + 1;
            const v3 = ((i + 1) * (radialSegments + 1)) + j;
            const v4 = v3 + 1;
            
            indices.push(v1, v3, v2);
            indices.push(v2, v3, v4);
        }
    }
    
    return { vertices, normals, indices, colorWeights, vertexCount };
}


// ===============================================
// FUNGSI GEOMETRI SIRIP PUNGGUNG (BARU, MENGIKUTI PATH)
// ===============================================
// ===============================================
// FUNGSI GEOMETRI SIRIP PUNGGUNG (BARU, MENGIKUTI PATH)
// ===============================================
// ===============================================
// FUNGSI GEOMETRI SIRIP PUNGGUNG (BARU, MENGIKUTI PATH)
// ===============================================
// ===============================================
// FUNGSI GEOMETRI SIRIP PUNGGUNG (BARU, MENGIKUTI PATH)
// ===============================================
function generateNewDorsalFin(path, radii, transform) {
    const vertices = [], normals = [], indices = [], colorWeights = [];
    const heights = []; 
    
    const segments = path.length - 1; 
    
const t_start_idx = Math.floor(segments * 0.03); // Mulai di 5% (dekat leher)
    const t_end_idx = Math.floor(segments * 0.3);   // Berakhir di 30% (punggung atas) 
    const numFinSegments = t_end_idx - t_start_idx;
    
    const finThickness = 0.3; 
    const maxSpikeHeight = 9.0; 
    const numSpikes = 3;        
    const spikePower = 8.0;     
    const heightThreshold = 0.2; 
    const finColorWeight = 0.0; // Sirip warna Krem (C_BELLY)

    let lastNormal = vec3.fromValues(0, 0, 1); 
    let lastBinormal = vec3.fromValues(1, 0, 0);
    let vertexOffset = 0;
    
    // --- LOOP 1: BUAT VERTICES ---
    for (let i = 0; i <= numFinSegments; i++) {
        const path_idx = t_start_idx + i;
        const t_norm = i / numFinSegments;
        
        const origin = path[path_idx];
        const bodyRadius = radii[path_idx];

        // --- Kalkulasi Frame (Tangent, Binormal, Normal) ---
        const tangent = vec3.create();
        if (path_idx === 0) {
            vec3.subtract(tangent, path[path_idx + 1], origin);
        } else if (path_idx === segments) {
            vec3.subtract(tangent, origin, path[path_idx - 1]);
        } else {
            vec3.subtract(tangent, path[path_idx + 1], path[path_idx - 1]);
        }
        vec3.normalize(tangent, tangent);
        
        let binormal = vec3.create();
        vec3.cross(binormal, tangent, lastNormal);
        vec3.normalize(binormal, binormal);
        if (vec3.length(binormal) < 0.001) {
            vec3.copy(binormal, lastBinormal);
        }
        let normal = vec3.create();
        vec3.cross(normal, binormal, tangent);
        vec3.normalize(normal, normal);
        vec3.copy(lastNormal, normal); 
        vec3.copy(lastBinormal, binormal);
        
        // --- Kalkulasi Tinggi Paku ---
        const profile = Math.sin(t_norm * Math.PI); 
        const spikeWave = Math.pow((Math.cos(t_norm * Math.PI * 2.0 * numSpikes) + 1.0) / 2.0, spikePower);
        const height = maxSpikeHeight * profile * spikeWave;
        heights.push(height); 
        
        // --- PERUBAHAN ARAH SIRIP ---
        // Arah "Punggung" adalah -normal (sesuai strip C_BACK / Biru)
        const backVector = vec3.create();
        vec3.negate(backVector, normal); // <-- Arah ke -normal (Punggung)
        
        // Arah "Tebal" (thickness) adalah binormal (Samping)
        const thickVector = binormal; // <-- Arah ke binormal (Samping)
        // --- AKHIR PERUBAHAN ARAH ---

        // Titik dasar (di atas permukaan badan)
        const basePoint = vec3.create();
        vec3.scaleAndAdd(basePoint, origin, backVector, bodyRadius * 0.8);
        
        // Titik ujung
        const p_tip_vec = vec3.create();
        vec3.scaleAndAdd(p_tip_vec, basePoint, backVector, height);
        
        // Vektor untuk ketebalan sirip
        const halfThickVec = vec3.create();
        vec3.scale(halfThickVec, thickVector, finThickness * (0.5 + profile * 0.5)); 

        const v_front_base_vec = vec3.create();
        vec3.add(v_front_base_vec, basePoint, halfThickVec);
        const v_back_base_vec = vec3.create();
        vec3.subtract(v_back_base_vec, basePoint, halfThickVec);
        
        // Normal pencahayaan
        const frontNormalVec = thickVector; 
        const backNormalVec = vec3.create();
        vec3.negate(backNormalVec, thickVector); 
        const tipNormalVec = backVector; 

        // Terapkan transformasi
        const v_front_base = transformVertex(v_front_base_vec, transform);
        const v_back_base = transformVertex(v_back_base_vec, transform);
        const v_tip = transformVertex(p_tip_vec, transform);
        
        const frontNormal = transformNormal(frontNormalVec, transform);
        const backNormal = transformNormal(backNormalVec, transform);
        const tipNormal = transformNormal(tipNormalVec, transform);

        // Masukkan data ke array
        vertices.push(v_front_base[0], v_front_base[1], v_front_base[2]);
        vertices.push(v_back_base[0], v_back_base[1], v_back_base[2]);
        vertices.push(v_tip[0], v_tip[1], v_tip[2]);
        
        normals.push(frontNormal[0], frontNormal[1], frontNormal[2]);
        normals.push(backNormal[0], backNormal[1], backNormal[2]);
        normals.push(tipNormal[0], tipNormal[1], tipNormal[2]);
        
        colorWeights.push(finColorWeight, finColorWeight, finColorWeight);
        vertexOffset += 3;
    }

    // --- LOOP 2: BUAT INDICES (DENGAN THRESHOLD) ---
    for (let i = 0; i < numFinSegments; i++) {
        const v_curr_fb = i * 3, v_curr_bb = i * 3 + 1, v_curr_t  = i * 3 + 2;
        const v_next_fb = (i + 1) * 3, v_next_bb = (i + 1) * 3 + 1, v_next_t  = (i + 1) * 3 + 2;
        
        if (heights[i] > heightThreshold || heights[i+1] > heightThreshold) 
        {
            indices.push(v_curr_fb, v_next_fb, v_curr_t); 
            indices.push(v_next_fb, v_next_t, v_curr_t); 
            indices.push(v_curr_bb, v_curr_t, v_next_bb); 
            indices.push(v_next_bb, v_curr_t, v_next_t); 
        }
    }
    return { vertices, normals, indices, colorWeights, vertexCount: vertexOffset };
}





// ===============================================
// FUNGSI GEOMETRI KEPALA (DARI script.js, REFACTORED)
// ===============================================

function createEllipsoid(transform, rx, ry, rz, segments, rings, colorWeight) {
    const vertices = [], normals = [], indices = [], colorWeights = [];
    const localPositions = [];
    
    for (let j=0;j<=rings;j++){
        let aj=j*Math.PI/rings; let sj=Math.sin(aj); let cj=Math.cos(aj);
        for(let i=0;i<=segments;i++){
            let ai=i*2*Math.PI/segments; let si=Math.sin(ai); let ci=Math.cos(ai);
            localPositions.push([rx*si*sj, ry*cj, rz*ci*sj]);
        }
    }
    for(let j=0;j<rings;j++){
        for(let i=0;i<segments;i++){
            let p1=j*(segments+1)+i; let p2=p1+(segments+1);
            indices.push(p1,p2,p1+1); indices.push(p1+1,p2,p2+1);
        }
    }
    
    localPositions.forEach(pos => {
        const v = transformVertex(pos, transform);
        vertices.push(v[0], v[1], v[2]);
        
        // Normal untuk ellipsoid sederhana adalah (pos.x/rx^2, pos.y/ry^2, pos.z/rz^2)
        const localNormal = [pos[0]/(rx*rx), pos[1]/(ry*ry), pos[2]/(rz*rz)];
        const n = transformNormal(localNormal, transform);
        normals.push(n[0], n[1], n[2]);
        
        colorWeights.push(colorWeight);
    });

    return {vertices, normals, indices, colorWeights, vertexCount: localPositions.length};
}

function createCylinder(transform, radius, height, segments, colorWeight) {
    const vertices = [], normals = [], indices = [], colorWeights = [];
    const localPositions = [], localNormals = [];
    const halfHeight = height / 2;

    // Sisi tabung
    for (let i=0;i<=segments;i++){
        const angle=i*2*Math.PI/segments;
        const x=radius*Math.cos(angle); const z=radius*Math.sin(angle);
        localPositions.push([x, halfHeight, z]); localNormals.push([x/radius, 0, z/radius]);
        localPositions.push([x, -halfHeight, z]); localNormals.push([x/radius, 0, z/radius]);
    }
    for(let i=0;i<segments;i++){
        const i1=i*2; const i2=i1+1; const i3=(i+1)*2; const i4=i3+1;
        indices.push(i1,i2,i3); indices.push(i3,i2,i4);
    }
    
    // Tutup atas
    const topCenterIndex = localPositions.length;
    localPositions.push([0, halfHeight, 0]); localNormals.push([0, 1, 0]);
    for(let i=0;i<segments;i++){
        const i1=i*2; const i3=(i+1)*2;
        localPositions.push(localPositions[i1]); localNormals.push([0, 1, 0]);
        localPositions.push(localPositions[i3]); localNormals.push([0, 1, 0]);
        indices.push(topCenterIndex, localPositions.length-2, localPositions.length-1);
    }

    // Tutup bawah
    const bottomCenterIndex = localPositions.length;
    localPositions.push([0, -halfHeight, 0]); localNormals.push([0, -1, 0]);
    for(let i=0;i<segments;i++){
        const i1=i*2+1; const i3=(i+1)*2+1;
        localPositions.push(localPositions[i1]); localNormals.push([0, -1, 0]);
        localPositions.push(localPositions[i3]); localNormals.push([0, -1, 0]);
        indices.push(bottomCenterIndex, localPositions.length-1, localPositions.length-2); // Urutan dibalik
    }
    
    localPositions.forEach((pos, i) => {
        const v = transformVertex(pos, transform);
        vertices.push(v[0], v[1], v[2]);
        const n = transformNormal(localNormals[i], transform);
        normals.push(n[0], n[1], n[2]);
        colorWeights.push(colorWeight);
    });

    return {vertices, normals, indices, colorWeights, vertexCount: localPositions.length};
}

function createTorus(transform, outerRadius, innerRadius, sides, rings, colorWeight) {
    const vertices = [], normals = [], indices = [], colorWeights = [];
    const localPositions = [], localNormals = [];

    for(let i=0;i<=rings;i++){
        const theta=i*2*Math.PI/rings; const cosTheta=Math.cos(theta); const sinTheta=Math.sin(theta);
        for(let j=0;j<=sides;j++){
            const phi=j*2*Math.PI/sides; const cosPhi=Math.cos(phi); const sinPhi=Math.sin(phi);
            const x=(outerRadius+innerRadius*cosPhi)*cosTheta;
            const y=innerRadius*sinPhi;
            const z=(outerRadius+innerRadius*cosPhi)*sinTheta;
            localPositions.push([x,y,z]);
            
            const nx = cosPhi * cosTheta;
            const ny = sinPhi;
            const nz = cosPhi * sinTheta;
            localNormals.push([nx, ny, nz]);
        }
    }
    for(let i=0;i<rings;i++){
        for(let j=0;j<sides;j++){
            const first=(i*(sides+1))+j; const second=first+sides+1;
            indices.push(first,second,first+1); indices.push(second,second+1,first+1);
        }
    }

    localPositions.forEach((pos, i) => {
        const v = transformVertex(pos, transform);
        vertices.push(v[0], v[1], v[2]);
        const n = transformNormal(localNormals[i], transform);
        normals.push(n[0], n[1], n[2]);
        colorWeights.push(colorWeight);
    });
    return {vertices, normals, indices, colorWeights, vertexCount: localPositions.length};
}

function createTriangularPyramid(transform, baseRadius, height, colorWeight) {
    const vertices = [], normals = [], indices = [], colorWeights = [];
    const localPositions = [], localNormals = [];

    const apex = [0, height, 0];
    const base = [];
    for (let i = 0; i < 3; i++) {
        const angle = i * (2 * Math.PI) / 3;
        base.push([baseRadius * Math.cos(angle), 0, baseRadius * Math.sin(angle)]);
    }

    // Alas
    localPositions.push(base[0], base[1], base[2]);
    localNormals.push([0, -1, 0], [0, -1, 0], [0, -1, 0]);
    indices.push(0, 1, 2);

    // Sisi
    for(let i=0; i<3; i++) {
        const i_curr = i;
        const i_next = (i + 1) % 3;
        localPositions.push(base[i_curr], base[i_next], apex);
        
        const e1 = vec3.create(); vec3.subtract(e1, base[i_next], base[i_curr]);
        const e2 = vec3.create(); vec3.subtract(e2, apex, base[i_curr]);
        const n = vec3.create(); vec3.cross(n, e1, e2); vec3.normalize(n, n);
        
        localNormals.push(n, n, n);
        indices.push(localPositions.length - 3, localPositions.length - 2, localPositions.length - 1);
    }
    
    localPositions.forEach((pos, i) => {
        const v = transformVertex(pos, transform);
        vertices.push(v[0], v[1], v[2]);
        const n = transformNormal(localNormals[i], transform);
        normals.push(n[0], n[1], n[2]);
        colorWeights.push(colorWeight);
    });

    return {vertices, normals, indices, colorWeights, vertexCount: localPositions.length};


}

// Fungsi geometri mata (2D diekstrusi)
function createExtrudedShape(transform, shapePoints, depth, colorWeight) {
    const vertices = [], normals = [], indices = [], colorWeights = [];
    const localPositions = [], localNormals = [];
    const halfDepth = depth / 2.0;

    // Sisi depan
    shapePoints.forEach(p => {
        localPositions.push([p[0], p[1], halfDepth]);
        localNormals.push([0, 0, 1]);
    });
    for(let i=1; i < shapePoints.length - 1; i++) {
        indices.push(0, i, i+1);
    }
    
    // Sisi belakang
    const backOffset = localPositions.length;
    shapePoints.forEach(p => {
        localPositions.push([p[0], p[1], -halfDepth]);
        localNormals.push([0, 0, -1]);
    });
    for(let i=1; i < shapePoints.length - 1; i++) {
        indices.push(backOffset, backOffset + i + 1, backOffset + i); // Dibalik
    }
    
    // Sisi samping
    const sideOffset = localPositions.length;
    for(let i=0; i < shapePoints.length; i++) {
        const j = (i + 1) % shapePoints.length;
        const p1 = shapePoints[i];
        const p2 = shapePoints[j];
        
        const v1_f = [p1[0], p1[1], halfDepth];
        const v2_f = [p2[0], p2[1], halfDepth];
        const v1_b = [p1[0], p1[1], -halfDepth];
        const v2_b = [p2[0], p2[1], -halfDepth];
        
        const e1 = vec3.fromValues(v2_f[0]-v1_f[0], v2_f[1]-v1_f[1], 0);
        const e2 = vec3.fromValues(0, 0, -depth);
        const n = vec3.create(); vec3.cross(n, e1, e2); vec3.normalize(n, n);
        
        localPositions.push(v1_f, v1_b, v2_f);
        localPositions.push(v2_f, v1_b, v2_b);
        localNormals.push(n, n, n);
        localNormals.push(n, n, n);
        indices.push(sideOffset+i*6, sideOffset+i*6+1, sideOffset+i*6+2);
        indices.push(sideOffset+i*6+3, sideOffset+i*6+4, sideOffset+i*6+5);
    }
    
    localPositions.forEach((pos, i) => {
        const v = transformVertex(pos, transform);
        vertices.push(v[0], v[1], v[2]);
        const n = transformNormal(localNormals[i], transform);
        normals.push(n[0], n[1], n[2]);
        colorWeights.push(colorWeight);
    });

    return {vertices, normals, indices, colorWeights, vertexCount: localPositions.length};
}

function createEyebrowShape(transform, colorWeight) {
    // Bentuk segitiga tajam agar terlihat "tegas"
    const points = [
        [-0.4, 0.0],  // Belakang
        [0.4, 0.2],   // Atas-depan
        [0.4, -0.1]   // Bawah-depan (titik tajam)
    ];
    return createExtrudedShape(transform, points, 0.05, colorWeight);
}

function createEyeShape(transform, colorWeight) {
    // Bentuk segiempat tajam (bagian putih mata)
    const points = [
        [-0.3, 0.0],   // Sudut belakang
        [0.2, 0.2],   // Sudut atas
        [0.4, 0.0],   // Sudut depan
        [0.1, -0.15]  // Sudut bawah
    ];
    return createExtrudedShape(transform, points, 0.08, colorWeight);
}

function createEyePupil(transform, colorWeight) {
    const points = [[-0.1, 0.0], [0.05, -0.05], [0.2, 0.0], [0.1, 0.1]];
    return createExtrudedShape(transform, points, 0.05, colorWeight);
}

// Menjalankan 'main' setelah HTML selesai di-load
document.addEventListener("DOMContentLoaded", main);