// StealthEnemy.js - Accept difficulty multiplier

    // Pass difficulty to parent Enemy constructor
    class StealthEnemy extends Enemy {
      constructor(x, y, difficulty = 1.0) { // Added difficulty
        super(x, y, 'stealth', difficulty); // Pass difficulty to parent

        // Override base stats AFTER parent constructor sets them based on difficulty
        this.color = color(150, 0, 255);
        this.glowColor = color(150, 0, 255, 100);
        this.baseHealth = 3; // Stealth base health
        this.health = ceil(this.baseHealth * (1 + (difficulty - 1) * 0.4)); // Recalculate health
        this.points = 40 * difficulty; // Scale points
        this.baseMaxSpeed = random(1.8, 2.5); // Stealth base speed
        this.maxSpeed = this.baseMaxSpeed * (1 + (difficulty - 1) * 0.3); // Recalculate speed

        // Stealth mechanics
        this.isVisible = false;
        this.canDamage = false;
        this.phaseTimer = 0;
        this.visibleDuration = 120;
        this.invisibleDuration = 180;
        this.phaseTimer = random(this.invisibleDuration);

        // Shooter capabilities
        this.isShooterVariant = random() > 0.5;
        this.shootCooldown = max(40, 75 / (1 + (difficulty - 1) * 0.3)); // Faster shooting too
        this.shootTimer = 0;
        this.preferredShootingRange = random(100, 200);
      }

      update(player, playerBullets, timeScale = 1) { /* Keep phase and movement logic, uses scaled speed/force from parent */ this.phaseTimer += timeScale; if (this.isVisible) { if (this.phaseTimer >= this.visibleDuration) { this.isVisible = false; this.canDamage = false; this.phaseTimer = 0; } } else { if (this.phaseTimer >= this.invisibleDuration) { this.isVisible = true; this.canDamage = true; this.phaseTimer = 0; } } let steeringForce = createVector(0, 0); let dodgeForce = this.dodge(playerBullets); if (dodgeForce.magSq() > 0 && this.isVisible) { steeringForce.add(dodgeForce); } else { if (this.isVisible) { if (this.isShooterVariant) { let distanceToPlayer = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y); if (distanceToPlayer < this.preferredShootingRange * 0.8) { steeringForce.add(this.flee(player.pos, this.preferredShootingRange)); } else { steeringForce.add(this.seek(player.pos)); } } else { steeringForce.add(this.seek(player.pos)); } } else { let wanderForce = p5.Vector.random2D().mult(this.maxForce * 0.3); steeringForce.add(wanderForce); steeringForce.add(this.seek(player.pos).mult(0.1)); } } this.applyForce(steeringForce); this.vel.add(p5.Vector.mult(this.acc, timeScale)); this.vel.limit(this.maxSpeed * timeScale); this.pos.add(p5.Vector.mult(this.vel, timeScale)); this.acc.mult(0); if (this.isShooterVariant) { this.shootTimer += timeScale; } }
      display() { /* Keep display logic with alpha based on visibility */ let currentAlpha = this.isVisible ? 255 : 80; let glowAlpha = this.isVisible ? 100 : 40; noStroke(); for (let i = 3; i > 0; i--) { fill(this.glowColor.levels[0], this.glowColor.levels[1], this.glowColor.levels[2], (glowAlpha / i) * (currentAlpha / 255)); ellipse(this.pos.x, this.pos.y, this.size + i * 4, this.size + i * 4); } fill(red(this.color), green(this.color), blue(this.color), currentAlpha); stroke(255, currentAlpha); strokeWeight(1); push(); translate(this.pos.x, this.pos.y); beginShape(); let points = 8; for (let i = 0; i < points; i++) { let angle = map(i, 0, points, 0, TWO_PI); let r = this.radius + (i % 2 === 0 ? -this.radius * 0.3 : this.radius * 0.3); let sx = cos(angle) * r; let sy = sin(angle) * r; vertex(sx, sy); } endShape(CLOSE); pop(); }
      takeDamage(amount) { if (this.isVisible) { super.takeDamage(amount); } }
      canShoot(timeScale = 1) { return this.isShooterVariant && this.isVisible && this.shootTimer >= this.shootCooldown; }
      shoot(targetPos) { if (this.canShoot()) { this.shootTimer = 0; return new EnemyBullet(this.pos.x, this.pos.y, targetPos, 5, 8, color(200, 0, 255)); } return null; }
    }
