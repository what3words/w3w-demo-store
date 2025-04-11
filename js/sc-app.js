const SWIFTCOMPLETE_API_KEY = "322d46ce-6eaa-4d57-8fdf-c39d5ccb54c0";
const SWIFTCOMPLETE_SEARCH_FIELD_ID = "w3w-input";

function initialiseSwiftcomplete() {
    const credits = document.getElementById('credits');
    
    if (credits) {
        credits.onchange = function() {
            const elements = document.querySelectorAll('[data-credits]');
            const selectedValue = this.options[this.selectedIndex].value;

            elements.forEach(element => {
                element.style.display = (element.dataset.credits === selectedValue) ? 'block' : 'none';
            });
        };
    }
}

function initSwiftcomplete() {
    swiftcomplete.runWhenReady(() => {
        const searchField = document.getElementById(SWIFTCOMPLETE_SEARCH_FIELD_ID);
        swiftcomplete.controls[SWIFTCOMPLETE_SEARCH_FIELD_ID] = new swiftcomplete.SwiftLookup({
            field: searchField,
            key: SWIFTCOMPLETE_API_KEY,
            searchFor: "what3words,address",
            emptyQueryMode: 'prompt',
            scrollToFieldOnFocus: true,
            populateLineFormat: [
                { format: 'Company' },
                { format: 'SubBuilding, BuildingName' },
                { format: 'BuildingNumber SecondaryRoad, Road, PoBox' },
                { format: 'TertiaryLocality, SecondaryLocality' },
                { format: 'PrimaryLocality' },
                { format: 'POSTCODE' },
                { format: 'PrimaryCountry' },
                { format: 'what3words' }
            ]
        });

        const control = swiftcomplete.controls[SWIFTCOMPLETE_SEARCH_FIELD_ID];
        control.groupBy('road,emptyroad');
        control.setMaxAutocompleteResults(5);
        control.setMaxContainerResults(100);
        control.setCountries('gb');
    });

    document.getElementById('w3w-input').addEventListener('swiftcomplete:swiftlookup:selected', function (e) {
        const lines = e.detail.result.populatedRecord.lines;
        console.log(lines);

        if (lines[3].length > 0 && lines[4].length === 0) {
            if (lines[3].includes(', ')) {
                const splitLine = lines[3].split(', ');
                lines[3] = splitLine[splitLine.length - 2];
                lines[4] = splitLine[splitLine.length - 1];
            } else {
                lines[4] = lines[3];
                lines[3] = '';
            }
        }

        document.getElementById('checkout_company').value = lines[0] || '';
        document.getElementById('checkout_city').value = lines[4] || '';
        document.getElementById('checkout_postcode').value = lines[5] || '';

        const countrySelect = document.querySelector('select[name="country"]');
        if (lines[6] === 'United Kingdom') {
            document.getElementById('checkout_country').value = lines[6];
            countrySelect.value = 'GB';
        } else {
            document.getElementById('checkout_country').value = countrySelect.options[countrySelect.selectedIndex].text;
        }

        document.getElementById('checkout_w3w').value = lines[7] || '';

        let addressLines = lines.splice(1, 3).filter(item => item.length > 0);
        if (addressLines.length > 3) {
            addressLines[2] += ', ' + addressLines[3];
            addressLines.length = 3;
        }

        document.getElementById('checkout_address_1').value = '';
        document.getElementById('checkout_address_2').value = '';
        document.getElementById('checkout_address_3').value = '';

        addressLines.forEach((line, index) => {
            document.getElementById('checkout_address_' + (index + 1)).value = line;
        });

        document.getElementById('w3w-input').value = '';
    }, false);
}

window.addEventListener("load", initialiseSwiftcomplete, false);
window.addEventListener("load", initSwiftcomplete, false);