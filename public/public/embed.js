<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Product Stage – License Activated</title>
    <style>
        body {
            margin: 0;
            background: #0a0a0a;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        #3d-product-stage {
            position: relative;
            width: 800px;
            max-width: 95vw;
            height: 500px;
            border-radius: 24px;
            background: #111;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
            overflow: hidden;
            transition: all 0.2s ease;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        /* Fallback image (visible when license inactive) */
        .fallback-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            z-index: 5;
        }
        /* 3D canvas container (hidden by default until license check passes) */
        .canvas-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none; /* becomes 'block' when active */
            z-index: 10;
        }
        /* subtle hint text – only for debug, can be removed */
        .status-badge {
            position: absolute;
            bottom: 12px;
            right: 16px;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            color: #aaa;
            font-size: 11px;
            padding: 6px 12px;
            border-radius: 40px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 20;
            pointer-events: none;
            letter-spacing: 0.3px;
        }
    </style>
</head>
<body>
    <!-- The stage element – it will hold either fallback image or 3D canvas -->
    <div id="3d-product-stage">
        <!-- Fallback image (visible if license inactive or missing) -->
        <img 
            class="fallback-image" 
            src="https://picsum.photos/800/500?grayscale&seed=42" 
            alt="Product preview"
            crossorigin="anonymous"
        >
        <!-- Canvas container – only shown when license active -->
        <div class="canvas-container" id="canvas-container"></div>
        <!-- Status indicator (shows license state, optional) -->
        <div class="status-badge" id="status-badge">⏳ checking license…</div>
    </div>

    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.128.0/build/three.module.js"
            }
        }
    </script>

    <script type="module">
        // ============================================================
        // CONFIGURATION – replace with your actual Supabase URL & key
        // ============================================================
        const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co/rest/v1/licenses'; // <-- CHANGE
        const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // <-- CHANGE (anon public key)
        const LICENSE_KEY = 'demo-license-123'; // <- license to check

        // ============================================================
        // 1. License check function
        // ============================================================
        async function checkLicense() {
            // If the URL is still the placeholder, we simulate a failed check
            if (SUPABASE_URL.includes('YOUR_SUPABASE_URL')) {
                console.warn('Supabase URL not configured – falling back to image.');
                return false;
            }

            try {
                const url = `${SUPABASE_URL}?license_key=eq.${encodeURIComponent(LICENSE_KEY)}&select=is_active`;
                const response = await fetch(url, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                // Expecting array of records: [{ is_active: true/false }]
                if (Array.isArray(data) && data.length > 0) {
                    return data[0].is_active === true;
                }
                return false;
            } catch (err) {
                console.error('License check failed:', err);
                return false;
            }
        }

        // ============================================================
        // 2. Three.js setup – only executed if license is active
        // ============================================================
        async function initThreeScene() {
            const container = document.getElementById('canvas-container');
            if (!container) return;

            // Dynamically import Three.js
            const THREE = await import('three');

            // --- Scene, Camera, Renderer ---
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x0a0a0a); // dark studio background

            const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
            camera.position.set(0, 0.5, 6);
            camera.lookAt(0, 0, 0);

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = false; // not needed for card
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.2;
            container.appendChild(renderer.domElement);

            // --- Create a sleek 3D card (plane with rounded corners visual via texture) ---
            // Use a canvas texture to create the card's surface with a gradient & subtle grid
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 384;
            const ctx = canvas.getContext('2d');

            // Background gradient – sleek dark metallic
            const gradient = ctx.createLinearGradient(0, 0, 512, 384);
            gradient.addColorStop(0, '#2a2a2a');
            gradient.addColorStop(0.5, '#1f1f1f');
            gradient.addColorStop(1, '#151515');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 384);

            // Add subtle diagonal lines for "sleek" texture
            ctx.strokeStyle = '#3a3a3a';
            ctx.lineWidth = 1.5;
            for (let i = -384; i < 512; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i + 384, 384);
                ctx.stroke();
            }

            // Add a glowing product name / placeholder text
            ctx.font = 'bold 52px "Inter", "Segoe UI", system-ui, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.shadowColor = '#00aaff';
            ctx.shadowBlur = 20;
            ctx.fillText('3D CARD', 70, 200);
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
            ctx.font = '24px "Inter", "Segoe UI", sans-serif';
            ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
            ctx.fillText('interactive studio', 100, 260);

            // Small accent line
            ctx.beginPath();
            ctx.strokeStyle = '#00aaff';
            ctx.lineWidth = 4;
            ctx.moveTo(70, 320);
            ctx.lineTo(200, 320);
            ctx.stroke();

            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace; // modern three version

            // Card geometry (slightly rounded via bevel? We'll use plane + subtle bevel via extrude? No need)
            // Use a BoxGeometry with tiny depth to give thickness
            const geometry = new THREE.BoxGeometry(4.4, 3.2, 0.1);
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.25,
                metalness: 0.6,
                emissive: new THREE.Color(0x001122),
                emissiveIntensity: 0.2,
                emissiveMap: texture, // subtle glow from texture
                color: 0xffffff,
                side: THREE.DoubleSide // show texture on both sides if rotated
            });

            const card = new THREE.Mesh(geometry, material);
            card.castShadow = false;
            card.receiveShadow = false;
            scene.add(card);

            // Add a subtle wireframe edge for that "tech" look
            const edges = new THREE.EdgesGeometry(geometry);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x2a6f9c, opacity: 0.3, transparent: true }));
            card.add(line);

            // --- Studio Lights (will be positioned dynamically by mouse) ---
            // Main key light (white, strong)
            const keyLight = new THREE.PointLight(0xffffff, 1.5, 20);
            keyLight.position.set(2, 3, 4);
            scene.add(keyLight);

            // Fill light (cool blue)
            const fillLight = new THREE.PointLight(0x4466ff, 0.8, 20);
            fillLight.position.set(-3, 1, 3);
            scene.add(fillLight);

            // Rim/back light (warm)
            const rimLight = new THREE.PointLight(0xffaa66, 0.9, 20);
            rimLight.position.set(0, -2, -4);
            scene.add(rimLight);

            // Ambient for base illumination
            const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
            scene.add(ambientLight);

            // --- Mouse tracking for lights ---
            const mouse = { x: 0, y: 0 };
            const targetLightPos = {
                key: new THREE.Vector3(2, 3, 4),
                fill: new THREE.Vector3(-3, 1, 3),
                rim: new THREE.Vector3(0, -2, -4)
            };

            // Store original positions for interpolation
            const baseKeyPos = new THREE.Vector3(2, 3, 4);
            const baseFillPos = new THREE.Vector3(-3, 1, 3);
            const baseRimPos = new THREE.Vector3(0, -2, -4);

            window.addEventListener('mousemove', (event) => {
                // Normalize mouse to [-1, 1] relative to window
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                // Calculate light target positions based on mouse
                // Key light follows mouse more closely
                targetLightPos.key.x = baseKeyPos.x + mouse.x * 3.5;
                targetLightPos.key.y = baseKeyPos.y + mouse.y * 2.5;
                targetLightPos.key.z = baseKeyPos.z + Math.abs(mouse.x) * 1.5;

                // Fill light moves opposite horizontally
                targetLightPos.fill.x = baseFillPos.x - mouse.x * 2.5;
                targetLightPos.fill.y = baseFillPos.y + mouse.y * 1.5;
                targetLightPos.fill.z = baseFillPos.z + Math.abs(mouse.y) * 1.0;

                // Rim light moves subtly
                targetLightPos.rim.x = baseRimPos.x + mouse.x * 1.5;
                targetLightPos.rim.y = baseRimPos.y + mouse.y * 1.0;
                targetLightPos.rim.z = baseRimPos.z + Math.abs(mouse.y) * 0.8;
            });

            // --- Animation loop with smooth light interpolation ---
            function animate() {
                requestAnimationFrame(animate);

                // Smoothly interpolate light positions (lerp)
                keyLight.position.lerp(targetLightPos.key, 0.08);
                fillLight.position.lerp(targetLightPos.fill, 0.08);
                rimLight.position.lerp(targetLightPos.rim, 0.08);

                // Very subtle rotation of card based on mouse (optional, adds life)
                // We'll rotate slightly to show depth
                card.rotation.y = mouse.x * 0.15;
                card.rotation.x = mouse.y * 0.1;

                // Make the edges follow card rotation
                line.rotation.copy(card.rotation);

                renderer.render(scene, camera);
            }

            animate();

            // --- Resize handler ---
            window.addEventListener('resize', () => {
                const width = container.clientWidth;
                const height = container.clientHeight;
                if (width === 0 || height === 0) return;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            });

            // Handle container size change (if parent resizes)
            const resizeObserver = new ResizeObserver(() => {
                const width = container.clientWidth;
                const height = container.clientHeight;
                if (width > 0 && height > 0) {
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                    renderer.setSize(width, height);
                }
            });
            resizeObserver.observe(container);
        }

        // ============================================================
        // 3. Main entry – check license and show appropriate view
        // ============================================================
        async function main() {
            const stage = document.getElementById('3d-product-stage');
            const canvasContainer = document.getElementById('canvas-container');
            const fallbackImage = stage.querySelector('.fallback-image');
            const statusBadge = document.getElementById('status-badge');

            // Initially hide canvas, show fallback (already default)
            canvasContainer.style.display = 'none';
            fallbackImage.style.display = 'block';

            // Check license
            const isActive = await checkLicense();

            if (isActive) {
                statusBadge.textContent = '✅ license active';
                statusBadge.style.color = '#88ff88';
                // Show canvas, hide image
                fallbackImage.style.display = 'none';
                canvasContainer.style.display = 'block';
                // Initialize 3D scene
                try {
                    await initThreeScene();
                } catch (err) {
                    console.error('Failed to initialize Three.js:', err);
                    // If Three.js fails, revert to image
                    fallbackImage.style.display = 'block';
                    canvasContainer.style.display = 'none';
                    statusBadge.textContent = '⚠️ 3D error – fallback';
                    statusBadge.style.color = '#ffaa66';
                }
            } else {
                statusBadge.textContent = '🔒 license inactive – image fallback';
                statusBadge.style.color = '#ff8888';
                fallbackImage.style.display = 'block';
                canvasContainer.style.display = 'none';
            }

            // Optional: auto-hide status badge after 3 seconds for cleaner look
            setTimeout(() => {
                if (statusBadge) statusBadge.style.opacity = '0.3';
            }, 3000);
        }

        // Run when DOM ready
        window.addEventListener('DOMContentLoaded', main);
    </script>
</body>
</html>
