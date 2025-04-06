// Neural Network Animation for Hero Section
class NeuralNetworkAnimation {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    
    // Default options
    this.options = {
      nodeCount: options.nodeCount || 100,
      connectionDistance: options.connectionDistance || 150,
      nodeSize: options.nodeSize || { min: 2, max: 6 },
      colors: options.colors || {
        nodes: '#4CAF50',
        connections: 'rgba(42, 59, 143, 0.5)',
        pulse: '#FFC107'
      },
      speed: options.speed || { min: 0.1, max: 0.5 },
      pulseFrequency: options.pulseFrequency || 0.02,
      responsive: options.responsive !== undefined ? options.responsive : true
    };
    
    this.nodes = [];
    this.pulses = [];
    this.mouse = { x: null, y: null, radius: 150 };
    
    this.init();
  }
  
  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    
    // Set canvas size
    this.setCanvasSize();
    
    // Create nodes
    this.createNodes();
    
    // Add event listeners
    window.addEventListener('resize', () => this.handleResize());
    this.container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.container.addEventListener('mouseleave', () => this.handleMouseLeave());
    
    // Start animation loop
    this.animate();
  }
  
  setCanvasSize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
  
  createNodes() {
    this.nodes = [];
    
    for (let i = 0; i < this.options.nodeCount; i++) {
      const size = Math.random() * (this.options.nodeSize.max - this.options.nodeSize.min) + this.options.nodeSize.min;
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const speedX = (Math.random() - 0.5) * (this.options.speed.max - this.options.speed.min) + this.options.speed.min;
      const speedY = (Math.random() - 0.5) * (this.options.speed.max - this.options.speed.min) + this.options.speed.min;
      
      this.nodes.push({
        x, y, size, speedX, speedY,
        originalSize: size,
        active: false
      });
    }
  }
  
  handleResize() {
    if (!this.options.responsive) return;
    
    this.setCanvasSize();
    this.createNodes();
  }
  
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }
  
  handleMouseLeave() {
    this.mouse.x = null;
    this.mouse.y = null;
  }
  
  createPulse(sourceNode) {
    const pulse = {
      x: sourceNode.x,
      y: sourceNode.y,
      size: 0,
      maxSize: this.options.connectionDistance,
      alpha: 1,
      growing: true
    };
    
    this.pulses.push(pulse);
  }
  
  updatePulses() {
    // Create new pulses randomly
    if (Math.random() < this.options.pulseFrequency && this.nodes.length > 0) {
      const randomNodeIndex = Math.floor(Math.random() * this.nodes.length);
      this.createPulse(this.nodes[randomNodeIndex]);
    }
    
    // Update existing pulses
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const pulse = this.pulses[i];
      
      if (pulse.growing) {
        pulse.size += 2;
        pulse.alpha = 1 - (pulse.size / pulse.maxSize);
        
        if (pulse.size >= pulse.maxSize) {
          this.pulses.splice(i, 1);
        }
      }
    }
  }
  
  updateNodes() {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      
      // Move nodes
      node.x += node.speedX;
      node.y += node.speedY;
      
      // Bounce off edges
      if (node.x < 0 || node.x > this.width) node.speedX *= -1;
      if (node.y < 0 || node.y > this.height) node.speedY *= -1;
      
      // Keep nodes within bounds
      node.x = Math.max(0, Math.min(this.width, node.x));
      node.y = Math.max(0, Math.min(this.height, node.y));
      
      // Check mouse interaction
      if (this.mouse.x && this.mouse.y) {
        const dx = this.mouse.x - node.x;
        const dy = this.mouse.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.mouse.radius) {
          // Increase node size when mouse is near
          node.size = node.originalSize * (1 + (1 - distance / this.mouse.radius));
          node.active = true;
          
          // Move nodes away from mouse slightly
          const angle = Math.atan2(dy, dx);
          const repelForce = (this.mouse.radius - distance) / this.mouse.radius * 0.5;
          node.x -= Math.cos(angle) * repelForce;
          node.y -= Math.sin(angle) * repelForce;
        } else {
          node.size = node.originalSize;
          node.active = false;
        }
      } else {
        node.size = node.originalSize;
        node.active = false;
      }
    }
  }
  
  drawConnections() {
    this.ctx.strokeStyle = this.options.colors.connections;
    this.ctx.lineWidth = 0.5;
    
    for (let i = 0; i < this.nodes.length; i++) {
      const nodeA = this.nodes[i];
      
      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeB = this.nodes[j];
        
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.options.connectionDistance) {
          // Calculate opacity based on distance
          const opacity = 1 - (distance / this.options.connectionDistance);
          this.ctx.strokeStyle = `rgba(42, 59, 143, ${opacity * 0.5})`;
          
          this.ctx.beginPath();
          this.ctx.moveTo(nodeA.x, nodeA.y);
          this.ctx.lineTo(nodeB.x, nodeB.y);
          this.ctx.stroke();
        }
      }
    }
  }
  
  drawNodes() {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      
      if (node.active) {
        this.ctx.fillStyle = this.options.colors.pulse;
      } else {
        this.ctx.fillStyle = this.options.colors.nodes;
      }
      
      this.ctx.fill();
    }
  }
  
  drawPulses() {
    for (let i = 0; i < this.pulses.length; i++) {
      const pulse = this.pulses[i];
      
      this.ctx.beginPath();
      this.ctx.arc(pulse.x, pulse.y, pulse.size, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(255, 193, 7, ${pulse.alpha * 0.5})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }
  
  animate() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Update
    this.updateNodes();
    this.updatePulses();
    
    // Draw
    this.drawConnections();
    this.drawNodes();
    this.drawPulses();
    
    // Continue animation loop
    requestAnimationFrame(() => this.animate());
  }
}

// Molecular Particles Animation for Background
class MolecularParticlesAnimation {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    
    // Default options
    this.options = {
      particleCount: options.particleCount || 50,
      particleSize: options.particleSize || { min: 2, max: 8 },
      colors: options.colors || ['#673AB7', '#4CAF50', '#2A3B8F'],
      speed: options.speed || { min: 0.2, max: 1 },
      connectionDistance: options.connectionDistance || 150,
      responsive: options.responsive !== undefined ? options.responsive : true,
      opacity: options.opacity || 0.7
    };
    
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 120 };
    
    this.init();
  }
  
  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    
    // Set canvas size
    this.setCanvasSize();
    
    // Create particles
    this.createParticles();
    
    // Add event listeners
    window.addEventListener('resize', () => this.handleResize());
    this.container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.container.addEventListener('mouseleave', () => this.handleMouseLeave());
    
    // Start animation loop
    this.animate();
  }
  
  setCanvasSize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
  
  createParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.options.particleCount; i++) {
      const size = Math.random() * (this.options.particleSize.max - this.options.particleSize.min) + this.options.particleSize.min;
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const speedX = (Math.random() - 0.5) * (this.options.speed.max - this.options.speed.min) + this.options.speed.min;
      const speedY = (Math.random() - 0.5) * (this.options.speed.max - this.options.speed.min) + this.options.speed.min;
      const color = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
      
      this.particles.push({
        x, y, size, speedX, speedY, color,
        originalSize: size,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      });
    }
  }
  
  handleResize() {
    if (!this.options.responsive) return;
    
    this.setCanvasSize();
    this.createParticles();
  }
  
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }
  
  handleMouseLeave() {
    this.mouse.x = null;
    this.mouse.y = null;
  }
  
  updateParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      // Move particles
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Rotate particles
      particle.angle += particle.rotationSpeed;
      
      // Bounce off edges
      if (particle.x < 0 || particle.x > this.width) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > this.height) particle.speedY *= -1;
      
      // Keep particles within bounds
      particle.x = Math.max(0, Math.min(this.width, particle.x));
      particle.y = Math.max(0, Math.min(this.height, particle.y));
      
      // Check mouse interaction
      if (this.mouse.x && this.mouse.y) {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.mouse.radius) {
          // Attract particles to mouse
          const angle = Math.atan2(dy, dx);
          const force = (this.mouse.radius - distance) / this.mouse.radius * 0.6;
          
          particle.x += Math.cos(angle) * force;
          particle.y += Math.sin(angle) * force;
          
          // Increase particle size when mouse is near
          particle.size = particle.originalSize * (1 + (1 - distance / this.mouse.radius) * 0.5);
        } else {
          particle.size = particle.originalSize;
        }
      } else {
        particle.size = particle.originalSize;
      }
    }
  }
  
  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      const particleA = this.particles[i];
      
      for (let j = i + 1; j < this.particles.length; j++) {
        const particleB = this.particles[j];
        
        const dx = particleB.x - particleA.x;
        const dy = particleB.y - particleA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.options.connectionDistance) {
          // Calculate opacity based on distance
          const opacity = (1 - (distance / this.options.connectionDistance)) * this.options.opacity;
          
          this.ctx.beginPath();
          this.ctx.moveTo(particleA.x, particleA.y);
          this.ctx.lineTo(particleB.x, particleB.y);
          this.ctx.strokeStyle = `rgba(103, 58, 183, ${opacity * 0.3})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }
  }
  
  drawParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      this.ctx.save();
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate(particle.angle);
      
      // Draw molecular shape
      this.ctx.beginPath();
      
      // Randomize shape type based on particle index
      if (i % 3 === 0) {
        // Hexagon (like benzene ring)
        const sides = 6;
        const radius = particle.size;
        
        this.ctx.moveTo(radius, 0);
        for (let j = 1; j <= sides; j++) {
          const angle = (j * 2 * Math.PI / sides);
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          this.ctx.lineTo(x, y);
        }
      } else if (i % 3 === 1) {
        // Circle (like atom)
        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
      } else {
        // Diamond (like carbon structure)
        this.ctx.moveTo(0, -particle.size);
        this.ctx.lineTo(particle.size, 0);
        this.ctx.lineTo(0, particle.size);
        this.ctx.lineTo(-particle.size, 0);
        this.ctx.closePath();
      }
      
      this.ctx.fillStyle = particle.color + Math.floor(this.options.opacity * 255).toString(16).padStart(2, '0');
      this.ctx.fill();
      
      this.ctx.restore();
    }
  }
  
  animate() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Update
    this.updateParticles();
    
    // Draw
    this.drawConnections();
    this.drawParticles();
    
    // Continue animation loop
    requestAnimationFrame(() => this.animate());
  }
}

// Brain Connectivity Animation for About Section
class BrainConnectivityAnimation {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    
    // Default options
    this.options = {
      nodeCount: options.nodeCount || 30,
      colors: options.colors || {
        nodes: ['#2A3B8F', '#4CAF50', '#673AB7', '#FFC107'],
        connections: 'rgba(96, 125, 139, 0.3)'
      },
      nodeSize: options.nodeSize || { min: 3, max: 8 },
      connectionStrength: options.connectionStrength || { min: 0.1, max: 1 },
      pulseSpeed: options.pulseSpeed || 0.02,
      responsive: options.responsive !== undefined ? options.responsive : true
    };
    
    this.nodes = [];
    this.connections = [];
    this.signals = [];
    this.isVisible = false;
    this.observer = null;
    
    this.init();
  }
  
  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    
    // Set canvas size
    this.setCanvasSize();
    
    // Create brain network
    this.createBrainNetwork();
    
    // Add event listeners
    window.addEventListener('resize', () => this.handleResize());
    
    // Set up intersection observer for scroll animation
    this.setupIntersectionObserver();
    
    // Start animation loop
    this.animate();
  }
  
  setCanvasSize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
  
  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
        
        if (this.isVisible) {
          // Generate new signals when becoming visible
          this.generateSignals(5);
        }
      });
    }, { threshold: 0.2 });
    
    this.observer.observe(this.container);
  }
  
  createBrainNetwork() {
    // Create nodes in a brain-like shape
    this.nodes = [];
    
    // Create nodes with brain region clustering
    const regions = [
      { x: this.width * 0.3, y: this.height * 0.4, radius: this.height * 0.25, count: Math.floor(this.options.nodeCount * 0.3) }, // Left hemisphere
      { x: this.width * 0.7, y: this.height * 0.4, radius: this.height * 0.25, count: Math.floor(this.options.nodeCount * 0.3) }, // Right hemisphere
      { x: this.width * 0.5, y: this.height * 0.3, radius: this.height * 0.2, count: Math.floor(this.options.nodeCount * 0.2) }, // Frontal lobe
      { x: this.width * 0.5, y: this.height * 0.6, radius: this.height * 0.15, count: Math.floor(this.options.nodeCount * 0.2) }  // Brain stem
    ];
    
    regions.forEach(region => {
      for (let i = 0; i < region.count; i++) {
        // Create node within region with random offset
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * region.radius;
        const x = region.x + Math.cos(angle) * distance;
        const y = region.y + Math.sin(angle) * distance;
        
        const size = Math.random() * (this.options.nodeSize.max - this.options.nodeSize.min) + this.options.nodeSize.min;
        const color = this.options.colors.nodes[Math.floor(Math.random() * this.options.colors.nodes.length)];
        const pulsePhase = Math.random() * Math.PI * 2;
        
        this.nodes.push({
          x, y, size, color, pulsePhase,
          originalSize: size,
          active: false
        });
      }
    });
    
    // Create connections between nodes
    this.connections = [];
    
    for (let i = 0; i < this.nodes.length; i++) {
      const nodeA = this.nodes[i];
      
      // Each node connects to 2-5 other nodes
      const connectionCount = Math.floor(Math.random() * 4) + 2;
      
      for (let c = 0; c < connectionCount; c++) {
        // Find a node to connect to (not already connected)
        let attempts = 0;
        let foundConnection = false;
        
        while (!foundConnection && attempts < 10) {
          const j = Math.floor(Math.random() * this.nodes.length);
          
          if (i !== j) {
            const nodeB = this.nodes[j];
            
            // Check if connection already exists
            const connectionExists = this.connections.some(conn => 
              (conn.sourceIndex === i && conn.targetIndex === j) || 
              (conn.sourceIndex === j && conn.targetIndex === i)
            );
            
            if (!connectionExists) {
              const strength = Math.random() * (this.options.connectionStrength.max - this.options.connectionStrength.min) + this.options.connectionStrength.min;
              
              this.connections.push({
                sourceIndex: i,
                targetIndex: j,
                strength
              });
              
              foundConnection = true;
            }
          }
          
          attempts++;
        }
      }
    }
  }
  
  handleResize() {
    if (!this.options.responsive) return;
    
    this.setCanvasSize();
    this.createBrainNetwork();
  }
  
  generateSignals(count = 1) {
    for (let i = 0; i < count; i++) {
      // Select random connection for signal
      if (this.connections.length === 0) return;
      
      const connectionIndex = Math.floor(Math.random() * this.connections.length);
      const connection = this.connections[connectionIndex];
      
      const sourceNode = this.nodes[connection.sourceIndex];
      const targetNode = this.nodes[connection.targetIndex];
      
      this.signals.push({
        sourceX: sourceNode.x,
        sourceY: sourceNode.y,
        targetX: targetNode.x,
        targetY: targetNode.y,
        progress: 0,
        speed: 0.01 + Math.random() * 0.02,
        color: sourceNode.color,
        size: 2 + Math.random() * 2,
        connectionIndex
      });
      
      // Activate source node
      sourceNode.active = true;
    }
  }
  
  updateNodes() {
    const time = performance.now() * 0.001;
    
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      
      // Pulse effect
      const pulse = Math.sin(time * this.options.pulseSpeed + node.pulsePhase) * 0.2 + 0.8;
      node.size = node.originalSize * (node.active ? 1.5 : 1) * pulse;
      
      // Reset active state (will be set by signals)
      node.active = false;
    }
  }
  
  updateSignals() {
    // Generate new signals randomly when visible
    if (this.isVisible && Math.random() < 0.02) {
      this.generateSignals();
    }
    
    // Update existing signals
    for (let i = this.signals.length - 1; i >= 0; i--) {
      const signal = this.signals[i];
      
      // Move signal along connection
      signal.progress += signal.speed;
      
      if (signal.progress >= 1) {
        // Activate target node
        const connection = this.connections[signal.connectionIndex];
        this.nodes[connection.targetIndex].active = true;
        
        // Remove completed signal
        this.signals.splice(i, 1);
        
        // Sometimes generate a new signal from the target
        if (Math.random() < 0.3) {
          this.generateSignals();
        }
      }
    }
  }
  
  drawConnections() {
    this.ctx.lineWidth = 0.5;
    
    for (let i = 0; i < this.connections.length; i++) {
      const connection = this.connections[i];
      const sourceNode = this.nodes[connection.sourceIndex];
      const targetNode = this.nodes[connection.targetIndex];
      
      // Draw connection line
      this.ctx.beginPath();
      this.ctx.moveTo(sourceNode.x, sourceNode.y);
      this.ctx.lineTo(targetNode.x, targetNode.y);
      this.ctx.strokeStyle = this.options.colors.connections;
      this.ctx.globalAlpha = connection.strength;
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
    }
  }
  
  drawNodes() {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      this.ctx.fillStyle = node.color;
      this.ctx.fill();
      
      // Add glow effect for active nodes
      if (node.active) {
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.size * 1.5, 0, Math.PI * 2);
        this.ctx.fillStyle = node.color + '33'; // 20% opacity
        this.ctx.fill();
      }
    }
  }
  
  drawSignals() {
    for (let i = 0; i < this.signals.length; i++) {
      const signal = this.signals[i];
      
      // Calculate current position
      const x = signal.sourceX + (signal.targetX - signal.sourceX) * signal.progress;
      const y = signal.sourceY + (signal.targetY - signal.sourceY) * signal.progress;
      
      // Draw signal
      this.ctx.beginPath();
      this.ctx.arc(x, y, signal.size, 0, Math.PI * 2);
      this.ctx.fillStyle = signal.color;
      this.ctx.fill();
      
      // Draw trail
      this.ctx.beginPath();
      this.ctx.moveTo(signal.sourceX, signal.sourceY);
      this.ctx.lineTo(x, y);
      this.ctx.strokeStyle = signal.color + '66'; // 40% opacity
      this.ctx.lineWidth = signal.size * 0.8;
      this.ctx.stroke();
    }
  }
  
  animate() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Update
    this.updateNodes();
    this.updateSignals();
    
    // Draw
    this.drawConnections();
    this.drawNodes();
    this.drawSignals();
    
    // Continue animation loop
    requestAnimationFrame(() => this.animate());
  }
}

// DNA Helix Animation for Projects Section
class DNAHelixAnimation {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    
    // Default options
    this.options = {
      basePairs: options.basePairs || 20,
      colors: options.colors || {
        strand1: '#2A3B8F',
        strand2: '#4CAF50',
        basePair1: '#FFC107',
        basePair2: '#673AB7'
      },
      radius: options.radius || this.width * 0.1,
      verticalSpacing: options.verticalSpacing || 15,
      rotationSpeed: options.rotationSpeed || 0.01,
      responsive: options.responsive !== undefined ? options.responsive : true
    };
    
    this.rotation = 0;
    this.isVisible = false;
    this.observer = null;
    
    this.init();
  }
  
  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    
    // Set canvas size
    this.setCanvasSize();
    
    // Add event listeners
    window.addEventListener('resize', () => this.handleResize());
    
    // Set up intersection observer for scroll animation
    this.setupIntersectionObserver();
    
    // Start animation loop
    this.animate();
  }
  
  setCanvasSize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Update radius based on width
    this.options.radius = this.width * 0.1;
  }
  
  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.2 });
    
    this.observer.observe(this.container);
  }
  
  handleResize() {
    if (!this.options.responsive) return;
    
    this.setCanvasSize();
  }
  
  drawDNAHelix() {
    const centerX = this.width / 2;
    const startY = this.height * 0.1;
    const endY = this.height * 0.9;
    const totalHeight = endY - startY;
    
    // Calculate number of base pairs based on height
    const basePairs = Math.floor(totalHeight / this.options.verticalSpacing);
    
    for (let i = 0; i < basePairs; i++) {
      const y = startY + i * this.options.verticalSpacing;
      const angle = this.rotation + i * (Math.PI / 10);
      
      // Calculate strand positions
      const x1 = centerX + Math.cos(angle) * this.options.radius;
      const x2 = centerX + Math.cos(angle + Math.PI) * this.options.radius;
      
      // Draw base pair connection
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y);
      this.ctx.lineTo(x2, y);
      this.ctx.strokeStyle = i % 2 === 0 ? this.options.colors.basePair1 : this.options.colors.basePair2;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Draw strand 1 node
      this.ctx.beginPath();
      this.ctx.arc(x1, y, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = this.options.colors.strand1;
      this.ctx.fill();
      
      // Draw strand 2 node
      this.ctx.beginPath();
      this.ctx.arc(x2, y, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = this.options.colors.strand2;
      this.ctx.fill();
    }
    
    // Draw backbone strands
    this.ctx.beginPath();
    for (let i = 0; i < basePairs; i++) {
      const y = startY + i * this.options.verticalSpacing;
      const angle = this.rotation + i * (Math.PI / 10);
      const x = centerX + Math.cos(angle) * this.options.radius;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.strokeStyle = this.options.colors.strand1;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    this.ctx.beginPath();
    for (let i = 0; i < basePairs; i++) {
      const y = startY + i * this.options.verticalSpacing;
      const angle = this.rotation + i * (Math.PI / 10);
      const x = centerX + Math.cos(angle + Math.PI) * this.options.radius;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.strokeStyle = this.options.colors.strand2;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
  
  animate() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Update rotation if visible
    if (this.isVisible) {
      this.rotation += this.options.rotationSpeed;
    }
    
    // Draw DNA helix
    this.drawDNAHelix();
    
    // Continue animation loop
    requestAnimationFrame(() => this.animate());
  }
}

// Skill Bar Animation
class SkillBarAnimation {
  constructor(containerSelector, options = {}) {
    this.containers = document.querySelectorAll(containerSelector);
    
    // Default options
    this.options = {
      colors: options.colors || {
        bar: '#4CAF50',
        background: '#f0f0f0',
        pulse: '#FFC107'
      },
      animationDuration: options.animationDuration || 1500,
      pulseFrequency: options.pulseFrequency || 3000
    };
    
    this.init();
  }
  
  init() {
    this.containers.forEach(container => {
      // Get skill value
      const value = parseInt(container.getAttribute('data-value') || 0);
      const label = container.getAttribute('data-label') || '';
      
      // Create skill bar elements
      this.createSkillBar(container, value, label);
      
      // Set up intersection observer for animation
      this.setupIntersectionObserver(container);
    });
  }
  
  createSkillBar(container, value, label) {
    // Clear container
    container.innerHTML = '';
    
    // Create label
    const labelElement = document.createElement('div');
    labelElement.className = 'skill-label';
    labelElement.textContent = label;
    container.appendChild(labelElement);
    
    // Create value display
    const valueElement = document.createElement('div');
    valueElement.className = 'skill-value';
    valueElement.textContent = value + '%';
    container.appendChild(valueElement);
    
    // Create bar container
    const barContainer = document.createElement('div');
    barContainer.className = 'skill-bar-container';
    barContainer.style.position = 'relative';
    barContainer.style.height = '10px';
    barContainer.style.backgroundColor = this.options.colors.background;
    barContainer.style.borderRadius = '5px';
    barContainer.style.overflow = 'hidden';
    barContainer.style.marginTop = '5px';
    container.appendChild(barContainer);
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'skill-progress';
    progressBar.style.position = 'absolute';
    progressBar.style.top = '0';
    progressBar.style.left = '0';
    progressBar.style.height = '100%';
    progressBar.style.width = '0%';
    progressBar.style.backgroundColor = this.options.colors.bar;
    progressBar.style.borderRadius = '5px';
    progressBar.style.transition = `width ${this.options.animationDuration}ms cubic-bezier(0.17, 0.67, 0.83, 0.67)`;
    barContainer.appendChild(progressBar);
    
    // Create pulse effect
    const pulseElement = document.createElement('div');
    pulseElement.className = 'skill-pulse';
    pulseElement.style.position = 'absolute';
    pulseElement.style.top = '0';
    pulseElement.style.height = '100%';
    pulseElement.style.width = '10px';
    pulseElement.style.backgroundColor = this.options.colors.pulse;
    pulseElement.style.opacity = '0';
    pulseElement.style.borderRadius = '50%';
    pulseElement.style.filter = 'blur(5px)';
    barContainer.appendChild(pulseElement);
    
    // Store elements and values
    container.progressBar = progressBar;
    container.pulseElement = pulseElement;
    container.skillValue = value;
  }
  
  setupIntersectionObserver(container) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate progress bar
          this.animateSkillBar(container);
          
          // Unobserve after animation
          observer.unobserve(container);
        }
      });
    }, { threshold: 0.2 });
    
    observer.observe(container);
  }
  
  animateSkillBar(container) {
    // Animate progress bar
    setTimeout(() => {
      container.progressBar.style.width = container.skillValue + '%';
      
      // Start pulse animation after progress bar animation
      setTimeout(() => {
        this.startPulseAnimation(container);
      }, this.options.animationDuration);
    }, 200);
  }
  
  startPulseAnimation(container) {
    const animate = () => {
      const progressWidth = container.skillValue;
      const pulseElement = container.pulseElement;
      
      // Reset pulse position
      pulseElement.style.left = '0';
      pulseElement.style.opacity = '0.7';
      
      // Animate pulse across the bar
      pulseElement.style.transition = `left ${this.options.pulseFrequency}ms linear, opacity 300ms ease-in ${this.options.pulseFrequency - 300}ms`;
      
      setTimeout(() => {
        pulseElement.style.left = progressWidth + '%';
        pulseElement.style.opacity = '0';
      }, 50);
      
      // Repeat animation
      setTimeout(animate, this.options.pulseFrequency + 200);
    };
    
    animate();
  }
}

// Scroll Trigger Animation Controller
class ScrollTriggerAnimations {
  constructor() {
    this.animatedElements = [];
    this.observer = null;
    
    this.init();
  }
  
  init() {
    // Set up intersection observer
    this.setupIntersectionObserver();
    
    // Find and register animated elements
    this.registerAnimatedElements();
    
    // Add scroll event listener for parallax effects
    window.addEventListener('scroll', () => this.handleScroll());
  }
  
  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.triggerAnimation(entry.target);
        } else {
          // Optional: reset animation when out of view
          if (entry.target.dataset.reset === 'true') {
            this.resetAnimation(entry.target);
          }
        }
      });
    }, { threshold: 0.2 });
  }
  
  registerAnimatedElements() {
    // Find elements with data-animate attribute
    const elements = document.querySelectorAll('[data-animate]');
    
    elements.forEach(element => {
      // Add to animated elements array
      this.animatedElements.push(element);
      
      // Prepare element for animation
      this.prepareElement(element);
      
      // Observe element
      this.observer.observe(element);
    });
  }
  
  prepareElement(element) {
    const animationType = element.dataset.animate;
    const delay = parseInt(element.dataset.delay || 0);
    
    // Set initial styles based on animation type
    switch (animationType) {
      case 'fade-in':
        element.style.opacity = '0';
        element.style.transition = `opacity 0.8s ease ${delay}ms`;
        break;
        
      case 'slide-up':
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)';
        element.style.transition = `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`;
        break;
        
      case 'slide-in-left':
        element.style.opacity = '0';
        element.style.transform = 'translateX(-50px)';
        element.style.transition = `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`;
        break;
        
      case 'slide-in-right':
        element.style.opacity = '0';
        element.style.transform = 'translateX(50px)';
        element.style.transition = `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`;
        break;
        
      case 'scale-in':
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        element.style.transition = `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`;
        break;
        
      case 'rotate-in':
        element.style.opacity = '0';
        element.style.transform = 'rotate(-10deg) scale(0.8)';
        element.style.transition = `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`;
        break;
    }
  }
  
  triggerAnimation(element) {
    const animationType = element.dataset.animate;
    
    // Apply animation based on type
    switch (animationType) {
      case 'fade-in':
        element.style.opacity = '1';
        break;
        
      case 'slide-up':
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        break;
        
      case 'slide-in-left':
      case 'slide-in-right':
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
        break;
        
      case 'scale-in':
        element.style.opacity = '1';
        element.style.transform = 'scale(1)';
        break;
        
      case 'rotate-in':
        element.style.opacity = '1';
        element.style.transform = 'rotate(0) scale(1)';
        break;
        
      case 'count-up':
        this.animateCountUp(element);
        break;
        
      case 'type-writer':
        this.animateTypeWriter(element);
        break;
    }
    
    // Add class for additional CSS animations
    element.classList.add('animated');
  }
  
  resetAnimation(element) {
    const animationType = element.dataset.animate;
    
    // Remove transition temporarily
    const currentTransition = element.style.transition;
    element.style.transition = 'none';
    
    // Force reflow
    void element.offsetWidth;
    
    // Reset based on animation type
    this.prepareElement(element);
    
    // Restore transition
    setTimeout(() => {
      element.style.transition = currentTransition;
    }, 50);
    
    // Remove animated class
    element.classList.remove('animated');
  }
  
  animateCountUp(element) {
    const target = parseInt(element.dataset.target || 0);
    const duration = parseInt(element.dataset.duration || 2000);
    const startTime = performance.now();
    const startValue = 0;
    
    const updateValue = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = Math.floor(startValue + (target - startValue) * easeProgress);
      element.textContent = currentValue;
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        element.textContent = target;
      }
    };
    
    requestAnimationFrame(updateValue);
  }
  
  animateTypeWriter(element) {
    const text = element.dataset.text || element.textContent;
    const duration = parseInt(element.dataset.duration || 2000);
    const cursorElement = document.createElement('span');
    
    // Prepare element
    element.textContent = '';
    cursorElement.className = 'typewriter-cursor';
    cursorElement.textContent = '|';
    cursorElement.style.animation = 'cursor-blink 1s infinite';
    element.appendChild(cursorElement);
    
    // Calculate delay between characters
    const charDelay = duration / text.length;
    let charIndex = 0;
    
    // Type characters one by one
    const typeNextChar = () => {
      if (charIndex < text.length) {
        const char = document.createTextNode(text.charAt(charIndex));
        element.insertBefore(char, cursorElement);
        charIndex++;
        
        setTimeout(typeNextChar, charDelay);
      }
    };
    
    // Start typing
    setTimeout(typeNextChar, 200);
  }
  
  handleScroll() {
    // Find elements with parallax effect
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    parallaxElements.forEach(element => {
      const speed = parseFloat(element.dataset.parallax || 0.5);
      const scrollY = window.scrollY;
      
      // Apply parallax transform
      element.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add CSS for animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cursor-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    
    .skill-label {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .skill-value {
      position: absolute;
      right: 0;
      top: 0;
      font-size: 14px;
    }
    
    [data-animate] {
      will-change: opacity, transform;
    }
  `;
  document.head.appendChild(style);
});
