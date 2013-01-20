(function () {
    "use strict";

    var nav = WinJS.Navigation;
    
    WinJS.UI.Pages.define("/pages/home/home.html", {
        ready: function (element, options) {
            document.getElementById("laBombonera").onclick = function () {
                nav.navigate("/pages/laBombonera/laBombonera.html", nav.state);
            };
            document.getElementById("historia").onclick = function () {
                nav.navigate("/pages/historia/historia.html", nav.state);
            };
            document.getElementById("noticias").onclick = function () {
                nav.navigate("/pages/groupedItems/groupedItems.html", nav.state);
            };
            document.getElementById("comisionDirectiva").onclick = function () {
                nav.navigate("/pages/comisionDirectiva/comisionDirectiva.html", nav.state);
            };
            document.getElementById("historiaEquipos").onclick = function () {
                nav.navigate("/pages/historiaEquipos/historiaEquipos.html", nav.state);
            };
            document.getElementById("historiaCamisetas").onclick = function () {
                nav.navigate("/pages/historiaCamisetas/historiaCamisetas.html", nav.state);
            };
            document.getElementById("informacionSocios").onclick = function () {
                nav.navigate("/pages/informacionSocios/informacionSocios.html", nav.state);
            };
        },
    });



})();
