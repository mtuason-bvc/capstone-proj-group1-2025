/**
 * @param {string} selector
 * @constructor
 */
const Meter = function (selector) {
  this.$root = document.querySelector(selector);
  this.$pointer = this.$root.querySelector(".meter-pointer");
  this.init();
};

Meter.prototype.init = function () {
  // for (var i = 0; i <= 10; i += 1) {
  
    for (var i = 0; i <= 20; i += 1) {
    const $scale = document.createElement("div");
    $scale.className = "meter-scale";
    // $scale.style.transform = "rotate(" + (i * 9 - 45) + "deg)";
    $scale.style.transform = "rotate(" + (i * 4.5 - 45) + "deg)";
    if (i % 5 === 0) {
      $scale.classList.add("meter-scale-strong");
    }
    if (i == 9 || i == 11) {
      $scale.classList.add("meter-scale-green");
    }
    if (i == 0) {
      $scale.classList.add("meter-scale-red");
      $scale.textContent += "♭";
    }
    if (i == 20){
      $scale.classList.add("meter-scale-red");
      $scale.textContent += "♯";
    }
    this.$root.appendChild($scale);
  }
};

/**
 * @param {number} deg
 */
Meter.prototype.update = function (deg) {
  this.$pointer.style.transform = "rotate(" + deg + "deg)";
};
