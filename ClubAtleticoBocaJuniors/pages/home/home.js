(function () {
    "use strict";

    var nav = WinJS.Navigation;
    
    WinJS.UI.Pages.define("/pages/home/home.html", {
        ready: function (element, options) {
        	var laBombonera = document.getElementById("laBombonera");
        	var historia = document.getElementById("historia");
        	var noticias = document.getElementById("noticias");
        	var comisionDirectiva = document.getElementById("comisionDirectiva");
        	var historiaEquipos = document.getElementById("historiaEquipos");
        	var historiaCamisetas = document.getElementById("historiaCamisetas");
        	var informacionSocios = document.getElementById("informacionSocios");
	        var redesSociales = document.getElementById("redesSociales");
	        
	        laBombonera.onclick = function () {
                nav.navigate("/pages/laBombonera/laBombonera.html", nav.state);
            };
	        historia.onclick = function () {
                nav.navigate("/pages/historia/historia.html", nav.state);
            };
	        noticias.onclick = function () {
                nav.navigate("/pages/groupedItems/groupedItems.html", nav.state);
            };
	        comisionDirectiva.onclick = function () {
                nav.navigate("/pages/comisionDirectiva/comisionDirectiva.html", nav.state);
            };
	        historiaEquipos.onclick = function () {
                nav.navigate("/pages/historiaEquipos/historiaEquipos.html", nav.state);
            };
	        historiaCamisetas.onclick = function () {
                nav.navigate("/pages/historiaCamisetas/historiaCamisetas.html", nav.state);
            };
	        informacionSocios.onclick = function () {
                nav.navigate("/pages/informacionSocios/informacionSocios.html", nav.state);
	        };
	        redesSociales.onclick = function () {
	        	nav.navigate("/pages/redesSociales/redesSociales.html", nav.state);
	        };

	        laBombonera.addEventListener("MSPointerDown", onPointerDown, false);
	        laBombonera.addEventListener("MSPointerUp", onPointerUp, false);
	        historia.addEventListener("MSPointerDown", onPointerDown, false);
	        historia.addEventListener("MSPointerUp", onPointerUp, false);
	        noticias.addEventListener("MSPointerDown", onPointerDown, false);
	        noticias.addEventListener("MSPointerUp", onPointerUp, false);
	        comisionDirectiva.addEventListener("MSPointerDown", onPointerDown, false);
	        comisionDirectiva.addEventListener("MSPointerUp", onPointerUp, false);
	        historiaEquipos.addEventListener("MSPointerDown", onPointerDown, false);
	        historiaEquipos.addEventListener("MSPointerUp", onPointerUp, false);
	        historiaCamisetas.addEventListener("MSPointerDown", onPointerDown, false);
	        historiaCamisetas.addEventListener("MSPointerUp", onPointerUp, false);
	        informacionSocios.addEventListener("MSPointerDown", onPointerDown, false);
	        informacionSocios.addEventListener("MSPointerUp", onPointerUp, false);
	        redesSociales.addEventListener("MSPointerDown", onPointerDown, false);
	        redesSociales.addEventListener("MSPointerUp", onPointerUp, false);
	        
	        var header = document.querySelector(".homepage header[role=banner]");
	        enterAnimation([header], [historia, historiaEquipos, historiaCamisetas], [laBombonera, redesSociales], [noticias, comisionDirectiva, informacionSocios]);
	    },
    });

	function enterAnimation(grupo1, grupo2, grupo3, grupo4) {
		var contenthost = document.getElementById("contenthost");
		contenthost.style.overflow = "hidden";
		
		WinJS.UI.Animation.enterPage([grupo1, grupo2, grupo3, grupo4], null).done(
            function () {
            	contenthost.style.overflow = "auto";
            });
	}

	function onPointerDown(evt) {
		WinJS.UI.Animation.pointerDown(evt.srcElement);
	}

	function onPointerUp(evt) {
		WinJS.UI.Animation.pointerUp(evt.srcElement);
	}


})();
