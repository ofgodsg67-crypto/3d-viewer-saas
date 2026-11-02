(function() {
    console.log("3D Viewer: Production Engine Initialized.");

    function initViewer() {
        const stage = document.getElementById('3d-product-stage');
        if (!stage) return false;
        if (stage.dataset.initialized === "true") return true;
        stage.dataset.initialized = "true";

        // 1. Stage Styling & Layout Container
        stage.style.position = 'relative';
        stage.style.overflow = 'hidden';
        stage.style.background = 'radial-gradient(circle at 50% 50%, #1e293b 0%, #020617 100%)';
        stage.style.cursor = 'grab';
        stage.style.width = '100%';
        stage.style.height = '480px';
        stage.style.borderRadius = '16px';
        stage.style.border = '1px solid rgba(255, 255, 255, 0.08)';
        stage.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.6), inset 0 0 50px rgba(0, 0, 0, 0.8)';

        if (typeof THREE === 'undefined') return true;

        // 2. Scene, Camera & ACES Filmic Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, stage.clientWidth / stage.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 4.2);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(stage.clientWidth, stage.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        stage.appendChild(renderer.domElement);

        // 3. High-Gloss Metallic Physical Material (Shaders)
        const geometry = new THREE.TorusKnotGeometry(0.68, 0.22, 256, 48);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x38bdf8,
            metalness: 0.95,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            reflectivity: 1.0
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // 4. Studio 3-Point Lighting Rig
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
        keyLight.position.set(5, 5, 4);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
        fillLight.position.set(-5, -2, 2);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
        rimLight.position.set(0, 5, -5);
        scene.add(rimLight);

        // Dynamic Interactive Cursor Light
        const cursorLight = new THREE.PointLight(0x00f2fe, 4.0, 10);
        scene.add(cursorLight);

        // 5. Drag & Hover Mechanics
        let isDragging = false;
        let prevMouse = { x: 0, y: 0 };

        stage.addEventListener('mousedown', (e) => {
            isDragging = true;
            stage.style.cursor = 'grabbing';
            prevMouse = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            stage.style.cursor = 'grab';
        });

        stage.addEventListener('mousemove', (e) => {
            const rect = stage.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / stage.clientWidth) * 2 - 1;
            const y = -((e.clientY - rect.top) / stage.clientHeight) * 2 + 1;

            cursorLight.position.set(x * 3.5, y * 3.5, 2);

            if (isDragging) {
                const deltaX = e.clientX - prevMouse.x;
                const deltaY = e.clientY - prevMouse.y;
                mesh.rotation.y += deltaX * 0.01;
                mesh.rotation.x += deltaY * 0.01;
                prevMouse = { x: e.clientX, y: e.clientY };
            }
        });

        // 6. Smooth Ambient Animation Loop
        function animate() {
            requestAnimationFrame(animate);
            if (!isDragging) {
                mesh.rotation.y += 0.005;
                mesh.rotation.x += 0.002;
            }
            renderer.render(scene, camera);
        }
        animate();

        // 7. Responsive Resizer
        window.addEventListener('resize', () => {
            if (!stage) return;
            camera.aspect = stage.clientWidth / stage.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(stage.clientWidth, stage.clientHeight);
        });

        return true;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runCheck);
    } else {
        runCheck();
    }

    function runCheck() {
        if (initViewer()) return;
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (initViewer() || attempts > 20) clearInterval(interval);
        }, 100);
    }
})();
