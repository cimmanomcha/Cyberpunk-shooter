// audio.js - Add level up and immortal sounds

      let isAudioSetup = false;
      let audioStarted = false;
      let masterVolume;

      // Synths and Effects
      let shootSynth, chargeOsc, chargeGain, chargedReleaseSynth, noiseSynth;
      let boostSynth, enemySpawnSynth, enemyHitSynth, enemyDestroyedSynth;
      let powerupSynth, damageSynth, gameOverSynth, healthSynth;
      let levelUpSynth, immortalSynth; // New synths
      let distortion, crusher;

      function setupAudio() {
        if (isAudioSetup || !audioStarted || !Tone.context || Tone.context.state !== 'running') { return false; }
        console.log("Setting up Tone.js audio components...");
        try {
          masterVolume = new Tone.Volume(-6).toDestination();
          distortion = new Tone.Distortion(0.2);
          crusher = new Tone.BitCrusher(4);
          // --- Existing Synth Definitions --- (Keep all from previous step)
          shootSynth = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.1 }, volume: -15 }).connect(masterVolume);
          chargeOsc = new Tone.Oscillator({ type: 'sawtooth', frequency: 100, volume: -12 }); chargeGain = new Tone.Gain(0).connect(masterVolume); chargeOsc.connect(chargeGain);
          chargedReleaseSynth = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 }, volume: -5 }).connect(distortion).connect(masterVolume);
          noiseSynth = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }, volume: -18 });
          boostSynth = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 }, volume: -10 }).connect(masterVolume);
          enemySpawnSynth = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.1 }, volume: -18 }).connect(crusher).connect(masterVolume);
          enemyHitSynth = new Tone.MetalSynth({ frequency: 150, envelope: { attack: 0.001, decay: 0.1, release: 0.05 }, harmonicity: 3.1, modulationIndex: 16, resonance: 2000, octaves: 0.5, volume: -12 }).connect(masterVolume);
          enemyDestroyedSynth = new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.02, decay: 0.4, sustain: 0, release: 0.3 }, volume: -8 }).connect(distortion).connect(masterVolume);
          powerupSynth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.4 }, volume: -9 }).connect(masterVolume);
          damageSynth = new Tone.MembraneSynth({ pitchDecay: 0.08, octaves: 2, oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.1 }, volume: -5 }).connect(masterVolume);
          gameOverSynth = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 1.0 }, volume: -8 }).connect(masterVolume);
          healthSynth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.05, decay: 0.1, sustain: 0.2, release: 0.3 }, volume: -10 }).connect(masterVolume);

          // --- New Synths ---
          // Level Up Sound (Similar to powerup but maybe higher pitch/faster)
          levelUpSynth = new Tone.Synth({
              oscillator: { type: 'triangle' },
              envelope: { attack: 0.005, decay: 0.15, sustain: 0.05, release: 0.3 },
              volume: -8
          }).connect(masterVolume);

          // Immortal Mode Activation Sound (More dramatic)
          immortalSynth = new Tone.MonoSynth({ // Use MonoSynth for richer sound
              oscillator: { type: 'pwm', modulationFrequency: 0.2 }, // Pulse width modulation
              envelope: { attack: 0.1, decay: 0.1, sustain: 0.6, release: 1.5 },
              filterEnvelope: { attack: 0.05, decay: 0.05, sustain: 0.2, release: 1.0, baseFrequency: 200, octaves: 4 },
              filter: { type: 'lowpass', Q: 3 },
              volume: -5
          }).connect(masterVolume);


          isAudioSetup = true;
          console.log("Tone.js audio components setup complete.");
          return true;
        } catch (error) { /* ... */ return false; }
      }

      // --- Playback Functions --- (Keep existing ones)
      function playShootSound() { if (!isAudioSetup || !audioStarted) return; try { shootSynth.triggerAttackRelease('C5', '16n', Tone.now(), random(0.8, 1.0)); } catch (e) { console.error("Error playing shoot sound:", e); } }
      function startChargeSound() { if (!isAudioSetup || !audioStarted || chargeOsc.state === 'started') return; try { chargeOsc.frequency.value = 100; chargeGain.gain.cancelScheduledValues(Tone.now()); chargeGain.gain.setValueAtTime(0, Tone.now()); chargeGain.gain.linearRampToValueAtTime(0.5, Tone.now() + 0.02); chargeOsc.start(Tone.now()); } catch (e) { console.error("Error starting charge sound:", e); } }
      function updateChargeSound(chargeRatio) { if (!isAudioSetup || !audioStarted || chargeOsc.state !== 'started') return; try { const targetFreq = Tone.Midi(map(chargeRatio, 0, 1, 40, 76)).toFrequency(); chargeOsc.frequency.rampTo(targetFreq, 0.05); } catch (e) { console.error("Error updating charge sound:", e); } }
      function stopChargeSound(fireCharged) { if (!isAudioSetup || !audioStarted || chargeOsc.state !== 'started') return; try { chargeGain.gain.cancelScheduledValues(Tone.now()); chargeGain.gain.setValueAtTime(chargeGain.gain.value, Tone.now()); chargeGain.gain.linearRampToValueAtTime(0, Tone.now() + 0.05); chargeOsc.stop(Tone.now() + 0.06); if (fireCharged) { playChargedReleaseSound(); } } catch (e) { console.error("Error stopping charge sound:", e); } }
      function playChargedReleaseSound() { if (!isAudioSetup || !audioStarted) return; try { chargedReleaseSynth.triggerAttackRelease('8n', Tone.now()); damageSynth.triggerAttackRelease('C2', '8n', Tone.now(), 0.8); } catch (e) { console.error("Error playing charged release sound:", e); } }
      function playBoostSound() { if (!isAudioSetup || !audioStarted) return; try { boostSynth.triggerAttackRelease('4n', Tone.now()); } catch (e) { console.error("Error playing boost sound:", e); } }
      function playEnemySpawnSound() { if (!isAudioSetup || !audioStarted) return; try { enemySpawnSynth.frequency.setValueAtTime(Tone.Midi(random(65, 73)).toFrequency(), Tone.now()); enemySpawnSynth.triggerAttackRelease('A4', '16n', Tone.now()); } catch (e) { console.error("Error playing enemy spawn sound:", e); } }
      function playEnemyHitSound() { if (!isAudioSetup || !audioStarted) return; try { enemyHitSynth.resonance = random(1500, 2500); enemyHitSynth.triggerAttackRelease(Tone.now(), 0.8); } catch (e) { console.error("Error playing enemy hit sound:", e); } }
      function playEnemyDestroyedSound() { if (!isAudioSetup || !audioStarted) return; try { enemyDestroyedSynth.triggerAttackRelease('4n', Tone.now()); damageSynth.triggerAttackRelease('G1', '4n', Tone.now(), 0.6); } catch (e) { console.error("Error playing enemy destroyed sound:", e); } }
      function playPowerupSound() { if (!isAudioSetup || !audioStarted) return; try { const now = Tone.now(); powerupSynth.triggerAttackRelease('C5', '16n', now, 0.8); powerupSynth.triggerAttackRelease('E5', '16n', now + 0.07, 0.8); powerupSynth.triggerAttackRelease('G5', '16n', now + 0.14, 1.0); } catch (e) { console.error("Error playing powerup sound:", e); } }
      function playDamageSound() { if (!isAudioSetup || !audioStarted) return; try { damageSynth.triggerAttackRelease('C2', '8n', Tone.now(), 1.0); } catch (e) { console.error("Error playing damage sound:", e); } }
      function playGameOverSound() { if (!isAudioSetup || !audioStarted) return; try { const now = Tone.now(); gameOverSynth.triggerAttackRelease('C4', '2n', now); gameOverSynth.frequency.rampTo('C3', 1.5, now + 0.1); } catch (e) { console.error("Error playing game over sound:", e); } }
      function playHealthPickupSound() { if (!isAudioSetup || !audioStarted) return; try { const now = Tone.now(); healthSynth.triggerAttackRelease('A4', '8n', now, 0.7); healthSynth.triggerAttackRelease('D5', '8n', now + 0.1, 0.9); } catch (e) { console.error("Error playing health pickup sound:", e); } }

      // --- New Playback Functions ---
      function playLevelUpSound() {
          if (!isAudioSetup || !audioStarted) return;
          try {
              const now = Tone.now();
              levelUpSynth.triggerAttackRelease('E5', '16n', now, 0.9);
              levelUpSynth.triggerAttackRelease('G5', '16n', now + 0.06, 0.9);
              levelUpSynth.triggerAttackRelease('C6', '8n', now + 0.12, 1.0);
          } catch (e) { console.error("Error playing level up sound:", e); }
      }

      function playImmortalSound() {
          if (!isAudioSetup || !audioStarted) return;
          try {
              // Play a powerful, sustained chord or effect
              immortalSynth.triggerAttackRelease('C4', '1.5s', Tone.now()); // Note, duration, time
              // Maybe add a rising noise sweep?
              let noiseSweep = new Tone.NoiseSynth({
                  noise: { type: 'white' },
                  envelope: { attack: 0.5, decay: 1.0, sustain: 0, release: 0.1 },
                  volume: -15
              }).toDestination();
              noiseSweep.triggerAttackRelease('1.5s', Tone.now());
          } catch (e) { console.error("Error playing immortal sound:", e); }
      }

      // --- Audio Context Start ---
      function startAudioContextOnce() { /* Keep as is */ if (audioStarted) return; audioStarted = true; console.log("Attempting to start audio context..."); Tone.start().then(() => { console.log("Audio context started successfully!"); setupAudio(); }).catch(e => { console.error("Error starting audio context:", e); }); }
