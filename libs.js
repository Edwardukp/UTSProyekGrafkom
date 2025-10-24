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
    
    rotate: (out, a, rad, axis) => { 
        let x = axis[0], y = axis[1], z = axis[2]; let len = Math.hypot(x, y, z); if (len < 0.000001) { return null; } len = 1 / len; x *= len; y *= len; z *= len; 
        const s = Math.sin(rad); const c = Math.cos(rad); const t = 1 - c; 
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]; const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]; const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]; 
        const b00 = x * x * t + c, b01 = y * x * t + z * s, b02 = z * x * t - y * s; 
        const b10 = x * y * t - z * s, b11 = y * y * t + c, b12 = z * y * t + x * s; 
        const b20 = x * z * t + y * s, b21 = y * z * t - x * s, b22 = z * z * t + c; 
        out[0] = a00 * b00 + a10 * b01 + a20 * b02; out[1] = a01 * b00 + a11 * b01 + a21 * b02; out[2] = a02 * b00 + a12 * b01 + a22 * b02; out[3] = a03 * b00 + a13 * b01 + a23 * b02; 
        out[4] = a00 * b10 + a10 * b11 + a20 * b12; out[5] = a01 * b10 + a11 * b11 + a21 * b12; out[6] = a02 * b10 + a12 * b11 + a22 * b12; out[7] = a03 * b10 + a13 * b11 + a23 * b12; 
        out[8] = a00 * b20 + a10 * b21 + a20 * b22; out[9] = a01 * b20 + a11 * b21 + a21 * b22; out[10] = a02 * b20 + a12 * b21 + a22 * b22; out[11] = a03 * b20 + a13 * b21 + a23 * b22; 
        if (a !== out) { out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15]; } 
        return out; 
    },

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
    },

    fromQuat: (out, q) => {
        let x = q[0], y = q[1], z = q[2], w = q[3];
        let x2 = x + x, y2 = y + y, z2 = z + z;
        let xx = x * x2, xy = x * y2, xz = x * z2;
        let yy = y * y2, yz = y * z2, zz = z * z2;
        let wx = w * x2, wy = w * y2, wz = w * z2;
        out[0] = 1 - (yy + zz); out[1] = xy + wz; out[2] = xz - wy; out[3] = 0;
        out[4] = xy - wz; out[5] = 1 - (xx + zz); out[6] = yz + wx; out[7] = 0;
        out[8] = xz + wy; out[9] = yz - wx; out[10] = 1 - (xx + yy); out[11] = 0;
        out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
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

    scaleAndAdd: (out, a, b, scale) => {
        out[0] = a[0] + b[0] * scale;
        out[1] = a[1] + b[1] * scale;
        out[2] = a[2] + b[2] * scale;
        return out;
    },
    copy: (out, a) => {
        out[0] = a[0]; out[1] = a[1]; out[2] = a[2];
        return out;
    },
    length: (v) => Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
};

const quat = {
    create: () => new Float32Array(4),
    rotationTo: (out, a, b) => {
        let d = vec3.dot(a, b);
        if (d === 1) { // Vektor identik
            out[0] = 0; out[1] = 0; out[2] = 0; out[3] = 1;
        } else if (d === -1) { //vektor berlawanan
            //mencoba cross dengan sumbu X
            let axis = vec3.cross([1, 0, 0], a);
            if (vec3.length(axis) < 0.00001) { //jika paralel dengan x, cross dengan y
                axis = vec3.cross([0, 1, 0], a);
            }
            vec3.normalize(axis, axis);
            //rotasi 180 derajat (PI radian)
            let s = Math.sin(Math.PI / 2);
            out[0] = axis[0] * s; out[1] = axis[1] * s; out[2] = axis[2] * s; out[3] = Math.cos(Math.PI / 2);
        } else {
            let v = vec3.cross(a, b);
            out[0] = v[0]; out[1] = v[1]; out[2] = v[2];
            out[3] = 1 + d;
            //normalisasi quaternion
            let len = Math.sqrt(out[0] * out[0] + out[1] * out[1] + out[2] * out[2] + out[3] * out[3]);
            if (len > 0.00001) {
                out[0] /= len; out[1] /= len; out[2] /= len; out[3] /= len;
            }
        }
        return out;
    }
};

//helper inisialisasi webGL
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

    let lastNormal = [0, 0, 1]; //frame pertama
    let lastBinormal = [1, 0, 0];

    for (let i = 0; i < pathPoints.length; i++) {
        const P = pathPoints[i];
        const R = radiusPoints[i];
        let T;
        if (i === 0) {
            T = vec3.normalize(vec3.subtract(pathPoints[1], P));
        } else if (i === pathPoints.length - 1) {
            T = vec3.normalize(vec3.subtract(P, pathPoints[i - 1]));
        } else {
            T = vec3.normalize(vec3.subtract(pathPoints[i + 1], pathPoints[i - 1]));
        }
        
        if (T[0] === 0 && T[1] === 0 && T[2] === 0) { //handle titik duplikat
           if (i > 0) T = vec3.normalize(vec3.subtract(P, pathPoints[i - 1]));
           else T = [0, 1, 0]; //default
        }

        //parallel transport frame
        let B = vec3.normalize(vec3.cross(T, lastNormal));
        if (vec3.length(B) < 0.001) { //jika T sejajar lastNormal
            B = vec3.normalize(vec3.cross(T, lastBinormal)); //coba B
            if (vec3.length(B) < 0.001) B = [1,0,0]; //failsafe
        }
        let N = vec3.normalize(vec3.cross(B, T));
        
        lastNormal = N; //menyimpan frame untuk iterasi berikutnya
        lastBinormal = B;

        for (let j = 0; j <= radialSegments; j++) {
            const t = j / radialSegments;
            const angle = angleStart + t * angleSweep;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            
            //posisi relatif dari B dan N (bukan x dan y)
            const relPos = vec3.add(
                vec3.scale(B, cosA), //x lokal
                vec3.scale(N, sinA)  //y lokal
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

function createHyperboloidOneSheet(gl, a, b, c, height, segments, stacks) {
  const vertices = [], normals = [], indices = [];

  for (let i = 0; i <= stacks; i++) {
    const v = i / stacks;
    const y = (v - 0.5) * height;
    const t = (y / c) * (y / c);
    const r = Math.sqrt(1 + t);
    const radiusX = a * r;
    const radiusZ = b * r;

    for (let j = 0; j <= segments; j++) {
      const u = (j / segments) * 2 * Math.PI;
      const cosU = Math.cos(u);
      const sinU = Math.sin(u);

      const x = radiusX * cosU;
      const z = radiusZ * sinU;

      vertices.push(x, y, z);

      const nx = (2 * x) / (a * a);
      const ny = (-2 * y) / (c * c);
      const nz = (2 * z) / (b * b);

      const len = Math.hypot(nx, ny, nz) || 1.0;
      normals.push(nx / len, ny / len, nz / len);
    }
  }

  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < segments; j++) {
      const first = i * (segments + 1) + j;
      const second = first + segments + 1;
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }
  return { position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)), normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)), indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), indexCount: indices.length };
}

function createEllipticParaboloid(gl, a, b, c, segments = 32, stacks = 16) {
  const vertices = [], normals = [], indices = [];

  for (let i = 0; i <= stacks; i++) {
    const v = i / stacks;
    const y = c * v;
    const r = Math.sqrt(v);
    const radiusX = a * r;
    const radiusZ = b * r;

    for (let j = 0; j <= segments; j++) {
      const u = (j / segments) * 2 * Math.PI;
      const cosU = Math.cos(u);
      const sinU = Math.sin(u);

      const x = radiusX * cosU;
      const z = radiusZ * sinU;

      vertices.push(x, y, z);

      const nx = (2 * x) / (a * a);
      const ny = -1 / c;
      const nz = (2 * z) / (b * b);

      const len = Math.hypot(nx, ny, nz) || 1.0;
      normals.push(nx / len, ny / len, nz / len);
    }
  }

  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < segments; j++) {
      const first = i * (segments + 1) + j;
      const second = first + segments + 1;
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }
  return { position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)), normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)), indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), indexCount: indices.length };
}

function createCurvedDropletHead(gl, baseRadius, height, taper = 0.6, segments = 32, stacks = 24) {
  const vertices = []; const normals = []; const indices = [];

  for (let i = 0; i <= stacks; i++) {
    const v = i / stacks;
    const y = v * height;

    const curve = Math.pow(1 - v, 1.5); // stronger inward pull
    const r = baseRadius * (1.0 - (1 - taper) * (1 - curve));

    for (let j = 0; j <= segments; j++) {
      const u = (j / segments) * 2 * Math.PI;
      const cosU = Math.cos(u);
      const sinU = Math.sin(u);

      const x = r * cosU;
      const z = r * sinU;

      vertices.push(x, y, z);

      const nx = x;
      const ny = (height / baseRadius) * 0.3;
      const nz = z;
      const len = Math.hypot(nx, ny, nz) || 1.0;
      normals.push(nx / len, ny / len, nz / len);
    }
  }

  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < segments; j++) {
      const first = i * (segments + 1) + j;
      const second = first + segments + 1;
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }
  return { position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)), normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)), indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), indexCount: indices.length };
}

function createVerticalHalfEllipsoid(gl, rx, ry, rz, segments = 32, stacks = 24) {
  const vertices = []; const normals = []; const indices = [];

  for (let i = 0; i <= stacks; i++) {
    const v = i / stacks;
    const theta = v * Math.PI;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let j = 0; j <= segments; j++) {
      const u = (j / segments) * Math.PI; // vertical cut
      const sinPhi = Math.sin(u);
      const cosPhi = Math.cos(u);

      const x = rx * cosPhi * sinTheta;
      const y = ry * cosTheta;
      const z = rz * sinPhi * sinTheta;

      vertices.push(x, y, z);

      const nx = x / (rx * rx);
      const ny = y / (ry * ry);
      const nz = z / (rz * rz);
      const len = Math.hypot(nx, ny, nz) || 1.0;
      normals.push(nx / len, ny / len, nz / len);
    }
  }

  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < segments; j++) {
      const first = i * (segments + 1) + j;
      const second = first + segments + 1;
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }
  return { position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)), normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)), indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), indexCount: indices.length };
}

function createCylinder(gl, radius, height, segments = 16) {
    const vertices = [], normals = [], indices = [];

    for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * 2 * Math.PI;
        const x = radius * Math.cos(phi);
        const z = radius * Math.sin(phi);
        const nx = Math.cos(phi);
        const nz = Math.sin(phi);

        vertices.push(x, height, z);
        normals.push(nx, 0, nz);
        vertices.push(x, 0, z);
        normals.push(nx, 0, nz);
    }

    for (let j = 0; j < segments; j++) {
        const a = j * 2;
        const b = j * 2 + 1;
        const c = (j + 1) * 2;
        const d = (j + 1) * 2 + 1;

        indices.push(b, c, a);
        indices.push(b, d, c);
    }

    const topCenterIndex = vertices.length / 3;
    vertices.push(0, height, 0);
    normals.push(0, 1, 0);

    const firstTopIndex = topCenterIndex + 1;
    for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * 2 * Math.PI;
        const x = radius * Math.cos(phi);
        const z = radius * Math.sin(phi);
        vertices.push(x, height, z);
        normals.push(0, 1, 0);
    }

    for (let j = 0; j < segments; j++) {
        indices.push(topCenterIndex, firstTopIndex + j + 1, firstTopIndex + j);
    }

    const bottomCenterIndex = vertices.length / 3;
    vertices.push(0, 0, 0);
    normals.push(0, -1, 0);

    const firstBottomIndex = bottomCenterIndex + 1;
    for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * 2 * Math.PI;
        const x = radius * Math.cos(phi);
        const z = radius * Math.sin(phi);
        vertices.push(x, 0, z);
        normals.push(0, -1, 0);
    }

    for (let j = 0; j < segments; j++) {
        indices.push(bottomCenterIndex, firstBottomIndex + j, firstBottomIndex + j + 1);
    }
    return { position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)), normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)), indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), indexCount: indices.length };
}


function createFeatherFin(gl, length = 2.0, maxWidth = 0.5, thickness = 0.05, segments = 16) {
    const vertices = [], normals = [], indices = [];
    const halfLength = length / 2;
    const halfThick = thickness / 2;

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = -halfLength + t * length;

        const widthFactor = Math.sin(t * Math.PI);
        const currentWidth = maxWidth * widthFactor;
        const halfWidth = currentWidth / 2;

        vertices.push(-halfWidth, y, halfThick); // l edge
        vertices.push(halfWidth, y, halfThick);  // r edge

        normals.push(0, 0, 1);
        normals.push(0, 0, 1);
    }

    const topVertexCount = vertices.length / 3;
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = -halfLength + t * length;
        const widthFactor = Math.sin(t * Math.PI);
        const currentWidth = maxWidth * widthFactor;
        const halfWidth = currentWidth / 2;

        vertices.push(-halfWidth, y, -halfThick);
        vertices.push(halfWidth, y, -halfThick);

        normals.push(0, 0, -1);
        normals.push(0, 0, -1);
    }


    for (let i = 0; i < segments; i++) {
        const tl = i * 2;
        const tr = i * 2 + 1;
        const bl = (i + 1) * 2;
        const br = (i + 1) * 2 + 1;

        indices.push(tl, bl, tr);
        indices.push(tr, bl, br);
    }

    for (let i = 0; i < segments; i++) {
        const tl = topVertexCount + i * 2;
        const tr = topVertexCount + i * 2 + 1;
        const bl = topVertexCount + (i + 1) * 2;
        const br = topVertexCount + (i + 1) * 2 + 1;

        indices.push(tl, tr, bl);
        indices.push(tr, br, bl);
    }

    for (let i = 0; i < segments; i++) {
        const topLeft = i * 2;
        const topRight = i * 2 + 1;
        const nextTopLeft = (i + 1) * 2;
        const nextTopRight = (i + 1) * 2 + 1;

        const bottomLeft = topVertexCount + i * 2;
        const bottomRight = topVertexCount + i * 2 + 1;
        const nextBottomLeft = topVertexCount + (i + 1) * 2;
        const nextBottomRight = topVertexCount + (i + 1) * 2 + 1;

        // l edge
        indices.push(topLeft, bottomLeft, nextBottomLeft);
        indices.push(topLeft, nextBottomLeft, nextTopLeft);

        // r edge
        indices.push(topRight, nextTopRight, nextBottomRight);
        indices.push(topRight, nextBottomRight, bottomRight);
    }
    return { position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)), normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)), indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), indexCount: indices.length };
}

function createBellyPlate(gl, rx, ry, rz, phiCenter, phiRadius, thetaCenter, thetaRadius, segments = 16, stacks = 12, surfaceOffset = 0.02) {
    const vertices = [], normals = [], indices = [];
    const vertexMap = new Map();

    for (let i = 0; i <= stacks; i++) {
        const v = i / stacks;
        const thetaDist = (v - 0.5) * 2;
        const maxPhiScaleFactor = Math.sqrt(1.0 - thetaDist * thetaDist);
        const currentTheta = thetaCenter + thetaDist * thetaRadius;
        const sinCurrentTheta = Math.sin(currentTheta);
        const cosCurrentTheta = Math.cos(currentTheta);

        for (let j = 0; j <= segments; j++) {
            const u = j / segments;
            const phiDist = (u - 0.5) * 2;
            const scaledPhiDist = phiDist * maxPhiScaleFactor;
            const currentPhiCorrected = phiCenter + scaledPhiDist * phiRadius;
            const sinCurrentPhi = Math.sin(currentPhiCorrected);
            const cosCurrentPhi = Math.cos(currentPhiCorrected);
            const baseX = rx * cosCurrentPhi * sinCurrentTheta;
            const baseY = ry * cosCurrentTheta;
            const baseZ = rz * sinCurrentPhi * sinCurrentTheta;
            const nx = (baseX / (rx * rx));
            const ny = (baseY / (ry * ry));
            const nz = (baseZ / (rz * rz));
            const len = Math.hypot(nx, ny, nz) || 1.0;
            const normX = nx / len;
            const normY = ny / len;
            const normZ = nz / len;
            const x = baseX + normX * surfaceOffset;
            const y = baseY + normY * surfaceOffset;
            const z = baseZ + normZ * surfaceOffset;

            vertices.push(x, y, z);
            normals.push(normX, normY, normZ);
            vertexMap.set(`${i}_${j}`, vertices.length / 3 - 1);
        }
    }

    for (let i = 0; i < stacks; i++) {
        for (let j = 0; j < segments; j++) {
            const aIdx = `${i}_${j}`;
            const bIdx = `${i}_${j + 1}`;
            const cIdx = `${i + 1}_${j}`;
            const dIdx = `${i + 1}_${j + 1}`;

            if (vertexMap.has(aIdx) && vertexMap.has(bIdx) && vertexMap.has(cIdx) && vertexMap.has(dIdx)) {
                 const a = vertexMap.get(aIdx);
                 const b = vertexMap.get(bIdx);
                 const c = vertexMap.get(cIdx);
                 const d = vertexMap.get(dIdx);

                 indices.push(a, c, b);
                 indices.push(b, c, d);
            } else {}
        }
    }
    return { position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)), normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)), indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), indexCount: indices.length };
}

function createEyeShape(gl, length = 1.0, maxRadius = 0.3, capRatio = 0.2, sharpness = 2.0, segments = 16, stacks = 12) {
    const vertices = [], normals = [], indices = [];
    const bodyLength = length * (1.0 - capRatio);
    const capCenterZ = bodyLength;
    const capRadius = maxRadius;

    vertices.push(0, 0, 0);
    normals.push(0, 0, -1);

    for (let i = 1; i <= stacks * (1 - capRatio); i++) {
        const t = i / (stacks * (1 - capRatio));
        const z = t * bodyLength;
        const currentRadius = maxRadius * Math.pow(t, 1.0 / sharpness);

        for (let j = 0; j <= segments; j++) {
            const phi = (j / segments) * 2 * Math.PI;
            const cosPhi = Math.cos(phi);
            const sinPhi = Math.sin(phi);

            const x = currentRadius * cosPhi;
            const y = currentRadius * sinPhi;
            vertices.push(x, y, z);

            const nr = 1.0;
            const nz = sharpness * (maxRadius / bodyLength) * Math.pow(t, (1.0 / sharpness) - 1.0) / sharpness;
            const normX = cosPhi * nr;
            const normY = sinPhi * nr;
            const normZ = -nz;
            const len = Math.hypot(normX, normY, normZ) || 1.0;
            normals.push(normX / len, normY / len, normZ / len);
        }
    }

    const bodyVertexCount = vertices.length / 3;
    const capStacks = Math.ceil(stacks * capRatio); 

    for (let i = 1; i <= capStacks; i++) {
        const t = i / capStacks;
        const theta = Math.PI / 2 * (1-t);
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        const z = capCenterZ + cosTheta * capRadius;
        const currentRadius = sinTheta * capRadius;

        for (let j = 0; j <= segments; j++) {
            const phi = (j / segments) * 2 * Math.PI;
            const cosPhi = Math.cos(phi);
            const sinPhi = Math.sin(phi);

            const x = currentRadius * cosPhi;
            const y = currentRadius * sinPhi;
            vertices.push(x, y, z);

            const normX = x;
            const normY = y;
            const normZ = z - capCenterZ;
            const len = Math.hypot(normX, normY, normZ) || 1.0;
            normals.push(normX / len, normY / len, normZ / len);
        }
    }

    const apexIndex = 0;
    const firstRingIndex = 1;
    for (let j = 0; j < segments; j++) {
        indices.push(apexIndex, firstRingIndex + j + 1, firstRingIndex + j);
    }

    for (let i = 0; i < stacks * (1-capRatio) -1 ; i++) {
        const ringStart = 1 + i * (segments + 1);
        const nextRingStart = ringStart + segments + 1;
        for (let j = 0; j < segments; j++) {
            const a = ringStart + j;
            const b = ringStart + j + 1;
            const c = nextRingStart + j;
            const d = nextRingStart + j + 1;
            indices.push(a, b, c);
            indices.push(c, b, d);
        }
    }

    const lastBodyRingStart = 1 + (stacks * (1-capRatio) - 1) * (segments + 1);
    const firstCapRingStart = bodyVertexCount;

    for (let i = 0; i < capStacks ; i++) {
        const ringStart = firstCapRingStart + i * (segments + 1);
        const nextRingStart = ringStart + segments + 1;
        for (let j = 0; j < segments; j++) {
             const a = ringStart + j;
             const b = ringStart + j + 1;
             const c = nextRingStart + j;
             const d = nextRingStart + j + 1;

             indices.push(a, b, c);
             indices.push(c, b, d);
        }
    }
    return { position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)), normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)), indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), indexCount: indices.length };
}

function createTriangularPyramid(gl, baseRadius, height) {
    const vertices = [], normals = [], indices = [];
    const localPositions = [], localNormals = [];

    const apex = [0, height, 0];
    const base = [];
    for (let i = 0; i < 3; i++) {
        const angle = i * (2 * Math.PI) / 3;
        base.push([baseRadius * Math.cos(angle), 0, baseRadius * Math.sin(angle)]);
    }

    //alas
    localPositions.push(base[0], base[1], base[2]);
    localNormals.push([0, -1, 0], [0, -1, 0], [0, -1, 0]);
    indices.push(0, 1, 2);

    //sisi
    for(let i=0; i<3; i++) {
        const i_curr = i;
        const i_next = (i + 1) % 3;
        localPositions.push(base[i_curr], base[i_next], apex);
        
        const e1 = vec3.subtract(base[i_next], base[i_curr]);
        const e2 = vec3.subtract(apex, base[i_curr]);
        const n = vec3.normalize(vec3.cross(e1, e2));
        
        localNormals.push(n, n, n);
        indices.push(localPositions.length - 3, localPositions.length - 2, localPositions.length - 1);
    }
    
    localPositions.forEach((pos, i) => {
        vertices.push(pos[0], pos[1], pos[2]);
        normals.push(localNormals[i][0], localNormals[i][1], localNormals[i][2]);
    });

    return { 
        position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)), 
        normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)), 
        indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), 
        indexCount: indices.length
    };
}

function createExtrudedShape(gl, shapePoints, depth) {
    const vertices = [], normals = [], indices = [];
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
    
    //sisi belakang
    const backOffset = localPositions.length;
    shapePoints.forEach(p => {
        localPositions.push([p[0], p[1], -halfDepth]);
        localNormals.push([0, 0, -1]);
    });
    for(let i=1; i < shapePoints.length - 1; i++) {
        indices.push(backOffset, backOffset + i + 1, backOffset + i); // Dibalik
    }
    
    //sisi samping
    const sideOffset = localPositions.length;
    for(let i=0; i < shapePoints.length; i++) {
        const j = (i + 1) % shapePoints.length;
        const p1 = shapePoints[i];
        const p2 = shapePoints[j];
        
        const v1_f = [p1[0], p1[1], halfDepth];
        const v2_f = [p2[0], p2[1], halfDepth];
        const v1_b = [p1[0], p1[1], -halfDepth];
        const v2_b = [p2[0], p2[1], -halfDepth];
        
        const e1 = [v2_f[0]-v1_f[0], v2_f[1]-v1_f[1], 0];
        const e2 = [0, 0, -depth];
        const n = vec3.normalize(vec3.cross(e1, e2));
        
        localPositions.push(v1_f, v1_b, v2_f);
        localPositions.push(v2_f, v1_b, v2_b);
        localNormals.push(n, n, n);
        localNormals.push(n, n, n);
        indices.push(sideOffset+i*6, sideOffset+i*6+1, sideOffset+i*6+2);
        indices.push(sideOffset+i*6+3, sideOffset+i*6+4, sideOffset+i*6+5);
    }
    
    localPositions.forEach((pos, i) => {
        vertices.push(pos[0], pos[1], pos[2]);
        normals.push(localNormals[i][0], localNormals[i][1], localNormals[i][2]);
    });

    return { 
        position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)), 
        normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)), 
        indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), 
        indexCount: indices.length
    };
}

function createEyebrowShape(gl) {
    const points = [ [-0.4, 0.0], [0.4, 0.2], [0.4, -0.1] ];
    return createExtrudedShape(gl, points, 0.05);
}

function createEyeShape(gl) {
    const points = [ [-0.3, 0.0], [0.2, 0.2], [0.4, 0.0], [0.1, -0.15] ];
    return createExtrudedShape(gl, points, 0.08);
}

function createEyePupil(gl) {
    const points = [[-0.1, 0.0], [0.05, -0.05], [0.2, 0.0], [0.1, 0.1]];
    return createExtrudedShape(gl, points, 0.05);
}

function generateNewDorsalFin(gl, path, radii) {
    const vertices = [], normals = [], indices = [];
    const heights = []; 
    
    const segments = path.length - 1; 
    
    const t_start_idx = Math.floor(segments * 0.03); 
    const t_end_idx = Math.floor(segments * 0.3);
    const numFinSegments = t_end_idx - t_start_idx;
    
    const finThickness = 0.3; 
    const maxSpikeHeight = 9.0; 
    const numSpikes = 3;
    const spikePower = 8.0;
    const heightThreshold = 0.2; 

    let lastNormal = [0, 0, 1];
    let lastBinormal = [1, 0, 0];
    let vertexOffset = 0;
    
    for (let i = 0; i <= numFinSegments; i++) {
        const path_idx = t_start_idx + i;
        const t_norm = i / numFinSegments;
        
        const origin = path[path_idx];
        const bodyRadius = radii[path_idx];

        //hitung frame
        let tangent;
        if (path_idx === 0) {
            tangent = vec3.normalize(vec3.subtract(path[path_idx + 1], origin));
        } else if (path_idx === segments) {
            tangent = vec3.normalize(vec3.subtract(origin, path[path_idx - 1]));
        } else {
            tangent = vec3.normalize(vec3.subtract(path[path_idx + 1], path[path_idx - 1]));
        }
        
        let binormal = vec3.normalize(vec3.cross(tangent, lastNormal));
        if (vec3.length(binormal) < 0.001) {
            binormal = vec3.normalize(vec3.cross(tangent, lastBinormal));
        }
        let normal = vec3.normalize(vec3.cross(binormal, tangent));
        vec3.copy(lastNormal, normal); 
        vec3.copy(lastBinormal, binormal);

        const profile = Math.sin(t_norm * Math.PI); 
        const spikeWave = Math.pow((Math.cos(t_norm * Math.PI * 2.0 * numSpikes) + 1.0) / 2.0, spikePower);
        const height = maxSpikeHeight * profile * spikeWave;
        heights.push(height); 
        
        const backVector = vec3.scale(normal, -1); //arah punggung (-normal)
        const thickVector = binormal; //arah ketebalan (binormal)

        const basePoint = vec3.scaleAndAdd(origin, backVector, bodyRadius * 0.8);
        const p_tip_vec = vec3.scaleAndAdd(basePoint, backVector, height);
        
        const halfThickVec = vec3.scale(thickVector, finThickness * (0.5 + profile * 0.5)); 

        const v_front_base_vec = vec3.add(basePoint, halfThickVec);
        const v_back_base_vec = vec3.subtract(basePoint, halfThickVec);
        
        const frontNormalVec = thickVector; 
        const backNormalVec = vec3.scale(thickVector, -1); 
        const tipNormalVec = backVector; 

        vertices.push(v_front_base_vec[0], v_front_base_vec[1], v_front_base_vec[2]);
        vertices.push(v_back_base_vec[0], v_back_base_vec[1], v_back_base_vec[2]);
        vertices.push(p_tip_vec[0], p_tip_vec[1], p_tip_vec[2]);
        
        normals.push(frontNormalVec[0], frontNormalVec[1], frontNormalVec[2]);
        normals.push(backNormalVec[0], backNormalVec[1], backNormalVec[2]);
        normals.push(tipNormalVec[0], tipNormalVec[1], tipNormalVec[2]);
        
        vertexOffset += 3;
    }

    for (let i = 0; i < numFinSegments; i++) {
        const v_curr_fb = i * 3, v_curr_bb = i * 3 + 1, v_curr_t  = i * 3 + 2;
        const v_next_fb = (i + 1) * 3, v_next_bb = (i + 1) * 3 + 1, v_next_t  = (i + 1) * 3 + 2;
        
        if (heights[i] > heightThreshold || heights[i+1] > heightThreshold) 
        {
            indices.push(v_curr_fb, v_next_fb, v_curr_t); 
            indices.push(v_next_fb, v_next_t, v_curr_t); 
            indices.push(v_curr_bb, v_curr_t, v_next_bb); 
            indices.push(v_next_bb, v_curr_t, v_next_t); 
        }
    }
    return { 
        position: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices)), 
        normal: createAndBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals)), 
        indices: createAndBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), 
        indexCount: indices.length 
    };
}