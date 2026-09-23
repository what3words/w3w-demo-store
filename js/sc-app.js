const SWIFTCOMPLETE_API_KEY = "322d46ce-6eaa-4d57-8fdf-c39d5ccb54c0";
const SWIFTCOMPLETE_SEARCH_ELEMENT_ID = "sc-address-search";
// The component ships with debounce off (0), i.e. one request per keystroke —
// which is what overflowed the API's per-key queue for Tile Mountain (TT-10697).
const SWIFTCOMPLETE_DEBOUNCE_MS = 300;

// Keys are ours; `format` is the Swiftcomplete line format, `fieldId` the input
// the component writes that line into on selection.
const SWIFTCOMPLETE_FIELDS = {
    company: 'Company',
    addressLine1: { fieldId: 'checkout_address_1', format: 'AddressLine1' },
    addressLine2: { fieldId: 'checkout_address_2', format: 'AddressLine2' },
    city: { fieldId: 'checkout_city', format: 'TertiaryLocality, SecondaryLocality, PrimaryLocality' },
    postalCode: { fieldId: 'checkout_postcode', format: 'POSTCODE' },
    country: 'PrimaryCountry',
    what3words: { fieldId: 'checkout_w3w_address', format: 'what3words' }
};

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

function clearAddressFields(search) {
    ['checkout_address_1', 'checkout_address_2', 'checkout_city', 'checkout_postcode', 'checkout_w3w_address']
        .forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    document.getElementById('checkout-w3w-address-wrapper').style.display = 'none';
    search.getInput().value = '';
}

function initSwiftcomplete() {
    const search = document.getElementById(SWIFTCOMPLETE_SEARCH_ELEMENT_ID);
    const countrySelect = document.querySelector('select[name="country"]');

    window.swiftcomplete.runWhenReady(function (service) {
        service.setApiKey(SWIFTCOMPLETE_API_KEY);
        service.setSearchFor('what3words', 'address');
        service.setDebounce(SWIFTCOMPLETE_DEBOUNCE_MS);
        service.setEnableSearchOnEmptySearch(true);
        service.setCountry((countrySelect.value || 'GB').toLowerCase());

        // The DE page has no "Apartment, suite" input, so we join both address
        // lines into line 1 ourselves below. Drop the fieldIds for both: the
        // component writes its own fields *after* dispatching select, so
        // leaving line 1 mapped would overwrite what we just wrote.
        const hasAddressLine2 = !!document.getElementById('checkout_address_2');
        const fields = Object.assign({}, SWIFTCOMPLETE_FIELDS);
        if (!hasAddressLine2) {
            fields.addressLine1 = SWIFTCOMPLETE_FIELDS.addressLine1.format;
            fields.addressLine2 = SWIFTCOMPLETE_FIELDS.addressLine2.format;
        }
        search.populateFields(fields);

        search.addEventListener(window.swiftcomplete.SearchEvents.Select, function (e) {
            // Every other field is filled by the component via `fields`.
            const selected = e.detail.selected;

            if (!hasAddressLine2) {
                document.getElementById('checkout_address_1').value =
                    [selected.addressLine1, selected.addressLine2].filter(Boolean).join(', ');
            }

            document.getElementById('checkout-w3w-address-wrapper').style.display =
                selected.what3words ? '' : 'none';
        });

        countrySelect.addEventListener('change', function () {
            service.setCountry((this.value || 'GB').toLowerCase());
            clearAddressFields(search);
        });
    });
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