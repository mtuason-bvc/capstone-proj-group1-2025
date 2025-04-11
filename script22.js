let audioCtx;
let oscillators = {};
let gains = {};
let masterGain;
let baseFrequency;
let octaveShift = 0;
let activePitch = null;
let activeButton = null; 

const pitchMapping = { A: 440, Bb: 466.16, Eb: 311.13, C: 261.63 };
const stringFrequencies = { pa: 293.66, sa: 261.63, saDetuned: 260, saLow: 130.81 };

// Initialize and start the Tanpura sound
function startTanpura() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.5;
        masterGain.connect(audioCtx.destination);
    }
    stopTanpura();

    Object.keys(stringFrequencies).forEach(key => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = stringFrequencies[key] * Math.pow(2, octaveShift);
        gain.gain.value = 0.5;
        osc.connect(gain).connect(masterGain);
        osc.start();
        oscillators[key] = osc;
        gains[key] = gain;
    });
}

// Stop all oscillators
function stopTanpura() {
    Object.values(oscillators).forEach(osc => osc.stop());
    oscillators = {};
}

// Handle pitch selection (toggle play/stop on the same button)
function togglePitch(pitch) {
    if (activePitch === pitch) {
        stopTanpura();
        document.getElementById("btn" + pitch).classList.remove("active");
        activePitch = null;
    } else {
        document.querySelectorAll(".button-group button").forEach(btn => btn.classList.remove("active"));
        document.getElementById("btn" + pitch).classList.add("active");
        baseFrequency = pitchMapping[pitch];
        startTanpura();
        activePitch = pitch;
    }

    const buttons = document.querySelectorAll(".pitch-button");

    buttons.forEach((btn) => {
        // Remove active class from other buttons
        if (btn.innerText !== note) {
            btn.classList.remove("active");
        }
    });

    // Find the clicked button and toggle the effect
    const clickedButton = document.querySelector(`.pitch-button[data-note="${note}"]`);
    if (clickedButton) {
        clickedButton.classList.toggle("active");
    }


}

// Handle octave adjustments
function toggleOctave(direction) {
    octaveShift = (direction === 'up') ? 1 : (direction === 'down' ? -1 : 0);
    document.getElementById('octaveUp').classList.toggle('active', octaveShift === 1);
    document.getElementById('octaveDown').classList.toggle('active', octaveShift === -1);
    if (audioCtx) {
        Object.keys(oscillators).forEach(key => {
            oscillators[key].frequency.setValueAtTime(stringFrequencies[key] * Math.pow(2, octaveShift), audioCtx.currentTime);
        });
    }
}

// Update volume and tooltip dynamically
function updateVolume(type, value) {
    if (gains[type]) {
        gains[type].gain.setValueAtTime(value / 100, audioCtx.currentTime);
    }
    updateTooltip(`tooltip${capitalize(type)}`, `slider${capitalize(type)}`, value);
}

function updateMasterVolume(value) {
    if (masterGain) {
        masterGain.gain.setValueAtTime(value / 100, audioCtx.currentTime);
    }
    updateTooltip("tooltipMaster", "sliderMaster", value);
}

// function updateTooltip(tooltipId, sliderId, value) {
//     let tooltip = document.getElementById(tooltipId);
//     let slider = document.getElementById(sliderId);
//     tooltip.innerText = value;
//     tooltip.style.opacity = 1;
//     clearTimeout(tooltip.hideTimeout);
//     tooltip.hideTimeout = setTimeout(() => { tooltip.style.opacity = 0; }, 1000);
// }

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


// collapsible pannel
function toggleCollapse() {
    const content = document.getElementById("content");
    content.style.visibility = content.style.visibility === "visible" ? "hidden" : "visible";
}


function setupSlider(sliderContainer) {
    const slider = sliderContainer.querySelector(".slider");
    const tooltip = sliderContainer.querySelector(".tooltip");
    
    function updateTooltip(value, posX) {
        tooltip.innerText = value;
        tooltip.style.left = `${posX}px`;
    }

    function updateSlider() {
        let value = slider.value;
        let percentage = ((value - slider.min) / (slider.max - slider.min)) * 100;
        let thumbX = percentage * (slider.offsetWidth - 20) / 100;
        
        slider.style.setProperty("--progress", percentage + "%");
        updateTooltip(value, thumbX);
    }

    slider.addEventListener("input", () => {
        tooltip.style.opacity = "1";
        updateSlider();
    });

    slider.addEventListener("mousemove", (event) => {
        let rect = slider.getBoundingClientRect();
        let percentage = ((event.clientX - rect.left) / rect.width) * 100;
        let value = Math.round((slider.max - slider.min) * (percentage / 100) + parseInt(slider.min));
        
        // Ensure the value stays within the range
        value = Math.max(parseInt(slider.min), Math.min(parseInt(slider.max), value));
        
        let thumbX = Math.max(0, Math.min(slider.offsetWidth - 20, (percentage * (slider.offsetWidth - 20) / 100)));
        updateTooltip(value, thumbX);
        tooltip.style.opacity = "1";
    });

    slider.addEventListener("mouseleave", () => tooltip.style.opacity = "0");
    updateSlider(); // Ensure initial background color is set
}

document.querySelectorAll(".slider-container").forEach(setupSlider);



document.addEventListener("DOMContentLoaded", function () {
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