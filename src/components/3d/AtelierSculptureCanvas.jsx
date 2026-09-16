import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Procedural fluted couture gown skirt generator.
 * Creates an architectural trumpet / mermaid silhouette with deep sculptural pleats,
 * asymmetrical bias draping, and realistic textile folds.
 */
function createCoutureSkirtGeometry(
  heightSegments = 64,
  radialSegments = 64,
  yTop = -0.16,
  yBottom = -2.85,
  rTop = 0.70,
  rHip = 1.10,
  rKnee = 0.94,
  rHem = 2.15
) {
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= heightSegments; i++) {
    const v = i / heightSegments; // 0 at waist, 1 at hem
    const y = yTop + (yBottom - yTop) * v;

    // Sculpted couture silhouette interpolation: fitted waist -> hip flare -> mermaid pinch -> dramatic fluted flare
    let rBase;
    if (v < 0.28) {
      // Waist to high hip
      const t = v / 0.28;
      rBase = rTop + (rHip - rTop) * Math.sin(t * Math.PI * 0.5);
    } else if (v < 0.52) {
      // Hip to tailored knee taper
      const t = (v - 0.28) / (0.52 - 0.28);
      rBase = rHip + (rKnee - rHip) * Math.sin(t * Math.PI * 0.5);
    } else {
      // Tailored knee to sweeping architectural hem flare
      const t = (v - 0.52) / (1.0 - 0.52);
      rBase = rKnee + (rHem - rKnee) * (t * t * 0.75 + t * 0.25);
    }

    // Flute & pleat amplitude deepens towards the hem
    const fluteAmp = Math.pow(v, 1.35) * 0.18;

    for (let j = 0; j <= radialSegments; j++) {
      const u = j / radialSegments;
      const theta = u * Math.PI * 2;

      // 8 primary architectural couture pleats + 16 micro-folds
      const pleat = Math.sin(theta * 8.0) * 0.72 + Math.sin(theta * 16.0) * 0.28;
      const r = rBase + fluteAmp * pleat;

      // Anatomical human proportion: flatter front-to-back (Z-axis)
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta) * 0.74;

      // Subtle high-fashion back train extension
      const isBack = Math.sin(theta) < 0 ? Math.abs(Math.sin(theta)) : 0;
      const trainOffset = v * v * isBack * 0.32;

      vertices.push(x, y - trainOffset * 0.25, z - trainOffset);
      uvs.push(u, v);
    }
  }

  for (let i = 0; i < heightSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = (i + 1) * (radialSegments + 1) + j;
      const c = (i + 1) * (radialSegments + 1) + (j + 1);
      const d = i * (radialSegments + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Procedural tailored couture bodice geometry generator.
 * Fits over the upper mannequin with an architectural asymmetrical neckline and sweetheart bustline.
 */
function createCoutureBodiceGeometry(heightSegments = 32, radialSegments = 48) {
  const vertices = [];
  const uvs = [];
  const indices = [];

  const yWaist = -0.16;
  const yApex = 0.72;
  const yNeck = 1.32;

  for (let i = 0; i <= heightSegments; i++) {
    const v = i / heightSegments; // 0 at waist, 1 at upper neckline
    const y = yWaist + (yNeck - yWaist) * v;

    // Bodice contour radius
    let rBase;
    if (v < 0.6) {
      // Waist to bust apex
      const t = v / 0.6;
      rBase = 0.70 + (1.14 - 0.70) * Math.sin(t * Math.PI * 0.5);
    } else {
      // Bust apex to decolletage
      const t = (v - 0.6) / 0.4;
      rBase = 1.14 - 0.16 * t;
    }

    for (let j = 0; j <= radialSegments; j++) {
      const u = j / radialSegments;
      const theta = u * Math.PI * 2;

      // Couture sweetheart neckline shaping: center front dips gracefully, side rises
      let yOffset = 0;
      if (v > 0.7) {
        const topFactor = (v - 0.7) / 0.3;
        // Dip at center front (theta = PI/2), rise at bust cups
        const centerFrontDip = Math.cos(theta) * 0.12;
        const oneShoulderRise = (Math.sin(theta) > 0 && Math.cos(theta) < 0) ? 0.18 : 0;
        yOffset = (centerFrontDip + oneShoulderRise) * topFactor;
      }

      // Vertical corset boning ridges
      const boning = Math.cos(theta * 6.0) * 0.015;
      const r = rBase + boning;

      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta) * 0.70;

      vertices.push(x, y + yOffset, z);
      uvs.push(u, v);
    }
  }

  for (let i = 0; i < heightSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = (i + 1) * (radialSegments + 1) + j;
      const c = (i + 1) * (radialSegments + 1) + (j + 1);
      const d = i * (radialSegments + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Procedural ribbon geometry generator for couture fabric drapes and sculptural trains.
 */
function createCoutureRibbonGeometry(
  curve,
  segments = 96,
  widthStart = 0.42,
  widthEnd = 0.95,
  transverseRibs = 5
) {
  const points = curve.getSpacedPoints(segments);
  const tangents = [];
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    tangents.push(curve.getTangentAt(u));
  }

  const vertices = [];
  const uvs = [];
  const indices = [];
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= segments; i++) {
    const p = points[i];
    const t = tangents[i];
    const u = i / segments;

    let binormal = new THREE.Vector3().crossVectors(t, up).normalize();
    if (binormal.lengthSq() < 0.01) {
      binormal = new THREE.Vector3().crossVectors(t, new THREE.Vector3(1, 0, 0)).normalize();
    }
    const normal = new THREE.Vector3().crossVectors(binormal, t).normalize();

    const width = widthStart + (widthEnd - widthStart) * Math.sin(u * Math.PI * 0.92);

    for (let r = 0; r < transverseRibs; r++) {
      const vProgress = r / (transverseRibs - 1) - 0.5;
      const offset = binormal.clone().multiplyScalar(vProgress * width);

      const foldArch = Math.sin((vProgress + 0.5) * Math.PI) * 0.045;
      const ripple = Math.sin(u * 14.0 + vProgress * 5.0) * 0.032;
      const foldOffset = normal.clone().multiplyScalar(foldArch + ripple);

      const vert = p.clone().add(offset).add(foldOffset);
      vertices.push(vert.x, vert.y, vert.z);
      uvs.push(u, r / (transverseRibs - 1));
    }
  }

  for (let i = 0; i < segments; i++) {
    for (let r = 0; r < transverseRibs - 1; r++) {
      const a = i * transverseRibs + r;
      const b = (i + 1) * transverseRibs + r;
      const c = (i + 1) * transverseRibs + (r + 1);
      const d = i * transverseRibs + (r + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export default function AtelierSculptureCanvas({ isInteractive = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const isWebGLAvailable = Boolean(
        window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      if (!isWebGLAvailable) return;
    } catch {
      return;
    }

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 700;
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    // Master Couture Model Group (Contains entire sculpture)
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Track all disposable resources
    const geometriesToDispose = [];
    const materialsToDispose = [];

    // =========================================================================
    // 4. THE COUTURE DRESSMAKER FORM (UPPER SILHOUETTE)
    // =========================================================================
    // Mannequin neck and shoulders in deep obsidian velvet crepe
    const mannequinProfile = [
      new THREE.Vector2(0.001, 2.38), // Finial base
      new THREE.Vector2(0.18, 2.36),
      new THREE.Vector2(0.19, 2.24),  // Slender neck column
      new THREE.Vector2(0.20, 2.02),
      new THREE.Vector2(0.24, 1.84),  // Clavicle transition
      new THREE.Vector2(0.48, 1.74),
      new THREE.Vector2(0.88, 1.62),  // Sloping couture shoulders
      new THREE.Vector2(1.08, 1.48),  // Shoulder peak
      new THREE.Vector2(1.10, 1.34),  // Armscye contour
      new THREE.Vector2(0.96, 1.16),
      new THREE.Vector2(1.02, 0.94),
      new THREE.Vector2(1.10, 0.70),  // Bust apex
      new THREE.Vector2(0.96, 0.42),
      new THREE.Vector2(0.80, 0.14),
      new THREE.Vector2(0.66, -0.16), // Cinched waist
      new THREE.Vector2(0.001, -0.18),// Base
    ];

    const torsoGeo = new THREE.LatheGeometry(mannequinProfile, 40);
    geometriesToDispose.push(torsoGeo);

    // Matte obsidian velvet crepe texture
    const mannequinMat = new THREE.MeshPhysicalMaterial({
      color: 0x141418,
      roughness: 0.72,
      metalness: 0.08,
      sheen: 0.5,
      sheenColor: new THREE.Color(0x303038),
    });
    materialsToDispose.push(mannequinMat);

    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat => mannequinMat);
    torsoMesh.scale.set(1.0, 1.0, 0.68);
    modelGroup.add(torsoMesh);

    // =========================================================================
    // 5. ATELIER PEDESTAL & TAILORING STAND
    // =========================================================================
    const standMat = new THREE.MeshStandardMaterial({
      color: 0xd4b27a, // Brushed champagne gold
      roughness: 0.22,
      metalness: 0.92,
    });
    materialsToDispose.push(standMat);

    // Neck Finial Dome Cap
    const finialGeo = new THREE.CylinderGeometry(0.18, 0.20, 0.12, 32);
    geometriesToDispose.push(finialGeo);
    const finialMesh = new THREE.Mesh(finialGeo, standMat);
    finialMesh.position.set(0, 2.42, 0);
    modelGroup.add(finialMesh);

    // Top sphere finial accent
    const finialSphereGeo = new THREE.SphereGeometry(0.14, 24, 16);
    geometriesToDispose.push(finialSphereGeo);
    const finialSphereMesh = new THREE.Mesh(finialSphereGeo, standMat);
    finialSphereMesh.position.set(0, 2.52, 0);
    modelGroup.add(finialSphereMesh);

    // Atelier Stand Vertical Column (Emerging below the gown hem)
    const columnGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.2, 24);
    geometriesToDispose.push(columnGeo);
    const columnMesh = new THREE.Mesh(columnGeo, standMat);
    columnMesh.position.set(0, -2.85, 0);
    modelGroup.add(columnMesh);

    // Atelier Height Adjustment Dial
    const knobGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.05, 16);
    geometriesToDispose.push(knobGeo);
    const knobMesh = new THREE.Mesh(knobGeo, standMat);
    knobMesh.position.set(0, -2.60, 0);
    modelGroup.add(knobMesh);

    // Atelier Weighted Cast Base with Beveled Stepped Rim
    const baseGeo = new THREE.CylinderGeometry(0.96, 1.04, 0.09, 40);
    geometriesToDispose.push(baseGeo);
    const baseMesh = new THREE.Mesh(baseGeo, standMat);
    baseMesh.position.set(0, -3.42, 0);
    modelGroup.add(baseMesh);

    // Base collar ring
    const baseCollarGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.06, 24);
    geometriesToDispose.push(baseCollarGeo);
    const baseCollarMesh = new THREE.Mesh(baseCollarGeo, standMat);
    baseCollarMesh.position.set(0, -3.36, 0);
    modelGroup.add(baseCollarMesh);

    // =========================================================================
    // 6. THE HAUTE COUTURE DESIGNER DRESS: BODICE & FLUTED GOWN SKIRT
    // =========================================================================
    // Liquid Champagne Duchesse Satin Material for the couture gown
    const dressSilkMat = new THREE.MeshPhysicalMaterial({
      color: 0xebdcc8, // Warm luminous champagne silk
      roughness: 0.20,
      metalness: 0.38,
      clearcoat: 0.88,
      clearcoatRoughness: 0.16,
      sheen: 1.0,
      sheenColor: new THREE.Color(0xfff3e6),
      side: THREE.DoubleSide,
    });
    materialsToDispose.push(dressSilkMat);

    // 6A. Fitted Couture Bodice with Sweetheart / Cowl Neckline
    const bodiceGeo = createCoutureBodiceGeometry(32, 48);
    geometriesToDispose.push(bodiceGeo);
    const bodiceMesh = new THREE.Mesh(bodiceGeo, dressSilkMat);
    modelGroup.add(bodiceMesh);

    // 6B. Fluted Architectural Gown Skirt with Deep Couture Pleats
    const skirtGeo = createCoutureSkirtGeometry(64, 64, -0.16, -2.85, 0.70, 1.10, 0.94, 2.15);
    geometriesToDispose.push(skirtGeo);
    const skirtMesh = new THREE.Mesh(skirtGeo, dressSilkMat);
    modelGroup.add(skirtMesh);

    // Store original positions of skirt for subtle undulating living fabric breath
    const skirtPosAttr = skirtGeo.attributes.position;
    const origSkirtPositions = new Float32Array(skirtPosAttr.array);

    // =========================================================================
    // 7. SCULPTURAL DRAPED SILK SASH & ASYMMETRIC PEPLUM TRAIN
    // =========================================================================
    // Sweeps gracefully from the one-shoulder decolletage, wraps the waist, and billows into an expansive train
    const silkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.90, 1.58, 0.10),  // Left shoulder drape
      new THREE.Vector3(-0.62, 1.38, 0.44),  // Cascading across clavicle
      new THREE.Vector3(-0.16, 0.98, 0.65),  // Diagonal bust drape
      new THREE.Vector3(0.50, 0.52, 0.56),   // Right ribcage wrap
      new THREE.Vector3(0.78, 0.08, 0.30),   // Waist wrap right
      new THREE.Vector3(0.54, -0.22, -0.40), // Across back waist
      new THREE.Vector3(-0.34, -0.40, -0.44),// Back waist wrap left
      new THREE.Vector3(-0.86, -0.66, -0.06),// Emerging around left hip
      new THREE.Vector3(-1.02, -1.04, 0.40), // Swooping peplum
      new THREE.Vector3(-0.66, -1.45, 0.76), // Billowing forward drape
      new THREE.Vector3(0.20, -1.90, 0.92),  // Cascading lower train
      new THREE.Vector3(1.00, -2.30, 0.62),  // Swooping train flare right
      new THREE.Vector3(1.48, -2.60, 0.10),  // Flared peplum hem
      new THREE.Vector3(1.16, -2.76, -0.50), // Flowing tail terminal
    ]);

    const silkGeo = createCoutureRibbonGeometry(silkCurve, 96, 0.42, 0.96, 5);
    geometriesToDispose.push(silkGeo);

    const silkPosAttr = silkGeo.attributes.position;
    const origSilkPositions = new Float32Array(silkPosAttr.array);

    // Radiant Liquid Gold/Champagne Satin for the dramatic sculptural train
    const trainSilkMat = new THREE.MeshPhysicalMaterial({
      color: 0xf0e2d2,
      roughness: 0.18,
      metalness: 0.46,
      clearcoat: 0.92,
      clearcoatRoughness: 0.14,
      sheen: 1.0,
      sheenColor: new THREE.Color(0xffedd8),
      side: THREE.DoubleSide,
    });
    materialsToDispose.push(trainSilkMat);

    const silkMesh = new THREE.Mesh(silkGeo, trainSilkMat);
    modelGroup.add(silkMesh);

    // =========================================================================
    // 8. SECONDARY LAYER: TRANSLUCENT COUTURE ORGANZA VEIL / STOLE
    // =========================================================================
    const organzaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.84, 1.50, 0.12),   // Over right shoulder
      new THREE.Vector3(0.50, 1.15, -0.38),  // Cascading upper back
      new THREE.Vector3(-0.36, 0.65, -0.46), // Wrapping back
      new THREE.Vector3(-0.78, 0.10, -0.16), // Left rib wrap
      new THREE.Vector3(-0.74, -0.36, 0.36), // Mid torso front
      new THREE.Vector3(-0.28, -0.88, 0.70), // Cascading down hip
      new THREE.Vector3(0.48, -1.48, 0.64),  // Swirling train
      new THREE.Vector3(1.02, -2.06, 0.28),  // Lower accent flare
    ]);

    const organzaGeo = createCoutureRibbonGeometry(organzaCurve, 64, 0.28, 0.62, 4);
    geometriesToDispose.push(organzaGeo);

    const organzaMat = new THREE.MeshStandardMaterial({
      color: 0xf7f5f0, // Pure warm ivory organza
      roughness: 0.32,
      metalness: 0.14,
      transparent: true,
      opacity: 0.60,
      side: THREE.DoubleSide,
    });
    materialsToDispose.push(organzaMat);

    const organzaMesh = new THREE.Mesh(organzaGeo, organzaMat);
    modelGroup.add(organzaMesh);

    // =========================================================================
    // 9. ATELIER PERSONAL STYLING DETAILS & TAILORING ACCENTS
    // =========================================================================
    // Atelier Cinch Belt at waistline (Connecting bodice to skirt)
    const cinchGeo = new THREE.TorusGeometry(0.72, 0.038, 16, 48);
    geometriesToDispose.push(cinchGeo);
    const cinchMesh = new THREE.Mesh(cinchGeo, standMat);
    cinchMesh.position.set(0, -0.16, 0);
    cinchMesh.rotation.x = Math.PI * 0.5;
    cinchMesh.scale.set(1.0, 0.70, 1.0);
    modelGroup.add(cinchMesh);

    // Sculptural Cinch Buckle Accent
    const buckleGeo = new THREE.BoxGeometry(0.10, 0.16, 0.06);
    geometriesToDispose.push(buckleGeo);
    const buckleMesh = new THREE.Mesh(buckleGeo, standMat);
    buckleMesh.position.set(0, -0.16, 0.53);
    modelGroup.add(buckleMesh);

    // Atelier Choker / Collar Contour
    const chokerGeo = new THREE.TorusGeometry(0.24, 0.018, 16, 36);
    geometriesToDispose.push(chokerGeo);
    const chokerMesh = new THREE.Mesh(chokerGeo, standMat);
    chokerMesh.position.set(0, 1.95, 0);
    chokerMesh.rotation.x = Math.PI * 0.5;
    modelGroup.add(chokerMesh);

    // Floating Atelier Editorial Silhouette Framing Halo
    const haloGeo = new THREE.TorusGeometry(2.38, 0.012, 12, 64);
    geometriesToDispose.push(haloGeo);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xc5a880,
      metalness: 0.88,
      roughness: 0.28,
      transparent: true,
      opacity: 0.42,
    });
    materialsToDispose.push(haloMat);
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.set(0.35, 0.22, -0.28);
    modelGroup.add(haloMesh);

    // =========================================================================
    // 10. AUTOMATIC BOUNDING-BOX CENTERING & CAMERA FRAMING
    // =========================================================================
    modelGroup.updateMatrixWorld(true);
    const initialBox = new THREE.Box3().setFromObject(modelGroup);
    const modelCenter = initialBox.getCenter(new THREE.Vector3());
    const modelSize = initialBox.getSize(new THREE.Vector3());

    // Center model at coordinate origin
    modelGroup.position.set(-modelCenter.x, -modelCenter.y, -modelCenter.z);

    let targetCameraDistance = 10.8;

    const frameCamera = (w, h) => {
      const aspect = w / h;
      camera.aspect = aspect;

      const fovRad = (camera.fov * Math.PI) / 180;

      // Calibrated padding ensures generous vertical and horizontal clearance
      const paddingY = 1.25;
      const paddingX = aspect < 1.0 ? 1.34 : 1.25;

      const distY = (modelSize.y * paddingY * 0.5) / Math.tan(fovRad * 0.5);
      const horizFovRad = 2 * Math.atan(Math.tan(fovRad * 0.5) * aspect);
      const distX = (modelSize.x * paddingX * 0.5) / Math.tan(horizFovRad * 0.5);

      targetCameraDistance = Math.max(distY, distX);
      camera.position.set(0, 0, targetCameraDistance);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };

    frameCamera(width, height);

    // =========================================================================
    // 11. LUXURY EDITORIAL STUDIO LIGHTING SETUP
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0xf7f5f0, 0.95);
    scene.add(ambientLight);

    // Key Light: Upper right, sculpts decolletage, bustier, waist, and fluted gown folds
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.8);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    // Rim Light: Warm champagne contour from back-left highlighting silhouette
    const rimLight = new THREE.DirectionalLight(0xc5a880, 2.4);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);

    // Fill Light: Front low directional light illuminating the skirt flutes
    const fillLight = new THREE.DirectionalLight(0xd4b27a, 1.1);
    fillLight.position.set(0, -2, 5);
    scene.add(fillLight);

    // Atelier Point Light: Catches satin specular highlights on the waist cinch & bodice
    const pointLight = new THREE.PointLight(0xfff0dd, 1.3, 16);
    pointLight.position.set(0, 0.4, 3.8);
    scene.add(pointLight);

    // Soft Floor Fill
    const floorFill = new THREE.DirectionalLight(0x5e5d5a, 0.7);
    floorFill.position.set(0, -6, 3);
    scene.add(floorFill);

    // =========================================================================
    // 12. 360-DEGREE DRAG INTERACTION & INERTIA ANIMATION LOOP
    // =========================================================================
    let isDragging = false;
    let previousX = 0;
    let previousY = 0;
    let rotationY = 0;
    let rotationX = 0;
    let velocityY = 0;
    let velocityX = 0;
    let isVisible = true;
    let animationFrameId = null;

    const dragSensitivity = 0.007;
    const inertiaDamping = 0.93;
    const autoRotateSpeed = 0.0032;

    const handlePointerDown = (e) => {
      if (!isInteractive) return;
      isDragging = true;
      previousX = e.clientX;
      previousY = e.clientY;
      velocityY = 0;
      velocityX = 0;
      try {
        container.setPointerCapture(e.pointerId);
      } catch {}
      container.style.cursor = 'grabbing';
    };

    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousX;
      const deltaY = e.clientY - previousY;
      previousX = e.clientX;
      previousY = e.clientY;

      rotationY += deltaX * dragSensitivity;
      rotationX = Math.max(-0.42, Math.min(0.42, rotationX + deltaY * dragSensitivity * 0.6));

      velocityY = deltaX * dragSensitivity;
      velocityX = deltaY * dragSensitivity * 0.6;
    };

    const handlePointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {}
      container.style.cursor = 'grab';
    };

    if (isInteractive) {
      container.addEventListener('pointerdown', handlePointerDown);
      container.addEventListener('pointermove', handlePointerMove);
      container.addEventListener('pointerup', handlePointerUp);
      container.addEventListener('pointercancel', handlePointerUp);
    }

    const startTime = performance.now();

    const animate = () => {
      if (!isVisible) return;

      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Apply drag momentum or auto-rotation when released
      if (!isDragging) {
        rotationY += velocityY;
        rotationX = Math.max(-0.42, Math.min(0.42, rotationX + velocityX));
        velocityY *= inertiaDamping;
        velocityX *= inertiaDamping;

        // Gentle ambient 360 drift when user is not actively dragging
        if (Math.abs(velocityY) < 0.0004) {
          rotationY += autoRotateSpeed;
        }
      }

      modelGroup.rotation.y = rotationY;
      modelGroup.rotation.x = rotationX;

      // Regal floating & ambient mannequin breathing
      const breathOffset = Math.sin(elapsedTime * 0.8) * 0.06;
      modelGroup.position.y = -modelCenter.y + breathOffset;

      // Subtle editorial counter-drift for framing halo
      haloMesh.rotation.z += 0.0010;

      // Living Fabric Wave: Sinusoidal breath through draped silk sash
      const pos = silkGeo.attributes.position;
      const count = pos.count;
      for (let i = 0; i < count; i++) {
        const origX = origSilkPositions[i * 3];
        const origY = origSilkPositions[i * 3 + 1];
        const origZ = origSilkPositions[i * 3 + 2];
        const wave = Math.sin(elapsedTime * 1.6 + origX * 2.2 + origY * 1.6) * 0.026;
        pos.setZ(i, origZ + wave);
      }
      pos.needsUpdate = true;

      // Subtle living sway through the fluted skirt hem
      const skirtPos = skirtGeo.attributes.position;
      const skirtCount = skirtPos.count;
      for (let i = 0; i < skirtCount; i++) {
        const origY = origSkirtPositions[i * 3 + 1];
        // Only ripple near the lower flare of the skirt
        const depth = Math.max(0, (-origY - 1.0) / 1.85);
        if (depth > 0) {
          const origX = origSkirtPositions[i * 3];
          const origZ = origSkirtPositions[i * 3 + 2];
          const ripple = Math.sin(elapsedTime * 1.4 + origX * 1.8 + origZ * 1.8) * 0.022 * depth;
          skirtPos.setZ(i, origZ + ripple);
        }
      }
      skirtPos.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    // 13. IntersectionObserver to pause rendering when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          if (!animationFrameId) {
            animate();
          }
        } else {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // 14. Responsive Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;

      frameCamera(newWidth, newHeight);
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    animate();

    // 15. Resource Disposal & Cleanup
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      if (isInteractive) {
        container.removeEventListener('pointerdown', handlePointerDown);
        container.removeEventListener('pointermove', handlePointerMove);
        container.removeEventListener('pointerup', handlePointerUp);
        container.removeEventListener('pointercancel', handlePointerUp);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      geometriesToDispose.forEach((geo) => geo.dispose());
      materialsToDispose.forEach((mat) => mat.dispose());

      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [isInteractive]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[440px] flex items-center justify-center relative cursor-grab active:cursor-grabbing touch-none select-none"
      aria-label="3D Interactive Haute Couture Designer Gown Sculpture"
      role="img"
    />
  );
}
