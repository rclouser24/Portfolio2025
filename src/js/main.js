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

    // Define shape types with their distribution
    const shapeTypes = [
      { type: "cube", count: 3, model: "assets/3d/GLTF/Cubic.gltf" }, // 20% - 3 shapes
      { type: "ball", count: 3, model: "assets/3d/GLTF/Ball.gltf" }, // 20% - 3 shapes
      { type: "sphere", count: 3, model: "assets/3d/GLTF/Hexagon.gltf" }, // 20% - 3 shapes
      { type: "spiral", count: 8, model: "assets/3d/GLTF/Twist.gltf" }, // 40% - 8 shapes (3 original + 5 new)
    ];

    const totalShapes = 20;

    // Create shapes based on distribution
    shapeTypes.forEach((shapeType) => {
      for (let i = 0; i < shapeType.count; i++) {
        this.loadModelAndCreateShape(shapeType.model, shapeType.type);
      }
    });

    // Add fallback if no models load
    setTimeout(() => {
      if (this.shapes.length === 0) {
        console.log("No GLTF models loaded, creating fallback shapes...");
        this.createFallbackShapes();
      }
    }, 3000);
  }

  loadModelAndCreateShape(modelPath, shapeType) {
    console.log("Loading model:", modelPath, "Type:", shapeType);

    this.loader.load(
      modelPath,
      (gltf) => {
        console.log("Successfully loaded:", modelPath, "Type:", shapeType);
        const model = gltf.scene;

        this.setupModel(model, shapeType);
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

  setupModel(model, shapeType) {
    // Scale the model to reasonable size (increased by 110% from original)
    model.scale.set(1.365, 1.365, 1.365);

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

    // Apply material to all meshes with 4 specific colors (5 shapes each)
    model.traverse((child) => {
      if (child.isMesh) {
        // Define the 4 specific colors with 5 shapes each
        const colors = [
          0x69bfe8, // Light Blue - 5 shapes
          0xfd6b63, // Coral Red - 5 shapes
          0xfbe04b, // Yellow - 5 shapes
          0xd686e6, // Purple - 5 shapes
        ];

        // Assign color based on shape index to ensure balanced distribution
        // Use a counter to ensure exactly 5 shapes get each color
        if (!this.colorCounter) this.colorCounter = { 0: 0, 1: 0, 2: 0, 3: 0 };

        // Find the color with the lowest count to maintain balance
        let colorIndex = 0;
        let minCount = this.colorCounter[0];
        for (let i = 1; i < 4; i++) {
          if (this.colorCounter[i] < minCount) {
            minCount = this.colorCounter[i];
            colorIndex = i;
          }
        }

        // Increment the counter for this color
        this.colorCounter[colorIndex]++;

        child.material.color.setHex(colors[colorIndex]);
        child.material.transparent = true;
        child.material.opacity = 0.9;
        child.material.shininess = 80;
      }
    });
  }

  createFallbackShapes() {
    // Create 20 shapes with variety: 3 cubes, 3 balls, 3 spheres, 8 spirals (increased by 110%)
    const shapeTypes = [
      {
        type: "cube",
        count: 3,
        geometry: new THREE.BoxGeometry(5.46, 5.46, 5.46),
      },
      {
        type: "ball",
        count: 3,
        geometry: new THREE.SphereGeometry(2.73, 16, 16),
      },
      {
        type: "sphere",
        count: 3,
        geometry: new THREE.SphereGeometry(2.73, 8, 6),
      },
      {
        type: "spiral",
        count: 8,
        geometry: new THREE.TorusGeometry(2.73, 0.84, 8, 16),
      },
    ];

    // Create 4 specific colors for fallback shapes (5 shapes each)
    const colors = [
      0x69bfe8, // Light Blue - 5 shapes
      0xfd6b63, // Coral Red - 5 shapes
      0xfbe04b, // Yellow - 5 shapes
      0xd686e6, // Purple - 5 shapes
    ];

    shapeTypes.forEach((shapeType) => {
      for (let i = 0; i < shapeType.count; i++) {
        // Create material with balanced color distribution (5 shapes each)
        // Use a counter to ensure exactly 5 shapes get each color
        if (!this.fallbackColorCounter)
          this.fallbackColorCounter = { 0: 0, 1: 0, 2: 0, 3: 0 };

        // Find the color with the lowest count to maintain balance
        let colorIndex = 0;
        let minCount = this.fallbackColorCounter[0];
        for (let i = 1; i < 4; i++) {
          if (this.fallbackColorCounter[i] < minCount) {
            minCount = this.fallbackColorCounter[i];
            colorIndex = i;
          }
        }

        // Increment the counter for this color
        this.fallbackColorCounter[colorIndex]++;

        const material = new THREE.MeshPhongMaterial({
          color: colors[colorIndex],
          transparent: true,
          opacity: 0.9,
        });

        const shape = new THREE.Mesh(shapeType.geometry, material);

        // Random position
        shape.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        );

        // Random rotation
        shape.rotation.x = Math.random() * Math.PI;
        shape.rotation.y = Math.random() * Math.PI;
        shape.rotation.z = Math.random() * Math.PI;

        // Physics properties
        shape.velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03
        );

        shape.rotationVelocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        );

        this.scene.add(shape);
        this.shapes.push(shape);
      }
    });
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
    // Update all shapes positions and handle physics
    this.shapes.forEach((shape, index) => {
      // Update position
      shape.position.add(shape.velocity);

      // Update rotation
      shape.rotation.x += shape.rotationVelocity.x;
      shape.rotation.y += shape.rotationVelocity.y;
      shape.rotation.z += shape.rotationVelocity.z;

      // Handle viewport boundary collisions
      this.handleBoundaryCollisions(shape);

      // Handle shape-to-shape collisions
      this.handleShapeCollisions(shape, index);

      // Handle cursor interaction
      this.handleCursorInteraction(shape);

      // Apply physics forces
      this.applyPhysicsForces(shape);
    });
  }

  handleBoundaryCollisions(shape) {
    // Bounce off viewport boundaries with damping
    const bounds = 20; // Increased bounds for larger shapes
    const damping = 0.85; // Light bounce effect

    ["x", "y", "z"].forEach((axis) => {
      if (Math.abs(shape.position[axis]) > bounds) {
        // Reverse velocity and apply damping
        shape.velocity[axis] *= -damping;

        // Prevent shapes from getting stuck outside bounds
        shape.position[axis] = Math.sign(shape.position[axis]) * bounds;

        // Add slight random variation to prevent oscillation
        shape.velocity[axis] += (Math.random() - 0.5) * 0.01;
      }
    });
  }

  handleShapeCollisions(shape, currentIndex) {
    // Check collision with all other shapes
    this.shapes.forEach((otherShape, otherIndex) => {
      if (currentIndex === otherIndex) return; // Skip self

      // Calculate distance between shape centers
      const distance = shape.position.distanceTo(otherShape.position);
      const minDistance = 3; // Minimum distance before collision

      if (distance < minDistance) {
        // Collision detected - calculate collision response
        this.resolveCollision(shape, otherShape, distance, minDistance);
      }
    });
  }

  resolveCollision(shape1, shape2, distance, minDistance) {
    // Calculate collision normal
    const collisionNormal = new THREE.Vector3()
      .subVectors(shape1.position, shape2.position)
      .normalize();

    // Calculate overlap
    const overlap = minDistance - distance;

    // Move shapes apart to prevent clipping
    const separationVector = collisionNormal
      .clone()
      .multiplyScalar(overlap * 0.5);
    shape1.position.add(separationVector);
    shape2.position.sub(separationVector);

    // Calculate relative velocity
    const relativeVelocity = new THREE.Vector3().subVectors(
      shape1.velocity,
      shape2.velocity
    );

    // Calculate impulse (collision response)
    const restitution = 0.6; // Bounce factor
    const impulse = relativeVelocity.dot(collisionNormal) * restitution;

    // Apply impulse to velocities
    const impulseVector = collisionNormal.clone().multiplyScalar(impulse);
    shape1.velocity.sub(impulseVector);
    shape2.velocity.add(impulseVector);

    // Add slight random variation to prevent shapes from getting stuck
    shape1.velocity.add(
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005
      )
    );

    shape2.velocity.add(
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005
      )
    );
  }

  handleCursorInteraction(shape) {
    // Create a virtual cursor sphere for interaction
    const cursorRadius = 2;
    const cursorPosition = new THREE.Vector3();

    // Convert mouse position to 3D world position
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const ray = this.raycaster.ray;

    // Simple plane intersection calculation (avoiding THREE.Plane dependency)
    const planeNormal = new THREE.Vector3(0, 0, 1);
    const planePoint = new THREE.Vector3(0, 0, shape.position.z);

    // Calculate intersection point
    const denom = ray.direction.dot(planeNormal);
    if (Math.abs(denom) > 0.0001) {
      const t = planePoint.clone().sub(ray.origin).dot(planeNormal) / denom;
      cursorPosition
        .copy(ray.origin)
        .add(ray.direction.clone().multiplyScalar(t));
    } else {
      // Fallback: use ray origin if no intersection
      cursorPosition.copy(ray.origin);
    }

    // Check if cursor is close to shape
    const distanceToCursor = shape.position.distanceTo(cursorPosition);

    if (distanceToCursor < cursorRadius + 2) {
      // 2 is shape radius approximation
      // Calculate repulsion force
      const repulsionDirection = new THREE.Vector3()
        .subVectors(shape.position, cursorPosition)
        .normalize();

      // Apply repulsion force (stronger when closer)
      const repulsionStrength =
        Math.max(0, cursorRadius + 2 - distanceToCursor) * 0.02;
      const repulsionForce = repulsionDirection
        .clone()
        .multiplyScalar(repulsionStrength);

      shape.velocity.add(repulsionForce);

      // Add slight upward force for more dynamic movement
      shape.velocity.y += 0.01;
    }
  }

  applyPhysicsForces(shape) {
    // Apply air resistance/drag
    shape.velocity.multiplyScalar(0.995);

    // No gravity - shapes float freely in zero gravity
    // shape.velocity.y -= 0.0005; // Gravity removed

    // Limit maximum velocity to prevent chaos
    const maxVelocity = 0.1;
    if (shape.velocity.length() > maxVelocity) {
      shape.velocity.normalize().multiplyScalar(maxVelocity);
    }

    // Apply rotation damping
    shape.rotationVelocity.multiplyScalar(0.98);
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
