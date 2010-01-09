// Copyright (C) 2008,2009 BRAT Tech LLC

ControlBar = function (document, serverUrl) {
  this.document = document;
  this.serverUrl = serverUrl;
  this.window = window;
  this.callbacks = [];
};

ControlBar.prototype.bind = function () {
};

ControlBar.HTML =
  '<div>' +
    '<div class="ui-widget-overlay"></div>' +
    '<div id="ng-login" ng-non-bindable="true">' +
      '<div class="ng-login-container"></div>' +
    '</div>' +
  '</div>';

ControlBar.prototype.login = function (loginSubmitFn) {
  this.callbacks.push(loginSubmitFn);
  if (this.callbacks.length == 1) {
    this.doTemplate("/user_session/new.mini?return_url=" + encodeURIComponent(this.urlWithoutAnchor()));
  }
};

ControlBar.prototype.logout = function (loginSubmitFn) {
  this.callbacks.push(loginSubmitFn);
  if (this.callbacks.length == 1) {
    this.doTemplate("/user_session/do_destroy.mini");
  }
};

ControlBar.prototype.urlWithoutAnchor = function (path) {
  return this.window.location.href.split("#")[0];
};

ControlBar.prototype.doTemplate = function (path) {
  var self = this;
  var id = new Date().getTime();
  var url = this.urlWithoutAnchor();
  url += "#$iframe_notify=" + id;
  var iframeHeight = 330;
  var loginView = jQuery('<div style="overflow:hidden; padding:2px 0 0 0;"><iframe name="'+ url +'" src="'+this.serverUrl + path + '" width="500" height="'+ iframeHeight +'"/></div>');
  this.document.append(loginView);
  loginView.dialog({
    height:iframeHeight + 33, width:500,
    resizable: false, modal:true,
    title: 'Authentication: <a href="http://www.getangular.com"><tt>&lt;angular/&gt;</tt></a>'
  });
  callbacks["_iframe_notify_" + id] = function() {
    loginView.dialog("destroy");
    loginView.remove();
    jQuery.each(self.callbacks, function(i, callback){
      callback();
    });
    self.callbacks = [];
  };
};

ControlBar.FORBIDEN =
  '<div ng-non-bindable="true" title="Permission Error:">' +
    'Sorry, you do not have permission for this!'+
  '</div>';

ControlBar.prototype.notAuthorized = function () {
  if (this.forbidenView) return;
  this.forbidenView = jQuery(ControlBar.FORBIDEN);
  this.forbidenView.dialog({bgiframe:true, height:70, modal:true});
};
