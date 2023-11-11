const portalName = 'cv';
if (window.PORTAL && window.PORTAL.IS_TRACKER_LOADED) {
  console.log('Tracker has already been injected.');
} else {
  window.PORTAL = window.PORTAL || {};
  window.PORTAL.UA = window.PORTAL.UA || {}
  window.PORTAL.IS_TRACKER_LOADED = true;
  //define whitelist domain by portal name
  const PORTAL_NAME_MAP = {
    'cv': ['citivelocity.com', 'icgciti.qualtrics.com'],
    'fxpulse': ['icgciti.qualtrics.com', 'citifxpulse.citigroup.net', 'citifxpulse.com'],
    'tts': ['citidirect.com', 'icgciti.qualtrics.com'],
    'ccb': ['citidirect.com', 'icgciti.qualtrics.com'],
  };
  window.PORTAL.UA.WHITELIST_DOMAINS = PORTAL_NAME_MAP[portalName];

  window.isEnableEPFAnalyticsDebugger = false
  try {
    window.isEnableEPFAnalyticsDebugger = window.location.href.includes('debugEPFAnalytics')
      || window.top.location.href.includes('debugEPFAnalytics');
  } catch (e) {
    console.log('portalApi tracker get url failed')
  }

  const now = new Date().toISOString();
  const page = window.location.href.split('/').slice(-1).pop();
  const infoHeader = `%cINFO: ${now} ${page}`;
  const errorHeader = `ERROR: ${now} ${page}`;
  const infoHeaderStyle = 'font-size:12px;color:#317efb;';

  /**
   * Info message to console using an normal way
   * @param {*} message - input message
   */
  const normalInfo = (message) => {
    console.log_(`${infoHeader}`, `${infoHeaderStyle}`, message);
  };

  /**
   * Info an object to console by a friendly way
   * @param {String} message - an object
   * @param {Object} obj - an object
   */
  const infoObject = (message, obj) => {
    console.log_(`${infoHeader}`, `${infoHeaderStyle}`, message, JSON.stringify(obj, undefined, 2));
  };

  /**
   * Log input message to console using normal info mode
   * Exported Log format example: INFO: 2018-06-01T06:02:21.936Z control.html message
   * @param {*} message
   * @param {Object} object
   */
  const info = (message, object) => {
    if (!object) {
      normalInfo(message);
    } else {
      infoObject(message, object);
    }
  };

  /**
   * Make an error message in console
   * @param error - error
   */
  const error = (e) => {
    console.error(`${errorHeader} ${e}`);
  };

  console.log_ = console.log;

  // cover some original function, this method can forbid all orignal function
  // and open it by calling window.enableDebugger(true);
  const GlobalDebug = (function () {
    const savedConsole = console;
    const whiteList = ['warn', 'trace', 'timeEnd', 'time', 'log_'];
    return function (debugOn) {
      window.isEnablePortalDebugger = debugOn;
      if (debugOn === false) {
        console = {};
        Object.keys(savedConsole).forEach((key) => {
          if (whiteList.includes(key)) {
            console[key] = function () { };
          } else {
            console[key] = savedConsole[key];
          }
        });
      } else {
        console = savedConsole;
      }
    };
  }());
  GlobalDebug(window.isEnableEPFAnalyticsDebugger);
  window.enableEPFAnalyticsDebugger = GlobalDebug;


  function checkIfDetectorInjected() {
    return !!window._detector;
  }

  function getUTCTime() {
    let a = new Date();
    function pad(a) {
      return a < 10 ? "0" + a : a;
    }
    return a.getUTCFullYear() + "-" + pad(a.getUTCMonth() + 1) + "-" + pad(a.getUTCDate()) + " " + pad(a.getUTCHours()) + ":" + pad(a.getUTCMinutes()) + ":" + pad(a.getUTCSeconds())
  }

  // This function is to detector if the request url is cross-domain or not.
  function detectorAllowedDomain(whiteList) {
    try {
      let isAllowed = false;
      whiteList.forEach(allow => {
        if (window.location.href.indexOf(allow) > -1) {
          isAllowed = true;
        }
      });
      return isAllowed;
    } catch (error) {
      console.log(error);
    }
  }

  (function (PORTAL_UA) {
    const PORTAL = window.PORTAL || {};
    PORTAL.UAAPI = Object.assign({}, PORTAL.UAAPI, {})
    PORTAL.UA.WHITELIST_THIRD_PARTY_DOMAINS = ['icgciti.qualtrics.com'];
    function PORTALTrackerConstructor() {
      this.CONSTANTS = {
        TRACKINGSOURCE: {
          DEFAULT_MENU: '1',
          SEARCH: '2',
          DOCUMENT_OR_VIDEO: '5',
          DEEPLINKS: '6',
          SEARCH_RESULT_CONTENT: '8',
          CVSUGGEST: '14',
          NEWS_LETTER: '17',
          NEWS_LETTER_MENU: '18',
          EMAIL_DIGEST: '19',
          EMAIL_DIGEST_MENU: '20',
          SUBSCRIPTION: '7',
          SUBSCRIPTION_MENU: '27',
          SYMPHONY_SUBSCRIPTION: '28',
          SYMPHONY_SUBSCRIPTION_MENU: '29',
          CITI_RECOMMENDS: '30',
          CITI_RECOMMENDS_MENU: '31',
          SEND_MAIL_PAGE: '32',
          NEWS_LETTER_TRACKSOURCE: '17',
          SEND_MAIL_CONTENT: '21',
        },
      };
      this.isDataReady = false;
      this.execQueue = [];
      this.execGlassBoxQueue = [];
      this.cpSite = null;
      this.oldState = null;
      this.newState = null;
      this.initData = function (prtlData) {
        this.prtlData = prtlData || {};
        this.enableGlassbox = prtlData.enableGlassbox;
        this.isDataReady = true;
        if (prtlData.siteId) {
          this.cpSite = Object.assign({}, this.cpSite, { SITE_ID: prtlData.siteId });
        }
        while (this.execQueue.length > 0) {
          let t = this.execQueue.shift();
          t.func.apply(t, ...[t.arg]);
          t = null;
        }
      };
      this.initEventTracker = function (cpSite) {
        this.site = cpSite;
      };

      this.getSiteId = function ({
        portal,
        zone,
        env,
        source,
        userType,
      }) {
        const source_ = source.toLowerCase();
        const zone_ = zone.toLowerCase();
        const env_ = env.toLowerCase();
        if (source_ === 'cvchat') {
          return '18';
        }
        let g = '0';
        try {
          if (zone_ === 'sfsexternal') {
            switch (env_) {
              case 'qa':
                g = '36';
                break;
              case 'uat':
                g = '36';
                break;
              case 'prod':
                g = '36';
                break;
              default:
                g = '1';
                break;
            }
          }
          let h = 0;
          try {
            h = this.prtlData && this.prtlData.userType === 'E' ? 0 : 1;
          } catch (f) {
            h = userType === 'Client' || userType === 'C';
          }
          if (portal === 'intranet' || portal === 'ICG') {
            switch (env_) {
              case 'qa':
                g = '2';
                break;
              case 'uat':
                g = '3';
                break;
              case 'prod':
                g = '4';
                break;
              default:
                g = '1';
                break;
            }
          } else if (zone_ === 'internal') {
            switch (env_) {
              case 'qa':
                g = '7';
                break;
              case 'uat':
                g = '9';
                break;
              case 'prod':
                g = '11';
                break;
              default:
                g = '5';
                break;
            }
          } else {
            switch (env) {
              case 'qa':
                g = !h ? '8' : '14';
                break;
              case 'uat':
                g = !h ? '10' : '14';
                break;
              case 'prod':
                g = !h ? '12' : '14';
                break;
              default:
                g = !h ? '6' : '14';
                break;
            }
          }
          return g;
        } catch (f) {
          return '';
        }
      }

      this.getUserType = function () {
        let userType = '';
        if (this.prtlData
          && this.prtlData.userType
          && this.prtlData.userType === 'C') {
          userType = 'Client';
        } else if (this.prtlData
          && this.prtlData.userType
          && this.prtlData.userType === 'E') {
          userType = 'Employee';
        } else if (this.prtlData
          && this.prtlData.userType
          && this.prtlData.userType === 'F') {
          userType = 'FID';
        }
        return userType;
      }

      this.triggerCustomEvent = (eventName, eventObj) => {
        if ((typeof eventName !== 'string' || typeof eventObj !== 'object')) {
          return false;
        }
        if (this.prtlData && this.prtlData.enableGlassbox && window._detector && window._detector.triggerCustomEventMap) {
          let csi_id = (this.site && this.site.CSI) || '';

          const site = {
            env: this.site.ENV || eventObj.ENV || eventObj.EVENT_ENV || this.prtlData.env,
            uid: eventObj.USER_ID || this.prtlData.loginId || this.site.USER_ID,
            utype: eventObj.USER_TYPE || eventObj.EVENT_USER_TYPE || this.getUserType(),
            zone: eventObj.ZONE || eventObj.EVENT_ZONE || this.site.ZONE || this.prtlData.zone,
            idsite: eventObj.SITE_ID || this.site.SITE_ID || this.prtlData.siteId,
            csi: eventObj.EVENT_CSI || this.site.CSI,
            app: eventObj.APPLICATION || eventObj.EVENT_APPLICATION || this.prtlData.portal,
            dtype: eventObj.DEVICE_TYPE || eventObj.EVENT_DEVICE_TYPE || window.navigator.userAgent,
            eventId: eventObj.EVENT_ID,
            ea: eventObj.EVENT_ACTION,
            ec: eventObj.EVENT_CATEGORY,
            et: eventObj.EVENT_TYPE,
            el: eventObj.EVENT_LABEL,
            ev: eventObj.EVENT_VALUE,
            mtitle: eventObj.EVENT_MENU_TITLE,
            ptl: eventObj.PORTAL || eventObj.EVENT_PORTAL || this.prtlData.portal,
            profile: eventObj.PROFILE || eventObj.EVENT_PORTAL_PROFILE || this.prtlData.profile,
            pname: eventObj.PORTLET_NAME || eventObj.EVENT_PORTLET_NAME,
            pcode: eventObj.PORTLET_CODE || eventObj.EVENT_PORTLET_CODE,
            contentSourceId: eventObj.CONTENT_SOURCE || eventObj.EVENT_CONTENT_SOURCE,
            contentId: eventObj.CONTENT_ID || eventObj.EVENT_CONTENT_ID,
            cp: eventObj.CONTENT_PROVIDER || eventObj.EVENT_CONTENT_PROVIDER,
            pagePath: eventObj.PAGE_HIERARCHY_PATH || eventObj.EVENT_PAGE_HIERARCHY_PATH,
            pageTitle: eventObj.PAGE_TITLE,
            mcode: eventObj.MENU_CODE || eventObj.EVENT_MENU_CODE,
            tabName: eventObj.TAB_NAME || eventObj.EVENT_TAB_NAME,
            tcode: eventObj.TRACKING_SOURCE || eventObj.EVENT_TRACKING_SOURCE || '1',
            reqId: eventObj.REQUEST_ID || eventObj.EVENT_REQUEST_ID,
            muid: eventObj.MIMICED_USER_ID || eventObj.EVENT_MIMICED_USER_ID,
            url: eventObj.URL || eventObj.EVENT_URL || window.location.href,
            ts: eventObj.EVENT_EPOCH_TIMESTAMPT || new Date().getTime(),
            ptm: eventObj.READABLE_TIMESTAMP || eventObj.EVENT_READABLE_TIMESTAMP || getUTCTime(),
            src: eventObj.EVENT_SOURCE || eventObj.SOURCE
          }

          if (this.prtlData && this.prtlData.mimicId) {
            site.muid = this.prtlData.mimicId;
          }

          if (eventObj.CUSTOM_PARAM && typeof eventObj.CUSTOM_PARAM === 'object') {
            let _CUSTOM_PARAM = {};
            for (let key in eventObj.CUSTOM_PARAM) {
              if (Object.hasOwnProperty.call(eventObj.CUSTOM_PARAM, key)) {
                _CUSTOM_PARAM[`_${key}`] = eventObj.CUSTOM_PARAM[key];
              }
            }
            Object.assign(site, { ..._CUSTOM_PARAM });
          }

          Object.keys(site).forEach(function (key) {
            if (typeof site[key] === 'undefined' || site[key] == "") {
              delete site[key];
            }
          });
          info(`triggerCustomEvent`, site)
          window._detector.triggerCustomEventMap(`${csi_id}_${eventName}`, site);
        } else {
          this.execGlassBoxQueue.push(
            {
              func: this.triggerCustomEvent,
              arg: [eventName, eventObj],
            },
          );
        }
      }

      this.getEventId = function () {
        const userId = (this.prtlData && this.prtlData.loginId) || '';
        if (!userId) {
          return `epf_${new Date().getTime()}`;
        }
        return `epf_${userId}_${new Date().getTime()}`;
      }

      this.releaseGBEventQueue = function () {
        while (this.execGlassBoxQueue.length > 0) {
          let t = this.execGlassBoxQueue.shift();
          t.func.apply(t, ...[t.arg]);
          t = null;
        }
      }

    }
    PORTAL.UAAPI = Object.assign({}, PORTAL.UAAPI, {
      status: null,
      configs: {},
      loadStatus: 0,
      tracker: new PORTALTrackerConstructor(),
      EventTracker: {
        /**
           *
           * <br>Refer to this by - {@link PORTAL.UA.EventTracker.triggerCustomEvent}
           * @memberof PORTAL.UA.EventTracker
           * @instance
           * @param {string} eventName
           * @param {object} eventObj - EVENT_ACTION : "<action>",
             EVENT_CATEGORY : "<category>", 
             Other reserved keys...,
             CUSTOM_PARAM: { key/value pairs }  key name will appear with "_" prefix in Glassbox
           */
        triggerCustomEvent: (eventName, eventObj) => (PORTAL.UAAPI.tracker.triggerCustomEvent(eventName, eventObj))
      },
      start: function () {
        this._switchPiwikStatus();
      },
      _getRequest: function (requrl, callback, errorCallback) {
        var xmlhttp = null;
        if (window.XMLHttpRequest) {
          xmlhttp = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
          xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        if (xmlhttp !== null) {
          xmlhttp.open("GET", requrl, true);
          xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
              try {
                var res = '';
                if (xmlhttp.responseText.indexOf('<!DOCTYPE html>') > -1) {
                  res = { errorMsg: 'NO_RESPONSE_TEXT' }
                } else {
                  res = JSON.parse(xmlhttp.responseText)
                }
              } catch (error) {
                callback({ errorMsg: 'NO_RESPONSE_TEXT' });
              }
              if (callback) {
                callback(res);
              }
            } else if (xmlhttp.readyState === 4 && xmlhttp.status === 500) {
              if (typeof errorCallback === 'function') {
                errorCallback({ errorMsg: 500 })
              }
            }
          }
          xmlhttp.send();
        } else {
          console.log('request error');
        }
      },
      getDomainUrl: function () {
        const domainUrl = window.location.href;
        switch (true) {
          case domainUrl.indexOf('https://dev') > -1:
            return 'dev';
          case domainUrl.indexOf('https://qa') > -1:
            return 'qa';
          case domainUrl.indexOf('https://uat') > -1:
            return 'uat';
          case domainUrl.indexOf('https://www') > -1:
            return 'prod';
          default:
            return 'prod';
        }
      },

      getAjaxResource: function (url, cb) {
        var f = function (token) {
          var options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'bearer ' + token.access_token
            },
            body: "data=data"
          };
          fetch(url, options).then(function (response) { return response.json(); })
            .then(function (data) { cb(data) })
            .catch(function (e) { console.log(e); });
        }
        parent.PORTAL.EPF.THIRDPARTY.TOKENS.tokenWrapper(f);
      },
      _switchPiwikStatus: function () {
        var that = PORTAL.UAAPI;
        var portalServiceGlassboxUrl = '';
        var getGlassboxConfigUrl = '';
        var isThirdPartyWhiteList = detectorAllowedDomain(PORTAL.UA.WHITELIST_THIRD_PARTY_DOMAINS);
        if (isThirdPartyWhiteList) {
          let domain = window.PORTAL.UA.DOMAIN;
          portalServiceGlassboxUrl = `${domain}/portal/service/eppublic/glassbox`;
          getGlassboxConfigUrl = `${domain}/portal-profile-service/eppublic/getGlassboxConfig`;
        } else {
          portalServiceGlassboxUrl = '/portal/service/eppublic/glassbox';
          getGlassboxConfigUrl = '/portal-profile-service/eppublic/getGlassboxConfig';
        }
        switch (that.loadStatus) {
          case 0:
            that._getRequest(portalServiceGlassboxUrl,
              function (res) {
                if (res) {
                  if (Object.hasOwnProperty.call(res, 'errorMsg') && res.errorMsg === 'NO_RESPONSE_TEXT') {
                    that.configs.enableGlassbox = true;
                    that.configs.env = that.getDomainUrl();
                    that.loadStatus += 1;
                    that._switchPiwikStatus();
                  } else {
                    if (res.loginId === 'anonymous') {
                      that.configs.enableGlassbox = true;
                    } else {
                      that.configs.enableGlassbox = res.enableGlassbox;
                    }
                    that.configs.env = res.env || '';
                    that.configs.loginId = res.loginId || '';
                    that.configs.portal = res.portal || '';
                    that.configs.userType = res.userType || '';
                    that.configs.zone = res.zone || '';
                    that.loadStatus += 1;
                    that._switchPiwikStatus();
                  }
                }
              },
            );
            that._getRequest(getGlassboxConfigUrl,
              function (res) {
                that.configs.siteId = res.siteId || '';
                that.configs.profile = res.profile || '';
                that.configs.reportURI = res.reportUrl || '';
                that.configs.glassboxJsUrl = res.jsUrl || '';
                that.configs.lob = res.lob || '';
                if (res.allGlassboxConfigurations) {
                  that.configs.ajaxBlacklist = res.allGlassboxConfigurations.ajaxBlacklist;
                  that.configs.pageMaskingBlacklist = res.allGlassboxConfigurations.pageMaskingBlacklist;
                  that.configs.pageTrackingOmission = res.allGlassboxConfigurations.pageTrackingOmission;
                  const customConfigurations = res.allGlassboxConfigurations.customConfigurations
                    && typeof (res.allGlassboxConfigurations.customConfigurations) === 'string'
                    && JSON.parse(res.allGlassboxConfigurations.customConfigurations);
                  that.configs.customConfigurations = customConfigurations;
                  // that.configs.standAloneConfigs = customConfigurations && customConfigurations.standAloneConfigs || {
                  //   enablePiwikGlassboxInExternal: true,
                  //   enablePiwikGlassboxInInternal: true,
                  // };
                }
                that.loadStatus += 1;
                that._switchPiwikStatus();
              },
              function (error) {
                that.loadStatus += 1;
                that._switchPiwikStatus();
              }
            );
            break;
          case 2:
            let userType = '';
            if (that.configs
              && that.configs.userType
              && that.configs.userType === 'C') {
              userType = 'Client';
            } else if (that.configs
              && that.configs.userType
              && that.configs.userType === 'E') {
              userType = 'Employee';
            }
            if (that.configs.loginId && that.configs.loginId !== 'anonymous') {
              window.UA = {
                userSession: {
                  uid: that.configs.loginId || '',
                  userType,
                  zone: that.configs.zone && that.configs.zone.toLowerCase(),
                  portalProfile: that.configs.profile,
                }
              }
            } else {
              window.UA = {
                userSession: {
                  userType,
                  zone: that.configs.zone && that.configs.zone.toLowerCase(),
                  portalProfile: that.configs.profile,
                }
              }
            }
            if (that.configs && that.configs.mimicId) {
              if (window.UA && window.UA.userSession) {
                window.UA.userSession.muid = that.configs.mimicId;
              }
            }
            var enableGlassbox = false;
            try {
              setTimeout(function () {
                var that = PORTAL.UAAPI;
                var standAloneConfigs = that.configs.standAloneConfigs;

                /**
                 * Identify if this cp is in the blackList
                 */
                var cpBlackList = that.configs.pageTrackingOmission || [];
                var pathname = window.location && window.location.pathname && window.location.pathname || '';
                var isCpInBlackList = false;
                cpBlackList.forEach(element => {
                  if (element) {
                    element = element.replace(/\]|\[/g, "").trim();
                    if (element !== '/' && element !== '' && pathname.indexOf(element) > -1) {
                      isCpInBlackList = true;
                    }
                  }
                });

                /**
                 * Identify if gb is required to be loaded in external or internal environment
                 */
                // var enableExternalGB = false;
                // var enableInternalGB = false;
                // try {
                //   var zone = that.configs.zone;
                //   enableExternalGB = (standAloneConfigs && standAloneConfigs.enablePiwikGlassboxInExternal && zone === "external") || false;
                //   enableInternalGB = (standAloneConfigs && standAloneConfigs.enablePiwikGlassboxInInternal && zone === "internal") || false;
                // } catch (error) {
                //   console.log(error);
                // }

                enableGlassbox = that.configs.enableGlassbox
                  // && (enableExternalGB || enableInternalGB)
                  && !isCpInBlackList

                that._injectGlassBox(enableGlassbox);
              }, 50);
            } catch (error) {
              that._injectGlassBox(enableGlassbox);
            }

            break;
          case 4:
            setTimeout(() => {
              PORTAL.UAAPI.tracker.initData(that.configs);
              if (that.tracker && that.tracker.releaseGBEventQueue) {
                that.tracker.releaseGBEventQueue();
              }
            }, 50);
            break;
          default:
            break;
        }
      },
      _injectGlassBox: function (enableGlassbox) {
        try {
          let that = PORTAL.UAAPI;
          const head = document.getElementsByTagName('head')[0];
          that.loadStatus += 1;
          that._switchPiwikStatus();
          if (enableGlassbox) {
            const isProd = that.configs.env && that.configs.env.includes('prod');
            let env_ = isProd ? '' : that.configs.env;
            const isSandbox = env_ === 'sandbox';
            env_ = isSandbox ? 'uat' : env_;
            const glassBoxScript = document.createElement('script');
            const defaultURL = `https://${env_}content.citivelocity.com/cv2/eppublic/js/glassbox/detector-dom.min.js?t=${new Date().getTime()}`;
            glassBoxScript.src = that.configs.glassboxJsUrl || defaultURL;
            glassBoxScript.id = '_cls_detector';
            const path = '/citiportal/eppublic/mvc/piwikTracker';
            const reg = new RegExp(`\S*(${path})`);
            const uriMatch = `ajaxRecordResponseBody=not(uriMatches(${reg}))`;
            glassBoxScript.setAttribute('data-clsconfig', uriMatch);
            if (!checkIfDetectorInjected()) {
              head.appendChild(glassBoxScript);
              glassBoxScript.addEventListener('load', function () {
                that.loadStatus += 1;
                that._switchPiwikStatus();
                const event = new CustomEvent('load_detector_js');
                window.dispatchEvent(event);
              }, false);
            } else {
              that.loadStatus += 1;
              that._switchPiwikStatus();
              const event = new CustomEvent('load_detector_js');
              window.dispatchEvent(event);
            }
            that.documentVisibleStateMonitor();
          } else {
            console.log('enableGlassbox is false, check below configuration...')
            console.log('(1)url omission blacklist in cpdashboard (2)external/internal is false (3)glassbox flag is false')
            that._switchPiwikStatus();
          }
        } catch (error) {
          console.log(error);
          console.log('Inject Package Failed.');
        }
      },
      addNativeLifeCycle: function () {
        let event = new CustomEvent('statechange', { detail: { oldState: 'start', newState: 'start' } });;
        const that = PORTAL.UAAPI;

        // https://developer.chrome.com/blog/page-lifecycle-api/
        document.addEventListener("visibilitychange", (e) => {
          if (document.visibilityState === 'hidden') {
            /**
            * Hidden	
            * A page is in the hidden state if it is not visible (and has not been frozen, discarded, or terminated).
            */
            event = new CustomEvent('statechange', { detail: { oldState: that.oldState, newState: 'hidden' } });
            window.dispatchEvent(event);
          }
          else if (!document.hasFocus() && document.visibilityState === 'visible') {
            /**
            * Passive
            * A page is in the passive state if it is visible and does not have input focus.
            */
            event = new CustomEvent('statechange', { detail: { oldState: that.oldState, newState: 'passive' } });
            window.dispatchEvent(event);
          } else {
            /**
            * Active	
            * A page is in the active state if it is visible and has input focus.
            */
            event = new CustomEvent('statechange', { detail: { oldState: that.oldState, newState: 'active' } });
          }
          that.oldState = event.detail.newState;
        });
        /**
         * Frozen	
         * In the frozen state the browser suspends execution of freezable tasks in the page's task queues until the page is unfrozen. 
         * This means things like JavaScript timers and fetch callbacks do not run. Already-running tasks can finish
         * (most importantly the freeze callback), but they may be limited in what they can do and how long they can run.
         * Browsers freeze pages as a way to preserve CPU/battery/data usage; they also do it as a way
         * to enable faster back/forward navigations — avoiding the need for a full page reload.
         */
        document.addEventListener('freeze', (event) => {
          event = new CustomEvent('statechange', { detail: { oldState: that.oldState, newState: 'freeze' } });
          window.dispatchEvent(event);
          that.oldState = event.detail.newState;
        });

        document.addEventListener('resume', (event) => {
          event = new CustomEvent('statechange', { detail: { oldState: that.oldState, newState: 'resume' } });
          window.dispatchEvent(event);
          that.oldState = event.detail.newState;
        });
      },
      documentVisibleStateMonitor: function () {
        const that = PORTAL.UAAPI;
        that.addNativeLifeCycle();
        window.addEventListener('statechange', (event) => {
          const detail = event.detail;
          console.log('glassbox lifeCycle state change: ', detail.oldState, ' ----> ', detail.newState, ' ----> ', new Date());
          switch (detail.newState) {
            case 'active':
              if (that.hasManualStopRecord) {
                that.resumeHandler();
                that.hasManualStopRecord = false;
              }
              break;
            case 'passive':
              if (detail.oldState !== 'active' && that.hasManualStopRecord) {
                that.resumeHandler();
                that.hasManualStopRecord = false;
              } else {
                that.clearHiddenTimeout();
              }
              break;
            case 'hidden':
              console.log('glassbox setTimeout  >>>> ', ' current time: ', new Date());
              that.hiddenMonitor = window.setTimeout(() => {
                if (detail.newState === 'hidden') {
                  that.timeoutHandler();
                }
                that.hiddenMonitor = '';
              }, 600000);
              break;
            case 'freeze':
              that.freezeHandler();
              break;
            default:
              that.clearHiddenTimeout();
              break;
          }
        });
      },
      resumeHandler: function () {
        console.log('page resume');
        PORTAL.UAAPI.clearHiddenTimeout();
        PORTAL.UAAPI.startReporting();
      },
      freezeHandler: function () {
        console.log('page frozen');
        PORTAL.UAAPI.clearHiddenTimeout();
        PORTAL.UAAPI.timeoutHandler();
      },
      timeoutHandler: function () {
        PORTAL.UAAPI.stopReporting();
      },
      startReporting: function () {
        window._detector.startRecording();
        window._detector.trigger3rdPartyMap(window.UA.userSession);
        window._detector.triggerCustomEvent('startRecording', `Current State is start`);
        console.log('------> glassbox startReporting <----- ', new Date());
        console.log(`------> glassbox isRecording: ${window._detector.isRecording()} <-----`, new Date());
      },
      stopReporting: function () {
        PORTAL.UAAPI.hasManualStopRecord = true;
        window._detector.triggerCustomEvent('stopRecording', `Current State is stop`);
        window._detector.flush();
        console.log('------> glassbox call flush <-----', new Date());
        window._detector.stopRecording();
        console.log('------> glassbox stopReporting <-----', new Date());
        window._detector.triggerCustomEvent('isRecording', window._detector.isRecording());
        console.log(`------> glassbox isRecording: ${window._detector.isRecording()} <-----`, new Date());
      },
      clearHiddenTimeout: function () {
        if (PORTAL.UAAPI.hiddenMonitor) {
          window.clearTimeout(PORTAL.UAAPI.hiddenMonitor);
          PORTAL.UAAPI.hiddenMonitor = '';
        }
      },
    })

    PORTAL.UA.getConfigurations = function () {
      return PORTAL.UAAPI.configs;
    };
    PORTAL.UA.getEventTracker = function (cpSite) {
      if (typeof cpSite === 'object' && Object.keys(cpSite).length > 0) {
        PORTAL.UAAPI.tracker.initEventTracker(cpSite);
      }
      return PORTAL.UAAPI.EventTracker;
    };

    try {
      if (window.isEnableEPFAnalyticsDebugger) {
        debugger
      }
      if (detectorAllowedDomain(PORTAL.UA.WHITELIST_DOMAINS)) {
        PORTAL.UAAPI.start();
      }
    } catch (error) {
      console.log(error);
    }
  })(window.PORTAL.UA);
}