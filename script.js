document.addEventListener("DOMContentLoaded", () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let currentOsc1 = null;
    let currentOsc2 = null;
    let currentGain1 = null;
    let currentGain2 = null;
    let activeButton = null;
    let isBbTuning = true;

    const frequencies = {
        "Bb": { bass: 58.27, tenor: 116.54, alto: 233.08, soprano: 466.16 },
        "A": { bass: 55.00, tenor: 110.00, alto: 220.00, soprano: 440.00 }
    };

    const tuningToggle = document.getElementById("tuningToggle");
    const tuningLabel = document.getElementById("tuningLabel");

    tuningToggle.addEventListener("change", () => {
        isBbTuning = !tuningToggle.checked;
        //tuningLabel.textContent = isBbTuning ? "Bb-Tuning (466 Hz Ref)" : "A-Tuning (440 Hz Ref)";
        console.log(`Tuning switched to: ${isBbTuning ? "Bb" : "A"}`);

        if (activeButton) {
            let note = activeButton.dataset.note;
            updateHarmonicSound(note);
        }
    });

    function updateHarmonicSound(note) {
        if (currentOsc1) currentOsc1.stop();
        if (currentOsc2) currentOsc2.stop();

        //if (!currentOsc1 || !currentOsc2 || !currentGain1 || !currentGain2) return;

        const tuning = isBbTuning ? "Bb" : "A";
        const baseFreq = frequencies[tuning][note];
        if (!baseFreq) return;

         currentOsc1 = audioContext.createOscillator();
         currentOsc2 = audioContext.createOscillator();
         currentGain1 = audioContext.createGain();
         currentGain2 = audioContext.createGain();

        currentOsc1.type = 'sawtooth';
        currentOsc2.type = 'sawtooth';

        currentOsc1.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
        currentOsc2.frequency.setValueAtTime(baseFreq * 2, audioContext.currentTime); // 1st harmonic

        currentGain1.gain.setValueAtTime(0.3, audioContext.currentTime);
        currentGain2.gain.setValueAtTime(0.1, audioContext.currentTime);

        currentOsc1.connect(currentGain1).connect(audioContext.destination);
        currentOsc2.connect(currentGain2).connect(audioContext.destination);

        currentOsc1.start();
        currentOsc2.start();
    }

    function playHarmonic(note, button) {

        if (currentOsc1) currentOsc1.stop();
        if (currentOsc2) currentOsc2.stop();

        if (activeButton === button) {
            button.classList.remove("active");
            activeButton = null;
            return;
        }

        try {
            const tuning = isBbTuning ? "Bb" : "A";
            const baseFreq = frequencies[tuning][note];
            if (!baseFreq) return;

            const osc1 = audioContext.createOscillator();
            const osc2 = audioContext.createOscillator();
            const gain1 = audioContext.createGain();
            const gain2 = audioContext.createGain();

            osc1.type = 'sawtooth';
            osc2.type = 'sawtooth';

            osc1.frequency.value = baseFreq;
            osc2.frequency.value = baseFreq * 2;

            gain1.gain.value = 0.3; // Fundamental louder
            gain2.gain.value = 0.1; // Harmonic softer

            osc1.connect(gain1).connect(audioContext.destination);
            osc2.connect(gain2).connect(audioContext.destination);

            osc1.start();
            osc2.start();

            currentOsc1 = osc1;
            currentOsc2 = osc2;
            currentGain1 = gain1;
            currentGain2 = gain2;

            if (activeButton) activeButton.classList.remove("active");
            activeButton = button;
            button.classList.add("active");

            console.log(`Playing ${note} with harmonic (${baseFreq}Hz + ${baseFreq * 2}Hz)`);

        } catch (error) {
            console.error("Error:", error);
        }
    }

    document.querySelectorAll(".note").forEach(button => {
        button.addEventListener("click", () => {
            const note = button.dataset.note;
            playHarmonic(note, button);
        });
    });

    // Nav button active link persistence
    const links = document.querySelectorAll(".nav-button a");
    const lastClicked = localStorage.getItem("activeLink");
    links.forEach(link => {
        if (link.getAttribute("href") === lastClicked) {
            link.classList.add("active");
        }
        link.addEventListener("click", () => {
            localStorage.setItem("activeLink", link.getAttribute("href"));
        });
    });
});
