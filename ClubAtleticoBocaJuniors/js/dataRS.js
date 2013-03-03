(function () {
    "use strict";

    var statuses = [
            { key: "group1", url: 'http://api.twitter.com/1/statuses/user_timeline.xml?screen_name=alebanzas' }
   ];

    var tweets = new WinJS.Binding.List();
    var groupedItems = tweets.createGrouped(
        function groupKeySelector(item) { return item.group.key; },
        function groupDataSelector(item) { return item.group; }
    );

    var localFolder = Windows.Storage.ApplicationData.current.localFolder;

    function getStatuses() {
        var dataPromises = [];

        // Get the content for each feed and get items from xml.
        statuses.forEach(function (status) {
            // We bind the data promise to the feed, to update the feed later with its response
            status.dataPromise = WinJS.xhr({ url: status.url });
            dataPromises.push(status.dataPromise);
        });

        return WinJS.Promise.join(dataPromises).then(function() { return statuses; }); // We return the feeds instead of the promise, for signature consistency
    };

    function isInternetAvailable() {
        var internetProfile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
        return internetProfile != null && internetProfile.getNetworkConnectivityLevel() == Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess;
    }

    function getTWStatuses() {
        if (isInternetAvailable()) {
            var pr = document.createElement("progress");
            var header = document.querySelector("header h1");
            header.appendChild(pr);

            return getStatuses()
                .then(function (cuentas) {
                    cuentas.forEach(function (cuenta) {
                        cuenta.dataPromise.then(function (articlesResponse) {
                            var articleSyndication = articlesResponse.responseXML;

                            if (articleSyndication == null) {
                                var parser = new DOMParser();
                                articleSyndication = parser.parseFromString(articlesResponse.responseText, "application/xml");
                            }

                            getGroupInfoFromXml(articleSyndication, cuenta);
                            getItemsFromXml(articleSyndication, cuenta);
                        });
                    });
                    writeFile(JSON.stringify(tweets));
                })
                .then(function (cuentas) {
                    header.removeChild(pr);
                    return cuentas;
                });
        } else {
            readFile();
            showConnectionError();
        }
    }

    function showConnectionError() {
        var popup = Windows.UI.Popups.MessageDialog("Ha habido un error intentando acceder a los nuevos datos o no hay conexiones de red disponibles.\nPor favor asegúrese de contar con acceso de red y vuelva a abrir la aplicación.", "Sin conexión");
        popup.showAsync();
    }

    function getGroupInfoFromXml(articleSyndication, feed) {
        // Get the blog title and last updated date.
        /*if (articleSyndication.querySelector("feed") != null) {
            feed.title = articleSyndication.querySelector(
                "feed > title").textContent;
            var ds = articleSyndication.querySelector(
                "feed > updated").textContent;
            var date = ds.substring(5, 7) + "-" + ds.substring(8, 10) + "-" + ds.substring(0, 4);
            var author = articleSyndication.querySelector(
                "author > name").textContent;
            feed.description = "Por " + author + " actualizado " + date;
            feed.subtitle = articleSyndication.querySelector("feed > title").textContent;

            feed.itemsName = "entry";
        } else if (articleSyndication.querySelector("channel") != null) {
            feed.title = articleSyndication.querySelector(
                "channel > title").textContent;
            if (articleSyndication.querySelector("channel > pubDate") != null)
                var ds = articleSyndication.querySelector("channel > pubDate").textContent;
            else
                var ds = articleSyndication.querySelector("channel > lastBuildDate").textContent;
            var date = ds.substring(5, 7) + "-" + ds.substring(8, 11) + "-" + ds.substring(12, 16);
            feed.description = "Actualizado " + date;
            feed.subtitle = articleSyndication.querySelector("channel > description").textContent;

            feed.itemsName = "item";
        }
        feed.pubDate = date;
        feed.backgroundImage = feed.logoUrl;*/
    }

    function getItemsFromXml(articleSyndication, feed) {
        var sss = articleSyndication.querySelectorAll("status");
        // Process each blog post.
        for (var index = 0; index < sss.length; index++) {
            var post = sss[index];
            // Get the title, author, and date published.
            var text = post.querySelector("text").textContent;
            
            //var imgInContent = /(<|\&lt\;)(img|IMG) [^>]*(src|SRC)="([^"]*)"[^>]*\/(>|\&gt\;)/.exec(post.querySelector(contentTag).textContent);

            // Avoid duplication if the user refreshes the data
            if (resolveItemReference([feed.key, text]) == undefined) {
                
                var postAuthorName = post.querySelector("user > name").textContent;

                var pds = post.querySelector("created_at").textContent;

                var postDate = pds.substring(5, 7) + "-" + pds.substring(8, 10)
                    + "-" + pds.substring(0, 4);
                
                // Store the post info we care about in the array.
                tweets.push({
                    group: feed, key: text, title: text,
                    author: postAuthorName, pubDate: postDate, link: link, postIndex: index
                });
            };

        }
    }


    function writeFile(content) {
        localFolder.createFileAsync("dataFileRS.txt", Windows.Storage.CreationCollisionOption.replaceExisting)
           .then(function (dataFile) {
               return Windows.Storage.FileIO.writeTextAsync(dataFile, content);
           });
    }

    function readFile() {
        localFolder.getFileAsync("dataFileRS.txt")
           .then(function (sampleFile) {
               return Windows.Storage.FileIO.readTextAsync(sampleFile);
           }).done(function (content) {
               var bp = JSON.parse(content);
               while (tweets.length > 0) {
                   tweets.pop();
               }

               for (var i = 1; i <= bp._lastNotifyLength; i++) {
                   var p = bp._keyMap[i];
                   tweets.push({
                       group: p.data.group, key: p.data.key, title: p.data.title,
                       author: p.data.author, pubDate: p.data.pubDate
                   });
               }
           }, function () {
           });
    }

    WinJS.Namespace.define("DataRS", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference,
        refresh: getTWStatuses
    });

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.group.key, item.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return tweets.createFiltered(function (item) { return item.group.key === group.key; });
    }

    // Get the unique group corresponding to the provided group key.
    function resolveGroupReference(key) {
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).key === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }

    // Get a unique item from the provided string array, which should contain a
    // group key and an item title.
    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);
            if (item.group.key === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }

})();
