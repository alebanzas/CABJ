(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/redesSociales/redesSociales.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            //window.fbAsyncInit = function () {
            //    FB.init({
            //        appId: '474618525905687', // App ID
            //        status: true, // check login status
            //        cookie: true, // enable cookies to allow the server to access the session
            //        xfbml: true  // parse XFBML
            //    });
            //};

            this.getPageInformation();
            this.getPageAlbums();
            //var login = document.querySelector(".loginButton").winControl;
            //if (login.isUserAuthenticated) {
            //    this.getPageWall(login.accessToken);
            //}
        },

        getPageInformation: function () {
            WinJS.xhr({ url: "http://graph.facebook.com/BocaJuniors" }).then(function (response) {
                var d = JSON.parse(response.responseText);
                document.querySelector(".pagetitle").textContent = d.name + " " + d.phone;
                document.querySelector(".about").textContent = d.about;
                document.querySelector(".culinary_team").textContent = "Por " + d.culinary_team;
                document.querySelector(".category").textContent = d.category;
                var pageLink = document.createElement("a");
                pageLink.href = d.link;
                pageLink.textContent = "su página.";
                var pageText = document.createElement("span");
                pageText.textContent = "A " + d.likes + " personas les gusta ";
                document.querySelector(".pageLikes").appendChild(pageText);
                document.querySelector(".pageLikes").appendChild(pageLink);
                //su página. " + d.talking_about_count + " están hablando sobre eso!";
                //document.querySelector(".redesSociales").style.backgroundImage = "url(" + d.cover.source + ")";

                Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: initMap, culture: "en-us", homeRegion: "US" });

                var map;
                var directionsManager;

                function createDirectionsManager() {
                    if (!directionsManager) {
                        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
                    }
                    directionsManager.resetDirections();
                };

                function createWalkingRoute(from, to) {
                    if (!directionsManager) { createDirectionsManager(); }
                    directionsManager.resetDirections();
                    // Set Route Mode to walking 
                    directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.walking });
                    var seattleWaypoint = new Microsoft.Maps.Directions.Waypoint({ location: from });
                    directionsManager.addWaypoint(seattleWaypoint);
                    var redmondWaypoint = new Microsoft.Maps.Directions.Waypoint({ location: to });
                    directionsManager.addWaypoint(redmondWaypoint);
                    //var fromWaypoint = new Microsoft.Maps.Directions.Waypoint({ location: from });
                    //directionsManager.addWaypoint(fromWaypoint);
                    //var toWaypoint = new Microsoft.Maps.Directions.Waypoint({ location: to });
                    //directionsManager.addWaypoint(toWaypoint);
                    // Set the element in which the itinerary will be rendered
                    //directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('directionsItinerary') });
                    //displayAlert('Calculating directions...');
                    directionsManager.calculateDirections();
                }

                function showDirections(currentPosition) {
                    var currentLocation = new Microsoft.Maps.Location(currentPosition.coords.latitude, currentPosition.coords.longitude);
                    var restaurantLocation = new Microsoft.Maps.Location(d.location.latitude, d.location.longitude);
                    if (!directionsManager) {
                        Microsoft.Maps.loadModule('Microsoft.Maps.Directions', { callback: createWalkingRoute(currentLocation, restaurantLocation) });
                    }
                    else {
                        createWalkingRoute(currentLocation, restaurantLocation);
                    }
                };

                function initMap() {
                    var mapOptions =
                    {
                        credentials: "ApknPccqXdZCVXA2Foa4QGqrXDPtCEt2qCfgLlnSUxWD_YuoPhof6PYZtjC-R_QH",
                        center: new Microsoft.Maps.Location(d.location.latitude, d.location.longitude),
                        mapTypeId: Microsoft.Maps.MapTypeId.road, zoom: 16,
                        width: 500, height: 400,
                        showDashboard: false,
                        enableSearchLogo: false,
                    };

                    navigator.geolocation.getCurrentPosition(showDirections);

                    map = new Microsoft.Maps.Map(document.getElementById("bingMap"), mapOptions);
                    document.getElementById("bingMap").style.width = "75%";
                    //var pushpin = new Microsoft.Maps.Pushpin(map.getCenter(), null);
                    //map.entities.push(pushpin);

                    var infobox = new Microsoft.Maps.Infobox(map.getCenter(), { title: d.name, height: 90, width: 180, description: d.location.street + " <br/>t: " + d.phone, showPointer: true });

                    infobox.setOptions({ visible: true });
                    map.entities.push(infobox);

                }

                var website = document.querySelector("a.website");
                website.href = d.website;
                website.text = d.website;
                //d.about; d.category; d.checkins; d.cover.source; d.culinary_team; d.hours; d.id;
                //d.likes;//d.link;//d.location.latitud;//d.location.longitud;//d.location.street;//d.name;
                //d.payment_options.visa;//d.phone;//d.restaurant_services.takeout;//d.restaurant_specialties;
                //d.talking_about_count;//d.username;//d.website;
            });

        },
        getPageAlbums: function () {

            var photos = new WinJS.Binding.List();
            var photosList = document.getElementById("photos").winControl;
            photosList.itemTemplate = document.getElementById("photoTemplate");
            photosList.itemDataSource = photos.dataSource;

            WinJS.xhr({ url: "http://graph.facebook.com/BocaJuniors/albums" }).then(function (response) {
                var d = JSON.parse(response.responseText);
                d.data.forEach(function (album) {
                    // we fetch each album
                    if (album.cover_photo) {
                        WinJS.xhr({ url: "http://graph.facebook.com/" + album.cover_photo }).then(function (response) {
                            var i = JSON.parse(response.responseText);
                            //i.images[6].source;
                            photos.push({ source: i.images[6].source, height: i.images[6].height, width: i.images[6].width });
                        });
                    }
                });


            });
        },
        getPageWall: function (accessToken) {
            var wall = new WinJS.Binding.List();
            var wallList = document.getElementById("wall").winControl;
            //photosList.itemTemplate = document.getElementById("photoTemplate");
            wallList.itemDataSource = wall.dataSource;
            WinJS.xhr({ url: "https://graph.facebook.com/BocaJuniors/feed?access_token=" + accessToken }).then(function (response) {
                var f = JSON.parse(response.responseText);
                f.data.forEach(function (message) {
                    wall.push(message);
                });
            });

        },
    });



})();
