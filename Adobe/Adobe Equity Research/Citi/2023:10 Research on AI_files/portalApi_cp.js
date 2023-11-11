/**
 * portalApi_cp in cv2 outer frame
 */
var PORTAL = window.PORTAL || {};
PORTAL.UI = PORTAL.UI || {};
PORTAL.bodyfunc = () => {
  const enableFrameless = window.PORTAL
    && window.PORTAL.UI
    && window.PORTAL.UI.SETTINGS
    && window.PORTAL.UI.SETTINGS.enableFrameless;
  if (enableFrameless) {
    return window.CURRENT_BODY || document.body;
  }
  return document.body || {};
};

/**
 * inject pendo js script
 */
try {
  if (parent.PORTAL
    && parent.PORTAL.UI
    && parent.PORTAL.UI.SETTINGS
    && parent.PORTAL.UI.SETTINGS.env
    && parent.PORTAL.UI.SETTINGS.env.indexOf('PROD') === -1) {
    var userId = window.parent.cv && window.parent.cv.medallia && window.parent.cv.medallia.userId || '';
    (function (apiKey) {
      (function (p, e, n, d, o) {
        var v, w, x, y, z; o = p[d] = p[d] || {}; o._q = o._q || [];
        v = ['initialize', 'identify', 'updateOptions', 'pageLoad', 'track']; for (w = 0, x = v.length; w < x; ++w)(function (m) {
          o[m] = o[m] || function () { o._q[m === v[0] ? 'unshift' : 'push']([m].concat([].slice.call(arguments, 0))); };
        })(v[w]);
        y = e.createElement(n); y.async = !0; y.src = 'https://cdn.pendo.io/agent/static/' + apiKey + '/pendo.js';
        z = e.getElementsByTagName(n)[0]; z.parentNode.insertBefore(y, z);
      })(window, document, 'script', 'pendo');

      // This function creates anonymous visitor IDs in Pendo unless you change the visitor id field to use your app's values
      // This function uses the placeholder 'ACCOUNT-UNIQUE-ID' value for account ID unless you change the account id field to use your app's values
      // Call this function after users are authenticated in your app and your visitor and account id values are available
      // Please use Strings, Numbers, or Bools for value types.
      pendo.initialize({
        visitor: {
          id: userId   // Required if user is logged in, default creates anonymous ID
          // email:        // Recommended if using Pendo Feedback, or NPS Email
          // full_name:    // Recommended if using Pendo Feedback
          // role:         // Optional

          // You can add any additional visitor level key-values here,
          // as long as it's not one of the above reserved names.
        }
      });
    })('feda947a-f970-4dda-6b9d-0e4012114136');
  }
} catch (error) {
  console.log(error);
}

/**
 * script to be injected into content provider by portalApi.js
 * Updated: 2010.08.23 - Global alert box exposed to CPs
 * @requires: portalApi.js
 * */
var lastState = PORTAL.UI.CP;
if (window.__POWERED_BY_QIANKUN__) {
  lastState = PORTAL.UI.CP
    && (PORTAL.UI.CP.name === window.CURRENT_NAME)
    && lastState;
}
PORTAL.UI.CP = lastState || {
  parentRef: null,
  currentHeight: null,
  status: null,
  name: window.CURRENT_NAME,
  /*0 - error, 1 - initialized*/
  resizeToMax: false,
  ruler: null,
  execQueue: [],
  useMaxHeightSizeAsFallback: true, //if height cannot be determined, or is smaller than available height, use available height - ICG only
  /**
   * Timer object is used to do a smart check on the content document body height.
   * Height is checked first every second, then 3 seconds, 10 seconds, 0.5 minute and finally every 1 minute.
   * This solution is implemented as a substitution for "onresize" event listener*/
  timer: {
    interval: 1000,
    execCounter: 0,
    timerRef: null,
    doCheck: function () {
      try {
        var parentCP = PORTAL.UI.CP;
        var that = PORTAL.UI.CP.timer;
        that.execCounter++;
        if (Math.abs(parentCP.currentHeight - parentCP.getContentHeight()) > 1) {
          //height changed
          parentCP.autoAdjust();
          that.reset();
        } else {
          if (that.execCounter > 120)
            that.reset(10000); //window.clearInterval(that.timerRef);
          else if (that.execCounter == 20) {
            that.reset(2000);
          } else if (that.execCounter == 40)
            that.reset(3000);
          else if (that.execCounter == 80)
            that.reset(5000);
        }
      } catch (e) { }
    },
    reset: function (x) {
      try {
        var menuNode = parent.window.prtl.navigation.getCurrentMenuNode() || {};
        var userAgent = parent.window.prtl.userAgent || {};
        if (menuNode.fluidHeightOuterFrame && !(userAgent.IPHONE || userAgent.IPAD)) {
          return;
        }
        var that = PORTAL.UI.CP.timer;
        window.clearInterval(PORTAL.UI.CP.timer.timerRef);
        if (!x || typeof x != "number") {
          that.interval = 1000;
          that.execCounter = 0;
        } else {
          that.interval = x;
        }
        that.timerRef = window.setInterval(PORTAL.UI.CP.timer.doCheck, PORTAL.UI.CP.timer.interval);
      } catch (e) { }
    },
    start: function () {
      var menuNode = parent.window.prtl.navigation.getCurrentMenuNode() || {};
      if (menuNode.fluidHeightOuterFrame) {
        parent.PORTAL.UI.Controller.fluidHeightOuterFrame && parent.PORTAL.UI.Controller.fluidHeightOuterFrame();
        var userAgent = parent.window.prtl.userAgent || {};
        if (!(userAgent.IPHONE || userAgent.IPAD)) {
          return;
        }
      }
      var that = PORTAL.UI.CP.timer;
      if (that.timerRef === null) {
        that.timerRef = window.setInterval(PORTAL.UI.CP.timer.doCheck, PORTAL.UI.CP.timer.interval);
      } else {
        that.reset();
      }
    },
    stop: function () {
      var that = PORTAL.UI.CP.timer;
      if (that.timerRef !== null) {
        window.clearInterval(PORTAL.UI.CP.timer.timerRef);
        that.timerRef = null;
      }
    }
  },
  startTimedResize: function () {
    /*if(!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.timer.start)){
      return false;
    }*/
    if (!PORTAL.UI.CP.resizeToMax)
      this.timer.start();
  },
  stopTimedResize: function () {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.timer.stop)) {
      return false;
    }
    this.timer.stop();
  },
  _initialize: function () {
    try {
      var that = PORTAL.UI.CP;
      if (that.status != 1) {
        try {
          that.parentRef = parent.PORTAL.UI.Controller;
        } catch (e) { }
        if (that.parentRef !== null) {
          try {
            if (typeof that.parentRef.needScrollToTop == "undefined" || that.parentRef.needScrollToTop) {
              that.parentRef.scrollTo(0, 0);
            }
          } catch (e) { }
          //create a div that is going to be used for measuring content height
          that.ruler = document.createElement("div");
          that.ruler.id = "PORTAL_ruler";
          that.ruler.style.clear = "both";
          that.ruler.style.height = "1px";
          var menuNode = parent.window.prtl.navigation.getCurrentMenuNode() || {};
          if (menuNode.fluidHeightOuterFrame) {
            that.ruler.style.display = "none";
          }
          PORTAL.bodyfunc().appendChild(that.ruler);
          that.status = 1;
          //add window resize listener on content provider window
          if (!that.resizeToMax) {
            that.autoAdjust();
            that.startTimedResize();
            try {
              that.parentRef.addWindowResizeListener({
                window: window,
                funcRef: PORTAL.UI.CP.timer.reset,
                namespace: "cpAutoAdjust"
              });
            } catch (e) { }
          } else {
            that.resizeToMaxAvailableHeight();
          }
          that._addUnload();

          //if there are any methods in the queue, execute them
          var task;
          while (task = that.execQueue.shift()) {
            task();
          }

          //Execute functions which are added in queue before Portal API is loaded
          that.executeQueue();
        }
        //no parent reference found, do nothing
      }
    } catch (e) { }
  },
  _addUnload: function () {
    try {
      /*attempt to add unload event listener to the iframe*/
      try {
        window.onbeforeunload = function () {
          try {
            PORTAL.UI.CP.parentRef.triggerUnload();
          } catch (e) { }
        };
      } catch (e) { }
      this.parentRef.addEvent(this.parentRef.iframeContainerRef, 'customUnload', function () {
        try {
          var that = PORTAL.UI.CP;
          that.parentRef.removeEvent(that.parentRef.iframeContainerRef, "customUnload");
          ///remove resize event listener that might've been evoked by this page/
          if (that.resizeToMax) {
            that.resizeToMax = false;
            PORTAL.UI.CP.parentRef.removeWindowResizeListener({
              namespace: "cpResizeToMaxHeight"
            });
          } else {
            PORTAL.UI.CP.parentRef.removeWindowResizeListener({
              window: window,
              namespace: "cpAutoAdjust"
            });
          }
        } catch (e) {
          PORTAL.UI.ErrorLog.error(e, "Error executing customUnload");
        }
        try {
          PORTAL.UI.CP.parentRef.injectScript();
        } catch (e) {
          PORTAL.UI.ErrorLog.error(e, "Error executing injectScript");
        }
      });
    } catch (e) { }
  },
  getContentHeight: function () {
    var isUsingActualPageHeight = parent.PORTAL.UI.SETTINGS.GLOBALSETTINGS && parent.PORTAL.UI.SETTINGS.GLOBALSETTINGS.ENABLE_ACTUAL_PAGE_HEIGHT || false;
    var that = PORTAL.UI.CP;
    if (isUsingActualPageHeight) {
      return that.getActualContentHeight();
    }
    return that.getMaxContentHeight();
  },
  getMaxContentHeight: function () {
    var that = PORTAL.UI.CP;
    var fallbackHeight = that.parentRef.getAvailableHeight();
    /*adding scrollHeight check at the last minute*/
    var scrH;
    try {
      var d = document;
      scrH = Math.max(
        Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
        Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
        Math.max(d.body.clientHeight, d.documentElement.clientHeight)
      );
      // scrH = PORTAL.bodyfunc().scrollHeight;
    } catch (e) {
      scrH = 0;
    }
    if (typeof that.useMaxHeightSizeAsFallback == "undefined" || !that.useMaxHeightSizeAsFallback) {
      fallbackHeight = 500;
    }
    try {
      PORTAL.bodyfunc().appendChild(PORTAL.UI.CP.ruler);
    } catch (e) {
      return fallbackHeight;
    }
    if (that.ruler.offsetTop !== null && that.ruler.offsetTop > 0) {
      if (typeof that.useMaxHeightSizeAsFallback == "undefined" || !that.useMaxHeightSizeAsFallback) {
        if (that.ruler.offsetTop < 600) {
          try {
            //              if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
            //              {
            //                // chrome's scroll height doesn't shrink
            //                return Math.max(PORTAL.bodyfunc().clientHeight, fallbackHeight, that.ruler.offsetTop+1);
            //              }
            //              else
            //              {
            return Math.max(PORTAL.bodyfunc().clientHeight, fallbackHeight, scrH);
            //              }
          } catch (e) {
            return fallbackHeight;
          }
        } else {
          //            if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
          //            {
          //              // chrome's scroll height doesn't shrink
          //              return Math.max(that.ruler.offsetTop+1, PORTAL.bodyfunc().clientHeight);
          //            }
          //            else
          //            {
          return Math.max(that.ruler.offsetTop + 1, scrH);
          //            }
        }
      }
      /*in case of ICG*/
      return Math.max(that.ruler.offsetTop + 1, fallbackHeight, scrH);
    } else {
      return Math.max(scrH, fallbackHeight);
    }
  },
  getActualContentHeight: function () {
    var that = PORTAL.UI.CP;
    var availableHeight = parent.PORTAL.UI.Controller.getMainFrameMaxHeight();
    /*adding scrollHeight check at the last minute*/
    var scrH;
    try {
      var d = document;
      scrH = Math.max(d.body.offsetHeight, d.documentElement.scrollHeight);
    } catch (e) {
      scrH = 0;
    }

    try {
      PORTAL.bodyfunc().appendChild(PORTAL.UI.CP.ruler);
    } catch (e) {
      return scrH;
    }

    if (that.ruler.offsetTop !== null && that.ruler.offsetTop > 0) {
      /*in case of ICG*/
      return Math.max(that.ruler.offsetTop + 1, availableHeight, scrH);
    } else {
      return Math.max(availableHeight, scrH);
    }
  },
  collapseTopHeader: function () {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.collapseTopHeader, arguments)) {
      return false;
    }
    try {
      PORTAL.UI.CP.parentRef.collapseTopHeader.apply(this, arguments);
    } catch (e) { }
  },
  enableMainFrameScrolling: function () {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.enableMainFrameScrolling, arguments)) {
      return false;
    }
    try {
      PORTAL.UI.CP.parentRef.enableMainFrameScrolling.apply(PORTAL.UI.CP.parentRef, arguments);
    } catch (e) { }
  },
  resizeFrame: function (w, h) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.resizeFrame, [w, h])) {
      return false;
    }
    if(document.URL !== PORTAL.UI.CP.parentRef.getCurrentFrameUrl()){
      return false
    }
    return PORTAL.UI.CP.parentRef.resizeFrame(w, h);
  },
  resizeFrameHeight: function (h) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.resizeFrameHeight, h)) {
      return false;
    }
    return PORTAL.UI.CP.parentRef.resizeFrame(null, h);
  },
  autoAdjust: function () {
    try {
      var that = PORTAL.UI.CP;
      if (!PORTAL.UI.CP.resizeToMax) {
        that.currentHeight = that.getContentHeight();
        that.resizeFrame(null, that.currentHeight);
      }
    } catch (e) { }
  },
  /**
   * Stops default method of resizing - including removal of window resize listener
   * */
  stopAutoAdjust: function () {
    var that = PORTAL.UI.CP;
    if (!that._queueIfNotReady(that.stopAutoAdjust)) {
      return false;
    }
    that.parentRef.removeWindowResizeListener({
      window: window,
      namespace: "cpAutoAdjust"
    });
    that.stopTimedResize();
    return true;
  },
  resizeToMaxAvailableHeight: function () {
    var that = PORTAL.UI.CP;
    if (!that._queueIfNotReady(that.resizeToMaxAvailableHeight)) {
      return false;
    }
    //readjust on window resize
    if (!that.resizeToMax) {
      /*stop autoresize*/
      that.stopAutoAdjust();
      //remember that we're in this mode
      that.resizeToMax = true;
      /*add new listener for PARENT window resize event*/
      that.parentRef.addWindowResizeListener({
        funcRef: that.parentRef.setAvailableHeight,
        namespace: "cpResizeToMaxHeight"
      });
    }
    /*IE6 needs a pause to correctly determine heights of elements*/
    if (document.attachEvent) {
      setTimeout(that.parentRef.setAvailableHeight, 100);
    } else {
      that.parentRef.setAvailableHeight();
    }
    return true;
    //return that.parentRef.setAvailableHeight();
  },
  readjust: function () {
    if (PORTAL.UI.CP.resizeToMax) {
      PORTAL.UI.CP.resizeToMaxAvailableHeight();
    }
  },
  toggleOuterHeader: function () {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.toggleOuterHeader)) {
      return false;
    }
    return PORTAL.UI.CP.parentRef.toggleOuterHeader();
  },
  collapseOuterHeader: function () {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.collapseOuterHeader)) {
      return false;
    }
    return PORTAL.UI.CP.parentRef.collapseOuterHeader();
  },
  expandOuterHeader: function () {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.expandOuterHeader)) {
      return false;
    }
    return PORTAL.UI.CP.parentRef.expandOuterHeader();
  },
  isOuterHeaderCollapsed: function () {
    try {
      return PORTAL.UI.CP.parentRef.isOuterHeaderCollapsed();
    } catch (e) {
      return false;
    }
  },
  changeFrameContent: function (url) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.changeFrameContent, url)) {
      return false;
    }
    return PORTAL.UI.CP.parentRef.changeIframeUrl(url);
  },
  postPageLoad: function () {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.postPageLoad)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.postPageLoad();
  },
  alert: function (t, m, c) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.alert, [t, m, c])) {
      return false;
    }
    PORTAL.UI.CP.parentRef.modalAlert(t, m, c);
  },
  confirm: function (t, m, c) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.confirm, [t, m, c])) {
      return false;
    }
    PORTAL.UI.CP.parentRef.modalConfirm(t, m, c);
  },
  prompt: function (t, m, c) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.prompt, [t, m, c])) {
      return false;
    }
    PORTAL.UI.CP.parentRef.modalPrompt(t, m, c);
  },
  info: function (settings) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.info, settings)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.modalInfo(settings);
  },
  linkTo: function (s, c, pn) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.linkTo, [s, c, pn])) {
      return false;
    }
    return PORTAL.UI.CP.parentRef.linkTo(s, c, false, pn);
  },
  _queueIfNotReady: function (func, args) {
    /*if API did not initialize yet, add func to execution queue and quit*/
    if (PORTAL.UI.CP.status !== 1) {
      PORTAL.UI.CP.execQueue.push(function () {
        if (args && !(typeof args.length == 'number' && args.length > 0 && (0 in args))) {
          func.apply(this, [args]);
        } else {
          func.apply(this, args);
        }
      });
      return false;
    }
    return true;
  },
  hideLeftNav: function () {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.hideLeftNav)) {
      return false;
    }
    return PORTAL.UI.CP.parentRef.hideLeftNav();
  },
  showLeftNav: function () {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.showLeftNav)) {
      return false;
    }
    return PORTAL.UI.CP.parentRef.showLeftNav();
  },
  collapseLeftNav: function () {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.collapseLeftNav)) {
      return false;
    }
    return PORTAL.UI.CP.parentRef.collapseLeftNav();
  },
  expandLeftNav: function () {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.expandLeftNav)) {
      return false;
    }
    return PORTAL.UI.CP.parentRef.expandLeftNav();
  },
  hideBreadcrumbs: function () {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.hideBreadcrumbs)) {
      return false;
    }
    return PORTAL.UI.CP.parentRef.hideBreadcrumbs();
  },
  showBreadcrumbs: function () {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.showBreadcrumbs)) {
      return false;
    }
    return PORTAL.UI.CP.parentRef.showBreadcrumbs();
  },
  turnOffEtradingBtn: function () {
    return false;
  },
  turnOnEtradingBtn: function (url) {
    return false;
  },
  reloadTopFrame: function (fromStepup) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.reloadTopFrame, fromStepup)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.reloadTopFrame(fromStepup);
    return true;
  },
  getParentFrameHeight: function () {
    try {
      return PORTAL.UI.CP.parentRef.getPageHeight();
    } catch (e) {
      return 500; //by default.
    }
  },
  getParentFrameScrollTop: function () {
    try {
      return PORTAL.UI.CP.parentRef.getPageScrollTop();
    } catch (e) {
      return 0;
    }
  },
  getCVItemTrail: function () {
    try {
      return PORTAL.UI.CP.parentRef.menu.activeNav.getCVItemTrail().trail;
    } catch (e) {
      return "";
    }
  },
  scrollTo: function (x, y) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.scrollTo, [x, y])) {
      return false;
    }
    return PORTAL.UI.CP.parentRef.scrollTo(x, y);
  },
  getObjectFromParentByName: function (name) {
    //Can't try catch this method because the API consumer(OFDelegate)
    //does some other logic in the try catch statement.
    return PORTAL.UI.CP.parentRef.getWindowObjectByName(name);
  },
  trackLink: function (link, type, idSite, gateWayType, trackingSource, menuCode, hitType, referrerUrl, visitorId) { //idsite integer
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.trackLink, arguments)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.trackLink({
      l: link,
      t: type,
      i: idSite,
      g: gateWayType,
      ts: trackingSource,
      m: menuCode,
      h: hitType,
      r: referrerUrl,
      v: visitorId
    });
    return true;
  },
  trackEvent: function (obj) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.trackEvent, arguments)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.trackEvent(obj);
    return true;
  },
  trackPageView: function (url, title, idSite, gateWayType, trackingSource, menuCode, hitType, referrerUrl, visitorId, requestId, cpName) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.trackPageView, arguments)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.trackPageView({
      l: url,
      t: title,
      i: idSite,
      g: gateWayType,
      ts: trackingSource,
      m: menuCode,
      h: hitType,
      r: referrerUrl,
      v: visitorId,
      ri: requestId,
      cpn: cpName
    });
    return true;
  },
  trackPageViewPiwikOnly: function (url, title, idSite, gateWayType, trackingSource, menuCode, hitType, referrerUrl, visitorId, requestId, cpName) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.trackPageViewPiwikOnly, arguments)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.trackPageViewPiwikOnly({
      l: url,
      t: title,
      i: idSite,
      g: gateWayType,
      ts: trackingSource,
      m: menuCode,
      h: hitType,
      r: referrerUrl,
      v: visitorId,
      ri: requestId,
      cpn: cpName
    });
    return true;
  },
  trackPvByMenuCode: function (menuCode) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.trackPvByMenuCode, menuCode)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.trackPvByMenuCode(menuCode);
    return true;
  },
  trackContent: function (portletName, contentId, contentSourceId, asDeepLink, trackingSource, menuCode, requestId, cpName, title, platformId) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.trackContent, arguments)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.trackContent({
      p: portletName,
      ci: contentId,
      csi: contentSourceId,
      adl: asDeepLink,
      ts: trackingSource,
      mc: menuCode,
      ri: requestId,
      cpn: cpName,
      t: title,
      pl: platformId
    });
    return true;
  },
  trackSuggest: function (portletName, contentId, contentSourceId, requestId, cpName, title) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.trackSuggest, arguments)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.trackSuggest({
      p: portletName,
      ci: contentId,
      csi: contentSourceId,
      ri: requestId,
      cpn: cpName,
      t: title
    });
    return true;
  },
  trackSearchContent: function (contentId, contentSourceId, portletName, requestId, cpName) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.trackSearchContent, arguments)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.trackSearchContent({
      p: portletName,
      ci: contentId,
      csi: contentSourceId,
      ri: requestId,
      cpn: cpName
    });
    return true;
  },
  trackSearchSubmission: function (url, trackingParams, menuitemshortcut) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.trackSearchSubmission, arguments)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.trackSearchSubmission(url, trackingParams, menuitemshortcut);
    return true;
  },
  initExperiment: function (expId, expVar) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.initExperiment, arguments)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.initExperiment(expId, expVar);
    return true;
  },
  cleanExperiment: function () {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.cleanExperiment)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.cleanExperiment();
    return true;
  },
  updateShoppingCart: function () {
    parent.PORTAL.UI.Controller.updateShoppingCart();
  },
  getPreference: function (component, opt_key, opt_callback) {
    try {
      return PORTAL.UI.CP.parentRef.getPreference(component, opt_key, opt_callback);
    } catch (e) {
      return null;
    }
  },
  savePreference: function (component, preferenceList, opt_callback) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.savePreference, [component, preferenceList, opt_callback])) {
      return false;
    }
    PORTAL.UI.CP.parentRef.savePreference(component, preferenceList, opt_callback);
  },
  pageReadyForUser: function (requestId) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.pageReadyForUser, requestId)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.pageReadyForUser(requestId);
  },
  pageReadyForCP: function (obj) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.pageReadyForCP, obj)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.pageReadyForCP(obj);
  },
  openFinWindow: function (name, url, callback, opt_options) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.openFinWindow, [name, url, callback, opt_options])) {
      return false;
    }
    parent.PORTAL.UI.Openfin.openFinWindow(name, url, callback, opt_options);
  },
  toggleMiniHeader: function (opt_miniHeader) {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.toggleMiniHeader, opt_miniHeader)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.toggleMiniHeader(opt_miniHeader);
  },
  getMenuInternalStructure: function (menuCode) {
    try {
      return PORTAL.UI.CP.parentRef.menu.getMenuInternalStructure(menuCode);
    } catch (e) {
      return null;
    };
  },
  isConnectEntitled: function () {
    try {
      return PORTAL.UI.CP.parentRef.isConnectEntitled();
    } catch (e) {
      return false;
    }
  },
  isCPBAEnabled: function () {
    try {
      return PORTAL.UI.CP.parentRef.isCPBAEnabled();
    } catch (e) {
      return false;
    }
  },
  executeQueue: function () {
    PORTAL.executionQueue = PORTAL.executionQueue || [];
    try {
      for (var i in PORTAL.executionQueue) {
        if (typeof PORTAL.executionQueue[i] == 'function') {
          PORTAL.executionQueue[i]();
        }
      }
    } catch (e) {
      return false;
    }
    return true;
  },
  cleanPageCookie: function () {
    if (!PORTAL.UI.CP._queueIfNotReady(PORTAL.UI.CP.cleanPageCookie)) {
      return false;
    }
    PORTAL.UI.CP.parentRef.cleanPageCookie();
    return true;
  },
  multiTheme: {
    prefix: '',
    addBlueberryToClasses: function () {
      PORTAL.bodyfunc().classList.add('chameleon');
      PORTAL.bodyfunc().classList.add('by-scrollbar');
      PORTAL.bodyfunc().classList.add('lmn-scrollbar');
      if (!this.prefix || (this.prefix && this.prefix === 'icgds')) {
        PORTAL.bodyfunc().classList.add('icgds-cv');
      }
    },
    addThemeToClasses: function (newTheme) {
      var byThemeClass = 'by-theme-' + newTheme;
      var lmnThemeClass = 'lmn-theme-' + newTheme;
      var currentIframeId = self.frameElement && self.frameElement.getAttribute('id');
      parent.PORTAL.UI.Controller.switchTheme(newTheme, currentIframeId);
      PORTAL.bodyfunc().classList.add(byThemeClass);
      PORTAL.bodyfunc().classList.add(lmnThemeClass);
    },
    getNewTheme: function (event, currentThemeClass) {
      var data = event.data || '';
      if (data.indexOf('by-theme-') >= 0) {
        var newTheme = data.slice(9) === 'light' ? 'light' : 'dark';
        this.initBlueberryCssFile(newTheme, this.replaceThemeClass.bind(this));
      }
    },
    init: function (theme, whetherLoadStyleFile, prefix, callback) {
      var defaultTheme = null;
      if (theme) {
        defaultTheme = theme === 'light' ? 'light' : 'dark';
      }
      var isCpsPage = false;

      try {
        isCpsPage = window.COMPOSITE_PAGE_SERVICE
          && Object.keys(window.COMPOSITE_PAGE_SERVICE).length > 0
          ? true : false;
      } catch (e) {
        isCpsPage = false;
      }
      if (isCpsPage) {
        console.log('This API is only implemented in non-CPS pages.')
        return false;
      }
      this.prefix = prefix;
      this.removeCurrentTheme();
      if (whetherLoadStyleFile == false) {
        var currentIframeId = self.frameElement && self.frameElement.getAttribute('id');
        parent.PORTAL.UI.Controller.switchTheme(defaultTheme, currentIframeId);
        return;
      }
      var that = this;
      if (PORTAL.bodyfunc()) {
        this.addBlueberryToClasses();
        this.initBlueberryCssFile(
          defaultTheme,
          function (newTheme) {
            that.addThemeToClasses(newTheme);
            if (typeof callback === 'function') {
              callback();
            }
          }
        );
      } else {
        document.addEventListener("DOMContentLoaded", this.addBlueberryToClasses.bind(this));
        document.addEventListener(
          "DOMContentLoaded",
          this.initBlueberryCssFile.bind(
            this,
            defaultTheme,
            function (newTheme) {
              that.addThemeToClasses(newTheme);
              if (typeof callback === 'function') {
                callback();
              }
            }
          )
        );
      }
      if (!defaultTheme) {
        window.addEventListener("message", this.getNewTheme.bind(this), false);
      }
    },
    removeCurrentTheme: function () {
      var classes = PORTAL.bodyfunc().classList;
      for (var i = 0; i < classes.length; i++) {
        if (classes[i].indexOf('-theme-') > -1) {
          PORTAL.bodyfunc().classList.remove(classes[i]);
        }
      }
      var parentBodyClasses = parent.document.body.classList;
      for (var i = 0; i < parentBodyClasses.length; i++) {
        if (parentBodyClasses[i].indexOf('cv-theme-') > -1) {
          PORTAL.bodyfunc().classList.remove(parentBodyClasses[i]);
        }
      }
    },
    loadCssFile: function (newTheme, prefix, url, callback) {
      try {
        var fileId = prefix + '-theme-file';
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        var env = parent.PORTAL.UI.SETTINGS.env;
        var domain = env === 'PROD' ? 'https://content.citivelocity.com' : 'https://uatcontent.citivelocity.com';
        domain = env === 'QA' ? 'https://qacontent.citivelocity.com' : domain;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = domain + url + newTheme + '.min.css';
        link.media = 'all';
        link.onload = function () {
          callback(newTheme);
          if (document.getElementById(fileId)) {
            try {
              document.getElementById(fileId).remove();
            } catch (error) {
              document.getElementById(fileId).removeNode(true);
            }
          }
          link.id = fileId;
        }
        head.appendChild(link);
      } catch (e) {
        console.log(e);
      }
    },
    initBlueberryCssFile: function (newTheme, callback) {
      var currentTheme = '';
      try {
        var currentTheme = parent.PORTAL.UI.Controller.getCurrentTheme && parent.PORTAL.UI.Controller.getCurrentTheme();
      } catch (error) {
        currentTheme = 'light';
      }
      newTheme = typeof newTheme === 'string' && newTheme;
      newTheme = newTheme ? newTheme : currentTheme;
      newTheme = newTheme === 'light' ? newTheme : 'dark';
      if (this.prefix == 'lmn') {
        this.loadCssFile(newTheme, 'lmn', '/chameleon/v1/latest/aknetpublic/chameleon-', callback);
      } else if (!this.prefix || this.prefix == 'by') {
        this.loadCssFile(newTheme, 'by', '/chameleon/latest/aknetpublic/chameleon-', callback);
      } else if (this.prefix == 'icgds') {
        this.loadCssFile(newTheme, 'icgds', '/icgds/cv/latest/aknetpublic/icgds-react-cv-', callback);
      } else if (this.prefix == 'both') {
        this.loadCssFile(newTheme, 'lmn', '/chameleon/v1/latest/aknetpublic/chameleon-', callback);
        this.loadCssFile(newTheme, 'by', '/chameleon/latest/aknetpublic/chameleon-', callback);
      }
    },
    replaceThemeClass: function (newTheme) {
      this.removeCurrentTheme();
      this.addThemeToClasses(newTheme);
    }
  },
  initMultiTheme: function (prefix, callback) {
    PORTAL.UI.CP.multiTheme.init(null, true, prefix, callback);
  },
  initDefaultTheme: function (defaultTheme, whetherLoadStyleFile, prefix, callback) {
    PORTAL.UI.CP.multiTheme.init(defaultTheme, whetherLoadStyleFile, prefix, callback);
  }
};

// run the following only if the content is been framed and only within citi.net and citivelocity.com
if (window.top != window.self)
//  && (document.referrer.indexOf("citivelocity.com") > -1 || document.referrer.indexOf("citi.net") > -1))
{
  try {
    window.parent.location.href;
  } catch (e) {
    if (document.domain.indexOf("citivelocity") > -1) {
      //Don't need to shorten citivelocity domain since long domain should be used all the time.
      //But document.domain need to be set even if it is already long domain.
      document.domain = document.domain;
      PORTAL.UI.CP.useMaxHeightSizeAsFallback = false;
    }
    if (document.domain.split(/\.+/).length > 3) {
      /*for citi.net shorten to only 3 parts of domain*/
      document.domain = document.domain.match(/[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,4}$/);
    }
  }

  //TODO: Remove domain shorting code after FX team fixes the cross domain issue.
  //Retry to shorten domain if the cross domain issue still exist.
  try {
    window.parent.location.href;
  } catch (e) {
    if (document.domain.indexOf("citivelocity") > -1) {
      document.domain = document.domain.match(/[a-zA-Z0-9-]+\.[a-zA-Z]{2,4}$/);
    }
  }

  try {
    //if(PORTAL.UI.isInjected){
    if (document.isInjected) {
      PORTAL.UI.CP._initialize();
    } else {
      parent.PORTAL.UI.Controller.addEvent(window, 'load', PORTAL.UI.CP._initialize);
    }
  } catch (e) {
    /*set error status if initialization failed*/
    PORTAL.UI.CP.status = 0;
  }
}

/**
 * help backend to test cache.
 */