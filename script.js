document.addEventListener("DOMContentLoaded", () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let isBbTuning = true; // Default to Bb-Tuning

    // Frequency mappings for Bb-Tuning and A-Tuning
    const frequencies = {
        "Bb": { bass: 58.27, tenor: 116.54, alto: 233.08, soprano: 466.16 },
        "A": { bass: 55.00, tenor: 110.00, alto: 220.00, soprano: 440.00 }
    };

    // Toggle tuning switch
    const tuningToggle = document.getElementById("tuningToggle");
    const tuningLabel = document.getElementById("tuningLabel");

    tuningToggle.addEventListener("change", () => {
        isBbTuning = !tuningToggle.checked; // If checked, switch to A-Tuning
        tuningLabel.textContent = isBbTuning ? "Bb-Tuning (466 Hz Ref)" : "A-Tuning (440 Hz Ref)";
        console.log(`Tuning switched to: ${isBbTuning ? "Bb" : "A"}`);
        
        // Play a brief sound in both tunings to compare
        compareTuning();
    });

    function compareTuning() {
        let BbFreq = frequencies["Bb"]["alto"]; // Pick an alto note for clarity
        let AFreq = frequencies["A"]["alto"];

        playBriefTone(BbFreq, 0.1);
        setTimeout(() => playBriefTone(AFreq, 0.1), 500); // Play A-tone after Bb-tone
    }

    function playBriefTone(frequency, duration) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.frequency.value = frequency;
        gainNode.gain.value = 0.2; // Reduce volume

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        setTimeout(() => oscillator.stop(), duration * 1000);
    }

    // Play a sound using Web Audio API
    let currentSources = [];
    function playSound(note) {
        if (currentSources.length) {
            // Stop all active sounds
            currentSources.forEach(source => source.stop());
            currentSources = [];
            return; // Stop playback on second tap
        }
    
        try {
            let tuning = isBbTuning ? "Bb" : "A";
            let frequency = frequencies[tuning][note];
    
            if (!frequency) {
                console.error("Invalid note:", note);
                return;
            }
    
            
            // Play first frequency immediately
            let oscillator1 = audioContext.createOscillator();
            let gainNode1 = audioContext.createGain();
            oscillator1.frequency.value = frequency;
            gainNode1.gain.value = 0.3;

            oscillator1.connect(gainNode1);
            gainNode1.connect(audioContext.destination);

            oscillator1.start();
            currentSources.push(oscillator1);

            // Play second frequency after 1 second
            setTimeout(() => {
                let oscillator2 = audioContext.createOscillator();
                let gainNode2 = audioContext.createGain();
                oscillator2.frequency.value = frequency * 2;
                gainNode2.gain.value = 0.3;

                oscillator2.connect(gainNode2);
                gainNode2.connect(audioContext.destination);

                oscillator2.start();
                currentSources.push(oscillator2);
            }, 0); // 1-second delay for the second sound



            // [frequency, frequency * 2].forEach(freq => {
            //     const oscillator = audioContext.createOscillator();
            //     const gainNode = audioContext.createGain();

            //     oscillator.frequency.value = freq;
            //     gainNode.gain.value = 0.3;

            //     oscillator.connect(gainNode);
            //     gainNode.connect(audioContext.destination);

            //     oscillator.start();

            //     currentSources.push(oscillator);
            // });
            
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    }

    // Attach event listeners to buttons
    
    
    document.querySelectorAll(".note").forEach(button => {
        button.addEventListener("click", () => {
            let note = button.dataset.note;
            playSound(note, button);
        });
    });
});


function toggleCollapse() {
    const content = document.getElementById("tampuraContent");
    content.style.visibility = content.style.visibility === "visible" ? "hidden" : "visible";
}


