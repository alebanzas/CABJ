(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/historiaCamisetas/historiaCamisetas.html", {
        ready: function (element, options) {
        },
        showConnectionError: function () {
            var popup = Windows.UI.Popups.MessageDialog("Ha habido un error intentando acceder a los nuevos datos o no hay conexiones de red disponibles.\nPor favor asegúrese de contar con acceso de red.", "Sin conexión");
            popup.showAsync();
        },
    });
})();
