(function () {

    WinJS.Namespace.define("FacebookWinJS", {
        Login: WinJS.Class.define(
            // constructor
            function Login(element, options) {
                this._element = element;
                this._appId = options.appId;
                if (this.isUserAuthenticated()) {
                    this.updateProfileLink();
                }
                else {
                    var a = document.createElement("a");
                    a.textContent("Login");
                    a.addEventListener("click", this._launchFacebookWebAuth.bind(this));
                    this._element.appendChild(a);
                }
            }, {
                // private members
                _element: null,
                _appId: null,
                _accessToken: null,
                _userLoggedIn: false,
                _me: null,
                _launchFacebookWebAuth: function () {
                    console.log("Launching Facebook Web Auth...");

                    var that = this;
                    this._launchLoginAsync(this._appId).then(function () {
                        if (that.isUserAuthenticated()) {
                            console.log("user is now loggedin");
                            that.updateProfileLink();
                        } else {
                            console.log("user not LoggedIn");
                        }
                    });
                },
                _launchLoginAsync: function (appId) {
                    if (appId === null || appId === "") {
                        throw "AppId cannot be null or empty";
                    }

                    var facebookURL = "https://www.facebook.com/dialog/oauth?client_id=";

                    // You should get this AppId creating an app in facebook. For more details check https://developers.facebook.com/docs/guides/mobile/web/#register
                    var clientID = appId;

                    // Being a Windows Store App, we don't have a domain and we need to handle callbacks as Desktop apps do, to get the auth token.
                    var callbackURL = "https://www.facebook.com/connect/login_success.html";

                    facebookURL += clientID + "&redirect_uri=" + encodeURIComponent(callbackURL) + "&scope=read_stream&display=popup&response_type=token";

                    if (this.authzInProgress) {
                        console.log("Authorization already in Progress ...");
                        return;
                    }

                    var startURI = new Windows.Foundation.Uri(facebookURL);
                    var endURI = new Windows.Foundation.Uri(callbackURL);

                    var that = this;

                    return Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAsync(
                        Windows.Security.Authentication.Web.WebAuthenticationOptions.none, startURI, endURI)
                        .then(function (result) {

                            var facebookReturnedToken = result.responseData;
                            console.log("Status returned by WebAuth broker: " + result.responseStatus);

                            if (result.responseStatus === Windows.Security.Authentication.Web.WebAuthenticationStatus.errorHttp) {
                                console.log("Error returned: " + result.responseErrorDetail);
                            }
                            else {
                                // connection was successful.
                                var accessTokenRes = /access_token=([^&]*)&/.exec(facebookReturnedToken);
                                if (accessTokenRes != null) {
                                    that.accessToken = accessTokenRes[1];
                                }
                                else
                                    that.accessToken = null;
                            }
                        }, function (err) {
                            console.log("Error returned by WebAuth broker: " + err);
                            console.log("Error Message: " + err.message);
                        });
                },

                // public members
                updateProfileLink: function () {
                    var that = this;
                    WinJS.xhr({ url: "https://graph.facebook.com/me/?access_token=" + this.accessToken }).then(function (response) {
                        that.me = JSON.parse(response.responseText);
                        that._element.textContent = "Hola " + that.me.first_name + "!";
                    });
                },
                isUserAuthenticated: function () {
                    // TODO: verify that accessToken is still valid. Check https://developers.facebook.com/blog/post/2011/05/13/how-to--handle-expired-access-tokens/
                    return this.accessToken != null;
                },
                me: {
                    get: function () { return this._me; },
                    set: function (me) { this._me = me }
                },
                accessToken: {
                    get: function () {
                        var roamingSettings = Windows.Storage.ApplicationData.current.roamingSettings;
                        this._accessToken = roamingSettings.values["accessToken"];
                        return this._accessToken;
                    },
                    set: function (accessToken) {
                        this._accessToken = accessToken;
                        var roamingSettings = Windows.Storage.ApplicationData.current.roamingSettings;
                        roamingSettings.values["accessToken"] = this._accessToken;
                    }
                },

            }, {
                // staticMembers
            })
    });

})();