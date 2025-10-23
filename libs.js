const mat4 = {
    create: () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
    clone: (m) => new Float32Array(m),
    multiply: (out, a, b) => {
        let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]; let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]; let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]; let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30; out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31; out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32; out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30; out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31; out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32; out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30; out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31; out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32; out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30; out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31; out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32; out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        return out;
    },
    perspective: (fovy, aspect, near, far) => { const f = 1.0 / Math.tan(fovy / 2), out = mat4.create(); out[0] = f / aspect; out[5] = f; out[10] = (far + near) / (near - far); out[11] = -1; out[14] = (2 * far * near) / (near - far); out[15] = 0; return out; },
    lookAt: (eye, center, up) => {
        const z = vec3.normalize(vec3.subtract(eye, center)); const x = vec3.normalize(vec3.cross(up, z)); const y = vec3.normalize(vec3.cross(z, x));
        return new Float32Array([ x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -vec3.dot(x, eye), -vec3.dot(y, eye), -vec3.dot(z, eye), 1 ]);
    },
    targetTo: (out, eye, target, up) => {
        let z = vec3.normalize(vec3.subtract(eye, target)); let x = vec3.normalize(vec3.cross(up, z)); let y = vec3.normalize(vec3.cross(z, x));
        out[0] = x[0]; out[1] = y[0]; out[2] = z[0]; out[3] = 0; out[4] = x[1]; out[5] = y[1]; out[6] = z[1]; out[7] = 0; out[8] = x[2]; out[9] = y[2]; out[10] = z[2]; out[11] = 0; out[12] = eye[0]; out[13] = eye[1]; out[14] = eye[2]; out[15] = 1;
        return out;
    },
    translate: (out, m, v) => { 
        let x = v[0], y = v[1], z = v[2];
        let m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
        let m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
        let m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];
        let m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];

        if (m === out) {
            out[12] = m00 * x + m10 * y + m20 * z + m30;
            out[13] = m01 * x + m11 * y + m21 * z + m31;
            out[14] = m02 * x + m12 * y + m22 * z + m32;
            out[15] = m03 * x + m13 * y + m23 * z + m33;
        } else {
            out[0] = m[0]; out[1] = m[1]; out[2] = m[2]; out[3] = m[3];
            out[4] = m[4]; out[5] = m[5]; out[6] = m[6]; out[7] = m[7];
            out[8] = m[8]; out[9] = m[9]; out[10] = m[10]; out[11] = m[11];
            out[12] = m00 * x + m10 * y + m20 * z + m30;
            out[13] = m01 * x + m11 * y + m21 * z + m31;
            out[14] = m02 * x + m12 * y + m22 * z + m32;
            out[15] = m03 * x + m13 * y + m23 * z + m33;
        }
        return out; 
    },
    rotateX: (out, m, rad) => { const s = Math.sin(rad), c = Math.cos(rad), a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7], a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11]; if (m !== out) { out[0] = m[0]; out[1] = m[1]; out[2] = m[2]; out[3] = m[3]; out[12] = m[12]; out[13] = m[13]; out[14] = m[14]; out[15] = m[15]; } out[4] = a10 * c + a20 * s; out[5] = a11 * c + a21 * s; out[6] = a12 * c + a22 * s; out[7] = a13 * c + a23 * s; out[8] = a20 * c - a10 * s; out[9] = a21 * c - a11 * s; out[10] = a22 * c - a12 * s; out[11] = a23 * c - a13 * s; return out; },
    rotateY: (out, m, rad) => { const s = Math.sin(rad), c = Math.cos(rad), a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3], a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11]; if (m !== out) { out[4] = m[4]; out[5] = m[5]; out[6] = m[6]; out[7] = m[7]; out[12] = m[12]; out[13] = m[13]; out[14] = m[14]; out[15] = m[15]; } out[0] = a00 * c - a20 * s; out[1] = a01 * c - a21 * s; out[2] = a02 * c - a22 * s; out[3] = a03 * c - a23 * s; out[8] = a00 * s + a20 * c; out[9] = a01 * s + a21 * c; out[10] = a02 * s + a22 * c; out[11] = a03 * s + a23 * c; return out; },
    rotateZ: (out, m, rad) => { const s = Math.sin(rad), c = Math.cos(rad), a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3], a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7]; if (m !== out) { out[8] = m[8]; out[9] = m[9]; out[10] = m[10]; out[11] = m[11]; out[12] = m[12]; out[13] = m[13]; out[14] = m[14]; out[15] = m[15]; } out[0] = a00 * c + a10 * s; out[1] = a01 * c + a11 * s; out[2] = a02 * c + a12 * s; out[3] = a03 * c + a13 * s; out[4] = a10 * c - a00 * s; out[5] = a11 * c - a01 * s; out[6] = a12 * c - a02 * s; out[7] = a13 * c - a03 * s; return out; },
    scale: (out, m, v) => { let x = v[0], y = v[1], z = v[2]; out[0] = m[0] * x; out[1] = m[1] * x; out[2] = m[2] * x; out[3] = m[3] * x; out[4] = m[4] * y; out[5] = m[5] * y; out[6] = m[6] * y; out[7] = m[7] * y; out[8] = m[8] * z; out[9] = m[9] * z; out[10] = m[10] * z; out[11] = m[11] * z; out[12] = m[12]; out[13] = m[13]; out[14] = m[14]; out[15] = m[15]; return out; },
    alignYTo: (out, eye, normal, upVec) => {
        let y = vec3.normalize(normal);
        const tempUp = (Math.abs(y[1]) > 0.99) ? [1, 0, 0] : upVec;
        let x = vec3.normalize(vec3.cross(tempUp, y));
        let z = vec3.normalize(vec3.cross(x, y));
        out[0] = x[0]; out[1] = x[1]; out[2] = x[2]; out[3] = 0;
        out[4] = y[0]; out[5] = y[1]; out[6] = y[2]; out[7] = 0;
        out[8] = z[0]; out[9] = z[1]; out[10] = z[2]; out[11] = 0;
        out[12] = eye[0]; out[13] = eye[1]; out[14] = eye[2]; out[15] = 1;
        return out;
    }
};
const mat3 = {
    create: () => new Float32Array(9),
    normalFromMat4: (out, m) => { let a00 = m[0], a01 = m[1], a02 = m[2], a10 = m[4], a11 = m[5], a12 = m[6], a20 = m[8], a21 = m[9], a22 = m[10]; let b01 = a22 * a11 - a12 * a21, b11 = -a22 * a10 + a12 * a20, b21 = a21 * a10 - a11 * a20; let det = a00 * b01 + a01 * b11 + a02 * b21; if (!det) { return null; } det = 1.0 / det; out[0] = b01 * det; out[1] = (-a22 * a01 + a02 * a21) * det; out[2] = (a12 * a01 - a02 * a11) * det; out[3] = b11 * det; out[4] = (a22 * a00 - a02 * a20) * det; out[5] = (-a12 * a00 + a02 * a10) * det; out[6] = b21 * det; out[7] = (-a21 * a00 + a01 * a20) * det; out[8] = (a11 * a00 - a01 * a10) * det; return out; }
};
const vec3 = {
    normalize: (v) => { const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); if (len > 0.00001) return [v[0] / len, v[1] / len, v[2] / len]; return [0, 0, 0]; },
    subtract: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    cross: (a, b) => [ a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] ],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    scale: (v, s) => [v[0] * s, v[1] * s, v[2] * s],
    transformMat4: (out, v, m) => {
        let x = v[0], y = v[1], z = v[2];
        let w = m[3] * x + m[7] * y + m[11] * z + m[15];
        w = w || 1.0;
        out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
        out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
        out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
        return out;
    },
};

// --- Fungsi Helper Inisialisasi WebGL ---
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Gagal me-link program shader: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Gagal mengkompilasi shader: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

//function gambar bentuk
function drawShape(gl, programInfo, shape, modelMatrix, color) {
    gl.bindBuffer(gl.ARRAY_BUFFER, shape.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, shape.normal);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.indices);
    const normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, modelMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, modelMatrix);
    gl.uniformMatrix3fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);
    gl.uniform4fv(programInfo.uniformLocations.color, color);
    gl.drawElements(gl.TRIANGLES, shape.indexCount, gl.UNSIGNED_SHORT, 0);
}

//function buat geometry
function createEllipsoid(gl, rx, ry, rz, latitudeBands, longitudeBands) {
    const vertices = []; const normals = []; const indices = [];
    for (let lat = 0; lat <= latitudeBands; lat++) {
        const theta = lat * Math.PI / latitudeBands; const sinTheta = Math.sin(theta); const cosTheta = Math.cos(theta);
        for (let long = 0; long <= longitudeBands; long++) {
            const phi = long * 2 * Math.PI / longitudeBands; const sinPhi = Math.sin(phi); const cosPhi = Math.cos(phi);
            const x = rx * cosPhi * sinTheta; const y = ry * cosTheta; const z = rz * sinPhi * sinTheta;
            const nx = x / (rx * rx); const ny = y / (ry * ry); const nz = z / (rz * rz);
            const len = 1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz);
            vertices.push(x, y, z); normals.push(nx * len, ny * len, nz * len);
        }
    }
    for (let lat = 0; lat < latitudeBands; lat++) {
        for (let long = 0; long < longitudeBands; long++) {
            const first = (lat * (longitudeBands + 1)) + long; const second = first + longitudeBands + 1;
            indices.push(first, second, first + 1); indices.push(second, second + 1, first + 1);
        }
    }
    return { position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)), normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)), indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), indexCount: indices.length };
}
function createCone(gl, baseRadius, height, subdivisions) {
    const vertices = []; const normals = []; const indices = [];
    vertices.push(0, height, 0); normals.push(0, 1, 0); 
    const baseStartIdx = vertices.length / 3;
    for (let i = 0; i <= subdivisions; i++) {
        const angle = (i / subdivisions) * 2 * Math.PI; const x = baseRadius * Math.cos(angle); const z = baseRadius * Math.sin(angle);
        vertices.push(x, 0, z); 
        const nx = x; const ny = (baseRadius / height); const nz = z;
        const len = 1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz); normals.push(nx * len, ny * len, nz * len);
    }
    for (let i = 1; i <= subdivisions; i++) { indices.push(0, baseStartIdx + i, baseStartIdx + i + 1); }
    const trueBaseCenterIdx = vertices.length / 3;
    vertices.push(0, 0, 0); normals.push(0, -1, 0); 
    for (let i = 0; i <= subdivisions; i++) {
        const angle = (i / subdivisions) * 2 * Math.PI; const x = baseRadius * Math.cos(angle); const z = baseRadius * Math.sin(angle);
        vertices.push(x, 0, z); normals.push(0, -1, 0);
    }
    for (let i = 1; i <= subdivisions; i++) { indices.push(trueBaseCenterIdx, trueBaseCenterIdx + i + 1, trueBaseCenterIdx + i); }
    return { position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)), normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)), indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), indexCount: indices.length };
}
function createFrustum(gl, bottomRadius, topRadius, height, subdivisions) {
    const vertices = []; const normals = []; const indices = [];
    for (let i = 0; i <= subdivisions; i++) {
        const angle = (i / subdivisions) * 2 * Math.PI; const cos = Math.cos(angle); const sin = Math.sin(angle);
        vertices.push(bottomRadius * cos, 0, bottomRadius * sin); normals.push(0, 0, 0); 
        vertices.push(topRadius * cos, height, topRadius * sin); normals.push(0, 0, 0); 
    }
    const slope = Math.atan2(bottomRadius - topRadius, height); const cosSlope = Math.cos(slope); const sinSlope = Math.sin(slope);
    let currentVertex = 0;
    for (let i = 0; i <= subdivisions; i++) {
        const angle = (i / subdivisions) * 2 * Math.PI; const cos = Math.cos(angle); const sin = Math.sin(angle);
        normals[currentVertex + 0] = cos * cosSlope; normals[currentVertex + 1] = sinSlope; normals[currentVertex + 2] = sin * cosSlope;
        normals[currentVertex + 3] = cos * cosSlope; normals[currentVertex + 4] = sinSlope; normals[currentVertex + 5] = sin * cosSlope;
        currentVertex += 6;
    }
    for (let i = 0; i < subdivisions; i++) {
        const p1 = i * 2; const p2 = i * 2 + 1; const p3 = (i + 1) * 2; const p4 = (i + 1) * 2 + 1; 
        indices.push(p1, p2, p3); indices.push(p2, p4, p3);
    }
    const baseCenterBottomIdx = vertices.length / 3;
    vertices.push(0, 0, 0); normals.push(0, -1, 0); 
    for (let i = 0; i <= subdivisions; i++) { const angle = (i / subdivisions) * 2 * Math.PI; vertices.push(bottomRadius * Math.cos(angle), 0, bottomRadius * Math.sin(angle)); normals.push(0, -1, 0); }
    for (let i = 1; i <= subdivisions; i++) { indices.push(baseCenterBottomIdx, baseCenterBottomIdx + i + 1, baseCenterBottomIdx + i); }
    const baseCenterTopIdx = vertices.length / 3;
    vertices.push(0, height, 0); normals.push(0, 1, 0); 
    for (let i = 0; i <= subdivisions; i++) { const angle = (i / subdivisions) * 2 * Math.PI; vertices.push(topRadius * Math.cos(angle), height, topRadius * Math.sin(angle)); normals.push(0, 1, 0); }
    for (let i = 1; i <= subdivisions; i++) { indices.push(baseCenterTopIdx, baseCenterTopIdx + i, baseCenterTopIdx + i + 1); }
    return { position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)), normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)), indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), indexCount: indices.length };
}
function createTorus(gl, majorRadius, minorRadius, majorSubdivisions, minorSubdivisions) {
    const vertices = []; const normals = []; const indices = [];
    for (let i = 0; i <= majorSubdivisions; i++) {
        const u = (i / majorSubdivisions) * 2 * Math.PI; const cosU = Math.cos(u); const sinU = Math.sin(u);
        for (let j = 0; j <= minorSubdivisions; j++) {
            const v = (j / minorSubdivisions) * 2 * Math.PI; const cosV = Math.cos(v); const sinV = Math.sin(v);
            const x = (majorRadius + minorRadius * cosV) * cosU; const y = minorRadius * sinV; const z = (majorRadius + minorRadius * cosV) * sinU;
            vertices.push(x, y, z);
            const nx = cosV * cosU; const ny = sinV; const nz = cosV * sinU; normals.push(nx, ny, nz);
        }
    }
    for (let i = 0; i < majorSubdivisions; i++) {
        for (let j = 0; j < minorSubdivisions; j++) {
            const a = (i * (minorSubdivisions + 1)) + j; const b = a + minorSubdivisions + 1; const c = a + 1; const d = b + 1;
            indices.push(a, b, c); indices.push(b, d, c);
        }
    }
    return { position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)), normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)), indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), indexCount: indices.length };
}
function createCurvedStrip(gl, pathPoints, radiusPoints, radialSegments, angleStart, angleEnd) {
    const vertices = [];
    const normals = [];
    const indices = [];
    const angleSweep = angleEnd - angleStart;
    for (let i = 0; i < pathPoints.length; i++) {
        const P = pathPoints[i];
        const R = radiusPoints[i];
        let T, N, B;
        if (i === 0) {
            T = vec3.normalize(vec3.subtract(pathPoints[1], P));
        } else if (i === pathPoints.length - 1) {
            T = vec3.normalize(vec3.subtract(P, pathPoints[i - 1]));
        } else {
            T = vec3.normalize(vec3.subtract(pathPoints[i + 1], pathPoints[i - 1]));
        }
        
        if (T[0] === 0 && T[1] === 0 && T[2] === 0) {
           if (i > 0) T = vec3.normalize(vec3.subtract(P, pathPoints[i - 1]));
           else T = [0, 1, 0]; 
        }

        const tempUp = (Math.abs(T[1]) > 0.99) ? [1, 0, 0] : [0, 1, 0];
        N = vec3.normalize(vec3.cross(T, tempUp));
        B = vec3.normalize(vec3.cross(N, T));
        B = [1.0, 0.0, 0.0];
        
        if (Math.abs(vec3.dot(T, B)) > 0.99) {
            B = [0.0, 1.0, 0.0]; 
        }
        
        N = vec3.normalize(vec3.cross(B, T));
        
        for (let j = 0; j <= radialSegments; j++) {
            const t = j / radialSegments;
            const angle = angleStart + t * angleSweep;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const relPos = vec3.add(
                vec3.scale(N, cosA),
                vec3.scale(B, sinA)
            );
            const vNormal = vec3.normalize(relPos);
            const vPos = vec3.add(P, vec3.scale(vNormal, R));
            vertices.push(vPos[0], vPos[1], vPos[2]);
            normals.push(vNormal[0], vNormal[1], vNormal[2]);
        }
    }
    for (let i = 0; i < pathPoints.length - 1; i++) {
        for (let j = 0; j < radialSegments; j++) {
            const a = (i * (radialSegments + 1)) + j;
            const b = a + radialSegments + 1;
            const c = a + 1;
            const d = b + 1;
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }
    return {
        position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)),
        normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)),
        indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)),
        indexCount: indices.length
    };
}
function createAndBuffer(gl, type, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, data, gl.STATIC_DRAW);
    return buffer;
}

//path interpolation
function catmullRomInterpolate(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    const v0 = vec3.scale(p0, -0.5 * t3 + t2 - 0.5 * t);
    const v1 = vec3.scale(p1, 1.5 * t3 - 2.5 * t2 + 1.0);
    const v2 = vec3.scale(p2, -1.5 * t3 + 2.0 * t2 + 0.5 * t);
    const v3 = vec3.scale(p3, 0.5 * t3 - 0.5 * t2);
    return vec3.add(vec3.add(v0, v1), vec3.add(v2, v3));
}
function linearInterpolate(a, b, t) {
    return a + (b - a) * t;
}