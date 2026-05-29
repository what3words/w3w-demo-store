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
        const pageLang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
        swiftcomplete.controls[SWIFTCOMPLETE_SEARCH_FIELD_ID] = new swiftcomplete.SwiftLookup({
            field: searchField,
            key: SWIFTCOMPLETE_API_KEY,
            searchFor: "what3words,address",
            language: pageLang,
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

        const countrySelect = document.querySelector('select[name="country"]');
        control.setCountries(countrySelect.value ? countrySelect.value.toLowerCase() : 'gb');

        countrySelect.addEventListener('change', function () {
            control.setCountries(this.value ? this.value.toLowerCase() : 'gb');
            ['checkout_w3w_lookup', 'checkout_address_1', 'checkout_address_2', 'checkout_city', 'checkout_postcode', 'checkout_w3w_address'].forEach(function (id) {
                var el = document.getElementById(id);
                if (el) el.value = '';
            });
            var w3wWrapper = document.getElementById('checkout-w3w-address-wrapper');
            if (w3wWrapper) w3wWrapper.style.display = 'none';
        });
    });

    document.getElementById('w3w-input').addEventListener('swiftcomplete:swiftlookup:selected', function (e) {
        const lines = e.detail.result.populatedRecord.lines;
        console.log(e.detail.result);

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

        document.getElementById('checkout_city').value = lines[4] || '';
        document.getElementById('checkout_postcode').value = lines[5] || '';

        const w3wValue = lines[7] || '';
        const w3wWrapper = document.getElementById('checkout-w3w-address-wrapper');
        document.getElementById('checkout_w3w_address').value = w3wValue;
        w3wWrapper.style.display = w3wValue ? '' : 'none';

        // country dropdown already reflects the user's selection; no change needed after result

        // Map SC's populated address lines into 2 inputs.
        // lines[1] = SubBuilding, BuildingName     (usually empty for residential UK)
        // lines[2] = BuildingNumber + Road + PoBox (the typical "main street" line)
        // lines[3] = TertiaryLocality, SecondaryLocality
        //
        // First non-empty line  -> Address (line 1)
        // Anything else, joined -> Apartment, suite, etc. (line 2)
        const primaryLines = [lines[1], lines[2], lines[3]].filter(Boolean);
        const address2El = document.getElementById('checkout_address_2');
        let addressLine1;
        if (address2El) {
            addressLine1 = primaryLines.shift() || '';
            address2El.value = primaryLines.join(', ');
        } else {
            addressLine1 = primaryLines.join(', ');
        }

        document.getElementById('checkout_address_1').value = addressLine1;

        document.getElementById('w3w-input').value = '';
    }, false);
}

window.addEventListener("load", initialiseSwiftcomplete, false);
window.addEventListener("load", initSwiftcomplete, false);

/**
 * Toggle the `.cs-radio--selected` class on the parent <fieldset> when a
 * radio in `name=<radioGroup>` changes. Lets the Shopify-style payment +
 * shipping panels expand/collapse purely via CSS.
 */
function bindRadioGroup(radioGroup) {
    const radios = document.querySelectorAll(`input[type="radio"][name="${radioGroup}"]`);
    radios.forEach(function (radio) {
        radio.addEventListener('change', function () {
            const groupKey = radioGroup.replace('_method', '');
            const groupFieldsets = document.querySelectorAll('fieldset[data-radio="' + groupKey + '"]');
            groupFieldsets.forEach(function (fs) { fs.classList.remove('cs-radio--selected'); });
            const owner = radio.closest('fieldset');
            if (owner) owner.classList.add('cs-radio--selected');
        });
    });
}

window.addEventListener('load', function () {
    bindRadioGroup('payment_method');
    bindRadioGroup('shipping_method');
}, false);