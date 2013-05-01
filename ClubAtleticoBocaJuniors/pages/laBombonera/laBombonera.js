(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/laBombonera/laBombonera.html", {
        ready: function (element, options) {
            document.getElementById("moreInfoLink").addEventListener("click", showMoreInfoFlyout, false);
        },
    });

    function showMoreInfoFlyout() {
        var moreInfoLink = document.getElementById("moreInfoLink");
        document.getElementById("moreInfoFlyout").winControl.show(moreInfoLink);
    }

})();
