// Player.js - INPUT HANDLING FIX + Review

    class Player {
      constructor(x, y, shipType = 'default') {
        this.pos = createVector(x, y);
        this.size = 25;
        this.baseSpeed = 4;
        this.speed = this.baseSpeed;
        this.color = color(0, 255, 255);
        this.glowColor = color(0, 255, 255, 100);
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.baseBulletDamage = 1;
        this.baseShootCooldown = 10;

        // Power-up states & Timers
        this.powerUpDuration = 480;
        this.shieldActive = false;
        this.overclockActive = false; // Note: Overclock currently only affects charged shot via old code? Revisit if needed.
        this.speedBoostActive = false;
        this.weaponUpgradeActive = false; // Charge shot enabled flag
        this.damageBoostActive = false;
        this.fireRateBoostActive = false;
        this.shieldRegenActive = false;
        this.multiShotLevel = 0;
        this.explosiveRoundsActive = false;

        this.overclockTimer = 0;
        this.speedBoostTimer = 0;
        this.damageBoostTimer = 0;
        this.fireRateBoostTimer = 0;
        this.shieldRegenTimer = 0;
        this.multiShotTimer = 0;
        this.explosiveRoundsTimer = 0;

        // Shield Regen Specific
        this.shieldRegenCooldown = 180;
        this.shieldRegenCurrent = 0;

        // Fire Rate Specific
        this.shootTimer = 0; // Cooldown timer for standard shots

        // Charge Shot Mechanics
        this.isCharging = false;
        this.chargeTimer = 0;
        this.maxChargeTime = 75;
        this.minChargeToFire = 15;
        // this.spaceHeld = false; // No longer needed with new input logic
      }

      update(playerBullets, enemyBullets, ts = 1.0) {
        // --- Movement & Position ---
        this.pos.x = constrain(this.pos.x, this.size / 2, width - this.size / 2);
        this.pos.y = constrain(this.pos.y, this.size / 2, height - this.size / 2);
        this.speed = this.speedBoostActive ? this.baseSpeed * 1.8 : this.baseSpeed;

        // --- Timers ---
        this.shootTimer -= ts; // Always decrement shoot cooldown timer

        if (this.overclockActive) { this.overclockTimer -= ts; if (this.overclockTimer <= 0) this.overclockActive = false; }
        if (this.speedBoostActive) { this.speedBoostTimer -= ts; if (this.speedBoostTimer <= 0) this.speedBoostActive = false; }
        if (this.damageBoostActive) { this.damageBoostTimer -= ts; if (this.damageBoostTimer <= 0) this.damageBoostActive = false; }
        if (this.fireRateBoostActive) { this.fireRateBoostTimer -= ts; if (this.fireRateBoostTimer <= 0) this.fireRateBoostActive = false; }
        if (this.shieldRegenActive) { this.shieldRegenTimer -= ts; if (this.shieldRegenTimer <= 0) this.shieldRegenActive = false; }
        if (this.multiShotLevel > 0) { this.multiShotTimer -= ts; if (this.multiShotTimer <= 0) this.multiShotLevel = 0; }
        if (this.explosiveRoundsActive) { this.explosiveRoundsTimer -= ts; if (this.explosiveRoundsTimer <= 0) this.explosiveRoundsActive = false; }

        // --- Shield Regeneration ---
        if (this.shieldRegenActive && !this.shieldActive) {
            this.shieldRegenCurrent += ts;
            if (this.shieldRegenCurrent >= this.shieldRegenCooldown) {
                this.shieldActive = true;
                this.shieldRegenCurrent = 0;
                playPowerupSound();
            }
        } else if (!this.shieldRegenActive) {
            this.shieldRegenCurrent = 0;
        }

        // --- Charging ---
        if (this.isCharging) {
            this.chargeTimer = min(this.chargeTimer + 1, this.maxChargeTime);
            updateChargeSound(this.chargeTimer / this.maxChargeTime);
        }
      }

      // --- Input Handling (Refactored) ---
      // Called from sketch.js keyPressed
      handleKeyPress(keyCode) {
          if (keyCode === 32) { // Spacebar
              if (this.weaponUpgradeActive) {
                  // If upgrade active, pressing space STARTS charging
                  this.startCharging();
              } else {
                  // If no upgrade, pressing space tries to fire a NORMAL shot
                  if (this.shootTimer <= 0) {
                      let newBullets = this.shoot(); // shoot() handles multi-shot etc.
                      bullets = bullets.concat(newBullets); // Add bullets to sketch array
                      // Reset cooldown based on fire rate boost
                      this.shootTimer = this.fireRateBoostActive ? this.baseShootCooldown * 0.5 : this.baseShootCooldown;
                  }
              }
          }
      }

      // Called from sketch.js keyReleased
      handleKeyRelease(keyCode) {
          if (keyCode === 32) { // Spacebar
              if (this.weaponUpgradeActive && this.isCharging) {
                  // If upgrade active and was charging, releasing space RELEASES the charge
                  let releasedBullet = this.releaseCharge(); // releaseCharge handles sound
                  if (releasedBullet) {
                      bullets.push(releasedBullet); // Add bullet to sketch array
                  }
              }
              // If no upgrade, releasing space does nothing special for shooting
          }
      }

      // --- Display ---
      display() { /* Keep display code */
        noStroke(); for (let i = 4; i > 0; i--) { fill(this.glowColor.levels[0], this.glowColor.levels[1], this.glowColor.levels[2], 50 / i); ellipse(this.pos.x, this.pos.y, this.size + i * 5, this.size + i * 5); }
        fill(this.color); stroke(255); strokeWeight(1.5); push(); translate(this.pos.x, this.pos.y); triangle(0, -this.size / 1.5, -this.size / 2, this.size / 2, this.size / 2, this.size / 2); pop();
        if (this.shieldActive) { noFill(); stroke(0, 150, 255, 200); strokeWeight(3); ellipse(this.pos.x, this.pos.y, this.size * 1.8, this.size * 1.8); }
        if (this.isCharging) { let chargeRatio = this.chargeTimer / this.maxChargeTime; let barWidth = 100; let barHeight = 10; let barX = this.pos.x - barWidth / 2; let barY = this.pos.y + this.size / 1.5 + 10; fill(100); rect(barX + barWidth / 2, barY, barWidth, barHeight); fill(255, 0, 255); rect(barX + (barWidth * chargeRatio) / 2, barY, barWidth * chargeRatio, barHeight); }
      }

      // --- Movement ---
      move(xOffset, yOffset) { this.pos.x += xOffset; this.pos.y += yOffset; }

      // --- Shooting (Standard Shot - called by handleKeyPress) ---
      shoot() {
        // This function now ONLY handles the creation of standard (non-charged) bullets
        // Cooldown is checked in handleKeyPress before calling this

        playShootSound();

        let bullets = [];
        let bulletSpeed = 8;
        let bulletColor = color(255, 255, 0);
        let finalDamage = this.damageBoostActive ? this.baseBulletDamage * 1.5 : this.baseBulletDamage;
        let explosive = this.explosiveRoundsActive;

        // Multi-Shot Logic
        let numShots = 1;
        let spreadAngle = 0;
        if (this.multiShotLevel === 1) { numShots = 3; spreadAngle = PI / 18; }
        else if (this.multiShotLevel >= 2) { numShots = 5; spreadAngle = PI / 12; }

        let startAngle = -PI / 2 - (spreadAngle * (numShots - 1)) / 2;

        for (let i = 0; i < numShots; i++) {
            let angle = startAngle + i * spreadAngle;
            let bulletX = this.pos.x + cos(angle) * (this.size * 0.6);
            let bulletY = this.pos.y + sin(angle) * (this.size * 0.6);
            let newBullet = new Bullet(bulletX, bulletY, bulletSpeed, bulletColor, finalDamage, false, explosive);
            newBullet.vel = createVector(cos(angle), sin(angle)).mult(bulletSpeed);
            bullets.push(newBullet);
        }

        return bullets;
      }

      // --- Charging ---
      startCharging() {
          // Only start charging if upgrade is active and not already charging
          if (this.weaponUpgradeActive && !this.isCharging) {
              this.isCharging = true;
              this.chargeTimer = 0;
              startChargeSound();
          }
      }

      releaseCharge() {
          // This is called ONLY from handleKeyRelease when space is released
          // while weaponUpgradeActive and isCharging were true.
          let fired = false;
          let chargedBullet = null;
          // We know we were charging, so set isCharging false
          this.isCharging = false;

          if (this.chargeTimer >= this.minChargeToFire) {
              // Fire the bullet
              let chargeRatio = this.chargeTimer / this.maxChargeTime;
              let baseDmg = lerp(this.baseBulletDamage * 1.5, this.baseBulletDamage * 4, chargeRatio);
              let finalDmg = this.damageBoostActive ? baseDmg * 1.5 : baseDmg;
              let bulletSize = lerp(10, 20, chargeRatio);
              let bulletSpeed = lerp(7, 10, chargeRatio);
              let piercing = chargeRatio > 0.8;
              let explosive = this.explosiveRoundsActive;

              chargedBullet = new ChargedBullet(this.pos.x, this.pos.y - this.size / 2, bulletSpeed, bulletSize, finalDmg, piercing, explosive);
              fired = true;
          }

          stopChargeSound(fired); // Stop charge sound, play release sound only if fired
          this.chargeTimer = 0; // Reset timer
          return chargedBullet; // Return the bullet (or null if not fired)
      }


      // --- Damage & Powerups ---
      takeDamage(amount) {
        if (this.shieldActive) {
            this.shieldActive = false; this.shieldRegenCurrent = 0;
            createPowerUpEffect(this.pos.x, this.pos.y, color(0, 150, 255));
            playPowerupSound(); return false;
        }
        if (this.health > 0) {
            this.health -= amount; this.health = max(0, this.health);
            createExplosion(this.pos.x, this.pos.y, color(255, 100, 0), 10, 0.8);
            playDamageSound(); return true;
        }
        return false;
      }

      hits(other) { let otherRadius = other.radius || other.size / 2; let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y); return d < this.size / 2 + otherRadius; }

      activatePowerUp(type) {
        switch (type) {
            case 'shield': this.shieldActive = true; this.shieldRegenCurrent = 0; break;
            case 'overclock': this.overclockActive = true; this.overclockTimer = this.powerUpDuration; break;
            case 'speedBoost': if (!this.speedBoostActive) playBoostSound(); this.speedBoostActive = true; this.speedBoostTimer = this.powerUpDuration; break;
            case 'weaponUpgrade': this.weaponUpgradeActive = true; break;
            case 'healthPack':
                this.health = min(this.maxHealth, this.health + 25);
                playHealthPickupSound(); // Use specific sound
                break;
            case 'damageBoost': this.damageBoostActive = true; this.damageBoostTimer = this.powerUpDuration; break;
            case 'fireRateBoost': this.fireRateBoostActive = true; this.fireRateBoostTimer = this.powerUpDuration; break;
            case 'shieldRegen': this.shieldRegenActive = true; this.shieldRegenTimer = this.powerUpDuration * 1.5; break;
            case 'multiShot': this.multiShotLevel = min(2, this.multiShotLevel + 1); this.multiShotTimer = this.powerUpDuration; break;
            case 'explosiveRounds': this.explosiveRoundsActive = true; this.explosiveRoundsTimer = this.powerUpDuration; break;
        }
      }
    }
