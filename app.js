const colorDivs = document.querySelectorAll(".color");
const colorDivText = document.querySelectorAll(".color h2");
const sliders = document.querySelectorAll('.slider input[type="range"]');
const slider = document.querySelectorAll(".slider");
const popup = document.querySelector(".copy-container");
const popupBox = document.querySelector(".copy-popup");
const adjustmentsBtns = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");

const closeBtns = document.querySelectorAll(".close-adjustment");
const generateBtn = document.querySelector(".generate");
let initialColors;

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", function () {
    updateTextUI(index);
  });
});

colorDivText.forEach((hex) => {
  hex.addEventListener("click", function () {
    copyToClipboard(hex);
  });
});

popup.addEventListener("transitionend", function () {
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

adjustmentsBtns.forEach((button, index) => {
  button.addEventListener("click", function () {
    adjustmentsBtn(index);
  });
});

closeBtns.forEach((button, index) => {
  button.addEventListener("click", function () {
    closeBtn(index);
  });
});

lockButton.forEach((button, index) => {
  button.addEventListener("click", (e) => {
    lockLayer(e, index);
  });
});
generateBtn.addEventListener("click", randomColors);

function generateHex() {
  const hexColor = chroma.random();

  return hexColor;
}

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const randomColor = generateHex();
    const hexText = div.children[0]; // select text

    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }

    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor.hex().toUpperCase();

    checkTextContrast(randomColor, hexText);

    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".slider input");

    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSlider(color, hue, brightness, saturation);
    updateTextUI(index);
  });
  resetInputs();
}

function checkTextContrast(color, text) {
  const luminosity = chroma(color).luminance();
  if (luminosity > 0.3) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSlider(color, hue, brightness, saturation) {
  const minSat = color.set("hsl.s", 0);
  const maxSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([minSat, color, maxSat]);
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )},${scaleSat(1)})`;

  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
    0
  )},${midBright},${scaleBright(1)})`;

  hue.style.backgroundImage = `linear-gradient(to right, rgb(178, 34, 34),rgb(180, 71, 34),rgb(180, 107, 34),rgb(180, 144, 34),rgb(180, 180, 34),rgb(144, 180, 34),rgb(107, 180, 34),rgb(71, 180, 34),rgb(34, 180, 34),rgb(34, 180, 71),rgb(34, 180, 107),rgb(34, 180, 144),	rgb(34, 180, 180),rgb(34, 144, 180),rgb(34, 107, 180),rgb(34, 71, 180),rgb(34, 34, 180),	rgb(71, 34, 180),	rgb(107, 34, 180),rgb(144, 34, 180),rgb(180, 34, 180),rgb(180, 34, 144),rgb(180, 34, 107),	rgb(180, 34, 71),	rgb(180, 34, 34)	)`;
}

function hslControls(e) {
  let index =
    e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat");

  // const divBgColor = colorDivText[index].innerText;
  const divBgColor = initialColors[index];

  let slider = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = slider[0];
  const brightness = slider[1];
  const sat = slider[2];
  const newColor = chroma(divBgColor)
    .set("hsl.h", hue.value)
    .set("hsl.l", brightness.value)
    .set("hsl.s", sat.value);
  colorDivs[index].style.backgroundColor = newColor;

  colorizeSlider(newColor, hue, brightness, sat);
}
function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const hexText = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  const bgColor = chroma(activeDiv.style.backgroundColor);
  hexText.innerText = bgColor.hex().toUpperCase();
  checkTextContrast(bgColor, hexText);
  for (icon of icons) {
    checkTextContrast(bgColor, icon);
  }
}

function resetInputs() {
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "saturation") {
      const saturationColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(saturationColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightnessValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightnessValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  const popup = document.querySelector(".copy-container");
  const popupBox = document.querySelector(".copy-popup");
  popup.classList.add("active");
  popupBox.classList.add("active");
}

function adjustmentsBtn(index) {
  slider[index].classList.toggle("active");
}
function closeBtn(index) {
  slider[index].classList.remove("active");
}

function lockLayer(e, index) {
  const lockSVG = e.target.children[0];
  const activeBg = colorDivs[index];
  activeBg.classList.toggle("locked");

  if (lockSVG.classList.contains("fa-lock-open")) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

//for saving the palette
let savePalettes = [];
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-name");
const saveBtn = document.querySelector(".save");
const submitBtn = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");

const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitBtn.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);
function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
  console.log(popup);
}

function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}

function savePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  colorDivText.forEach((hex) => {
    colors.push(hex.innerText);
  });
  let nr;
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (paletteObjects) {
    nr = paletteObjects.length;
  } else {
    nr = savePalettes.length;
  }
  let paletteObj = { PalatteName: name, PalatteColor: colors, PalatteNo: nr };
  console.log(paletteObj);
  savePalettes.push(paletteObj);
  savetoLocal(paletteObj);
  saveInput.value = "";

  //generate the palette for library
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.PalatteName;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.PalatteColor.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.background = smallColor;
    preview.appendChild(smallDiv);
  });

  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.PalatteNo);
  paletteBtn.innerText = "select";

  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savePalettes[paletteIndex].PalatteColor.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.background = color;
      const text = colorDivs[index].children[0];

      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInputs();
    initialColors.forEach((color, index) => {
      let slider = colorDivs[index].querySelectorAll('input[type="range"]');
      const hue = slider[0];
      const brightness = slider[1];
      const sat = slider[2];
      const newColor = chroma(color)
        .set("hsl.h", hue.value)
        .set("hsl.l", brightness.value)
        .set("hsl.s", sat.value);
      colorDivs[index].style.backgroundColor = newColor;

      colorizeSlider(newColor, hue, brightness, sat);
    });
  });

  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);

  libraryContainer.children[0].appendChild(palette);
}
function savetoLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}
function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}

function getLocal(paletteObj) {
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    paletteObjects.forEach((paletteObj) => {
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.PalatteName;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObj.PalatteColor.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.background = smallColor;
        preview.appendChild(smallDiv);
      });

      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObj.PalatteNo);
      paletteBtn.innerText = "select";

      paletteBtn.addEventListener("click", (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[paletteIndex].PalatteColor.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.background = color;
          const text = colorDivs[index].children[0];

          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInputs();
        initialColors.forEach((color, index) => {
          let slider = colorDivs[index].querySelectorAll('input[type="range"]');
          const hue = slider[0];
          const brightness = slider[1];
          const sat = slider[2];
          const newColor = chroma(color)
            .set("hsl.h", hue.value)
            .set("hsl.l", brightness.value)
            .set("hsl.s", sat.value);
          colorDivs[index].style.backgroundColor = newColor;

          colorizeSlider(newColor, hue, brightness, sat);
        });
      });

      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);

      libraryContainer.children[0].appendChild(palette);
    });
  }
}

getLocal();
randomColors();
