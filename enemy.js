// Enemy.js - Accept difficulty multiplier

    class Enemy {
      // Added difficultyMultiplier to constructor
      constructor(x, y, type = 'chaser', difficulty = 1.0) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        // Scale base speed by difficulty
        this.baseMaxSpeed = (type === 'shooter') ? random(0.8, 1.5) : random(1.5, 3);
        this.maxSpeed = this.baseMaxSpeed * (1 + (difficulty - 1) * 0.3); // Speed increases moderately
        this.maxForce = 0.1 * (1 + (difficulty - 1) * 0.2); // Steering force increases slightly
        this.type = type;
        this.size = 30;
        this.radius = this.size / 2;
        // Scale base health by difficulty
        this.baseHealth = (type === 'shooter') ? 2 : 1;
        this.health = ceil(this.baseHealth * (1 + (difficulty - 1) * 0.4)); // Health increases moderately
        this.points = ((type === 'shooter') ? 25 : 10) * difficulty; // Scale points
        this.color = (type === 'shooter') ? color(255, 100, 0) : color(255, 0, 0);
        this.glowColor = color(red(this.color), green(this.color), blue(this.color), 100);
        this.canDamage = true;

        // AI State / Timers
        this.state = (type === 'shooter') ? 'positioning' : 'seeking';
        this.stateTimer = 0;
        this.dodgeCooldown = 30;
        this.dodgeTimer = 0;

        // Type-specific properties
        if (this.type === 'shooter') {
          this.shootCooldown = max(45, 90 / (1 + (difficulty - 1) * 0.3)); // Shoots faster with difficulty
          this.shootTimer = random(this.shootCooldown);
          this.preferredShootingRange = random(150, 300);
        }
      }

      // --- Core Movement ---
      applyForce(force) { this.acc.add(force); }
      seek(target) { /* Keep as is */ let desired = p5.Vector.sub(target, this.pos); desired.setMag(this.maxSpeed); let steer = p5.Vector.sub(desired, this.vel); steer.limit(this.maxForce); return steer; }
      flee(target, range = 100) { /* Keep as is */ let desired = p5.Vector.sub(this.pos, target); if (desired.mag() < range) { desired.setMag(this.maxSpeed); let steer = p5.Vector.sub(desired, this.vel); steer.limit(this.maxForce * 1.5); return steer; } return createVector(0, 0); }
      dodge(bullets) { /* Keep as is */ if (this.dodgeTimer > 0) return createVector(0,0); let dangerZone = this.radius * 3; let closestBulletDist = Infinity; let closestBullet = null; for (let bullet of bullets) { if (!bullet) continue; let d = dist(this.pos.x, this.pos.y, bullet.pos.x, bullet.pos.y); if (d < dangerZone && d < closestBulletDist) { if (bullet.pos.y > this.pos.y && abs(bullet.pos.x - this.pos.x) < this.radius * 2) { closestBulletDist = d; closestBullet = bullet; } } } if (closestBullet) { let desired = p5.Vector.sub(this.pos, closestBullet.pos); let dodgeForce = createVector(-desired.y, desired.x); if (abs(closestBullet.pos.x - this.pos.x) < 5) { dodgeForce.x = (random() > 0.5 ? 1 : -1) * this.maxSpeed; dodgeForce.y = 0; } else { dodgeForce.setMag(this.maxSpeed); } let steer = p5.Vector.sub(dodgeForce, this.vel); steer.limit(this.maxForce * 2.0); this.dodgeTimer = this.dodgeCooldown; return steer; } return createVector(0, 0); }

      // --- Update Logic ---
      update(player, playerBullets, timeScale = 1) { /* Keep AI logic, apply timeScale to timers/physics */ this.stateTimer -= timeScale; this.dodgeTimer -= timeScale; let steeringForce = createVector(0, 0); let dodgeForce = this.dodge(playerBullets); if (dodgeForce.magSq() > 0) { steeringForce.add(dodgeForce); this.state = 'fleeing'; this.stateTimer = 15; } else { if (this.type === 'chaser') { steeringForce.add(this.seek(player.pos)); } else if (this.type === 'shooter') { let distanceToPlayer = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y); if (this.state === 'positioning') { let targetPos = player.pos.copy(); let desiredOffset = p5.Vector.sub(this.pos, player.pos).setMag(this.preferredShootingRange); targetPos.add(desiredOffset); targetPos.y = constrain(targetPos.y, height * 0.1, height * 0.5); steeringForce.add(this.seek(targetPos)); let strafeForce = createVector(cos(frameCount * 0.05 + this.pos.y), 0); strafeForce.mult(this.maxForce * 0.5); steeringForce.add(strafeForce); if (distanceToPlayer < this.preferredShootingRange * 1.2 && distanceToPlayer > this.preferredShootingRange * 0.8) { this.state = 'shooting'; this.stateTimer = random(120, 240); } } else if (this.state === 'shooting') { if (distanceToPlayer < this.preferredShootingRange * 0.7) { steeringForce.add(this.flee(player.pos, this.preferredShootingRange)); } else { let strafeForce = createVector(cos(frameCount * 0.05 + this.pos.y), 0); strafeForce.mult(this.maxForce * 0.3); steeringForce.add(strafeForce); } if (this.stateTimer <= 0) { this.state = 'positioning'; } } } } this.applyForce(steeringForce); this.vel.add(p5.Vector.mult(this.acc, timeScale)); this.vel.limit(this.maxSpeed * timeScale); this.pos.add(p5.Vector.mult(this.vel, timeScale)); this.acc.mult(0); if (this.type === 'shooter') { this.shootTimer += timeScale; } }
      display() { /* Keep as is */ noStroke(); for (let i = 3; i > 0; i--) { fill(this.glowColor.levels[0], this.glowColor.levels[1], this.glowColor.levels[2], 50 / i); ellipse(this.pos.x, this.pos.y, this.size + i * 4, this.size + i * 4); } fill(this.color); stroke(255); strokeWeight(1); push(); translate(this.pos.x, this.pos.y); if (this.type === 'chaser') { rotate(PI / 4); rect(0, 0, this.size * 0.8, this.size * 0.8); } else if (this.type === 'shooter') { rect(0, 0, this.size * 1.2, this.size * 0.7); } pop(); }
      takeDamage(amount) { this.health -= amount; }
      isOffscreen(h = height) { /* Keep as is */ return this.pos.y > h + this.size * 2 || this.pos.y < -this.size * 2 || this.pos.x < -this.size * 2 || this.pos.x > width + this.size * 2; }
      canShoot(timeScale = 1) { return this.type === 'shooter' && this.state === 'shooting' && this.shootTimer >= this.shootCooldown; }
      shoot(targetPos) { if (this.canShoot()) { this.shootTimer = 0; return new EnemyBullet(this.pos.x, this.pos.y + this.size / 2, targetPos); } return null; }
      hitObstacle() { this.vel.mult(-0.5); if (this.type === 'shooter') { this.state = 'positioning'; } }
    }
