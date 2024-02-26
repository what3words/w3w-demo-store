const regex =
  /(?:\/\/\/|(?:http(?:s)?:\/\/)?(?:www\.)?(?:what3words|w3w)?\.\D+\/)?(\/{0,}(?:[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+|[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+([\u0020\u00A0][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+){1,3}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+([\u0020\u00A0][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+){1,3}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+([\u0020\u00A0][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+){1,3}))/gim;
const formElement = document.querySelector("#form_elem");
const textarea = document.querySelector("#w3w");
const suggestionDialog = document.querySelector("#suggestions");
// let position = {};




function main(sdk) {
  if (!textarea) return;
  // window.onload = function () {
  //   getCurrentPosition();
  // }

  textarea.addEventListener("blur", () => setTimeout(() => clearDialog(), 100));
  textarea.addEventListener("click", () => {
    clearDialog();
    getSuggestions().then(appendSuggestions);
  });
  textarea.addEventListener("input", ({ inputType, target: { value } }) => {
    clearDialog();
    if (inputType === "insertFromPaste") {
      displayNotice();
      return;
    }

    if (inputType !== "insertText" && inputType !== "deleteContentBackward")
      return;
    getSuggestions().then(appendSuggestions);
  });

  function getSuggestions() {
    const word = findWordAtCursorPos();

    if (word) {
      return sdk.api
        .autosuggest({ input: word, clipToCountry:['GB']  })
        .then(({ suggestions }) => suggestions);
    }

    return Promise.resolve([]);
  }

  function createDiv(suggestion) {
    const div = document.createElement("div");
    const words = document.createElement("div");
    const nearestPlace = document.createElement("div");

    words.innerHTML = `<what3words-symbol size="16"></what3words-symbol><b>${suggestion.words}</b>`;
    nearestPlace.innerHTML = `<small>near ${suggestion.nearestPlace}</small>`;
    if (suggestion.distanceToFocusKm) {
      nearestPlace.innerHTML += `<span><small>${suggestion.distanceToFocusKm}km</small></span>`;
    }

    div.appendChild(words);
    div.appendChild(nearestPlace);
    div.addEventListener("click", () => {
      const word = findWordAtCursorPos();

      if (word) {
        const newVal = textarea.value.replace(word, `///${suggestion.words}`);
        const newPos =
          textarea.value.indexOf(word) + ("///" + suggestion.words).length;
        textarea.value = newVal;
        textarea.focus();
        textarea.selectionEnd = newPos;
      }

      clearDialog();
    });

    return div;
  }

  function appendSuggestions(suggestions) {
    suggestions
      .map(createDiv)
      .forEach((div) => suggestionDialog.appendChild(div));
  }

  function clearDialog() {
    suggestionDialog.innerHTML = "";
  }

  function findWordAtCursorPos() {
    const cursorPos = textarea.selectionStart;
    const matches = textarea.value.match(regex);
    if (!matches) return;

    let word;
    do {
      const input = matches.shift();
      const start = textarea.value.indexOf(input);
      const end = start + input.length;
      if (start <= cursorPos && end >= cursorPos) word = input;
    } while (word === undefined && matches.length);

    return word;
  }

  function displayNotice() {
    if (regex.test(textarea.value)) {
      const matches = textarea.value.match(regex);
      suggestionDialog.innerHTML = `what3words ${
        matches.length > 1 ? "addresses" : "address"
      } detected. Click on ${matches.length > 1 ? "them" : "it"} to validate`;
    }
  }

  // function getCurrentPosition() {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(({ coords }) => {
  //       position = {
  //         focus: {
  //           lat: coords.latitude,
  //           lng: coords.longitude,
  //         },
  //       };
  //     });
  //   } else {
  //     console.log("Geolocation is not supported by this browser.");
  //   }
  // }
}
