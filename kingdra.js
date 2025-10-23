const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;

    varying highp vec3 vTransformedNormal;
    varying highp vec4 vPosition;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vPosition = uModelViewMatrix * aVertexPosition;
        vTransformedNormal = (uNormalMatrix * vec4(aVertexNormal, 0.0)).xyz;
    }
`;


const fsSource = `
    precision mediump float;

    varying highp vec3 vTransformedNormal;
    varying highp vec4 vPosition;

    uniform vec3 uLightPosition;
    uniform vec3 uViewPosition;
    uniform vec4 uObjectColor;

    void main() {
        vec3 lightColor = vec3(0.6, 1.0, 1.0);
        float ambientStrength = 0.72;
        float specularStrength = 0.02;
        float shininess = 2.0;

        vec3 ambient = ambientStrength * lightColor;

        vec3 normal = normalize(vTransformedNormal);
        vec3 lightDirection = normalize(uLightPosition - vPosition.xyz);
        float diff = max(dot(normal, lightDirection), 0.0);
        vec3 diffuse = diff * lightColor;

        vec3 viewDirection = normalize(uViewPosition - vPosition.xyz);
        vec3 reflectDirection = reflect(-lightDirection, normal);
        float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), shininess);
        vec3 specular = specularStrength * spec * lightColor;

        vec3 litColor = (ambient + diffuse + specular) * uObjectColor.rgb;
        gl_FragColor = vec4(litColor, uObjectColor.a);
    }
`;

// scene node - hierarchical structure
class SceneNode {
  constructor(options = {}) {
    this.buffers = options.buffers || null;
    this.localTransform = options.localTransform || {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };
    this.color = options.color || [1, 1, 1, 1];
    this.children = [];
    this.parent = null;
  }

  addChild(child) {
    this.children.push(child);
    child.parent = this;
  }

  getLocalMatrix() {
    const m = mat4.create();
    mat4.translate(m, m, this.localTransform.position);
    mat4.rotate(m, m, this.localTransform.rotation[0], [1, 0, 0]);
    mat4.rotate(m, m, this.localTransform.rotation[1], [0, 1, 0]);
    mat4.rotate(m, m, this.localTransform.rotation[2], [0, 0, 1]);
    mat4.scale(m, m, this.localTransform.scale);
    return m;
  }

  getWorldMatrix(parentWorldMatrix = null) {
    const localMatrix = this.getLocalMatrix();
    if (parentWorldMatrix) {
      const worldMatrix = mat4.create();
      mat4.multiply(worldMatrix, parentWorldMatrix, localMatrix);
      return worldMatrix;
    }
    return localMatrix;
  }
}

function main() {
  const canvas = document.querySelector("#glcanvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert("Unable to initialize WebGL.");
    return;
  }

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
      lightPosition: gl.getUniformLocation(shaderProgram, "uLightPosition"),
      viewPosition: gl.getUniformLocation(shaderProgram, "uViewPosition"),
      objectColor: gl.getUniformLocation(shaderProgram, "uObjectColor"),
    },
  };

  // geometries
  const ellipsoidGeometry = createEllipsoid(1.0, 1.0, 1.0, 32, 24);
  const hyperboloidGeometry = createHyperboloidOneSheet(0.4, 0.4, 0.5, 1.0, 32, 16);
  const cheekGeometry = createEllipticParaboloid(0.5, 0.5, 0.5, 32, 16);
  const featherFinGeometry = createFeatherFin(1.2, 0.6, 0.05, 16);
  const dropletGeometry = createCurvedDropletHead(0.5, 1.2, 0.18, 32, 24);
  const craniumGeometry = createVerticalHalfEllipsoid(0.9, 0.6, 1.0, 32, 24);
  const cylinderGeometry = createCylinder(0.5, 1.0, 16);
  const bellyPlateGeometry = createBellyPlate(1.0, 1.0, 1.0, 0, Math.PI / 4, Math.PI / 2, Math.PI / 3, 16, 12, 0.02);
  const eyeGeometry = createEyeShape(1.2, 0.3, 0.3, 0.8, 16, 12);

  // buffers
  const ellipsoidBuffers = initBuffers(gl, ellipsoidGeometry);
  const hyperboloidBuffers = initBuffers(gl, hyperboloidGeometry);
  const cheekBuffers = initBuffers(gl, cheekGeometry);
  const dropletBuffers = initBuffers(gl, dropletGeometry);
  const craniumBuffers = initBuffers(gl, craniumGeometry);
  const cylinderBuffers = initBuffers(gl, cylinderGeometry);
  const featherFinBuffers = initBuffers(gl, featherFinGeometry);
  const bellyPlateBuffers = initBuffers(gl, bellyPlateGeometry);
  const eyeBuffers = initBuffers(gl, eyeGeometry);

  // colors
  const kingdraBlue = [0.32, 0.58, 0.78, 1.0];
  const kingdraYellow = [0.96, 0.84, 0.44, 1.0];
  const kingdraFinWhite = [0.9, 0.88, 0.8, 1.0];
  const eyeWhite = [1.0, 1.0, 1.0, 1.0];
  const eyeRed = [0.8, 0.1, 0.1, 1.0];
  const eyeBlack = [0.1, 0.1, 0.1, 1.0];
  
  // base scene graph node
  const root = new SceneNode();

  // 1. BODY (Parent) - ellipsoid centered at origin
  const body = new SceneNode({
    buffers: ellipsoidBuffers,
    localTransform: {
      position: [0.0, -1.0, 0.0],
      rotation: [0.4, 0.0, 0.0],
      scale: [1.0, 1.5, 1.0], 
    },
    color: kingdraBlue,
  });
  root.addChild(body);

  // 2. NECK (Child of Body) - hyperboloid attached to the top of the body
  const neck = new SceneNode({
    buffers: hyperboloidBuffers,
    localTransform: {
      position: [0.0, 1.1, 0.1],
      rotation: [0.1, 0.0, 0.0],
      scale: [1.2, 0.7, 1.2],
    },
    color: kingdraBlue,
  });
  body.addChild(neck);

  // 3. HEAD (Child of Neck) - ellipsoid attached to the top of the neck
  const head = new SceneNode({
    buffers: ellipsoidBuffers,
    localTransform: {
      position: [0.0, 0.9, 0.0],
      rotation: [-0.9, 0.0, 0.0],
      scale: [0.65, 0.7, 0.75],
    },
    color: kingdraBlue,
  });
  neck.addChild(head);

  // 4. LEFT CHEEK (Child of Head) - paraboloid on left side of head
  const leftCheek = new SceneNode({
    buffers: cheekBuffers,
    localTransform: {
      position: [-0.95, -0.6, -0.1],
      rotation: [0.75, 0.16, -0.4],
      scale: [0.6, 0.95, 1.8],
    },
    color: kingdraBlue,
  });
  head.addChild(leftCheek);

  // 4a. LEFT CHEEK COVER (Child of Left Cheek) - ellipsoid to cover the top opening of the the cheek paraboloid
  const leftCheekCover = new SceneNode({
    buffers: ellipsoidBuffers,
    localTransform: {
      position: [0.0, 0.6, 0.0],
      rotation: [0.0, 0.0, 0.0],
      scale: [0.5, 0.4, 0.5],
    },
    color: kingdraBlue,
  });
  leftCheek.addChild(leftCheekCover);

  // 4b. LEFT FIN (Child of Left Cheek) - hyperboloid fin attached to back of cheek
    const leftFin = new SceneNode({
        buffers: hyperboloidBuffers,
        localTransform: {

            position: [0.1, 0.6, -0.5], 
            rotation: [1.4, 0.3, -0.8],
            scale: [0.05, 0.8, 0.75] 
        },
        color: kingdraBlue,
    });
    leftCheek.addChild(leftFin);

  // 5. RIGHT CHEEK (Child of Head) - paraboloid on right side of head
  const rightCheek = new SceneNode({
    buffers: cheekBuffers,
    localTransform: {
      position: [0.95, -0.6, -0.1],
      rotation: [0.75, -0.16, 0.4],
      scale: [0.6, 0.95, 1.8],
    },
    color: kingdraBlue,
  });
  head.addChild(rightCheek);

  // 5a. RIGHT CHEEK COVER (Child of Right Cheek) - ellipsoid to cover the top opening of the the cheek paraboloid
  const rightCheekCover = new SceneNode({
    buffers: ellipsoidBuffers,
    localTransform: {
      position: [0.0, 0.6, 0.0],
      rotation: [0.0, 0.0, 0.0],
      scale: [0.5, 0.4, 0.5],
    },
    color: kingdraBlue,
  });
  rightCheek.addChild(rightCheekCover);

  // 5b. RIGHT FIN (Child of Right Cheek) - hyperboloid fin attached to back of cheek
  const rightFin = new SceneNode({
      buffers: hyperboloidBuffers,
      localTransform: {

          position: [-0.1, 0.6, -0.5], 
          rotation: [1.4, -0.3, 0.8],
          scale: [0.05, 0.8, 0.75] 
      },
      color: kingdraBlue,
  });
  rightCheek.addChild(rightFin);

  // 6. NOSE (Child of Head) - paraboloid at front of head
  const leftNose = new SceneNode({
    buffers: cheekBuffers,
    localTransform: {
      position: [-0.62, -1.15, 0.9],
      rotation: [0.55, 0.46, -0.5],
      scale: [0.4, 0.65, 1.2],
    },
    color: kingdraBlue,
  });
  head.addChild(leftNose);

  // 6a. LEFT NOSE COVER (Child of Left Nose) - ellipsoid to cover the top opening of the the nose paraboloid
  const leftNoseCover = new SceneNode({
    buffers: ellipsoidBuffers,
    localTransform: {
      position: [0.0, 0.6, 0.0],
      rotation: [0.0, 0.0, 0.0],
      scale: [0.5, 0.4, 0.5],
    },
    color: kingdraBlue,
  });
  leftNose.addChild(leftNoseCover);

  // 7. NOSE (Child of Head) - paraboloid at front of head
  const rightNose = new SceneNode({
    buffers: cheekBuffers,
    localTransform: {
      position: [0.62, -1.15, 0.9],
      rotation: [0.55, -0.46, 0.5],
      scale: [0.4, 0.65, 1.2],
    },
    color: kingdraBlue,
  });
  head.addChild(rightNose);

  // 7a. RIGHT NOSE COVER (Child of Right Nose) - ellipsoid to cover the top opening of the the nose paraboloid
  const rightNoseCover = new SceneNode({
    buffers: ellipsoidBuffers,
    localTransform: {
      position: [0.0, 0.6, 0.0],
      rotation: [0.0, 0.0, 0.0],
      scale: [0.5, 0.4, 0.5],
    },
    color: kingdraBlue,
  });
  rightNose.addChild(rightNoseCover);

  // 8. BLOWHOLE (Child of Head) - blowhole on nose
  const blowhole = new SceneNode({
    buffers: dropletBuffers,
    localTransform: {
      position: [0.0, -0.4, 0.5],
      rotation: [2.2, 0.0, 0.0],
      scale: [1.6, 1.8, 1.3],
    },
    color: kingdraBlue,
  });
  head.addChild(blowhole);

  // 8a. NOSE HOLE (Child of Blowhole) - small black ellipsoid to represent blowhole insides
  const noseHole = new SceneNode({
    buffers: ellipsoidBuffers,
    localTransform: {
      position: [0.0, 1.05, 0.0],
      rotation: [0.0, 0.0, 0.0],
      scale: [0.1, 0.1, 0.1],
    },
    color: [0,0,0,0.8],
  });
  blowhole.addChild(noseHole);

  // 9. CRANIUM (Child of Head) - half-ellipsoid on top of head (for definition)
  const cranium = new SceneNode({
    buffers: craniumBuffers,
    localTransform: {
      position: [0.0, -0.25, 0.07],
      rotation: [-0.9, 0.0, 0.0],
      scale: [1.1, 2.0, 1.3],
    },
    color: kingdraBlue,
  });
  head.addChild(cranium);


  // 10. HORNS (Child of Head) - 2 main horns with curvy extensions
  const hornAssembly = new SceneNode({
      localTransform: {
          position: [0.0, 0.7, -0.2],
          rotation: [0.2, 0.0, 0.0],
          scale: [1.0, 1.0, 1.0],
      },
  });
  head.addChild(hornAssembly);

  // 10a. MAIN LEFT HORN - upright horn base
  const mainLeftHorn = new SceneNode({
      buffers: cylinderBuffers,
      localTransform: {
          position: [-0.3, 0.0, 0.5],
          rotation: [0.3, 0.0, 0.1],
          scale: [0.2, 1.5, 0.2]
      },
      color: kingdraBlue,
  });
  hornAssembly.addChild(mainLeftHorn);

  // 10b. MAIN RIGHT HORN - upright horn base
  const mainRightHorn = new SceneNode({
      buffers: cylinderBuffers,
      localTransform: {
          position: [0.3, 0.0, 0.5],
          rotation: [0.3, 0.0, -0.1],
          scale: [0.2, 1.5, 0.2]
      },
      color: kingdraBlue,
  });
  hornAssembly.addChild(mainRightHorn);

  // 10c. CURVY LEFT HORN (5 Segments) - curvy horn extension
  // segment 1 - straight
  const curvyLeftHorn1 = new SceneNode({
      buffers: cylinderBuffers,
      localTransform: {
          position: [-0.0, 0.6, -2.0],
          rotation: [1.6, 0.0, 0.0],
          scale: [1.0, 2.0, 0.15]
      },
      color: kingdraBlue,
  });
  mainLeftHorn.addChild(curvyLeftHorn1);

  // segment 2 - curve
  const curvyLeftHorn2 = new SceneNode({
      buffers: cylinderBuffers,
      localTransform: {
          position: [-0.0, 0.475, -3.7],
          rotation: [1.5, 0.0, 0.0],
          scale: [1.0, 1.8, 0.15]
      },
      color: kingdraBlue,
  });
  mainLeftHorn.addChild(curvyLeftHorn2);

  // segment 3 - straight
  const curvyLeftHorn3 = new SceneNode({
      buffers: cylinderBuffers,
      localTransform: {
          position: [-0.0, 0.53, -5.4],
          rotation: [1.6, 0.0, 0.0],
          scale: [1.0, 1.8, 0.15]   
      },
      color: kingdraBlue,
  });
  mainLeftHorn.addChild(curvyLeftHorn3);

  // segment 4 - curve
  const curvyLeftHorn4 = new SceneNode({
      buffers: cylinderBuffers,
      localTransform: {
          position: [-0.0, 0.53, -5.4],
          rotation: [-1.45, 0.0, 0.0],
          scale: [1.0, 1.0, 0.15]   
      },
      color: kingdraBlue,
  });
  mainLeftHorn.addChild(curvyLeftHorn4);

  // segment 5 - straight
  const curvyLeftHorn5 = new SceneNode({
      buffers: cylinderBuffers,
      localTransform: {
          position: [-0.0, 0.71, -8.2],
          rotation: [1.6, 0.0, 0.0],
          scale: [1.0, 1.8, 0.145]
      },
      color: kingdraBlue,
  });
  mainLeftHorn.addChild(curvyLeftHorn5);

  // 10d. CURVY RIGHT HORN (5 Segments) - curvy horn extension
  // segment 1 - straight
  const curvyRightHorn1 = new SceneNode({
      buffers: cylinderBuffers,
      localTransform: {
          position: [-0.0, 0.6, -2.0],
          rotation: [1.6, 0.0, 0.0],
          scale: [1.0, 2.0, 0.15]     
      },
      color: kingdraBlue,
  });
  mainRightHorn.addChild(curvyRightHorn1);

  // segment 2 - curve
  const curvyRightHorn2 = new SceneNode({
      buffers: cylinderBuffers,
      localTransform: {
          position: [-0.0, 0.475, -3.7],
          rotation: [1.5, 0.0, 0.0],
          scale: [1.0, 1.8, 0.15]   
      },
      color: kingdraBlue,
  });
  mainRightHorn.addChild(curvyRightHorn2);

  // segment 3 - straight
  const curvyRightHorn3 = new SceneNode({
      buffers: cylinderBuffers,
      localTransform: {
          position: [-0.0, 0.53, -5.4],
          rotation: [1.6, 0.0, 0.0],
          scale: [1.0, 1.8, 0.15]  
      },
      color: kingdraBlue,
  });
  mainRightHorn.addChild(curvyRightHorn3);

  // segment 4 - curve
  const curvyRightHorn4 = new SceneNode({
      buffers: cylinderBuffers,
      localTransform: {
          position: [-0.0, 0.53, -5.4],
          rotation: [-1.45, 0.0, 0.0],
          scale: [1.0, 1.0, 0.15]   
      },
      color: kingdraBlue,
  });
  mainRightHorn.addChild(curvyRightHorn4);

  const curvyRightHorn5 = new SceneNode({
      buffers: cylinderBuffers,
      localTransform: {
          position: [-0.0, 0.71, -8.2],
          rotation: [1.6, 0.0, 0.0],
          scale: [1.0, 1.8, 0.145]
      },
      color: kingdraBlue,
  });
  mainRightHorn.addChild(curvyRightHorn5);


  // 11. BACK FINS (Child of Body) - fin structure of cyllinders at back of body
  const backFinAssembly = new SceneNode({
    localTransform: {
      position: [0.0, 0.4, -1.2],
      rotation: [0.2, 0.0, 0.0],
      scale: [0.8, 0.8, 0.8],
    },
  });
  body.addChild(backFinAssembly);

  // 11a. BOTTOM SEGMENT (4 cylinders) 
  const finBottom1 = new SceneNode({
    buffers: cylinderBuffers,
    localTransform: {
      position: [0.0, -0.2, 0.15],
      rotation: [1.0, 0.0, 0.0],
      scale: [0.15, 0.8, 0.15],
    },
    color: kingdraBlue,
  });
  backFinAssembly.addChild(finBottom1);

  const finBottom2 = new SceneNode({
    buffers: cylinderBuffers,
    localTransform: {
      position: [0.0, -0.65, -0.85],
      rotation: [1.15, 0.0, 0.0],
      scale: [0.15, 1.1, 0.15],
    },
    color: kingdraBlue,
  });
  backFinAssembly.addChild(finBottom2);

  const finBottom3 = new SceneNode({
    buffers: cylinderBuffers,
    localTransform: {
      position: [0.0, -0.9, -1.12],
      rotation: [0.85, 0.0, 0.0],
      scale: [0.15, 0.4, 0.15],
    },
    color: kingdraBlue,
  });
  backFinAssembly.addChild(finBottom3);

  const finBottom4 = new SceneNode({
    buffers: cylinderBuffers,
    localTransform: {
      position: [0.0, -1.35, -1.3],
      rotation: [0.4, 0.0, 0.0],
      scale: [0.15, 0.5, 0.15],
    },
    color: kingdraBlue,
  });
  backFinAssembly.addChild(finBottom4);

  // 11b. TOP SEGMENT (4 cylinders)
  const finTop1 = new SceneNode({
    buffers: cylinderBuffers,
    localTransform: {
      position: [0.0, 0.25, 0.45],
      rotation: [-1.3, 0.0, 0.0],
      scale: [0.15, 0.8, 0.15],
    },
    color: kingdraBlue,
  });
  backFinAssembly.addChild(finTop1);

  const finTop2 = new SceneNode({
    buffers: cylinderBuffers,
    localTransform: {
      position: [0.0, 0.45, -0.28],
      rotation: [-1.4, 0.0, 0.0],
      scale: [0.15, 0.8, 0.15],
    },
    color: kingdraBlue,
  });
  backFinAssembly.addChild(finTop2);

  const finTop3 = new SceneNode({
    buffers: cylinderBuffers,
    localTransform: {
      position: [0.0, 0.575, -1.05],
      rotation: [-1.65, 0.0, 0.0],
      scale: [0.15, 0.6, 0.15],
    },
    color: kingdraBlue,
  });
  backFinAssembly.addChild(finTop3);

  const finTop4 = new SceneNode({
    buffers: cylinderBuffers,
    localTransform: {
      position: [0.0, 0.55, -1.48],
      rotation: [-1.7, 0.0, 0.0],
      scale: [0.15, 1.0, 0.15],
    },
    color: kingdraBlue,
  });
  backFinAssembly.addChild(finTop4); 

  // 11c. UPPER SEGMENT (3 cylinders) - top of top segment
  const finUpper1 = new SceneNode({
    buffers: cylinderBuffers,
    localTransform: {
      position: [0.0, 0.55, -1.08],
      rotation: [-0.3, 0.0, 0.0],
      scale: [0.15, 0.25, 0.15],
    },
    color: kingdraBlue,
  });
  backFinAssembly.addChild(finUpper1);

  const finUpper2 = new SceneNode({
    buffers: cylinderBuffers,
    localTransform: {
      position: [0.0, 0.75, -1.11],
      rotation: [-1.3, 0.0, 0.0],
      scale: [0.15, 0.4, 0.15],
    },
    color: kingdraBlue,
  });
  backFinAssembly.addChild(finUpper2);

  const finUpper3 = new SceneNode({
    buffers: cylinderBuffers,
    localTransform: {
      position: [0.0, 0.85, -1.45],
      rotation: [-1.7, 0.0, 0.0],
      scale: [0.15, 0.8, 0.15],
    },
    color: kingdraBlue,
  });
  backFinAssembly.addChild(finUpper3);

  // 12. TAIL (Child of Body) - segmented curling tail
  const tailAssembly = new SceneNode({
      localTransform: {
          position: [0.0, -0.3, 0.1],
          rotation: [-3.0, -1.55, 0.0],
          scale: [1.0, 1.0, 1.0],
      },
  });
  body.addChild(tailAssembly);

  const numTailSegments = 8;
  let currentTailSegment = tailAssembly;
  const initialTailScale = [0.8, 0.9, 0.6];
  const segmentLengthFactor = 0.8;
  const curlPerSegment = 0.66;
  const taperFactor = 0.99;

  for (let i = 1; i <= numTailSegments; i++) {
      const scaleMultiplier = Math.pow(taperFactor, i + 1);
      const currentScale = [
          initialTailScale[0] * scaleMultiplier + (0.00 * i),
          initialTailScale[1] * scaleMultiplier,
          initialTailScale[2] * scaleMultiplier + (0.07 * i)
      ];

      const parentYRadius = (i === 1) ? 0 : currentTailSegment.localTransform.scale[1] * 0.5;
      const currentYRadius = currentScale[1] * 0.5;

      const segment = new SceneNode({
          buffers: ellipsoidBuffers,
          localTransform: {
              position: [0.0, (parentYRadius + currentYRadius) * segmentLengthFactor, 0.0],
              rotation: [0.0, 0.0, curlPerSegment],
              scale: currentScale
          },
          color: kingdraBlue,
      });

      currentTailSegment.addChild(segment);
      currentTailSegment = segment;
  }


  // 13. FEATHERS (Child of Head) - feather fins on back of cheeks
  const featherLength = 1.2;
  const leftPivotPos = [-0.84, -0.1, -0.3];
  const leftPivotRot = [0.0, 1.8, -1.7];
  const rightPivotPos = [0.84, -0.1, -0.3];
  const rightPivotRot = [0.0, -1.8, 1.7];

  const leftFeatherPivot = new SceneNode({
      localTransform: {
          position: leftPivotPos,
          rotation: leftPivotRot,
          scale: [1.0, 1.0, 1.0]
      },
  });
  head.addChild(leftFeatherPivot);

  const leftHeadFeather = new SceneNode({
      buffers: featherFinBuffers,
      localTransform: {
          position: [0, featherLength / 2, 0],
          rotation: [0, 0, 0],
          scale: [0.7, 0.9, 1.0]
      },
      color: kingdraFinWhite,
  });
  leftFeatherPivot.addChild(leftHeadFeather);

const rightFeatherPivot = new SceneNode({
        localTransform: {
            position: rightPivotPos,
            rotation: rightPivotRot,
            scale: [1.0, 1.0, 1.0]
        },
    });
    head.addChild(rightFeatherPivot);

  const rightHeadFeather = new SceneNode({
      buffers: featherFinBuffers,
      localTransform: {
          position: [0, featherLength / 2, 0],
          rotation: [0, 0, 0],
          scale: [0.7, 0.9, 1.0]
      },
      color: kingdraFinWhite,
  });
  rightFeatherPivot.addChild(rightHeadFeather);

  // 14. BACK FEATHERS (Child of Back Fin Assembly) - feather fins on back fin assembly
  const wing1 = new SceneNode({
      buffers: featherFinBuffers,
      localTransform: {
          position: [0.0, 0.2, -0.7],
          rotation: [0.0, -1.6, -1.8],
          scale: [1.3, 2.1, 1.2]
      },
      color: kingdraFinWhite,
  });
  backFinAssembly.addChild(wing1);


  const wing2 = new SceneNode({
      buffers: featherFinBuffers,
      localTransform: {
          position: [0.0, -0.25, -0.66],
          rotation: [0.0, -1.6, -1.5],
          scale: [0.9, 1.2, 1.0]
      },
      color: kingdraFinWhite,
  });
  backFinAssembly.addChild(wing2);

  const wing3 = new SceneNode({
      buffers: featherFinBuffers,
      localTransform: {
          position: [0.0, -0.0, -0.0],
          rotation: [-0.2, -1.6, -1.2],
          scale: [0.9, 0.9, 1.0]
      },
      color: kingdraFinWhite,
  });
  backFinAssembly.addChild(wing3);

  const wingEdge1 = new SceneNode({
      buffers: ellipsoidBuffers,
      localTransform: {
          position: [0.0, 0.25, -1.4],
          rotation: [0.2, -0.0, -0.0],
          scale: [0.03, 0.3, 0.8]
      },
      color: kingdraFinWhite,
  });
  backFinAssembly.addChild(wingEdge1);

  const wingEdge2 = new SceneNode({
      buffers: ellipsoidBuffers,
      localTransform: {
          position: [0.0, -0.05, -1.2],
          rotation: [-2.1, -0.0, -0.0],
          scale: [0.03, 0.3, 0.4]
      },
      color: kingdraFinWhite,
  });
  backFinAssembly.addChild(wingEdge2);


  // 15. BELLY PLATE (Child of Body) - yellow belly plate on front of body
  const bellyPlate = new SceneNode({
      buffers: bellyPlateBuffers,
      localTransform: {
          position: [0.0, 0.06, 0.04],
          rotation: [0.0, -1.5, 0.0],
          scale: [1.01, 0.96, 0.8]
      },
      color: kingdraYellow,
  });
  body.addChild(bellyPlate);


  // 16. EYES (Child of Head) - layered eye structure
  // 16a. LEFT EYE ASSEMBLY - white, red, black pupils
  const leftEyeAssembly = new SceneNode({
      localTransform: {
          position: [-0.83, -0.45, 0.85], 
          rotation: [1, 3.3, 0.2],
          scale: [0.1, 1.0, 1.0]
      }
  });
  head.addChild(leftEyeAssembly);

  const leftEyeWhiteNode = new SceneNode({
      buffers: eyeBuffers,
      localTransform: {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [0.6, 0.6, 0.6]
      },
      color: eyeWhite
  });
  leftEyeAssembly.addChild(leftEyeWhiteNode);

  const leftEyeRedNode = new SceneNode({
      buffers: eyeBuffers,
      localTransform: {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [0.6 * 0.8, 0.6 * 0.8, 0.6 * 0.8]
      },
      color: eyeRed
  });
  leftEyeAssembly.addChild(leftEyeRedNode);

  const leftEyeBlackNode = new SceneNode({
      buffers: eyeBuffers,
      localTransform: {
          position: [0, 0, 0.02],
          rotation: [0, 0, 0],
          scale: [0.7 * 0.8, 0.7 * 0.8, 0.7 * 0.8]
      },
      color: eyeBlack
  });
  leftEyeRedNode.addChild(leftEyeBlackNode);


  // 16b. RIGHT EYE ASSEMBLY - white, red, black pupils
  const rightEyeAssembly = new SceneNode({
      localTransform: {
          position: [0.83, -0.45, 0.85],
          rotation: [1, -3.3, -0.2],
          scale: [0.1, 1.0, 1.0]
      }
  });
  head.addChild(rightEyeAssembly);

  const rightEyeWhiteNode = new SceneNode({
      buffers: eyeBuffers,
      localTransform: {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [0.6, 0.6, 0.6]
      },
      color: eyeWhite
  });
  rightEyeAssembly.addChild(rightEyeWhiteNode);

  const rightEyeRedNode = new SceneNode({
      buffers: eyeBuffers,
      localTransform: {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [0.6 * 0.8, 0.6 * 0.8, 0.6 * 0.8]
      },
      color: eyeRed
  });
  rightEyeAssembly.addChild(rightEyeRedNode);

  const rightEyeBlackNode = new SceneNode({
      buffers: eyeBuffers,
      localTransform: {
          position: [0, 0, 0.02],
          rotation: [0, 0, 0],
          scale: [0.7 * 0.8, 0.7 * 0.8, 0.7 * 0.8]
      },
      color: eyeBlack
  });
  rightEyeRedNode.addChild(rightEyeBlackNode);

  // animaition setup variables
  const initialRootPosition = [...root.localTransform.position];
  const initialBodyRotationX = body.localTransform.rotation[0];
  const tailRotationForward = -3.0;
  const tailRotationBackward = -2.0;
  const initialLeftPivotRotY = leftFeatherPivot.localTransform.rotation[1];
  const initialLeftPivotRotZ = leftFeatherPivot.localTransform.rotation[2];
  const initialRightPivotRotY = rightFeatherPivot.localTransform.rotation[1];
  const initialRightPivotRotZ = rightFeatherPivot.localTransform.rotation[2];
  const initialBackFinRotY = backFinAssembly.localTransform.rotation[1];
  const initialEyeScale = [...leftEyeAssembly.localTransform.scale];
    
  const featherFlapAmplitude = 0.15;
  const featherYawAmplitude = 0.2; 
  const backFinSwayAmplitude = 0.4;
  const backFinSwaySpeedFactor = 1.5;
  const blinkInterval = 2.0;
  const blinkDuration = 0.2;
  const blinkTransition = 0.1;

  // camera controls
  let isDragging = false;
  let previousMousePosition = {x: 0, y: 0};
  let cameraRotation = {x: 0.35, y: 0.8};
  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    previousMousePosition = {x: e.clientX, y: e.clientY};
  });
  canvas.addEventListener("mouseup", () => {
    isDragging = false;
  });
  canvas.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;
    cameraRotation.y += deltaX * 0.01;
    cameraRotation.x += deltaY * 0.01;
    cameraRotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, cameraRotation.x)
    );
    previousMousePosition = {x: e.clientX, y: e.clientY};
  });

  function renderNode(node, parentWorldMatrix, viewMatrix) {
    const worldMatrix = node.getWorldMatrix(parentWorldMatrix);

    if (node.buffers) {
      const modelViewMatrix = mat4.create();
      mat4.multiply(modelViewMatrix, viewMatrix, worldMatrix);

      gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
      );

      const normalMatrix = mat4.create();
      mat4.invert(normalMatrix, modelViewMatrix);
      mat4.transpose(normalMatrix, normalMatrix);
      gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix
      );

      gl.uniform4fv(programInfo.uniformLocations.objectColor, node.color);

      gl.bindBuffer(gl.ARRAY_BUFFER, node.buffers.position);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        3,
        gl.FLOAT,
        false,
        0,
        0
      );
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

      gl.bindBuffer(gl.ARRAY_BUFFER, node.buffers.normal);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        3,
        gl.FLOAT,
        false,
        0,
        0
      );
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, node.buffers.indices);
      gl.drawElements(
        gl.TRIANGLES,
        node.buffers.vertexCount,
        gl.UNSIGNED_SHORT,
        0
      );
    }

    node.children.forEach((child) =>
      renderNode(child, worldMatrix, viewMatrix)
    );
  }

  function render(now) {
    now *= 0.001;

    // animation parameters
    const swimSpeed = 0.8;
    const swimAmplitudeY = 0.2;
    const swimAmplitudeZ = 0.3;
    const bodyRotationAmplitude = 0.3;
    const featherFlapSpeed = 3.0;
    const backFinSwaySpeed = swimSpeed * backFinSwaySpeedFactor;

    // cycle values
    const swimCycleValue = Math.sin(now * swimSpeed * 2 * Math.PI);
    const featherCycleValue = Math.sin(now * featherFlapSpeed * 2 * Math.PI);
    const backFinCycleValue = Math.sin(now * backFinSwaySpeed * 2 * Math.PI);
    // pos offsets
    const offsetY = (Math.cos(now * swimSpeed * 2 * Math.PI) * swimAmplitudeY);
    const offsetZ = swimCycleValue * swimAmplitudeZ;

    // body rotation
    const rotationAmount = (swimCycleValue + 1) / 2;
    const currentBodyRotationX = initialBodyRotationX - (rotationAmount * bodyRotationAmplitude);

    // tail rotation
    const currentTailRotationX = tailRotationBackward * (1 - rotationAmount) + tailRotationForward * rotationAmount;

    // head feather pivot rotation - arbitrary rotation between z and y axis
    const currentLeftPivotRotZ = initialLeftPivotRotZ + featherCycleValue * featherFlapAmplitude;
    const currentRightPivotRotZ = initialRightPivotRotZ - featherCycleValue * featherFlapAmplitude;
    const currentLeftPivotRotY = initialLeftPivotRotY - featherCycleValue * featherYawAmplitude;
    const currentRightPivotRotY = initialRightPivotRotY + featherCycleValue * featherYawAmplitude;
    const currentBackFinRotY = initialBackFinRotY + backFinCycleValue * backFinSwayAmplitude;

    // eyes scale
    let currentEyeScaleY = initialEyeScale[1];
        const timeInBlinkCycle = now % blinkInterval;

        if (timeInBlinkCycle < blinkTransition) {
            const t = timeInBlinkCycle / blinkTransition;
            const scaleFactor = Math.cos(t * Math.PI / 2);
            currentEyeScaleY = initialEyeScale[1] * scaleFactor;
        } else if (timeInBlinkCycle < blinkTransition + blinkDuration) {
            currentEyeScaleY = 0.01;
        } else if (timeInBlinkCycle < blinkTransition * 2 + blinkDuration) {
            const t = (timeInBlinkCycle - (blinkTransition + blinkDuration)) / blinkTransition; // 0 to 1
            const scaleFactor = Math.sin(t * Math.PI / 2);
            currentEyeScaleY = initialEyeScale[1] * scaleFactor;
        }
        currentEyeScaleY = Math.max(0.01, currentEyeScaleY)

    // apply transformations
    root.localTransform.position[1] = initialRootPosition[1] + offsetY;
    root.localTransform.position[2] = initialRootPosition[2] + offsetZ;
    body.localTransform.rotation[0] = currentBodyRotationX;
    tailAssembly.localTransform.rotation[0] = currentTailRotationX;
    leftFeatherPivot.localTransform.rotation[1] = currentLeftPivotRotY;
    leftFeatherPivot.localTransform.rotation[2] = currentLeftPivotRotZ;
    rightFeatherPivot.localTransform.rotation[1] = currentRightPivotRotY;
    rightFeatherPivot.localTransform.rotation[2] = currentRightPivotRotZ;
    backFinAssembly.localTransform.rotation[1] = currentBackFinRotY;
    leftEyeAssembly.localTransform.scale[1] = currentEyeScaleY;
    rightEyeAssembly.localTransform.scale[1] = currentEyeScaleY;

    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.55, 0.85, 1.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, 0.1, 100.0);

    const viewMatrix = mat4.create();
    const cameraPosition = [0.0, 0.0, 12.0];
    mat4.translate(viewMatrix, viewMatrix, [
      0.0,
      -cameraPosition[1],
      -cameraPosition[2],
    ]);
    mat4.rotate(viewMatrix, viewMatrix, cameraRotation.x, [1, 0, 0]);
    mat4.rotate(viewMatrix, viewMatrix, cameraRotation.y, [0, 1, 0]);

    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );
    gl.uniform3fv(programInfo.uniformLocations.lightPosition, [5.0, 4.0, 7.0]);
    gl.uniform3fv(programInfo.uniformLocations.viewPosition, cameraPosition);

    renderNode(root, null, viewMatrix);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

// helper functions
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram)
    );
    return null;
  }
  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function resizeCanvasToDisplaySize(canvas) {
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    return true;
  }
  return false;
}

function initBuffers(gl, geometry, usage = gl.STATIC_DRAW) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.vertices), usage);

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals), usage);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(geometry.indices),
    gl.STATIC_DRAW
  );

  return {
    position: positionBuffer,
    normal: normalBuffer,
    indices: indexBuffer,
    vertexCount: geometry.indices.length,
  };
}

function createEllipsoid(rx, ry, rz, segments = 32, stacks = 24) {
  const vertices = [],
    normals = [],
    indices = [];

  for (let i = 0; i <= stacks; i++) {
    const theta = (i * Math.PI) / stacks;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let j = 0; j <= segments; j++) {
      const phi = (j * 2 * Math.PI) / segments;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = rx * cosPhi * sinTheta;
      const y = ry * cosTheta;
      const z = rz * sinPhi * sinTheta;

      vertices.push(x, y, z);
      const nx = x / rx;
      const ny = y / ry;
      const nz = z / rz;
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

  return {vertices, normals, indices};
}

function createHyperboloidOneSheet(a, b, c, height, segments, stacks) {
  const vertices = [],
    normals = [],
    indices = [];
  // const halfHeight = height / 2;

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

  return {vertices, normals, indices};
}

function createEllipticParaboloid(a, b, c, segments = 32, stacks = 16) {
  const vertices = [],
    normals = [],
    indices = [];

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
  return {vertices, normals, indices};
}

function createCurvedDropletHead(baseRadius, height, taper = 0.6, segments = 32, stacks = 24) {
  const vertices = [];
  const normals = [];
  const indices = [];

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

  return { vertices, normals, indices };
}

function createVerticalHalfEllipsoid(rx, ry, rz, segments = 32, stacks = 24) {
  const vertices = [];
  const normals = [];
  const indices = [];

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

  return { vertices, normals, indices };
}

function createCylinder(radius, height, segments = 16) {
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

    return { vertices, normals, indices };
}


function createFeatherFin(length = 2.0, maxWidth = 0.5, thickness = 0.05, segments = 16) {
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


    return { vertices, normals, indices };
}

function createBellyPlate(rx, ry, rz, phiCenter, phiRadius, thetaCenter, thetaRadius, segments = 16, stacks = 12, surfaceOffset = 0.02) {
    const vertices = [], normals = [], indices = [];
    const vertexMap = new Map();

    for (let i = 0; i <= stacks; i++) {
        const v = i / stacks;
        // const thetaAngleOffset = Math.sin(v * Math.PI) * thetaRadius;
        // const theta = thetaCenter + thetaAngleOffset * Math.sign(v - 0.5) ;
        const thetaDist = (v - 0.5) * 2;
        const maxPhiScaleFactor = Math.sqrt(1.0 - thetaDist * thetaDist);
        const currentTheta = thetaCenter + thetaDist * thetaRadius;
        const sinCurrentTheta = Math.sin(currentTheta);
        const cosCurrentTheta = Math.cos(currentTheta);

        for (let j = 0; j <= segments; j++) {
            const u = j / segments;
            const phiDist = (u - 0.5) * 2;
            // const ovalScalePhi = Math.sqrt(Math.max(0, 1.0 - thetaDist * thetaDist));
            // const ovalScaleTheta = Math.sqrt(Math.max(0, 1.0 - phiDist * phiDist));
            // const currentPhi = phiCenter + phiDist * phiRadius * ovalScalePhi;
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

    return { vertices, normals, indices };
}

function createEyeShape(length = 1.0, maxRadius = 0.3, capRatio = 0.2, sharpness = 2.0, segments = 16, stacks = 12) {
    const vertices = [], normals = [], indices = [];
    const bodyLength = length * (1.0 - capRatio);
    // const capLength = length * capRatio;
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


    return { vertices, normals, indices };
}

// mat4 functions
const mat4 = {
    create: () => { const out = new Float32Array(16); out[0] = 1; out[5] = 1; out[10] = 1; out[15] = 1; return out; },
    perspective: (out, fovy, aspect, near, far) => { const f = 1.0 / Math.tan(fovy / 2); out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0; out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0; out[8] = 0; out[9] = 0; out[11] = -1; out[12] = 0; out[13] = 0; out[15] = 0; if (far != null && far !== Infinity) { const nf = 1 / (near - far); out[10] = (far + near) * nf; out[14] = (2 * far * near) * nf; } else { out[10] = -1; out[14] = -2 * near; } return out; },
    translate: (out, a, v) => { const x = v[0], y = v[1], z = v[2]; if (a === out) { out[12] = a[0] * x + a[4] * y + a[8] * z + a[12]; out[13] = a[1] * x + a[5] * y + a[9] * z + a[13]; out[14] = a[2] * x + a[6] * y + a[10] * z + a[14]; out[15] = a[3] * x + a[7] * y + a[11] * z + a[15]; } else { out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3]; out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7]; out[8] = a[8]; out[9] = a[9]; out[10] = a[10]; out[11] = a[11]; out[12] = a[0] * x + a[4] * y + a[8] * z + a[12]; out[13] = a[1] * x + a[5] * y + a[9] * z + a[13]; out[14] = a[2] * x + a[6] * y + a[10] * z + a[14]; out[15] = a[3] * x + a[7] * y + a[11] * z + a[15]; } return out; },
    rotate: (out, a, rad, axis) => { let x = axis[0], y = axis[1], z = axis[2]; let len = Math.hypot(x, y, z); if (len < 0.000001) { return null; } len = 1 / len; x *= len; y *= len; z *= len; const s = Math.sin(rad); const c = Math.cos(rad); const t = 1 - c; const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]; const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]; const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]; const b00 = x * x * t + c, b01 = y * x * t + z * s, b02 = z * x * t - y * s; const b10 = x * y * t - z * s, b11 = y * y * t + c, b12 = z * y * t + x * s; const b20 = x * z * t + y * s, b21 = y * z * t - x * s, b22 = z * z * t + c; out[0] = a00 * b00 + a10 * b01 + a20 * b02; out[1] = a01 * b00 + a11 * b01 + a21 * b02; out[2] = a02 * b00 + a12 * b01 + a22 * b02; out[3] = a03 * b00 + a13 * b01 + a23 * b02; out[4] = a00 * b10 + a10 * b11 + a20 * b12; out[5] = a01 * b10 + a11 * b11 + a21 * b12; out[6] = a02 * b10 + a12 * b11 + a22 * b12; out[7] = a03 * b10 + a13 * b11 + a23 * b12; out[8] = a00 * b20 + a10 * b21 + a20 * b22; out[9] = a01 * b20 + a11 * b21 + a21 * b22; out[10] = a02 * b20 + a12 * b21 + a22 * b22; out[11] = a03 * b20 + a13 * b21 + a23 * b22; if (a !== out) { out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15]; } return out; },
    scale: (out, a, v) => { const x = v[0], y = v[1], z = v[2]; out[0] = a[0] * x; out[1] = a[1] * x; out[2] = a[2] * x; out[3] = a[3] * x; out[4] = a[4] * y; out[5] = a[5] * y; out[6] = a[6] * y; out[7] = a[7] * y; out[8] = a[8] * z; out[9] = a[9] * z; out[10] = a[10] * z; out[11] = a[11] * z; out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15]; return out; },
    multiply: (out, a, b) => { const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]; const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]; const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]; const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]; let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3]; out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30; out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31; out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32; out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33; b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7]; out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30; out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31; out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32; out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33; b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11]; out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30; out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31; out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32; out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33; b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15]; out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30; out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31; out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32; out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33; return out; },
    invert: (out, a) => { const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]; const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]; const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]; const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]; const b00 = a00 * a11 - a01 * a10; const b01 = a00 * a12 - a02 * a10; const b02 = a00 * a13 - a03 * a10; const b03 = a01 * a12 - a02 * a11; const b04 = a01 * a13 - a03 * a11; const b05 = a02 * a13 - a03 * a12; const b06 = a20 * a31 - a21 * a30; const b07 = a20 * a32 - a22 * a30; const b08 = a20 * a33 - a23 * a30; const b09 = a21 * a32 - a22 * a31; const b10 = a21 * a33 - a23 * a31; const b11 = a22 * a33 - a23 * a32; let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06; if (!det) { return null; } det = 1.0 / det; out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det; out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det; out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det; out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det; out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det; out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det; out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det; out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det; out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det; out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det; out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det; out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det; out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det; out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det; out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det; out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det; return out; },
    transpose: (out, a) => { if (out === a) { const a01 = a[1], a02 = a[2], a03 = a[3]; const a12 = a[6], a13 = a[7]; const a23 = a[11]; out[1] = a[4]; out[2] = a[8]; out[3] = a[12]; out[4] = a01; out[6] = a[9]; out[7] = a[13]; out[8] = a02; out[9] = a12; out[11] = a[14]; out[12] = a03; out[13] = a13; out[14] = a23; } else { out[0] = a[0]; out[1] = a[4]; out[2] = a[8]; out[3] = a[12]; out[4] = a[1]; out[5] = a[5]; out[6] = a[9]; out[7] = a[13]; out[8] = a[2]; out[9] = a[6]; out[10] = a[10]; out[11] = a[14]; out[12] = a[3]; out[13] = a[7]; out[14] = a[11]; out[15] = a[15]; } return out; }

};

window.onload = main;
