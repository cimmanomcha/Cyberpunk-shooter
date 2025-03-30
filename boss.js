// Boss.js - Accept difficulty multiplier

    class Boss {
      // Added difficultyMultiplier to constructor
      constructor(x, y, difficulty = 1.0) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 2);
        this.size = 150;
        this.radius = this.size / 2;
        this.color = color(200, 50, 250);
        this.glowColor = color(200, 50, 250, 150);
        this.name = "CYBER BEHEMOTH";

        // Scale health and points by difficulty
        this.baseMaxHealth = 100;
        this.maxHealth = this.baseMaxHealth * (1 + (difficulty - 1) * 0.6); // Health scales significantly
        this.health = this.maxHealth;
        this.points = 500; // Base points (scaling handled in sketch.js on defeat)

        // Phases & States
        this.currentPhase = 0;
        this.phaseHealthThresholds = [0.7, 0.3];
        this.state = 'entering';
        this.stateTimer = 0;

        // Attack Patterns (Could potentially scale cooldowns/counts with difficulty here too)
        this.attackPatterns = [ /* Keep patterns as defined before */ [[{ type: 'burstFire', cooldown: 120, timer: 60, duration: 60, bulletsPerShot: 5, spread: PI / 8 }, { type: 'laserSweep', cooldown: 300, timer: 200, duration: 180, telegraph: 60 },], [{ type: 'burstFire', cooldown: 90, timer: 0, duration: 45, bulletsPerShot: 7, spread: PI / 6 }, { type: 'spawnMinions', cooldown: 400, timer: 300, count: 3 }, { type: 'homingMissiles', cooldown: 240, timer: 120, count: 2 },]] ];
        this.activeAttackTimers = [];

        // Movement
        this.targetPos = createVector(width / 2, height * 0.2);
        this.maxSpeed = 1.5 * (1 + (difficulty - 1) * 0.2); // Slightly faster boss
        this.maxForce = 0.05;

        // Telegraphing
        this.telegraphingAttack = null;
        this.telegraphTimer = 0;
        this.telegraphColor = color(255, 255, 0, 150);

         // Destructible Parts (Health could scale too)
         this.parts = [ { name: 'left_turret', pos: createVector(-50, 20), health: 20 * difficulty, active: true, size: 25 }, { name: 'right_turret', pos: createVector(50, 20), health: 20 * difficulty, active: true, size: 25 } ];
      }

      // --- Core Logic ---
      enter() { /* Keep */ this.state = 'entering'; this.vel = createVector(0, 2); }
      update(player, enemyBullets, timeScale = 1) { /* Keep state machine, movement, attack execution */ this.stateTimer -= timeScale; if (this.state === 'entering') { this.pos.add(p5.Vector.mult(this.vel, timeScale)); if (this.pos.y >= this.targetPos.y) { this.pos.y = this.targetPos.y; this.vel.mult(0); this.changePhase(1); } } else if (this.state === 'attacking') { this.handleMovement(player, timeScale); this.executeAttackPattern(player, enemyBullets, timeScale); this.checkPhaseChange(); } else if (this.state === 'changing_phase') { if (this.stateTimer <= 0) { this.state = 'attacking'; this.initializeAttackTimers(); } } else if (this.state === 'defeated') { this.vel.mult(0.98); this.pos.add(p5.Vector.mult(this.vel, timeScale)); } if (this.telegraphingAttack) { this.telegraphTimer -= timeScale; if (this.telegraphTimer <= 0) { this.telegraphingAttack = null; } } for (let part of this.parts) { if (!part.active) continue; } }
      handleMovement(player, timeScale) { /* Keep */ let targetX = width / 2 + sin(frameCount * 0.01 * timeScale) * (width * 0.3); let desired = createVector(targetX - this.pos.x, 0); desired.setMag(this.maxSpeed); let steer = p5.Vector.sub(desired, this.vel); steer.limit(this.maxForce); this.vel.add(p5.Vector.mult(steer, timeScale)); this.vel.limit(this.maxSpeed * timeScale); this.pos.add(this.vel); this.pos.x = constrain(this.pos.x, this.radius, width - this.radius); }
      checkPhaseChange() { /* Keep */ let healthRatio = this.health / this.maxHealth; let nextPhase = this.currentPhase; for (let i = 0; i < this.phaseHealthThresholds.length; i++) { if (this.currentPhase === i + 1 && healthRatio <= this.phaseHealthThresholds[i]) { nextPhase = i + 2; break; } } if (nextPhase !== this.currentPhase) { this.changePhase(nextPhase); } }
      changePhase(newPhase) { /* Keep */ console.log(`Boss changing to Phase ${newPhase}`); this.currentPhase = newPhase; this.state = 'changing_phase'; this.stateTimer = 60; this.telegraphingAttack = null; shockwaves.push(new Shockwave(this.pos.x, this.pos.y, this.size * 2, this.color, 3, 60)); this.initializeAttackTimers(); } // Initialize timers on phase change now
      initializeAttackTimers() { /* Keep */ this.activeAttackTimers = []; let phaseIndex = this.currentPhase - 1; if (phaseIndex >= 0 && phaseIndex < this.attackPatterns.length) { this.attackPatterns[phaseIndex].forEach(pattern => { this.activeAttackTimers.push(pattern.timer || random(pattern.cooldown * 0.5, pattern.cooldown)); }); } }
      executeAttackPattern(player, enemyBullets, timeScale) { /* Keep */ let phaseIndex = this.currentPhase - 1; if (phaseIndex < 0 || phaseIndex >= this.attackPatterns.length) return; let currentPatterns = this.attackPatterns[phaseIndex]; for (let i = 0; i < currentPatterns.length; i++) { this.activeAttackTimers[i] -= timeScale; if (this.activeAttackTimers[i] <= 0) { let pattern = currentPatterns[i]; if (pattern.telegraph && !this.telegraphingAttack) { if (this.activeAttackTimers[i] <= -pattern.telegraph) { this.performAttack(pattern, player, enemyBullets); this.activeAttackTimers[i] = pattern.cooldown; this.telegraphingAttack = null; } else if (this.telegraphingAttack !== pattern.type) { this.telegraphingAttack = pattern.type; this.telegraphTimer = pattern.telegraph; } } else if (!this.telegraphingAttack) { this.performAttack(pattern, player, enemyBullets); this.activeAttackTimers[i] = pattern.cooldown; } } } }
      performAttack(pattern, player, enemyBullets) { /* Keep attack logic */ if (pattern.type === 'burstFire') { let angleToPlayer = atan2(player.pos.y - this.pos.y, player.pos.x - this.pos.x); let startAngle = angleToPlayer - pattern.spread / 2; let angleStep = pattern.spread / (pattern.bulletsPerShot - 1); for (let i = 0; i < pattern.bulletsPerShot; i++) { let angle = startAngle + i * angleStep; let speed = 4; let bulletPos = this.pos.copy(); let targetPos = createVector(this.pos.x + cos(angle) * 100, this.pos.y + sin(angle) * 100); enemyBullets.push(new EnemyBullet(bulletPos.x, bulletPos.y, targetPos, speed, 12, color(255, 50, 50))); } } else if (pattern.type === 'laserSweep') { let laserBullet = new EnemyBullet(this.pos.x, this.pos.y, player.pos, 10, 8, color(255, 0, 0), 0.5); enemyBullets.push(laserBullet); } else if (pattern.type === 'spawnMinions') { for (let i = 0; i < pattern.count; i++) { let spawnX = this.pos.x + random(-this.radius, this.radius); let spawnY = this.pos.y + this.radius / 2; enemies.push(new Enemy(spawnX, spawnY, 'chaser', difficultyMultiplier)); /* Pass difficulty */ playEnemySpawnSound(); } } else if (pattern.type === 'homingMissiles') { /* Placeholder */ } }
      display() { /* Keep display logic */ push(); translate(this.pos.x, this.pos.y); noStroke(); let baseGlow = this.glowColor; if (this.telegraphingAttack) { let flash = abs(sin(frameCount * 0.2)); baseGlow = lerpColor(this.glowColor, this.telegraphColor, flash); } for (let i = 5; i > 0; i--) { fill(red(baseGlow), green(baseGlow), blue(baseGlow), (alpha(baseGlow) / i) * 0.8); ellipse(0, 0, this.size + i * 10, this.size + i * 10); } fill(this.color); stroke(255); strokeWeight(2); beginShape(); for (let i = 0; i < 6; i++) { let angle = TWO_PI / 6 * i + PI/6; let vx = cos(angle) * this.radius; let vy = sin(angle) * this.radius; vertex(vx, vy); } endShape(CLOSE); fill(255, 0, 0); ellipse(0, 0, this.radius * 0.4, this.radius * 0.4); for (let part of this.parts) { if (!part.active) continue; fill(150, 150, 150); stroke(200); ellipse(part.pos.x, part.pos.y, part.size, part.size); rect(part.pos.x, part.pos.y + part.size*0.6, part.size*0.3, part.size*0.5); } pop(); if (this.telegraphingAttack === 'laserSweep' && this.telegraphTimer > 0) { strokeWeight(map(this.telegraphTimer, pattern.telegraph, 0, 1, 5)); stroke(255, 0, 0, map(this.telegraphTimer, pattern.telegraph, 0, 100, 200)); line(this.pos.x, this.pos.y, player.pos.x, player.pos.y); } }
      takeDamage(amount) { /* Keep */ if (this.state === 'entering' || this.state === 'changing_phase' || this.state === 'defeated') return; this.health -= amount; this.health = max(0, this.health); if (this.health <= 0) { this.defeat(); } }
      hits(bullet) { /* Keep */ if (this.state === 'entering' || this.state === 'changing_phase' || this.state === 'defeated') return false; let d = dist(this.pos.x, this.pos.y, bullet.pos.x, bullet.pos.y); return d < this.radius + bullet.size / 2; }
      defeat() { /* Keep */ this.state = 'defeated'; this.vel = createVector(random(-1, 1), -1); this.telegraphingAttack = null; }
      isDefeated() { /* Keep */ return this.health <= 0 && this.state === 'defeated'; }
    }
