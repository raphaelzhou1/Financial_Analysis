(window.webpackJsonp=window.webpackJsonp||[]).push([[16,69],{598:function(t,e,a){"use strict";a.d(e,"a",function(){return u});var n=a(1),r=a.n(n),o=a(4),i=a.n(o),c=a(81),l=a(35),s=a(16),d=a(587),u=function(){var t,e=c.c()&&l.L()?r()("body"):r()(window),a=(new Date).getTime();window.HTML_RENDITION.scrollTrackerSettings={headerTracked:!1,bodyCountTracked:0,footerTracked:!1};var n=function(){var t=(e.height()||0)+(e.scrollTop()||0),a=s.a.getState().asyncStateReducer.docHeaderJsonData.totalJSONFileCount;"HTML"==window.HTML_RENDITION.initialData.docFileType&&(a=3);var n=a-2,c=window.HTML_RENDITION.scrollTrackerSettings.headerTracked,l=window.HTML_RENDITION.scrollTrackerSettings.footerTracked,u=window.HTML_RENDITION.scrollTrackerSettings.bodyCountTracked;if(!i.a.isUndefined(a)&&!l){var T=r()("#issuer"),h=(T.offset()||{top:0}).top+(T.height()||0);if(!c&&h<=t)return d.a.trackScrollPercent(o(a,1),a.toString()),void(window.HTML_RENDITION.scrollTrackerSettings.headerTracked=!0);if(u<n){u+=1;var g=r()("#bodyText .body_section_"+u);if(g.length)if((g.offset()||{top:0}).top+(g.height()||0)<=t)return d.a.trackScrollPercent(o(a,u+1),a.toString()),void(window.HTML_RENDITION.scrollTrackerSettings.bodyCountTracked=u)}var f=r()("#disclosures");if(f.is(":visible")){var w=(f.offset()||{top:0}).top+(f.height()||0);if(!l&&w<=t)return d.a.trackScrollPercent(o(a,a),a.toString()),void(window.HTML_RENDITION.scrollTrackerSettings.footerTracked=!0)}}},o=function(t,e){return Math.round(100/t*e).toString()},u=function(){try{var n=(new Date).getTime(),o=n-a;if(a=n,o<300)return;if(parent.Main.window!=window)return;if(window.PORTAL.UI.CP.toggleMiniHeader){var i=!1,c=e.scrollTop();if("undefined"==typeof t&&(t=!0),0==c?(window.PORTAL.UI.CP.toggleMiniHeader(!1),t=!1,i=!0):t||(window.PORTAL.UI.CP.toggleMiniHeader(!0),t=!0,i=!0),i){var s=r()(window.parent.document).find("#Main"),d=l.z(s);window.PORTAL.UI.CP.resizeFrameHeight(d)}}}catch(u){console.log("Error executing PORTAL.UI.CP.toggleMiniHeader")}},T=function(){var t=s.a.getState().asyncStateReducer.docHeaderJsonData.totalJSONFileCount;"HTML"==window.HTML_RENDITION.initialData.docFileType&&(t=3);var e=r()(window).scrollTop(),a=r()(window).height(),n=r()(document).height(),o=Math.round(e/(n-a)*100);d.a.trackScrollPercent(o,t.toString()),0===o?window.HTML_RENDITION.scrollTrackerSettings.headerTracked=!0:100===o?window.HTML_RENDITION.scrollTrackerSettings.footerTracked=!0:window.HTML_RENDITION.scrollTrackerSettings.bodyCountTracked=!0};"LOCAL"!=window.HTML_RENDITION.initialData.environment.toUpperCase()&&(e.on("scroll",i.a.debounce(n)),e.on("scroll",i.a.debounce(T,1e3))),l.K()&&!l.J()&&e.on("scroll",i.a.debounce(u,100))}},618:function(t,e,a){"use strict";var n=a(6),r=a(7),o=a(10),i=a(8),c=a(9),l=a(0),s=a.n(l),d=a(136),u=a(589),T=a(16),h=a(35),g=a(1),f=a.n(g),w=a(86),p=a.n(w),v=a(588),y=a(56),k=a(137),b=a(24),S=a(586),C=function(t){function e(t){return Object(n.a)(this,e),Object(o.a)(this,Object(i.a)(e).call(this,t))}return Object(c.a)(e,t),Object(r.a)(e,[{key:"componentDidMount",value:function(){!f()(".CatalystWatch .CatalystWatch").length&&p()(this.props.catalystWatchData)&&this.props.loadCatalystWatchData()}},{key:"openOriginLinkHrefFun",value:function(){var t=this.props.docHeaderSectionJson,e="";t.CatalystWatch&&t.CatalystWatch.originalDocUrl&&(e=Object(h.f)(t.CatalystWatch.originalDocUrl)),Object(h.jb)()?Object(h.p)(e):window.open(e,Object(h.J)()?"_self":"_blank")}},{key:"scrollTo",value:function(t){if("mainPage"!==T.a.getState().commonStateReducer.switchPageData.pageName&&Object(u.a)("TocToMainPage"),this.props.initialData.showPDFDigidocViewer&&Object(h.Bb)(this.props.htmlPDFtoggleStatus),"cw_scrollToLink"===t.target.className){var e=f()(".CatalystWatch,.CatalystWatchPage").attr("id");Object(h.g)(e)}}},{key:"getModalSource",value:function(t){var e=this,a=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=this.props.docHeaderSectionJson;return s.a.createElement("div",{id:"catalyst-watch-popup",className:"catalyst-watch-popup"},n.CatalystWatch&&"false"==n.CatalystWatch.isOriginDoc&&s.a.createElement("div",{id:"catalyst-original-url"},s.a.createElement("a",{tabIndex:0,role:"link",onClick:function(){return e.openOriginLinkHrefFun()},onKeyPress:function(t){return Object(S.a)(t,e.openOriginLinkHrefFun.bind(e))},"aria-label":n.i18n.original_link},n.i18n.original_link)),s.a.createElement("div",{className:"catalyst-watch-table"},t&&s.a.createElement("div",{dangerouslySetInnerHTML:{__html:t}})),s.a.createElement("div",{className:"cw_scrollToLink_holder "+(a?"show":"hide")},s.a.createElement("span",null,n.i18n.figure_here_before),s.a.createElement("a",{tabIndex:a?0:-1,role:"link",className:"cw_scrollToLink",onClick:function(t){return e.scrollTo(t)},"aria-label":n.i18n.figure_here}," ",n.i18n.figure_here," "),s.a.createElement("span",null,n.i18n.figure_here_after)))}},{key:"render",value:function(){var t=this.props,e=t.catalystWatchData,a=t.initialData,n=null,r=!0;a.isFAVE&&"HTML"==a.docFileType||(r=!1);var o=r?f()(".CatalystWatchPage .CatalystWatchPage"):f()(".CatalystWatch .CatalystWatch"),i=!1,c="",l="";if(o.length)c=o[0].outerHTML,l=f()(c).addClass("CW_fromBody").css("border-width","0").prop("outerHTML"),i=!0,n=this.getModalSource(l,i);else{var s="<div>No data available.</div>";if(!p()(e)){var d,u,T;r?s=e.htmlText:(null===e||void 0===e?void 0:null===(d=e.response)||void 0===d?void 0:null===(u=d.data)||void 0===u?void 0:null===(T=u.GET_CATALYST_WATCH)||void 0===T?void 0:T.data[0])?s=e.response.data.GET_CATALYST_WATCH.data[0].htmlText:p()(e)||p()(e.htmlText)||(s=e.htmlText);try{/^<table/g.test(s)||(s=b.Base64.decode(s)),s=f()(s).find("tr").first().addClass("first").parents("table")[0].outerHTML,s=f()(s).find("tr").last().addClass("last").parents("table")[0].outerHTML}catch(h){s="<div>The data structure or type has some issue, and can't render the table.</div>"}}n=this.getModalSource(s)}return n}}]),e}(l.PureComponent);e.a=Object(d.b)(function(t){return{docHeaderSectionJson:t.asyncStateReducer.docHeaderJsonData,initialData:t.asyncStateReducer.initialData,catalystWatchData:t.asyncStateReducer.catalystWatchData,htmlPDFtoggleStatus:t.commonStateReducer.htmlPDFtoggleStatus}},function(t){return{loadCatalystWatchData:function(){return t(v.f(y.c(k.a.GET_CATALYST_WATCH)))}}})(C)},640:function(t,e,a){}}]);
//# sourceMappingURL=16.5ea2c46a.chunk.js.map