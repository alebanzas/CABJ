(function () {
    "use strict";

    var storage = Windows.Storage;
    var dtm = Windows.ApplicationModel.DataTransfer.DataTransferManager;
    var item;

    WinJS.UI.Pages.define("/pages/itemDetail/itemDetail.html", {


        // This function provides the Elements to be animated by PageControlNavigator on Navigation.
        getAnimationElements: function () {
            return [[this.element.querySelector("article")]];
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            item = options && options.item ? Data.resolveItemReference(options.item) : Data.items.getAt(0);
            var itemContent = element.querySelector("article .item-content");
            if (item.group.scrapOficialWebItem) {

                var showError = function () {
                    var popup = Windows.UI.Popups.MessageDialog("Ocurrió un error al intentar obtener la noticia. Intentelo nuevamente más tarde.", "Ups.");
                    popup.showAsync().done();
                };
                if (!Data.isInternetAvailable()) {
                    Data.showConnectionError();
                    itemContent.innerHTML = "<p></p>";
                    Data.loaded = false;
                    return;
                }

                $.get(item.link, function (responseText) {
                    var rr = window.toStaticHTML(responseText);

                    try {
                        element.querySelector(".titlearea .pagetitle").textContent = item.group.title;
                        element.querySelector("article .item-title").textContent = item.title;
                        element.querySelector("article .item-subtitle").textContent = item.pubDate;
                        element.querySelector("article .item-link").attributes.href.value = item.link;

                        var noticiaId = $("body", rr).attr('idNoticia');
                        var noticia = $(".noticia", rr);
                        $(".sponsor_noticias", noticia).remove();
                        $(".cont_ads", noticia).remove();
                        $("#autorfecha", noticia).remove();
                        $("#jquery_jplayer", noticia).remove();
                        $("#player_container", noticia).remove();
                        $("h1:first", noticia).remove();
                        $(".banner_registro", noticia).remove();
                        $('*[style]', noticia).attr('style', '');
                    
                        /*if ($('div.galeria_de_fotos', noticia).length > 0) {
                            $.post('http://www.bocajuniors.com.ar/noticias/getjsongaleria', { id: noticiaId },
                                    function (data) {
                                        if (data) {
                                        
                                        }
                                    }
                                , 'json');
                        }*/
                    
                        itemContent.innerHTML = noticia.html();
                        
                        $("img", itemContent).each(function (postIndex) {
                            var src = $(this).attr("src");
                            if (src) {
                                $(this).attr("src", "http://www.bocajuniors.com.ar/" + src);
                                $(this).error(function () {
                                    $(this).attr("src", "http://www.bocajuniors.com.ar/" + src.replace("_0-lo.jpg", "_1-lo.jpg"));
                                    $(this).error(function () {
                                        $(this).attr("src", "http://www.bocajuniors.com.ar/img/es-ar/logo-boca_juniors_v2.png");
                                    });
                                });
                            } else {
                                $(this).remove();
                            }
                        });

                        element.querySelector(".content").focus();
                    } catch (e) {
                        showError();
                    }
                });
            } else {
                element.querySelector(".titlearea .pagetitle").textContent = item.group.title;
                element.querySelector("article .item-title").textContent = item.title;
                element.querySelector("article .item-subtitle").textContent = item.pubDate;
                element.querySelector("article .item-link").attributes.href.value = item.link;
                itemContent.innerHTML = item.content;
                element.querySelector(".content").focus();
            }
            //element.querySelector("article .item-content").innerHTML = item.content;

            dtm.getForCurrentView().addEventListener("datarequested", this.onDataRequested);
        },

        onDataRequested: function (e) {
            var request = e.request;
            request.data.properties.title = item.title;
            request.data.properties.description = "Por " + item.author;

            // We are sharing the full content... keeping the original link and sharing it may be a better idea..
            var formatted = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(item.content);
            request.data.setHtmlFormat(formatted);
        },

        unload: function () {
            WinJS.Navigation.removeEventListener("datarequested", this.onDataRequested);
        }
    });
})();
