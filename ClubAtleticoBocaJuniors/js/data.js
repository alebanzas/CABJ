(function () {
    "use strict";

    var feeds = [
        { key: "group1", url: 'http://www.bocajuniors.com.ar/noticias', redererFunc: scrapOficialWeb, logoUrl: 'http://boca-imagenes.planisys.net/img/es-ar/logo-boca_juniors_v2.png' },
        { key: "group1", url: 'http://www.bocajuniors.com.ar/es-ar/noticias/p/8', redererFunc: scrapOficialWeb, logoUrl: 'http://boca-imagenes.planisys.net/img/es-ar/logo-boca_juniors_v2.png' },
        //{ key: "group2", url: 'http://www.ole.com.ar/rss/boca-juniors/', logoUrl: 'http://boca-imagenes.planisys.net/img/es-ar/logo-boca_juniors_v2.png' },
    ];

    var loaded = false;

    var blogPosts = new WinJS.Binding.List();
    var groupedItems = blogPosts.createGrouped(
        function groupKeySelector(item) { return item.group.key; },
        function groupDataSelector(item) { return item.group; }
    );

    var localFolder = Windows.Storage.ApplicationData.current.localFolder;

    function scrapOficialWeb(responseText, feed) {
        var rr = window.toStaticHTML(responseText);
        
        var html = $("ul.listado li", $(rr)).each(function (postIndex) {
            var item = $(this);
            var postTitle = $(".info strong", item).text();
            var postAuthor = "CABJ Oficial";
            var postDate = $(".fecha", item).text();
            var imageUrl = "http://www.bocajuniors.com.ar/" + $(".img img", item).attr("src");
            var link = "http://www.bocajuniors.com.ar/" + $("a", item).attr("href");
            var staticContent = $(".info", item).html();
            
            //        <li>
            //            <a href="/es-ar/noticias/2012/12/15/triunfo-ante-obras">
            //                <span class="img">
            //                    <img src="/img/common/noticias-imagen_por_defecto-md.jpg" alt="triunfo-ante-obras">
            //                    <br>
            //                </span>
            //                <span class="info">
            //                    <div class="cont_titulo_fecha clearfix">
            //                    <span class="fecha">Dec 15, 2012</span>
            //                    <strong>Triunfo ante Obras</strong><br>
            //                </div>
            //                El equipo de básquet derrotó el jueves a Obras por 93-73, de visitante, por la 12ª fecha de la segunda fase de la Liga Nacional. Volverán a jugar el...
            //                </span>
            //            </a>
            //        </li>


            blogPosts.push({
                group: feed, key: postTitle, title: postTitle,
                author: postAuthor, pubDate: postDate, backgroundImage: imageUrl.replace("-md.jpg", "-lg.jpg"), backgroundImageLow: imageUrl,
                content: staticContent, link: link, postIndex: postIndex
            });
        });

        var date = $("ul.listado li:first .fecha", $(rr)).text();
        feed.title = "Boca Juniors - Sitio Oficial";
        feed.description = "Por CABJ Oficial actualizado " + date;
        feed.subtitle = "";
        feed.scrapOficialWebItem = true;
        feed.itemsName = "entry";
    }

    function getFeeds() {
        var dataPromises = [];

        // Get the content for each feed and get items from xml.
        feeds.forEach(function (feed) {
            // We bind the data promise to the feed, to update the feed later with its response
            feed.dataPromise = WinJS.xhr({ url: feed.url });
            dataPromises.push(feed.dataPromise);
        });

        return WinJS.Promise.join(dataPromises).then(function() { return feeds; }); // We return the feeds instead of the promise, for signature consistency
    };

    function isInternetAvailable() {
        var internetProfile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
        return internetProfile != null && internetProfile.getNetworkConnectivityLevel() == Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess;
    }

    function getBlogPosts() {
        if (isInternetAvailable()) {
            var pr = document.createElement("progress");
            var header = document.querySelector("header h1");
            header.appendChild(pr);

            if (loaded) {
                var progress = document.getElementsByTagName('progress');
                progress[0].style.display = "none";
                return;
            }

            return getFeeds()
                .then(function (feeds) {
                    feeds.forEach(function (feed) {
                        feed.dataPromise.then(function (articlesResponse) {
                            
                            if (feed.redererFunc) {
                                var responseText = articlesResponse.responseText;
                                feed.redererFunc(responseText, feed);
                            } else {
                                var articleSyndication = articlesResponse.responseXML;

                                if (articleSyndication == null) {
                                    var parser = new DOMParser();
                                    articleSyndication = parser.parseFromString(articlesResponse.responseText, "application/xml");
                                }

                                getGroupInfoFromXml(articleSyndication, feed);
                                getItemsFromXml(articleSyndication, feed);
                            }
                        });
                    });
                    loaded = true;
                    writeFile(JSON.stringify(blogPosts));
                })
                .then(function (feeds) {
                    header.removeChild(pr);
                    return feeds;
                });
        } else {
            readFile();
            showConnectionError();
        }
    };

    function showConnectionError() {
        var popup = Windows.UI.Popups.MessageDialog("Ha habido un error intentando acceder a los nuevos datos o no hay conexiones de red disponibles.\nPor favor asegúrese de contar con acceso de red y vuelva a abrir la aplicación.", "Sin conexión");
        popup.showAsync();
    }

    function getGroupInfoFromXml(articleSyndication, feed) {
        // Get the blog title and last updated date.
        if (articleSyndication.querySelector("feed") != null) {
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
            var currentTime = new Date();
            var month = currentTime.getMonth() + 1;
            var day = currentTime.getDate();
            var year = currentTime.getFullYear();
            var ds = month + "/" + day + "/" + year;
            if (articleSyndication.querySelector("channel > pubDate") != null)
                ds = articleSyndication.querySelector("channel > pubDate").textContent;
            if (articleSyndication.querySelector("channel > lastBuildDate") != null)
                ds = articleSyndication.querySelector("channel > lastBuildDate").textContent;
            var date = ds.substring(5, 7) + "-" + ds.substring(8, 11) + "-" + ds.substring(12, 16);
            feed.description = "Actualizado " + date;
            feed.subtitle = articleSyndication.querySelector("channel > description").textContent;

            feed.itemsName = "item";
        }
        feed.pubDate = date;
        feed.backgroundImage = feed.logoUrl;
    }

    function getItemsFromXml(articleSyndication, feed) {
        var posts = articleSyndication.querySelectorAll(feed.itemsName);
        // Process each blog post.
        for (var postIndex = 0; postIndex < posts.length; postIndex++) {
            var post = posts[postIndex];
            // Get the title, author, and date published.
            var postTitle = post.querySelector("title").textContent;
            var link = post.querySelector("link").textContent;
            if (link == null || link == "") {
                link = post.querySelector("link").attributes.href.value;
            }
            var contentTag = null;
            var contentTagsUsed = ["encoded", "description", "content"];
            contentTagsUsed.forEach(function (t) {
                if (post.querySelector(t) != null && contentTag == null)
                    contentTag = t;
            });
            var imgInContent = /<img [^>]*src="([^"]*)"[^>]*\/>/.exec(post.querySelector(contentTag).textContent);

            // Avoid duplication if the user refreshes the data
            if (resolveItemReference([feed.key, postTitle]) == undefined) {
	            var postAuthor;
	            var pds;
	            var postDate;
	            var imageUrl;
	            var staticContent;
	            if (feed.itemsName == "entry") {
		            postAuthor = post.querySelector("author > name").textContent;
		            if (post.querySelector("published") != null) {
			            pds = post.querySelector("published").textContent;
		            } else if (post.querySelector("updated") != null) {
			            pds = post.querySelector("updated").textContent;
		            }
		            postDate = pds.substring(5, 7) + "-" + pds.substring(8, 10)
			            + "-" + pds.substring(0, 4);
		            if (post.querySelector("thumbnail") != null)
                        imageUrl = post.querySelector("thumbnail").attributes.url.value;
                    else if (post.querySelector("img") != null)
                        imageUrl = post.querySelector("img").attributes.src.value;
                    else if (imgInContent != null)
                        imageUrl = imgInContent[1];
                    else
                        imageUrl = feed.logoUrl;

                    // Process the content so that it displays nicely.
		            staticContent = toStaticHTML(post.querySelector(
			            contentTag).textContent);
	            } else if (feed.itemsName == "item") {
		            postAuthor = feed.title;
		            pds = post.querySelector("pubDate").textContent;
		            postDate = pds.substring(5, 7) + "-" + pds.substring(8, 11) + "-" + pds.substring(12, 16);
		            if (post.querySelector("enclosure") != null)
                        imageUrl = post.querySelector("enclosure").attributes.url.value;
                    else if (post.querySelector("img") != null)
                        imageUrl = post.querySelector("img").attributes.src.value;
                    else if (imgInContent != null)
                        imageUrl = imgInContent[1];
                    else
                        imageUrl = feed.logoUrl;

                    // Process the content so that it displays nicely.
		            staticContent = toStaticHTML(post.querySelector(
			            contentTag).textContent);
	            }

                // Store the post info we care about in the array.
                blogPosts.push({
                    group: feed, key: postTitle, title: postTitle,
                    author: postAuthor, pubDate: postDate, backgroundImage: imageUrl,
                    content: staticContent, link: link, postIndex: postIndex
                });
            };

        }
    }


    function writeFile(content) {
        localFolder.createFileAsync("dataFile.txt", Windows.Storage.CreationCollisionOption.replaceExisting)
           .then(function (dataFile) {
               return Windows.Storage.FileIO.writeTextAsync(dataFile, content);
           });
    }

    function readFile() {
        localFolder.getFileAsync("dataFile.txt")
           .then(function (sampleFile) {
               return Windows.Storage.FileIO.readTextAsync(sampleFile);
           }).done(function (content) {
               var bp = JSON.parse(content);
               while (blogPosts.length > 0) {
                   blogPosts.pop();
               }

               for (var i = 1; i <= bp._lastNotifyLength; i++) {
                   var p = bp._keyMap[i];
                   blogPosts.push({
                       group: p.data.group, key: p.data.key, title: p.data.title,
                       author: p.data.author, pubDate: p.data.pubDate, backgroundImage: p.data.backgroundImage,
                       content: p.data.content
                   });
               }
           }, function () {
           });
    }

    WinJS.Namespace.define("Data", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference,
        refresh: getBlogPosts
    });

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.group.key, item.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return blogPosts.createFiltered(function (item) { return item.group.key === group.key; });
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
