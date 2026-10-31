(function() {
  // 1. Locate the container element
  const stage = document.getElementById('3d-product-stage');
  if (!stage) return console.error('3D Viewer: Container #3d-product-stage not found.');

  // Set up container styling
  stage.style.position = 'relative';
  stage.style.overflow = 'hidden';
  stage.style.background = 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)';
  stage.style.cursor = 'grab';

  // 2. Check for Three.js availability
  if (typeof THREE === 'undefined') {
    return console.error('3D Viewer: Three.js library is missing. Make sure three.min.js is loaded.');
  }

  // 3. Initialize Three.js Scene, Camera, and Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, stage.clientWidth / stage.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  stage.innerHTML = ''; // Clear fallback contents
  stage.appendChild(renderer.domElement);

  // 4. Create an Interactive 3D Product Mesh (Shiny Metallic Knot)
  const geometry = new THREE.TorusKnotGeometry(0.8, 0.28, 128, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.15,
    metalness: 0.85,
  });
  const productMesh = new THREE.Mesh(geometry, material);
  scene.add(productMesh);

  // 5. Add Studio Lighting System
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
  mainLight.position.set(5, 5, 5);
  scene.add(mainLight);

  const cursorLight = new THREE.PointLight(0x38bdf8, 2, 10);
  scene.add(cursorLight);

  // 6. Interactive Mouse & Drag Mechanics
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  stage.addEventListener('mousedown', (e) => {
    isDragging = true;
    stage.style.cursor = 'grabbing';
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    stage.style.cursor = 'grab';
  });

  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / stage.clientWidth) * 2 - 1;
    const y = -((e.clientY - rect.top) / stage.clientHeight) * 2 + 1;

    // Move interactive light source with cursor
    cursorLight.position.set(x * 3, y * 3, 2);

    // Orbit the 3D product mesh on mouse drag
    if (isDragging) {
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      productMesh.rotation.y += deltaMove.x * 0.01;
      productMesh.rotation.x += deltaMove.y * 0.01;
    }

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  // 7. Continuous Rendering & Idle Rotation Loop
  function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) {
      productMesh.rotation.y += 0.005; // Gentle ambient rotation
    }
    renderer.render(scene, camera);
  }
  animate();

  // 8. Responsive Window Resizing
  window.addEventListener('resize', () => {
    if (!stage) return;
    camera.aspect = stage.clientWidth / stage.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(stage.clientWidth, stage.clientHeight);
  });
})();
