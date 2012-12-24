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
            
            if (item.group.scrapOficialWebItem) {
                $.get(item.link, function (responseText) {
                    var rr = window.toStaticHTML(responseText);

                    element.querySelector(".titlearea .pagetitle").textContent = item.group.title;
                    element.querySelector("article .item-title").textContent = item.title;
                    element.querySelector("article .item-subtitle").textContent = item.pubDate;
                    element.querySelector("article .item-link").attributes.href.value = item.link;
                    var noticiaId = $("body", rr).attr('idNoticia');
                    var noticia = $(".noticia", rr);
                    $("img", noticia).each(function(postIndex) {
                        var src = $(this).attr("src");
                        if (src) {
                            $(this).attr("src", "http://www.bocajuniors.com.ar/" + src);
                        } else {
                            $(this).remove();
                        }
                    });
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
                    
                    element.querySelector("article .item-content").innerHTML = noticia.html();
                    element.querySelector(".content").focus();
                });
            } else {
                element.querySelector(".titlearea .pagetitle").textContent = item.group.title;
                element.querySelector("article .item-title").textContent = item.title;
                element.querySelector("article .item-subtitle").textContent = item.pubDate;
                element.querySelector("article .item-link").attributes.href.value = item.link;
                element.querySelector("article .item-content").innerHTML = item.content;
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
