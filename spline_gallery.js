(function() {
    // 1. Setup Three.js
    const canvas = document.getElementById('spline-canvas');
    if (!canvas) return;
    
    // Canvas Setup from prompt spec
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    
    // A tighter FOV (e.g., 45) keeps the edge cards from stretching
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3500);
    camera.position.set(0, 0, 1450); 

    const totalCards = 10;
    const radius = 500; // Radius of cylinder
    
    const carouselGroup = new THREE.Group();
    // Container completely flat/upright
    scene.add(carouselGroup);

    const cards = [];
    // Explicit sizing as requested
    const cardGeom = new THREE.PlaneGeometry(450, 260); 

    for (let i = 0; i < totalCards; i++) {
        const angle = (i / totalCards) * Math.PI * 2;
        
        // Generate texture
        const cardCanvas = document.createElement('canvas');
        cardCanvas.width = 1024;
        cardCanvas.height = 576;
        const ctx = cardCanvas.getContext('2d');
        
        ctx.fillStyle = `hsl(${220 + i * 36}, 30%, 15%)`;
        ctx.fillRect(0, 0, 1024, 576);
        ctx.strokeStyle = `hsl(${180 + i * 36}, 80%, 60%)`;
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 1004, 556);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 80px monospace";
        ctx.fillText(`PROJECT _0${i + 1}`, 300, 260);
        ctx.fillStyle = `hsl(${180 + i * 36}, 80%, 60%)`;
        ctx.font = "30px monospace";
        ctx.fillText(`WEBGL / INTERACTIVE`, 350, 320);
        
        const tex = new THREE.CanvasTexture(cardCanvas);
        tex.minFilter = THREE.LinearFilter;
        const mat = new THREE.MeshBasicMaterial({ 
            map: tex, 
            transparent: true, 
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        
        const card = new THREE.Mesh(cardGeom, mat);
        
        // Save initial state, but position will be fully controlled by the render loop
        card.userData = { targetOpacity: 0.4 };
        card.position.set(0, 0, 0);
        
        carouselGroup.add(card);
        cards.push(card);
    }

    // Scroll Logic via GSAP
    const scrollProxy = { progress: 0 };
    window.addEventListener('load', () => {
        gsap.registerPlugin(ScrollTrigger);
        
        gsap.to(scrollProxy, {
            progress: 1,
            ease: "none",
            scrollTrigger: {
                trigger: "#spline-gallery",
                start: "top top",
                end: "+=6000",
                pin: true,
                scrub: 1
            }
        });
    });

    // Render loop
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        
        const activeIndex = scrollProxy.progress * (totalCards - 1);
        const spineRadius = 680; // Distance from the central 3D spine structure
        const verticalStep = 340; // Vertical gap between cards in the sequence
        const angleStep = 0.52; // Angular spacing wrapping around the 3D core
        
        cards.forEach((card, index) => {
            // Using smooth interpolated active index
            const offset = index - activeIndex; 
            const absOffset = Math.abs(offset);
            
            // Continuous activation factor to smoothly handle the pop-out without snapping
            const activation = Math.max(0, 1 - absOffset);
            
            // 1. The Elevator (Y-Axis)
            // Vertical flow along the central spine
            const targetY = -offset * verticalStep; 

            // 2. The Horizontal Arc Orbit (X and Z Axis)
            // Cylindrical angle tracking around the 3D center core
            const theta = offset * angleStep; 
            
            // X and Z coordinates mapping out the cylinder surrounding the central structure
            const targetX = Math.sin(theta) * spineRadius;
            
            // Pronounced forward push for the active card overlapping the central spine
            const targetZ = (Math.cos(theta) - 1) * spineRadius + (activation * 380);

            // 3. Tangential orientation locked to the cylindrical spine curve
            // Keeps side cards angled inward toward the center while the active card faces dead-on
            const targetRotY = theta; 

            // Smooth Lerp transforms
            card.position.x += (targetX - card.position.x) * 0.1;
            card.position.y += (targetY - card.position.y) * 0.1;
            card.position.z += (targetZ - card.position.z) * 0.1;
            
            card.rotation.y += (targetRotY - card.rotation.y) * 0.1;
            
            // Fade non-active cards smoothly
            const targetOpacity = Math.max(0.2, 1.0 - absOffset * 0.6);
            card.userData.targetOpacity += (targetOpacity - card.userData.targetOpacity) * 0.1;
            if (card.material) {
                card.material.opacity = card.userData.targetOpacity;
            }
        });
        
        renderer.render(scene, camera);
    }
    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        const wrapper = document.querySelector('.spline-sticky-wrapper');
        if (wrapper) {
            camera.aspect = wrapper.clientWidth / wrapper.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
        }
    });

})();
