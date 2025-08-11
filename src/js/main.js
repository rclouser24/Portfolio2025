/* ==========================================================================
   Portfolio Website - Main JavaScript
   ========================================================================== */

// Three.js Scene Management
class ThreeJSScene {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.shapes = [];
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.loader = null;

    this.init();
  }

  init() {
    console.log("Three.js version:", THREE.REVISION);
    console.log(
      "GLTFLoader available:",
      typeof THREE.GLTFLoader !== "undefined"
    );

    this.setupScene();
    this.setupLighting();
    this.setupLoader();
    this.loadModels();
    this.setupEventListeners();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);

    const container = document.getElementById("three-container");
    if (container) {
      container.appendChild(this.renderer.domElement);
    }

    this.camera.position.z = 30;
    console.log("Three.js scene initialized");
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);
  }

  setupLoader() {
    if (typeof THREE.GLTFLoader !== "undefined") {
      this.loader = new THREE.GLTFLoader();
    } else {
      console.error("GLTFLoader not found, using fallback shapes");
    }
  }

  loadModels() {
    if (!this.loader) {
      this.createFallbackShapes();
      return;
    }

    const modelFiles = [
      "assets/3d/GLTF/Ball.gltf",
      "assets/3d/GLTF/Cubic.gltf",
      "assets/3d/GLTF/Hexagon.gltf",
      "assets/3d/GLTF/Triangle.gltf",
      "assets/3d/GLTF/Star.gltf",
      "assets/3d/GLTF/Flow.gltf",
      "assets/3d/GLTF/Twist.gltf",
      "assets/3d/GLTF/Split.gltf",
    ];

    const numShapes = 8;

    for (let i = 0; i < numShapes; i++) {
      const modelIndex = i % modelFiles.length;
      this.loadModelAndCreateShape(modelFiles[modelIndex], i);
    }

    // Add fallback if no models load
    setTimeout(() => {
      if (this.shapes.length === 0) {
        console.log("No GLTF models loaded, creating fallback shapes...");
        this.createFallbackShapes();
      }
    }, 3000);
  }

  loadModelAndCreateShape(modelPath, index) {
    console.log("Loading model:", modelPath);

    this.loader.load(
      modelPath,
      (gltf) => {
        console.log("Successfully loaded:", modelPath);
        const model = gltf.scene;

        this.setupModel(model);
        this.scene.add(model);
        this.shapes.push(model);

        console.log("Model added to scene. Total shapes:", this.shapes.length);
      },
      (progress) => {
        console.log("Loading progress:", progress);
      },
      (error) => {
        console.error("Error loading model:", modelPath, error);
      }
    );
  }

  setupModel(model) {
    // Scale the model to reasonable size (increased by 30%)
    model.scale.set(0.65, 0.65, 0.65);

    // Random position
    const x = (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 20;
    const z = (Math.random() - 0.5) * 20;

    model.position.set(x, y, z);

    // Random rotation
    model.rotation.x = Math.random() * Math.PI;
    model.rotation.y = Math.random() * Math.PI;
    model.rotation.z = Math.random() * Math.PI;

    // Physics properties
    model.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.03,
      (Math.random() - 0.5) * 0.03,
      (Math.random() - 0.5) * 0.03
    );

    model.rotationVelocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01
    );

    // Apply material to all meshes
    model.traverse((child) => {
      if (child.isMesh) {
        child.material.color.setHex(0x121aff);
        child.material.transparent = true;
        child.material.opacity = 0.8;
        child.material.shininess = 100;
      }
    });
  }

  createFallbackShapes() {
    const geometry = new THREE.BoxGeometry(2.6, 2.6, 2.6);
    const material = new THREE.MeshPhongMaterial({
      color: 0x121aff,
      transparent: true,
      opacity: 0.8,
    });

    for (let i = 0; i < 8; i++) {
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );

      cube.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.03
      );

      cube.rotationVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      );

      this.scene.add(cube);
      this.shapes.push(cube);
    }
  }

  setupEventListeners() {
    document.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener("resize", () => {
      this.handleResize();
    });
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  updateShapes() {
    this.shapes.forEach((shape) => {
      // Update position
      shape.position.add(shape.velocity);

      // Bounce off boundaries
      const bounds = 15;
      ["x", "y", "z"].forEach((axis) => {
        if (Math.abs(shape.position[axis]) > bounds) {
          shape.velocity[axis] *= -0.8;
          shape.position[axis] = Math.sign(shape.position[axis]) * bounds;
        }
      });

      // Update rotation
      shape.rotation.x += shape.rotationVelocity.x;
      shape.rotation.y += shape.rotationVelocity.y;
      shape.rotation.z += shape.rotationVelocity.z;

      // Mouse interaction
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.shapes, true);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        const shape = intersect.object.parent || intersect.object;

        // Push shape away from mouse
        const pushForce = new THREE.Vector3()
          .subVectors(shape.position, this.camera.position)
          .normalize()
          .multiplyScalar(0.05);

        shape.velocity.add(pushForce);
      }

      // Apply drag
      shape.velocity.multiplyScalar(0.99);
    });
  }

  updateCamera() {
    // Slowly rotate camera
    this.camera.position.x = Math.sin(Date.now() * 0.0001) * 3;
    this.camera.position.y = Math.cos(Date.now() * 0.0001) * 3;
    this.camera.lookAt(this.scene.position);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.updateShapes();
    this.updateCamera();

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Navigation Management
class Navigation {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes("project")) {
      return path.split("/").pop().replace(".html", "");
    }
    return "home";
  }

  init() {
    this.updateActiveLink();
    this.setupMobileMenu();
  }

  updateActiveLink() {
    const links = document.querySelectorAll(".nav__link");
    links.forEach((link) => {
      link.classList.remove("nav__link--active");
      if (
        link.getAttribute("href") === this.currentPage + ".html" ||
        (this.currentPage === "home" &&
          link.getAttribute("href") === "index.html")
      ) {
        link.classList.add("nav__link--active");
      }
    });
  }

  setupMobileMenu() {
    const mobileMenuToggle = document.querySelector(".nav__mobile-toggle");
    const mobileMenu = document.querySelector(".nav__menu");

    if (mobileMenuToggle && mobileMenu) {
      mobileMenuToggle.addEventListener("click", () => {
        mobileMenu.classList.toggle("nav__menu--open");
      });
    }
  }
}

// Utility Functions
const Utils = {
  // Debounce function for performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Smooth scroll to element
  scrollTo(element, duration = 1000) {
    const target = document.querySelector(element);
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  },

  // Check if element is in viewport
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Three.js scene if container exists
  if (document.getElementById("three-container")) {
    new ThreeJSScene();
  }

  // Initialize navigation
  new Navigation();

  // Add smooth scrolling to all internal links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      Utils.scrollTo(this.getAttribute("href"));
    });
  });

  console.log("Portfolio website initialized successfully!");
});
