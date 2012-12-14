(function () {
    "use strict";
    
    WinJS.UI.Pages.define("/pages/comisionDirectiva/comisionDirectiva.html", {
        ready: function (element, options) {
            
        },
        showConnectionError: function () {
            var popup = Windows.UI.Popups.MessageDialog("Ha habido un error intentando acceder a los nuevos datos o no hay conexiones de red disponibles.\nPor favor asegúrese de contar con acceso de red.", "Sin conexión");
            popup.showAsync();
        },
        isInternetAvailable: function () {
            var internetProfile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
            return internetProfile != null && internetProfile.getNetworkConnectivityLevel() == Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess;
        },
        getPageInformation: function (page) {

        },
    });
})();
