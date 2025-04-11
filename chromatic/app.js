const Application = function () {
  this.initA4();
  this.tuner = new Tuner(this.a4);
  this.notes = new Notes(".notes", this.tuner);
  this.notes.initFrequencyControls();
  this.notes.initA4TextControl(); 
  this.meter = new Meter(".meter");
  this.frequencyBars = new FrequencyBars(".frequency-bars");
  this.update({
    name: "A",
    frequency: this.a4,
    octave: 4,
    value: 69,
    cents: 0,
  });

};

Application.prototype.initA4 = function () {
  this.$a4 = document.querySelector(".a4 span");
  this.$select = document.getElementById("frequency-select");
  this.$input = document.getElementById("frequency-input"); // New input element
  
  this.a4 = parseInt(localStorage.getItem("a4")) || 440;
  this.$a4.innerHTML = this.a4;

  // Set the dropdown's selected value to match the current frequency if possible
  try {
    this.$select.value = this.a4;
  } catch (e) {
    // If the exact value isn't in the dropdown, that's ok
  }
  
  // If we have the number input, set its value
  if (this.$input) {
    this.$input.value = this.a4;
  }

  // Add event listener for dropdown changes
  const self = this;
  if (this.$select) {
    this.$select.addEventListener("change", function(event) {
      const newFreq = parseFloat(event.target.value);
      self.a4 = newFreq;
      self.$a4.innerHTML = newFreq;
      if (self.$input) self.$input.value = newFreq;
      
      self.tuner.middleA = newFreq;
      self.notes.createNotes();
      self.update({
        name: "A",
        frequency: newFreq,
        octave: 4,
        value: 69,
        cents: 0,
      });
      localStorage.setItem("a4", newFreq);
      
    });
  }
  
  // Add event listener for direct input changes if the element exists
  if (this.$input) {
    this.$input.addEventListener("change", function(event) {
      let newFreq = parseFloat(event.target.value);
      // Enforce min/max constraints
      newFreq = Math.min(Math.max(newFreq, 400), 470);
      self.a4 = newFreq;
      self.$a4.innerHTML = newFreq;
      self.$input.value = newFreq; // Update in case we clamped the value
      
      self.tuner.middleA = newFreq;
      self.notes.createNotes();
      self.update({
        name: "A",
        frequency: newFreq,
        octave: 4,
        value: 69,
        cents: 0,
      });
      localStorage.setItem("a4", newFreq);
    });
  }

  // Original click handler for A4 text
  this.$a4.addEventListener("click", function () {
    swal
      .fire({ input: "number", inputValue: self.a4 })
      .then(function ({ value: a4 }) {
        if (!parseInt(a4) || a4 === self.a4) {
          return;
        }
        self.a4 = parseFloat(a4);
        self.$a4.innerHTML = a4;
        if (self.$input) self.$input.value = a4;
        
        self.tuner.middleA = a4;
        self.notes.createNotes();
        self.update({
          name: "A",
          frequency: self.a4,
          octave: 4,
          value: 69,
          cents: 0,
        });
        localStorage.setItem("a4", a4);
      });
  });
};

Application.prototype.start = function () {
  const self = this;

  this.tuner.onNoteDetected = function (note) {
    if (self.notes.isAutoMode) {
      if (self.lastNote === note.name) {
        self.update(note);
      } else {
        self.lastNote = note.name;
      }
    }
  };

  swal.fire("Initialize chromatic online tuner").then(function () {
    self.tuner.init();
    self.frequencyData = new Uint8Array(self.tuner.analyser.frequencyBinCount);
  });

  //uncomment this to enable the frequency bar historgram
  // this.updateFrequencyBars();
  
  document.querySelector(".auto input").addEventListener("change", () => {
    this.notes.toggleAutoMode();
  });
};

Application.prototype.updateFrequencyBars = function () {
  if (this.tuner.analyser) {
    this.tuner.analyser.getByteFrequencyData(this.frequencyData);
    this.frequencyBars.update(this.frequencyData);
  }
  requestAnimationFrame(this.updateFrequencyBars.bind(this));
};

Application.prototype.update = function (note) {
  this.notes.update(note);
  this.meter.update((note.cents / 50) * 45);
  
};

const app = new Application();
app.start();