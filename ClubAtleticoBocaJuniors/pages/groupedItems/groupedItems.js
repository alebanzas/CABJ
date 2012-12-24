(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;

    function multisizeItemTemplateRenderer(itemPromise) {
        return itemPromise.then(function (currentItem) {
            var content;
            // Grab the default item template used on the groupeditems page.
            content = document.getElementsByClassName("multisizebaseitemtemplate")[0];
            var result = content.cloneNode(true);

            result.className = "mediumitemtemplate";
	        
            // Because we used a WinJS template, we need to strip off some attributes 
            // for it to render.
            result.attributes.removeNamedItem("data-win-control");
            result.attributes.removeNamedItem("style");
            result.style.overflow = "hidden";

            // Because we're doing the rendering, we need to put the data into the item.
            // We can't use databinding.
            result.getElementsByClassName("item-image")[0].src = currentItem.data.backgroundImage;
            result.getElementsByClassName("item-title")[0].textContent = currentItem.data.title;
            result.getElementsByClassName("item-subtitle")[0].textContent = currentItem.data.pubDate;
            return result;
        });
    }

    function groupInfo() {
        return {
            enableCellSpanning: true,
            cellWidth: 150,
            cellHeight: 150
        };
    }

    ui.Pages.define("/pages/groupedItems/groupedItems.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            Data.refresh();

            var listView = element.querySelector(".groupeditemslist").winControl;
            var itemTemplate = element.querySelector(".itemtemplate");

            this.bindControls(listView, element, options);

            this._initializeLayout(listView, appView.value, itemTemplate);

            listView.element.focus();
        },

        bindControls: function (listView, element, options) {

            listView.groupHeaderTemplate = element.querySelector(".headertemplate");
            listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.oniteminvoked = this._itemInvoked.bind(this);
        },

        groupInvoked: function (args) {
            var group = Data.groups.getAt(args.detail.itemIndex);
            nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: group.key });
        },


        // This function provides the Elements to be animated by PageControlNavigator on Navigation.
        getAnimationElements: function () {
            return [[this.element.querySelector("header")], [this.element.querySelector("section")]];
        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            var listView = element.querySelector(".groupeditemslist").winControl;

            var itemTemplate = element.querySelector(".itemtemplate");

            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    };

                    listView.addEventListener("contentanimating", handler, false);
                    this._initializeLayout(listView, viewState, itemTemplate);
                }

            }
        },

        // This function updates the ListView with new layouts
        _initializeLayout: function (listView, viewState, itemTemplate) {
            /// <param name="listView" value="WinJS.UI.ListView.prototype" />

            if (viewState === appViewState.snapped) {
                listView.itemDataSource = Data.groups.dataSource;
                listView.groupDataSource = null;
                listView.itemTemplate = itemTemplate;

                listView.layout = new ui.ListLayout();
            } else {
                listView.itemDataSource = Data.items.dataSource;
                listView.groupDataSource = Data.groups.dataSource;
                listView.itemTemplate = multisizeItemTemplateRenderer;
                listView.layout = new ui.GridLayout({ groupInfo: groupInfo, groupHeaderPosition: "top" });
            }
        },

        _itemInvoked: function (args) {
            if (appView.value === appViewState.snapped) {
                // If the page is snapped, the user invoked a group.
                var group = Data.groups.getAt(args.detail.itemIndex);
                this.navigateToGroup(group.key);
            } else {
                // If the page is not snapped, the user invoked an item.
                var item = Data.items.getAt(args.detail.itemIndex);
                nav.navigate("/pages/itemDetail/itemDetail.html", { item: Data.getItemReference(item) });
            }
        }
    });
})();
