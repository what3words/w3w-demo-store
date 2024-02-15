(function ($) {
  var country = $(".select-skin");

  initW3Address(country);

  $(".select-skin").on("change", function () {
    country = $(".select-skin");
    initW3Address();
  });

  function initW3Address() {
    $("#w3wsearch").w3wAddress({
      api_end_point:
        "https://om0x0bo857.execute-api.eu-west-2.amazonaws.com/preprod/v2/",
      results: 3,
      country_filter: ".select-skin",
    });
  }
})(jQuery);
