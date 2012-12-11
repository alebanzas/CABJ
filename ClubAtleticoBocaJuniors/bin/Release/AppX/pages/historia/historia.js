(function () {
    "use strict";

    var directionsManager;
    var map;
    var page;
    var cLocation;
    var rLocation;
    var currentLocation;
    var loading;
    
    WinJS.UI.Pages.define("/pages/historia/historia.html", {
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

            return;
            Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: initMap, culture: "en-us", homeRegion: "US" });

            function positionNotGetted() {
                var currentPosition = new Object();
                currentPosition.coords = new Object();
                currentPosition.coords.latitude = -34.603702;
                currentPosition.coords.longitude = -58.381668;
                setCurrentPosition(currentPosition);
            };
            
            function positionGetted(currentPosition) {
                setCurrentPosition(currentPosition);
            };
            
            function setCurrentPosition(currentPosition) {
                currentLocation = currentPosition;
                var mypositionpoint = new Microsoft.Maps.Location(currentPosition.coords.latitude, currentPosition.coords.longitude);
                map.setView({ zoom: 16, center: mypositionpoint });
                var pushpin = new Microsoft.Maps.Pushpin(mypositionpoint, null);
                map.entities.push(pushpin);
            };

            function initMap() {
                var mapelement = document.getElementById("bingMap");
                
                /*
                var messagedialogpopup = new Windows.UI.Popups.MessageDialog('Allow to use your location ', 'Location Application'); 
                messagedialogpopup.showAsync().then(function (e) {
                    //Code to execute on close goes here
                });
                */

                var mapOptions =
                {
                    credentials: "AnByQf4BriO0Rkdr4JkzuUbpd3ZkYqx6gLlN1txZS4_wilBJ4wJqaDFHaXoiiZUE",
                    center: new Microsoft.Maps.Location(-34.603702, -58.381668),
                    mapTypeId: Microsoft.Maps.MapTypeId.road, zoom: 12,
                    width: ((window.outerWidth * 0.7) - 120), height: ((window.outerHeight * 0.85) - 120),
                    showDashboard: false,
                    enableSearchLogo: false,
                };

                map = new Microsoft.Maps.Map(mapelement, mapOptions);
                mapelement.style.width = "75%";
                
                navigator.geolocation.getCurrentPosition(positionGetted, positionNotGetted);
            }
        },
        getDirection: function (currentPosition, callback) {
            if (!this.isInternetAvailable()) {
                this.showConnectionError();
                callback();
                return;
            }
            WinJS.xhr({ type: "post", url: "http://servicio.abhosting.com.ar/hotel/near/?lat=" + currentPosition.coords.latitude + "&lon=" + currentPosition.coords.longitude }).then(function (re) {
                var r = JSON.parse(re.responseText);

                document.querySelector(".nombre").textContent = r.Nombre;
                var direccion = r.Direccion + ", " + r.Barrio;
                direccion += r.Ciudad !== "Capital Federal" ? r.Ciudad : "";
                //direccion += r.Telefono !== null ? r.Telefono : "";

                document.querySelector(".direccion").textContent = direccion;
                document.querySelector(".descripcion").textContent = r.Descripcion;
                document.querySelector(".telefono").textContent = r.Telefono;
                
                var location = new Microsoft.Maps.Location(r.Latitud, r.Longitud);
                var infobox = new Microsoft.Maps.Infobox(location, { title: r.Nombre, height: 100, width: 180, description: direccion, showPointer: true });
                infobox.setOptions({ visible: true });
                map.entities.push(infobox);

                cLocation = new Microsoft.Maps.Location(currentPosition.coords.latitude, currentPosition.coords.longitude);
                rLocation = new Microsoft.Maps.Location(r.Latitud, r.Longitud);
                if (Math.abs(cLocation.latitude - rLocation.latitude) < 10 && Math.abs(cLocation.longitude - rLocation.longitude) < 10) {
                    page.setDirection(cLocation, rLocation, "walking");
                } else {
                    map.setView({ zoom: 16, center: rLocation });
                }
                
                page.getPorBarrio(r.Barrio, function () {
                    loading.style.display = "none";
                });

                callback();
            });
        },
        getAll: function (callback) {
            if (!this.isInternetAvailable()) {
                this.showConnectionError();
                callback();
                return;
            }

            var wall = new WinJS.Binding.List();
            var wallList = document.getElementById("lista").winControl;
            wallList.itemTemplate = document.getElementById("itemTemplate");
            wallList.itemDataSource = wall.dataSource;
            document.getElementById("lista").winControl.ensureVisible(1);
            wallList.forceLayout();

            WinJS.xhr({ type: "post", url: "http://servicio.abhosting.com.ar/hotel/all/" }).then(function (re) {
                var r = JSON.parse(re.responseText);

                r.forEach(function (message) {
                    wall.push({ nombre: message.Nombre, direccion: message.Direccion });
                });

                callback();
            });
            document.getElementById("lista").layout = new WinJS.UI.ListLayout({ horizonal: false });
        },
        getPorBarrio: function (barrio, callback) {
            if (!this.isInternetAvailable()) {
                this.showConnectionError();
                callback();
                return;
            }
            
            document.getElementById("masBarrio").textContent = "Mas en el barrio (" + barrio + ")";
            document.getElementById("masBarrio").style.display = "block";

            var wall = new WinJS.Binding.List();
            var wallList = document.getElementById("lista").winControl;
            wallList.itemTemplate = document.getElementById("itemTemplate");
            wallList.itemDataSource = wall.dataSource;
            document.getElementById("lista").winControl.ensureVisible(1);
            wallList.forceLayout();
            
            WinJS.xhr({ type: "post", url: "http://servicio.abhosting.com.ar/hotel/PorBarrio/?barrio=" + barrio }).then(function (re) {
                var r = JSON.parse(re.responseText);

                r.forEach(function (message) {
                    wall.push({ nombre: message.Nombre, direccion: message.Direccion });
                });

                callback();
            });
            document.getElementById("lista").layout = new WinJS.UI.ListLayout({ horizonal: false });
        },
        setDirection: function (cl, dl, mode) { //mode = transit || walking
            
            if(mode) {
                if(mode !== "transit") {
                    mode = Microsoft.Maps.Directions.RouteMode.walking;
                } else {
                    mode = Microsoft.Maps.Directions.RouteMode.transit;
                }
            } else {
                mode = Microsoft.Maps.Directions.RouteMode.walking;
            }

            if (!directionsManager) {
                Microsoft.Maps.loadModule('Microsoft.Maps.Directions', { callback: createWalkingRoute(cl, dl, mode) });
            } else {
                createWalkingRoute(cl, dl, mode);
            }
            
            function createDirectionsManager() {
                if (!directionsManager) {
                    directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
                }
                directionsManager.resetDirections();
            };

            function createWalkingRoute(from, to, m) {
                if (!directionsManager) { createDirectionsManager(); }
                directionsManager.resetDirections();
                // Set Route Mode to walking 
                directionsManager.setRequestOptions({ routeMode: m });
                var seattleWaypoint = new Microsoft.Maps.Directions.Waypoint({ location: from });
                directionsManager.addWaypoint(seattleWaypoint);
                var redmondWaypoint = new Microsoft.Maps.Directions.Waypoint({ location: to });
                directionsManager.addWaypoint(redmondWaypoint);
                directionsManager.calculateDirections();
            }
        }
    });



})();
