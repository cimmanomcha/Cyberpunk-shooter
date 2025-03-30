// WEAPON LEVELS & IMMORTAL MODE VERSION

    // --- Game Variables ---
    let player;
    let bullets = [];
    let enemies = [];
    let enemyBullets = [];
    let powerUps = [];
    let particles = [];
    let shockwaves = [];
    let drones = [];
    let obstacles = [];

    let score = 0;
    let highScore = 0;
    let gameState = 'start';

    let gridOffsetY = 0;
    const gridSpeed = 1;
    const gridSize = 40;

    // Timers & Difficulty
    let baseEnemySpawnRate = 130;
    let enemySpawnRate = baseEnemySpawnRate;
    let enemySpawnTimer = 0;
    let powerUpSpawnRate = 480; // Slightly adjusted
    let powerUpSpawnTimer = 0;
    let obstacleSpawnRate = 900;
    let obstacleSpawnTimer = 0;
    let difficultyTimer = 0;
    const difficultyInterval = 540; // Increase difficulty every ~9 seconds
    let gameTime = 0;
    let difficultyMultiplier = 1.0;

    // Score Threshold for Immortal Mode
    const IMMORTAL_SCORE_THRESHOLD = 3000;
    let immortalModeActivated = false; // Flag to prevent repeated activation

    // Boss Variables
    let boss = null;
    let bossSpawnScoreThreshold = 1500;
    let nextBossScore = bossSpawnScoreThreshold;
    let bossActive = false;

    // Time Slow Effect
    let timeScale = 1.0;
    let timeSlowTimer = 0;
    const timeSlowDuration = 240;

    // Screen Effects
    let lowHealthEffectAlpha = 0;

    let canvasElement;

    // --- SETUP ---
    function setup() { /* Keep as is */ console.log("p5 setup started"); try { canvasElement = createCanvas(windowWidth * 0.8, windowHeight * 0.8); background(20, 0, 30); canvasElement.mousePressed(() => startAudioContextOnce(), { once: true }); window.addEventListener('keydown', () => startAudioContextOnce(), { once: true }); player = new Player(width / 2, height - 50); rectMode(CENTER); textAlign(CENTER, CENTER); loadHighScore(); console.log("p5 setup complete. Click or press key to start audio."); } catch (error) { console.error("CRITICAL ERROR during core setup:", error); let canvas = document.querySelector('canvas'); if (canvas) { /* Error display code */ } noLoop(); } }

    // --- DRAW LOOP ---
    function draw() {
       if (!player) { /* Error handling */ return; }

      try {
        let effectiveGridSpeed = gridSpeed * timeScale;
        background(0, 0, 10);
        drawBackgroundGrid(effectiveGridSpeed);

        if (gameState === 'playing' || gameState === 'bossFight') {
          gameTime++;
          updateTimeSlow();
          increaseDifficulty();

          // Check for Immortal Mode Trigger
          if (!immortalModeActivated && score >= IMMORTAL_SCORE_THRESHOLD) {
              activateImmortalMode();
          }
        }

        // Game State Management
        if (gameState === 'start') { displayStartMenu(); }
        else if (gameState === 'playing') { runGame(); checkBossSpawn(); }
        else if (gameState === 'bossFight') { runBossFight(); }
        else if (gameState === 'gameOver') { displayGameOverScreen(); }

        // Global Updates & Display
        updateAndDisplayParticles(timeScale);
        updateAndDisplayShockwaves(timeScale);
        updateAndDisplayObstacles(timeScale);
        applyScreenEffects();

      } catch (error) { /* Error handling */ }
    }

    // --- GAME LOGIC (Normal Play) ---
    function runGame() { /* Keep as is */ if (!player) return; player.update(bullets, enemyBullets, timeScale); updateBullets(timeScale); updateEnemies(bullets, timeScale); updateEnemyBullets(timeScale); updatePowerUps(timeScale); updateDrones(timeScale); handleInput(); spawnEnemies(timeScale); spawnPowerUps(timeScale); spawnObstacles(timeScale); displayObstacles(); player.display(); displayBullets(); displayEnemies(); displayEnemyBullets(); displayPowerUps(); displayDrones(); displayScore(); displayPlayerStatus(); checkCollisions(); if (player.health <= 0 && player.weaponUpgradeLevel < 3) { triggerGameOver(); } /* Only trigger if not immortal */ }
    // --- BOSS FIGHT LOGIC ---
    function runBossFight() { /* Keep as is */ if (!player) return; player.update(bullets, enemyBullets, timeScale); updateBullets(timeScale); if (boss) { boss.update(player, enemyBullets, timeScale); if (boss.isDefeated()) { score += boss.points * difficultyMultiplier; createExplosion(boss.pos.x, boss.pos.y, boss.color, 100, 5); playEnemyDestroyedSound(); nextBossScore += bossSpawnScoreThreshold * 1.5; boss = null; bossActive = false; gameState = 'playing'; enemyBullets = []; enemySpawnTimer = 0; obstacleSpawnTimer = 0; powerUpSpawnTimer = 0; } } updateEnemyBullets(timeScale); updateDrones(timeScale); handleInput(); displayObstacles(); player.display(); if (boss) boss.display(); displayBullets(); displayEnemyBullets(); displayDrones(); displayScore(); displayPlayerStatus(); if (boss) displayBossHealth(); checkBossCollisions(); if (player.health <= 0 && player.weaponUpgradeLevel < 3) { triggerGameOver(); } /* Only trigger if not immortal */ }

    // --- Background Grid ---
    function drawBackgroundGrid(speed = gridSpeed) { /* Keep as is */ stroke(0, 100, 150, 100); strokeWeight(1); gridOffsetY = (gridOffsetY + speed) % gridSize; for (let x = 0; x < width; x += gridSize) { line(x, 0, x, height); } for (let y = gridOffsetY - gridSize; y < height; y += gridSize) { line(0, y, width, y); } }

    // --- Spawning Functions ---
    function spawnEnemies(ts = 1.0) { /* Keep as is */ if (bossActive) return; enemySpawnTimer += ts; if (enemySpawnTimer >= enemySpawnRate) { enemySpawnTimer = 0; let x = random(width); let y = -20; let enemyTypeRoll = random(); let spawned = false; if (enemyTypeRoll < 0.15 && score > 300) { enemies.push(new StealthEnemy(x, y, difficultyMultiplier)); spawned = true; } else if (enemyTypeRoll < 0.5) { enemies.push(new Enemy(x, y, 'shooter', difficultyMultiplier)); spawned = true; } else { enemies.push(new Enemy(x, y, 'chaser', difficultyMultiplier)); spawned = true; } if (spawned) { playEnemySpawnSound(); } } }
    function spawnPowerUps(ts = 1.0) {
      if (bossActive) return;
      powerUpSpawnTimer += ts;
      if (powerUpSpawnTimer >= powerUpSpawnRate) {
        powerUpSpawnTimer = 0;
        let x = random(width * 0.1, width * 0.9); let y = random(height * 0.2, height * 0.8);
        // Remove 'weaponUpgrade2X', keep 'weaponUpgrade' for levels 1 & 2
        let type = random([
            'shield', 'overclock', 'speedBoost', 'emp', 'timeSlow', 'drone',
            'weaponUpgrade', // This now increments level up to 2
            'healthPack', 'damageBoost', 'fireRateBoost', 'shieldRegen', 'multiShot', 'explosiveRounds'
            ]);
        // Don't spawn weapon upgrade if player is already level 2 or immortal
        if (type === 'weaponUpgrade' && player.weaponUpgradeLevel >= 2) {
            type = random(['shield', 'healthPack', 'damageBoost']); // Replace with something else
        }
        if (player.health < player.maxHealth * 0.4 && random() < 0.3) { type = 'healthPack'; }
        powerUps.push(new PowerUp(x, y, type));
      }
    }
    function spawnObstacles(ts = 1.0) { /* Keep as is */ if (bossActive) return; obstacleSpawnTimer += ts; if (obstacleSpawnTimer >= obstacleSpawnRate) { obstacleSpawnTimer = 0; let barrierWidth = random(100, 200); let barrierHeight = 20; let startY = random(height * 0.3, height * 0.7); let speed = random(1, 3) * (random() > 0.5 ? 1 : -1); let startX = (speed > 0) ? -barrierWidth / 2 : width + barrierWidth / 2; obstacles.push(new MovingBarrier(startX, startY, barrierWidth, barrierHeight, speed)); } }

    // --- Update Functions --- (Keep as is)
    function updateBullets(ts = 1.0) { for (let i = bullets.length - 1; i >= 0; i--) { if (!bullets[i]) continue; bullets[i].update(ts); if (bullets[i].isOffscreen() || (bullets[i].faded && bullets[i].fadeTimer <= 0)) { bullets.splice(i, 1); } } }
    function updateEnemies(playerBullets, ts = 1.0) { for (let i = enemies.length - 1; i >= 0; i--) { if (!enemies[i]) continue; enemies[i].update(player, playerBullets, ts); if (enemies[i].isOffscreen(height)) { enemies.splice(i, 1); } else if (enemies[i].type === 'shooter' && enemies[i].canShoot(ts)) { let bullet = enemies[i].shoot(player.pos); if(bullet) enemyBullets.push(bullet); } else if (enemies[i].type === 'stealth' && enemies[i].canShoot && enemies[i].canShoot(ts)) { let bullet = enemies[i].shoot(player.pos); if(bullet) enemyBullets.push(bullet); } } }
    function updateEnemyBullets(ts = 1.0) { for (let i = enemyBullets.length - 1; i >= 0; i--) { if (!enemyBullets[i]) continue; enemyBullets[i].update(ts); if (enemyBullets[i].isOffscreen(width, height)) { enemyBullets.splice(i, 1); } } }
    function updatePowerUps(ts = 1.0) { for (let i = powerUps.length - 1; i >= 0; i--) { if (!powerUps[i]) continue; powerUps[i].update(ts); } }
    function updateDrones(ts = 1.0) { for (let i = drones.length - 1; i >= 0; i--) { if (!drones[i]) continue; drones[i].update(player.pos, enemies, bullets, ts); if (drones[i].duration <= 0) { drones.splice(i, 1); } } }
    function updateAndDisplayParticles(ts = 1.0) { for (let i = particles.length - 1; i >= 0; i--) { if (!particles[i]) continue; particles[i].update(ts); particles[i].display(); if (particles[i].isFinished()) { particles.splice(i, 1); } } }
    function updateAndDisplayShockwaves(ts = 1.0) { for (let i = shockwaves.length - 1; i >= 0; i--) { if (!shockwaves[i]) continue; shockwaves[i].update(ts); shockwaves[i].display(); if (shockwaves[i].isFinished()) { shockwaves.splice(i, 1); } } }
    function updateAndDisplayObstacles(ts = 1.0) { for (let i = obstacles.length - 1; i >= 0; i--) { if (!obstacles[i]) continue; obstacles[i].update(ts); obstacles[i].display(); if (obstacles[i].isOffscreen(width, height)) { obstacles.splice(i, 1); } } }

    // --- Display Functions ---
    function displayBullets() { /* Keep */ for (let bullet of bullets) if(bullet) bullet.display(); }
    function displayEnemies() { /* Keep */ for (let enemy of enemies) if(enemy) enemy.display(); }
    function displayEnemyBullets() { /* Keep */ for (let bullet of enemyBullets) if(bullet) bullet.display(); }
    function displayPowerUps() { /* Keep */ for (let powerUp of powerUps) if(powerUp) powerUp.display(); }
    function displayDrones() { /* Keep */ for (let drone of drones) if(drone) drone.display(); }
    function displayObstacles() { /* Keep */ for (let obstacle of obstacles) if(obstacle) obstacle.display(); }
    function displayScore() { /* Keep */ fill(0, 255, 255); textSize(24); textAlign(LEFT, TOP); text(`Score: ${score}`, 10, 10); textAlign(RIGHT, TOP); text(`High Score: ${highScore}`, width - 10, 10); textAlign(CENTER, TOP); text(`Difficulty: ${difficultyMultiplier.toFixed(2)}x`, width/2, 10); }
    function displayPlayerStatus() { // Updated to show weapon level
        textAlign(LEFT, BOTTOM); textSize(16);
        let healthBarWidth = 150; let healthBarHeight = 15; let healthX = 10; let healthY = height - healthBarHeight - 5;
        let currentHealthWidth = map(player.health, 0, player.maxHealth, 0, healthBarWidth);
        stroke(100); fill(50, 0, 0); rect(healthX + healthBarWidth / 2, healthY + healthBarHeight / 2, healthBarWidth, healthBarHeight);
        if (player.health > 0) { fill(0, 200, 0); rect(healthX + currentHealthWidth / 2, healthY + healthBarHeight / 2, currentHealthWidth, healthBarHeight); }
        noStroke(); fill(255); textAlign(LEFT, CENTER); text(`${player.health} / ${player.maxHealth}`, healthX + healthBarWidth + 5, healthY + healthBarHeight / 2);
        let statusTextY = healthY - 5;

        // Weapon Level Display
        let weaponText = "WEAPON LVL: " + player.weaponUpgradeLevel;
        if (player.weaponUpgradeLevel === 3) { fill(255, 255, 0); weaponText = "IMMORTAL MODE"; } // Yellow for immortal
        else { fill(255, 0, 255); } // Magenta for levels 1/2
        text(weaponText, 10, statusTextY); statusTextY -= 20;

        // Other statuses...
        if (player.shieldActive) { fill(0, 150, 255); text("SHIELD", 10, statusTextY); statusTextY -= 20; }
        else if (player.shieldRegenActive) { fill(0, 100, 200); text(`SHIELD REGEN: ${ceil(player.shieldRegenTimer / 60)}s`, 10, statusTextY); statusTextY -= 20; }
        if (player.damageBoostActive) { fill(255, 150, 0); text(`DMG BOOST: ${ceil(player.damageBoostTimer / 60)}s`, 10, statusTextY); statusTextY -= 20; }
        if (player.fireRateBoostActive) { fill(255, 200, 0); text(`FIRE RATE++: ${ceil(player.fireRateBoostTimer / 60)}s`, 10, statusTextY); statusTextY -= 20; }
        if (player.multiShotLevel > 0 && player.weaponUpgradeLevel < 3) { fill(200, 0, 255); text(`MULTI-SHOT L${player.multiShotLevel}: ${ceil(player.multiShotTimer / 60)}s`, 10, statusTextY); statusTextY -= 20; } // Hide if immortal
        if (player.explosiveRoundsActive && player.weaponUpgradeLevel < 3) { fill(255, 50, 0); text(`EXPLOSIVE RND: ${ceil(player.explosiveRoundsTimer / 60)}s`, 10, statusTextY); statusTextY -= 20; } // Hide if immortal
        if (player.overclockActive) { fill(255, 100, 0); text(`OVERCLOCK: ${ceil(player.overclockTimer / 60)}s`, 10, statusTextY); statusTextY -= 20; }
        if (player.speedBoostActive) { fill(255, 255, 0); text(`SPEED BOOST: ${ceil(player.speedBoostTimer / 60)}s`, 10, statusTextY); statusTextY -= 20; }
        if (timeScale < 1.0) { fill(150, 150, 255); text(`TIME SLOW: ${ceil(timeSlowTimer / 60)}s`, 10, statusTextY); statusTextY -= 20; }
        if (drones.length > 0) { fill(100, 255, 100); text(`DRONE ACTIVE: ${ceil(drones[0].duration / 60)}s`, 10, statusTextY); statusTextY -= 20; }
        if (player.isCharging) { /* Keep charge bar display */ let chargeRatio = player.chargeTimer / player.maxChargeTime; let barWidth = 100; let barHeight = 10; let barX = player.pos.x - barWidth / 2; let barY = player.pos.y + player.size / 1.5 + 10; fill(100); rect(barX + barWidth / 2, barY, barWidth, barHeight); fill(255, 0, 255); rect(barX + (barWidth * chargeRatio) / 2, barY, barWidth * chargeRatio, barHeight); }
    }
    function displayBossHealth() { /* Keep */ if (!boss) return; let barWidth = width * 0.6; let barHeight = 20; let barX = width / 2; let barY = 40; let healthRatio = boss.health / boss.maxHealth; fill(50, 0, 0); noStroke(); rect(barX, barY, barWidth, barHeight); fill(255, 0, 0); rect(barX - barWidth / 2 + (barWidth * healthRatio) / 2, barY, barWidth * healthRatio, barHeight); fill(255); textSize(16); textAlign(CENTER, CENTER); text(`BOSS: ${boss.name} - Phase ${boss.currentPhase}`, barX, barY); }

    // --- Collision Detection --- (Keep as is)
    function checkCollisions() { for (let i = bullets.length - 1; i >= 0; i--) { let bullet = bullets[i]; if (!bullet) continue; for (let j = enemies.length - 1; j >= 0; j--) { let enemy = enemies[j]; if (!enemy) continue; if (bullet.hits(enemy)) { enemy.takeDamage(bullet.damage); playEnemyHitSound(); let enemyDestroyed = false; if (enemy.health <= 0) { score += enemy.points; createExplosion(enemy.pos.x, enemy.pos.y, enemy.color, 20, 2); playEnemyDestroyedSound(); enemies.splice(j, 1); enemyDestroyed = true; } if (bullet.isExplosive && enemyDestroyed) { createExplosion(bullet.pos.x, bullet.pos.y, color(255,100,0), 30, 1.5); } if (!bullet.piercing || bullet.isExplosive) { bullets.splice(i, 1); break; } } } } for (let i = enemies.length - 1; i >= 0; i--) { let enemy = enemies[i]; if (!enemy) continue; if (enemy.canDamage && player.hits(enemy)) { createExplosion(enemy.pos.x, enemy.pos.y, enemy.color); let tookDamage = player.takeDamage(1); if (enemy.type === 'chaser') { enemies.splice(i, 1); } else { enemy.takeDamage(1); playEnemyHitSound(); if (enemy.health <= 0) { score += enemy.points; createExplosion(enemy.pos.x, enemy.pos.y, enemy.color, 20, 2); playEnemyDestroyedSound(); enemies.splice(i, 1); } } if (player.health <= 0 && player.weaponUpgradeLevel < 3) triggerGameOver(); } } for (let i = enemyBullets.length - 1; i >= 0; i--) { let enemyBullet = enemyBullets[i]; if (!enemyBullet) continue; if (player.hits(enemyBullet)) { createExplosion(player.pos.x, player.pos.y, color(255, 0, 0)); player.takeDamage(enemyBullet.damage || 1); enemyBullets.splice(i, 1); if (player.health <= 0 && player.weaponUpgradeLevel < 3) triggerGameOver(); } } for (let i = powerUps.length - 1; i >= 0; i--) { let powerUp = powerUps[i]; if (!powerUp) continue; if (player.hits(powerUp)) { let powerUpType = powerUp.type; player.activatePowerUp(powerUpType); createPowerUpEffect(powerUp.pos.x, powerUp.pos.y, powerUp.color); if (powerUpType !== 'speedBoost' && powerUpType !== 'healthPack') { playPowerupSound(); } if (powerUpType === 'emp') triggerEMP(); else if (powerUpType === 'timeSlow') activateTimeSlow(); else if (powerUpType === 'drone') spawnDrone(); powerUps.splice(i, 1); } } checkObstacleCollisions(); }
    function checkBossCollisions() { /* Keep */ if (!boss) return; for (let i = bullets.length - 1; i >= 0; i--) { let bullet = bullets[i]; if (!bullet) continue; if (boss.hits(bullet)) { boss.takeDamage(bullet.damage); playEnemyHitSound(); createExplosion(bullet.pos.x, bullet.pos.y, boss.color, 10, 1); if (!bullet.piercing || bullet.isExplosive) { bullets.splice(i, 1); break; } } } if (player.hits(boss)) { player.takeDamage(2); createExplosion(player.pos.x, player.pos.y, color(255, 100, 0)); let pushBack = p5.Vector.sub(player.pos, boss.pos); pushBack.setMag(5); player.pos.add(pushBack); if (player.health <= 0 && player.weaponUpgradeLevel < 3) triggerGameOver(); } for (let i = enemyBullets.length - 1; i >= 0; i--) { let enemyBullet = enemyBullets[i]; if (!enemyBullet) continue; if (player.hits(enemyBullet)) { createExplosion(player.pos.x, player.pos.y, color(255, 0, 0)); player.takeDamage(enemyBullet.damage || 1); enemyBullets.splice(i, 1); if (player.health <= 0 && player.weaponUpgradeLevel < 3) triggerGameOver(); } } checkObstacleCollisions(); }
    function checkObstacleCollisions() { /* Keep */ for (let obstacle of obstacles) { if (obstacle.blocksPlayer && obstacle.hits(player)) { let overlap = obstacle.getOverlap(player); player.pos.add(overlap); } if (obstacle.dealsDamage && obstacle.hits(player)) { player.takeDamage(obstacle.damageAmount * (deltaTime / 1000)); if (player.health <= 0 && player.weaponUpgradeLevel < 3) triggerGameOver(); } } for (let i = bullets.length - 1; i >= 0; i--) { let bullet = bullets[i]; if (!bullet) continue; for (let obstacle of obstacles) { if (obstacle.blocksBullets && obstacle.hits(bullet)) { createExplosion(bullet.pos.x, bullet.pos.y, color(150), 5, 0.5); bullets.splice(i, 1); break; } } } for (let i = enemyBullets.length - 1; i >= 0; i--) { let bullet = enemyBullets[i]; if (!bullet) continue; for (let obstacle of obstacles) { if (obstacle.blocksBullets && obstacle.hits(bullet)) { createExplosion(bullet.pos.x, bullet.pos.y, color(150), 5, 0.5); enemyBullets.splice(i, 1); break; } } } for (let i = enemies.length - 1; i >= 0; i--) { let enemy = enemies[i]; if (!enemy) continue; for (let obstacle of obstacles) { if (obstacle.blocksPlayer && obstacle.hits(enemy)) { let overlap = obstacle.getOverlap(enemy); enemy.pos.add(overlap); enemy.hitObstacle(); } if (obstacle.dealsDamage && obstacle.hits(enemy)) { enemy.takeDamage(obstacle.damageAmount * (deltaTime / 1000)); if (enemy.health <= 0) { score += enemy.points; createExplosion(enemy.pos.x, enemy.pos.y, enemy.color, 20, 2); enemies.splice(i, 1); break; } } } } }

    // --- Input Handling --- (Keep as is)
    function handleInput() { let currentSpeed = player.speed; if (player.speedBoostActive) { currentSpeed *= 1.8; } if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { player.move(-currentSpeed, 0); } if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { player.move(currentSpeed, 0); } if (keyIsDown(UP_ARROW) || keyIsDown(87)) { player.move(0, -currentSpeed); } if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { player.move(0, currentSpeed); } }
    function keyPressed() { startAudioContextOnce(); if (gameState === 'playing' || gameState === 'bossFight') { player.handleKeyPress(keyCode); } else if (gameState === 'start' || gameState === 'gameOver') { if (keyCode === ENTER || keyCode === RETURN) { startGame(); } } }
    function keyReleased() { if (gameState === 'playing' || gameState === 'bossFight') { player.handleKeyRelease(keyCode); } }

    // --- Game State Functions --- (Keep as is)
    function displayStartMenu() { background(0, 0, 10, 200); fill(0, 255, 255); textSize(64); text("CYBERPUNK SHOOTER", width / 2, height / 2 - 150); textSize(24); text("Enhanced Edition", width / 2, height / 2 - 100); text("Use Arrow Keys or WASD to Move", width / 2, height / 2 - 20); text("Spacebar to Shoot (Hold if Upgraded)", width / 2, height / 2 + 10); textSize(20); fill(200); if (!audioStarted) { text("(Click or Press Key to Enable Audio)", width/2, height/2 + 45); } else if (!isAudioSetup) { text("(Audio Starting...)", width/2, height/2 + 45); } else { text("(Audio Enabled)", width/2, height/2 + 45); } textSize(32); fill(255, 255, 0); text("Press ENTER to Start", width / 2, height / 2 + 80); if (highScore > 0) { fill(0, 255, 255); textSize(24); text(`High Score: ${highScore}`, width / 2, height / 2 + 130); } }
    function displayGameOverScreen() { background(0, 0, 10, 200); fill(255, 0, 0); textSize(64); text("GAME OVER", width / 2, height / 2 - 50); fill(0, 255, 255); textSize(32); text(`Your Score: ${score}`, width / 2, height / 2 + 20); if (score > highScore) { fill(255, 255, 0); text("New High Score!", width / 2, height / 2 + 60); } else { fill(0, 255, 255); text(`High Score: ${highScore}`, width / 2, height / 2 + 60); } textSize(24); fill(255); text("Press ENTER to Restart", width / 2, height / 2 + 120); }
    function startGame() { startAudioContextOnce(); resetGame(); gameState = 'playing'; }
    function triggerGameOver() { if (gameState !== 'gameOver') { gameState = 'gameOver'; updateHighScore(); saveHighScore(); playGameOverSound(); } }
    function resetGame() { player = new Player(width / 2, height - 50); bullets = []; enemies = []; enemyBullets = []; powerUps = []; particles = []; shockwaves = []; drones = []; obstacles = []; boss = null; bossActive = false; score = 0; gameTime = 0; difficultyMultiplier = 1.0; enemySpawnRate = baseEnemySpawnRate; enemySpawnTimer = 0; powerUpSpawnTimer = 0; obstacleSpawnTimer = 0; difficultyTimer = 0; timeScale = 1.0; timeSlowTimer = 0; nextBossScore = bossSpawnScoreThreshold; immortalModeActivated = false; /* Reset flag */ }

    // --- Difficulty --- (Slightly adjusted scaling)
    function increaseDifficulty() { difficultyTimer++; if (difficultyTimer >= difficultyInterval) { difficultyTimer = 0; difficultyMultiplier += 0.07; // Slightly slower increase
        enemySpawnRate = max(20, baseEnemySpawnRate / (1 + (difficultyMultiplier - 1) * 0.6)); // Spawn rate scales a bit more aggressively, min 20
        console.log(`Difficulty Increased! Multiplier: ${difficultyMultiplier.toFixed(2)}, Spawn Rate: ${enemySpawnRate.toFixed(1)}`); } }

    // --- Immortal Mode ---
    function activateImmortalMode() {
        if (!player || immortalModeActivated) return; // Already active or player doesn't exist
        console.log("IMMORTAL MODE ACTIVATED!");
        immortalModeActivated = true;
        player.weaponUpgradeLevel = 3; // Set player level
        player.health = player.maxHealth; // Optional: Full heal on activation
        // Play activation sound
        playImmortalSound();
        // Maybe add a visual effect like a large shockwave
        shockwaves.push(new Shockwave(player.pos.x, player.pos.y, width * 1.5, color(255, 255, 0), 5, 90));
    }

    // --- Boss Spawning --- (Keep as is)
    function checkBossSpawn() { if (!bossActive && score >= nextBossScore && player.weaponUpgradeLevel < 3) { spawnBoss(); } } // Don't spawn boss if immortal
    function spawnBoss() { console.log("BOSS INCOMING!"); bossActive = true; gameState = 'bossFight'; enemies = []; enemyBullets = []; boss = new Boss(width / 2, -100, difficultyMultiplier); boss.enter(); }

    // --- Effects --- (Keep as is)
    function createExplosion(x, y, clr, count = 20, speedMod = 1, lifespanMod = 1) { for (let i = 0; i < count; i++) { particles.push(new Particle(x, y, clr, random(1, 4) * speedMod, 60 * lifespanMod)); } }
    function createPowerUpEffect(x, y, clr) { for (let i = 0; i < 15; i++) { particles.push(new Particle(x, y, clr, random(1, 3), 45)); } shockwaves.push(new Shockwave(x, y, 30, clr, 1.5)); }
    function triggerEMP() { console.log("EMP ACTIVATED!"); shockwaves.push(new Shockwave(player.pos.x, player.pos.y, width * 1.5, color(100, 150, 255), 4, 60)); for(let enemy of enemies) { createExplosion(enemy.pos.x, enemy.pos.y, enemy.color, 15, 1.5); } enemies = []; for(let bullet of enemyBullets) { createExplosion(bullet.pos.x, bullet.pos.y, bullet.color, 5, 0.5); } enemyBullets = []; score += 5 * enemies.length; }
    function activateTimeSlow() { console.log("TIME SLOW ACTIVATED!"); if (timeScale === 1.0) { timeScale = 0.4; timeSlowTimer = timeSlowDuration; shockwaves.push(new Shockwave(player.pos.x, player.pos.y, width * 0.8, color(150, 150, 255, 100), 2, 30)); } else { timeSlowTimer = max(timeSlowTimer, timeSlowDuration); } }
    function updateTimeSlow() { if (timeScale < 1.0) { timeSlowTimer -= 1; if (timeSlowTimer <= 0) { timeScale = 1.0; } } }
    function spawnDrone() { if (drones.length === 0) { console.log("DRONE ACTIVATED!"); drones.push(new Drone(player.pos.x, player.pos.y)); } else { drones[0].duration = drones[0].maxDuration; } }
    function applyScreenEffects() { if (player.weaponUpgradeLevel === 3) { lowHealthEffectAlpha = 0; return; } /* No low health effect if immortal */ if (player.health <= player.maxHealth * 0.2 && player.health > 0) { lowHealthEffectAlpha = lerp(lowHealthEffectAlpha, 150, 0.1); if (frameCount % 15 < 7) { fill(255, 0, 0, lowHealthEffectAlpha * 0.6); rect(width / 2, height / 2, width, height); } } else { lowHealthEffectAlpha = lerp(lowHealthEffectAlpha, 0, 0.1); } if (lowHealthEffectAlpha > 1) { fill(150, 0, 0, lowHealthEffectAlpha * 0.4); noStroke(); rect(width / 2, 0, width, height * 0.2); rect(width / 2, height, width, height * 0.2); rect(0, height / 2, width * 0.2, height); rect(width, height / 2, width * 0.2, height); } if (timeScale < 1.0) { fill(0, 0, 100, 30); rect(width/2, height/2, width, height); } }

    // --- High Score Persistence --- (Keep as is)
    function saveHighScore() { localStorage.setItem('cyberpunkShooterHighScoreEnhanced', highScore); }
    function loadHighScore() { const storedScore = localStorage.getItem('cyberpunkShooterHighScoreEnhanced'); highScore = storedScore ? parseInt(storedScore, 10) : 0; }
    function updateHighScore() { if (score > highScore) { highScore = score; } }

    // --- Window Resize --- (Keep as is)
    function windowResized() { resizeCanvas(windowWidth * 0.8, windowHeight * 0.8); if(player) { player.pos.x = constrain(player.pos.x, 0, width); player.pos.y = constrain(player.pos.y, 0, height); } }
