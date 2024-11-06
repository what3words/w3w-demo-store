const apiKey = '73XQksR86T';
const id = '3000';
const ptid = '5BQdHLA3nC0';
const inputField = document.getElementById('w3w-input');
const suggestionsList = document.getElementById('suggestions');
const addressDetails = document.getElementById('address-details');
const searchIcon = document.getElementById('search-icon');
const clearIcon = document.getElementById('clear-icon');
const locationDropdown = document.getElementById('location-dropdown');


// Function to handle the Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        getFullLocation(inputField.value);
    }
}

// Step 1: Get full location for entered what3words address
async function getFullLocation(address) {
    const url = `https://posttagtesting.com/PAYG203PGN.php?cmd=getfulllocation&key=${apiKey}&id=${id}&ptid=${ptid}&address=${address}`;
    
    try {
        const response = await fetch(url);
        const responseData = await response.json();

        if (responseData.data) {
            showSuggestions(responseData.data);
        } else {
            console.error("No data found in response:", responseData);
            suggestionsList.innerHTML = '<li>No suggestions available</li>';
        }

    } catch (error) {
        console.error("Error fetching full location:", error);
    }
}

// Step 2: Display suggestions and add click event to select one
function showSuggestions(suggestions) {
    // Clear existing suggestions
    suggestionsList.innerHTML = '';

    if (suggestions.length > 0) {
        // Show the dropdown if there are suggestions
        locationDropdown.classList.remove('hidden');

        suggestions.forEach((suggestion) => {
            const listItem = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'suggestion-button';
            button.addEventListener('click', () => selectSuggestion(suggestion.w3w));

            const prefix = document.createElement('span');
            prefix.className = 'prefix';
            prefix.textContent = '///';

            const text = document.createTextNode(` ${suggestion.w3w}, ${suggestion.place}`);

            button.appendChild(prefix);
            button.appendChild(text);
            listItem.appendChild(button);
            suggestionsList.appendChild(listItem);
        });
    } else {
        // Hide the dropdown if there are no suggestions
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
            // If data is present, sort and display it
            const sortedLocations = data.data.sort((a, b) => parseInt(a.Distance) - parseInt(b.Distance));
            showLocations(sortedLocations, w3wAddress);
        } else {
            // Show "No locations found" message if there's no data
            locationDropdown.classList.remove('hidden'); // Make sure dropdown is visible
            suggestionsList.innerHTML = '<li>No locations found</li>';
        }

    } catch (error) {
        console.error("Error fetching locations:", error);
        // Optionally show an error message in the dropdown as well
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
        
        // Combine all address details into a single line
        const addressText = [
            location.Organisation,
            location.SubBuilding,
            location.Number,
            location.Building,
            location.Street,
            location.Town,
            location.PostCode
        ].filter(Boolean).join(', ');

        // Address line element
        const addressLine = document.createElement('span');
        addressLine.className = 'address-line';
        addressLine.textContent = addressText;

        // Distance element, bold and aligned to the right
        const distanceText = document.createElement('span');
        distanceText.className = 'distance';
        distanceText.textContent = `${location.Distance || ''}`;

        // Append address and distance to the button
        button.appendChild(addressLine);
        button.appendChild(distanceText);

        // Add event listener to select the location on click
        button.addEventListener('click', () => selectLocation(location.Idx, w3wAddress));

        listItem.appendChild(button);
        suggestionsList.appendChild(listItem);
    });
}

// Step 5: Fetch and display full address details for selected location
async function selectLocation(idx, w3wAddress) {
    const url = `https://posttagtesting.com/PAYG203PGN.php?cmd=getidx&key=${apiKey}&id=${id}&ptid=${ptid}&idx=${idx}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        displayAddressDetails(data, w3wAddress);

    } catch (error) {
        console.error("Error fetching address details:", error);
    }
}

// Function to display detailed address information
function displayAddressDetails(data, what3WordsAddress) {
    const addressData = data.data[0];

    const fullAddress = `${addressData.Organisation || ''}, ${addressData['Sub Building'] || ''}, ${addressData.Number || ''}, ${addressData.Building || ''}, ${addressData.Street || ''}, ${addressData.Town || ''}, ${addressData['Post Code'] || ''}`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '');
    const addressLine1 = `${addressData.Organisation || ''}, ${addressData['Sub Building'] || ''}, ${addressData.Number || ''}, ${addressData.Building || ''}`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '');
    const addressLine2 = `${addressData.Street || ''}`;
    const townCity = `${addressData.Town || ''}`;
    const postcode = `${addressData['Post Code'] || ''}`;
    const latitude = `${addressData.Latitude || 'N/A'}`;
    const longitude = `${addressData.Longitude || 'N/A'}`;

    addressDetails.innerHTML = `
        <h2>Address Details</h2>
        <p><strong>What3Words Address:</strong> ${what3WordsAddress}</p>
        <p><strong>Full Address:</strong> ${fullAddress}</p>
        <p><strong>Address Line 1:</strong> ${addressLine1}</p>
        <p><strong>Address Line 2:</strong> ${addressLine2}</p>
        <p><strong>Town/City:</strong> ${townCity}</p>
        <p><strong>Postcode:</strong> ${postcode}</p>
        <p><strong>Latitude:</strong> ${latitude}</p>
        <p><strong>Longitude:</strong> ${longitude}</p>
    `;
} 

// Trigger search and toggle icons
function triggerSearch() {
    const address = inputField.value.trim();
    if (address) {
        searchIcon.classList.add('hidden');
        clearIcon.classList.remove('hidden');
        getFullLocation(address);  // Call your search function here
    }
}

// Clear the input field and reset icons
function clearInput() {
    inputField.value = '';
    clearIcon.classList.add('hidden');
    searchIcon.classList.remove('hidden');
    locationDropdown.classList.add('hidden'); // Hide dropdown
    suggestionsList.innerHTML = '';
    addressDetails.innerHTML = '';
}

// Handle enter key to trigger search
inputField.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        triggerSearch();
    }
});
