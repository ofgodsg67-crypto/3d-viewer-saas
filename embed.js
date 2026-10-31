(function() {
    console.log("3D Viewer: Script initialized.");

    // 1. Core initialization function
    function initViewer() {
        const stage = document.getElementById('3d-product-stage');
        if (!stage) {
            console.warn("3D Viewer: Waiting for container #3d-product-stage...");
            return false;
        }

        // Prevent double-initialization
        if (stage.dataset.initialized === "true") return true;
        stage.dataset.initialized = "true";

        console.log("3D Viewer: Container found. Building WebGL scene...");

        // Style the stage box
        stage.style.position = 'relative';
        stage.style.overflow = 'hidden';
        stage.style.background = '#090d16';
        stage.style.cursor = 'grab';
        stage.style.width = '100%';
        stage.style.height = '450px';

        // Check Three.js
        if (typeof THREE === 'undefined') {
            console.error("3D Viewer Error: Three.js library is not loaded on the page.");
            stage.innerHTML = '<div style="color:red; padding:20px; text-align:center;">Error: Three.js missing</div>';
            return true;
        }

        // Setup Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, stage.clientWidth / stage.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 4.5);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(stage.clientWidth, stage.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        stage.appendChild(renderer.domElement);

        // Add 3D Geometry (Torus Knot)
        const geometry = new THREE.TorusKnotGeometry(0.7, 0.22, 128, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            roughness: 0.1,
            metalness: 0.9
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Add Studio Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
        keyLight.position.set(5, 5, 5);
        scene.add(keyLight);

        const pointLight = new THREE.PointLight(0x00ffff, 3, 10);
        scene.add(pointLight);

        // Mouse Interactivity
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

            pointLight.position.set(x * 3, y * 3, 2);

            if (isDragging) {
                const deltaX = e.clientX - prevMouse.x;
                const deltaY = e.clientY - prevMouse.y;
                mesh.rotation.y += deltaX * 0.01;
                mesh.rotation.x += deltaY * 0.01;
                prevMouse = { x: e.clientX, y: e.clientY };
            }
        });

        // Animation Loop
        function animate() {
            requestAnimationFrame(animate);
            if (!isDragging) {
                mesh.rotation.y += 0.006;
            }
            renderer.render(scene, camera);
        }
        animate();

        // Resize handler
        window.addEventListener('resize', () => {
            if (!stage) return;
            camera.aspect = stage.clientWidth / stage.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(stage.clientWidth, stage.clientHeight);
        });

        console.log("3D Viewer: Successfully rendered.");
        return true;
    }

    // 2. Execution Logic: Poll until container is available in the DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runCheck);
    } else {
        runCheck();
    }

    function runCheck() {
        if (initViewer()) return;
        // Fallback polling loop if injected dynamically
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (initViewer() || attempts > 20) {
                clearInterval(interval);
            }
        }, 100);
    }
})();
