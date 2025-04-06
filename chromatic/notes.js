const Notes = function (selector, tuner) {
  this.tuner = tuner;
  this.isAutoMode = true;
  this.$root = document.querySelector(selector);
  this.$notesList = this.$root.querySelector(".notes-list");
  this.$frequency = this.$root.querySelector(".frequency");
  this.$notes = [];
  this.$notesMap = {};
  this.createNotes();
  this.$notesList.addEventListener("touchstart", (event) =>
    event.stopPropagation()
  );
  
};
Notes.prototype.initA4TextControl = function () {
  const self = this;
  const a4Text = document.querySelector(".a4 span");

  if (a4Text) {
    // Add event listener for clicking on A4 text
    a4Text.addEventListener("click", function () {
      // Stop the oscillator when the A4 text is clicked
      self.tuner.stopOscillator();

      // Clear the active note
      const activeNote = self.$notesList.querySelector(".active");
      if (activeNote) {
        activeNote.classList.remove("active");
      }

      // // Optionally reset or change the frequency (this example sets it to 440Hz)
      // self.tuner.middleA = 440;

      // // Update the reference frequency in the display
      // a4Text.textContent = "440"; // Or dynamically set this if needed

      // Optionally, you can also update the visual components of the meter or UI
    });
  }
};



Notes.prototype.initFrequencyControls = function () {
  const self = this;
  const frequencySelect = document.getElementById("frequency-select");

  // Event listener for frequency change
  frequencySelect.addEventListener("change", function () {
    // Stop the oscillator when the frequency is changed
    self.tuner.stopOscillator();

    // Clear the active note by removing the "active" class
    const activeNote = self.$notesList.querySelector(".active");
    if (activeNote) {
      activeNote.classList.remove("active");
    }

    // Update the reference frequency on the tuner
    const newFrequency = parseFloat(this.value);
    self.tuner.middleA = newFrequency;
    
    // Optionally, update the displayed reference frequency
    const frequencySpan = document.querySelector(".a4 span");
    if (frequencySpan) {
      frequencySpan.textContent = newFrequency;
    }

    // Optionally, you can update the visual elements of the meter or other UI components if needed
  });
};


Notes.prototype.createNotes = function () {
  this.$notesList.innerHTML = "";
  const minOctave = 1;
  const maxOctave = 8;
  for (var octave = minOctave; octave <= maxOctave; octave += 1) {
    for (var n = 0; n < 12; n += 1) {
      const $note = document.createElement("div");
      $note.className = "note";
      $note.dataset.name = this.tuner.noteStrings[n];
      $note.dataset.value = 12 * (octave + 1) + n;
      $note.dataset.octave = octave.toString();
      $note.dataset.frequency = this.tuner.getStandardFrequency(
        $note.dataset.value
      );
      $note.innerHTML =
        $note.dataset.name[0] +
        '<span class="note-sharp">' +
        ($note.dataset.name[1] || "") +
        "</span>" +
        '<span class="note-octave">' +
        $note.dataset.octave +
        "</span>";
      this.$notesList.appendChild($note);
      this.$notes.push($note);
      this.$notesMap[$note.dataset.value] = $note;
    }
  }

  const self = this;
  this.$notes.forEach(function ($note) {
    $note.addEventListener("click", function () {
      if (self.isAutoMode) {
        return;
      }

      const $active = self.$notesList.querySelector(".active");
      if ($active === this) {
        self.tuner.stopOscillator();
        $active.classList.remove("active");
      } else {
        self.tuner.play(this.dataset.frequency);
        self.update($note.dataset);
      }
    });
  });

  this.enableDragScroll();
};

// Add drag functionality to make the notes list scrollable
Notes.prototype.enableDragScroll = function () {
  let isDragging = false;
  let startX;
  let scrollLeft;

  const onMouseDown = (e) => {
    isDragging = true;
    startX = e.pageX || e.touches[0].pageX; // for mouse or touch
    scrollLeft = this.$notesList.scrollLeft;
    this.$notesList.style.cursor = 'grabbing';
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX || e.touches[0].pageX;
    const walk = (x - startX) * 2; // Adjust scroll speed
    this.$notesList.scrollLeft = scrollLeft - walk;
  };

  const onMouseUp = () => {
    isDragging = false;
    this.$notesList.style.cursor = 'grab';
  };

  const onMouseLeave = () => {
    isDragging = false;
    this.$notesList.style.cursor = 'grab';
  };

  // Add event listeners for mouse
  this.$notesList.addEventListener("mousedown", onMouseDown);
  this.$notesList.addEventListener("mousemove", onMouseMove);
  this.$notesList.addEventListener("mouseup", onMouseUp);
  this.$notesList.addEventListener("mouseleave", onMouseLeave);

  // Add touch events for mobile support
  this.$notesList.addEventListener("touchstart", onMouseDown);
  this.$notesList.addEventListener("touchmove", onMouseMove);
  this.$notesList.addEventListener("touchend", onMouseUp);
  this.$notesList.addEventListener("touchcancel", onMouseUp);
};


Notes.prototype.active = function ($note) {
  this.clearActive();
  $note.classList.add("active");
  this.$notesList.scrollLeft =
    $note.offsetLeft - (this.$notesList.clientWidth - $note.clientWidth) / 2;
};

Notes.prototype.clearActive = function () {
  const $active = this.$notesList.querySelector(".active");
  if ($active) {
    $active.classList.remove("active");
  }
};

Notes.prototype.update = function (note) {
  if (note.value in this.$notesMap) {
    this.active(this.$notesMap[note.value]);
    this.$frequency.childNodes[0].textContent = parseFloat(
      note.frequency
    ).toFixed(1);
  }
};

Notes.prototype.toggleAutoMode = function () {
  if (!this.isAutoMode) {
    this.tuner.stopOscillator();
  }
  this.clearActive();
  this.isAutoMode = !this.isAutoMode;
};
