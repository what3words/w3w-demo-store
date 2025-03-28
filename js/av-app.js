const apiKey = '73XQksR86T';
const id = '3000';
const ptid = '5BQdHLA3nC0';
const inputField = document.getElementById('w3w-input');
const suggestionsList = document.getElementById('suggestions');
const clearIcon = document.getElementById('clear-icon');
const locationDropdown = document.getElementById('location-dropdown');
// const what3wordsApiKey = 'YF0C5HNE';
const threeWordAddressRegex = /^\/{0,}(?:[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+|[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+([\u0020\u00A0][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+){1,3}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+([\u0020\u00A0][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+){1,3}[.｡。･・︒។։။۔።।][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+([\u0020\u00A0][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]+){1,3})$/;

document.addEventListener('DOMContentLoaded', () => {
    // Show or hide the clear icon based on input field content
    inputField.addEventListener('input', () => {
        const inputText = inputField.value.trim();
        clearIcon.classList.toggle('hidden', inputText === '');

        const words = inputText.split('.');

        // Check if input matches a likely what3words address or a traditional address
        if (
            (words.length >= 3 && words[2].length > 0) ||  // what3words format
            inputText.length > 5 // Allow traditional addresses with reasonable length
        ) {
            getFullLocation(inputText);  // Trigger suggestions for both formats
        } else {
            locationDropdown.classList.add('hidden');
        }
    });
    // Event listener for the clear icon to clear the input
    clearIcon.addEventListener('click', () => {
        inputField.value = '';
        clearIcon.classList.add('hidden');
        locationDropdown.classList.add('hidden');
        suggestionsList.innerHTML = '';
    });

    // Function to handle the Enter key press
    inputField.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });

    // Step 1: Get full location for entered what3words address or traditional address
    async function getFullLocation(address) {
        const url = `https://posttagtesting.com/PAYG203PGN.php?cmd=getfulllocation&key=${apiKey}&id=${id}&ptid=${ptid}&address=${address}`;
        
        try {
            const response = await fetch(url);

            // Check if the response is valid JSON by reading the text first
            const responseText = await response.text();
            
            try {
                // Parse JSON if possible
                const responseData = JSON.parse(responseText);
                
                if (responseData.data) {
                    showSuggestions(responseData.data);
                } else {
                    console.error("No data found in response:", responseData);
                    suggestionsList.innerHTML = '<li>No suggestions available</li>';
                }
            } catch (jsonError) {
                // Log the raw text response if JSON parsing fails
                console.error("Failed to parse JSON. Raw response:", responseText);
                suggestionsList.innerHTML = '<li>Error: Invalid JSON response</li>';
            }

        } catch (error) {
            console.error("Error fetching full location:", error);
        }
    }

    // Function to display suggestions and add click event to select one
    function showSuggestions(suggestions) {
        suggestionsList.innerHTML = '';
        if (suggestions.length > 0) {
            locationDropdown.classList.remove('hidden');

            suggestions.forEach((suggestion) => {
                const listItem = document.createElement('li');
                const button = document.createElement('button');
                button.className = 'suggestion-button';

                let addressText;

                if (suggestion.w3w && suggestion.place) {
                    const prefix = document.createElement('span');
                    prefix.className = 'prefix';
                    prefix.textContent = '///';

                    const text = document.createTextNode(` ${suggestion.w3w}, ${suggestion.place}`);
                    button.appendChild(prefix);
                    button.appendChild(text);
                    // Set click event to call `selectSuggestion` for what3words address and update input field
                    button.addEventListener('click', () => {
                        inputField.value = suggestion.w3w;
                        selectSuggestion(suggestion.w3w);
                    });
                } else {
                    addressText = [
                        suggestion.Organisation,
                        suggestion['Sub Building'],
                        suggestion.Number,
                        suggestion.Building,
                        suggestion.Street,
                        suggestion.Town,
                        suggestion.PostCode
                    ].filter(Boolean).join(', ');

                    button.textContent = addressText;
                    // Set click event to call `selectLocation` for traditional address and update input field
                    button.addEventListener('click', () => {
                        inputField.value = addressText;
                        selectLocation(suggestion.Idx, addressText);
                    });
                }

                listItem.appendChild(button);
                suggestionsList.appendChild(listItem);
            });
        } else {
            locationDropdown.classList.add('hidden');
        }
    }

    // Step 3: Handle selection of a suggestion and fetch related locations
    async function selectSuggestion(w3wAddress) {
        const url = `https://posttagtesting.com/PAYG203PGN.php?cmd=getw3w&key=${apiKey}&id=${id}&ptid=${ptid}&address=${w3wAddress}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.data && data.data.length > 0) {
                const sortedLocations = data.data.sort((a, b) => parseInt(a.Distance) - parseInt(b.Distance));
                showLocations(sortedLocations, w3wAddress);
            } else {
                locationDropdown.classList.remove('hidden');
                suggestionsList.innerHTML = '<li>No locations found</li>';
            }

        } catch (error) {
            console.error("Error fetching locations:", error);
            locationDropdown.classList.remove('hidden');
            suggestionsList.innerHTML = '<li>Error fetching locations</li>';
        }
    }

    // Step 4: Display locations and add click event to select one
    function showLocations(locations, w3wAddress) {
        suggestionsList.innerHTML = '';

        locations.forEach((location) => {
            const listItem = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'suggestion-button';
            
            const addressText = [
                location.Organisation,
                location['Sub Building'],
                location.Number,
                location.Building,
                location.Street,
                location.Town,
                location.PostCode
            ].filter(Boolean).join(', ');

            const addressLine = document.createElement('span');
            addressLine.className = 'address-line';
            addressLine.textContent = addressText;

            const distanceText = document.createElement('span');
            distanceText.className = 'distance';
            distanceText.textContent = `${location.Distance || ''}`;

            button.appendChild(addressLine);
            button.appendChild(distanceText);

            button.addEventListener('click', () => {
                inputField.value = addressText; // Update input field
                selectLocation(location.Idx, w3wAddress);
                inputField.value = '';  // Clear the input field
                clearIcon.classList.add('hidden');  // Hide the clear icon
                locationDropdown.classList.add('hidden');  // Hide the location dropdown
            });
            listItem.appendChild(button);
            suggestionsList.appendChild(listItem);
        });
    }

    // Step 5: Fetch and display full address details for selected location
    async function selectLocation(idx, addressText) {
        const url = `https://posttagtesting.com/PAYG203PGN.php?cmd=getidx&key=${apiKey}&id=${id}&ptid=${ptid}&idx=${idx}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            // console.log(addressText);
            displayAddressDetails(data, addressText);
            // if (!addressText.includes('///')) {
            //     // If no w3w is provided, call convert-to-3wa with lat/lng
            //     const latitude = data.data[0].Latitude;
            //     const longitude = data.data[0].Longitude;
            //     getWhat3WordsAddress(latitude, longitude);
            // }
            inputField.value = '';  // Clear the input field
            clearIcon.classList.add('hidden');  // Hide the clear icon
            locationDropdown.classList.add('hidden'); // Hide the location dropdown after selection

        } catch (error) {
            console.error("Error fetching address details:", error);
        }
    }

    // // Retrieve what3words address from coordinates
    // async function getWhat3WordsAddress(lat, lng) {
    //     const url = `https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&key=${what3wordsApiKey}`;

    //     try {
    //         const response = await fetch(url);
    //         const data = await response.json();

    //         const w3wField = document.getElementById('checkout_w3w');
    //         if (w3wField) w3wField.value = data.words || '';
    //     } catch (error) {
    //         console.error("Error fetching what3words address:", error);
    //     }
    // }

    // Function to check if a given text is in the 3-word address format
    function isThreeWordAddress(text) {
        return threeWordAddressRegex.test(text);
    }   
    // Populate fields with address details and ensure w3w is empty if not provided
    function displayAddressDetails(data, what3WordsAddress) {
        const addressData = data.data[0];

        const companyField = document.getElementById('checkout_company');
        if (companyField) companyField.value = addressData.Organisation || '';

        const address1Field = document.getElementById('checkout_address_1');
        if (address1Field) address1Field.value = [
            addressData['Sub Building'] || '',
            addressData.Number || '',
            addressData.Building || '',
            addressData.Street || '',
        ].filter(Boolean).join(', ');

        const cityField = document.getElementById('checkout_city');
        if (cityField) cityField.value = addressData.Town || '';

        const postcodeField = document.getElementById('checkout_postcode');
        if (postcodeField) postcodeField.value = addressData['Post Code'] || '';

        const w3wField = document.getElementById('checkout_w3w');

        // Only populate w3w if what3WordsAddress is valid, otherwise clear
        if (w3wField) {
            // console.log(what3WordsAddress)
            if (isThreeWordAddress(what3WordsAddress)) {
                w3wField.value = what3WordsAddress;
            } else if (data.w3w) {
                w3wField.value = data.w3w; // Use response's w3w if provided
            } else {
                w3wField.value = ''; // Clear if no valid w3w
            }
        }
    }
});
