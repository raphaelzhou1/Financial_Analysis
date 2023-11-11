(function () {
    try {
        window._uxa = window._uxa || [];
        /**
         * safe decode from base 64. method taken from: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
         * @param {!string} str string to decode
         * @return {string} returns decoded string
         */
        function Base64Decode(str) {
            return decodeURIComponent(atob(str).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        }

        function getQueryFromPathPart(decodedPathPart) {
            var splitQuery = decodedPathPart.split('&');
            if (splitQuery.length > 1) {
                var docArr = splitQuery.filter(function (queryPart) {
                    return /^doc_id=/.test(queryPart);
                });
                return docArr[0];
            } else {
                return decodedPathPart
            }
        }

        function getPathNameWithoutUserId() {
            var pathname = window.location.pathname;
            var pathnameMatch = pathname.match(/^\/rendition\/eppublic\/documentService\/(.*)/i);
            var parentDocDataCheck = window.location.search.indexOf('parentDocData') != -1;
            if (pathnameMatch) {
                var docPath = pathnameMatch[1];
                if (docPath.indexOf('/') !== -1 || window.location.search === '' || docPath.indexOf('/') == -1 && parentDocDataCheck) {
                    var splitDocPath = parentDocDataCheck ? [docPath] : docPath.split('/'); //path so not large
                    var indexesToSplice = [];
                    var queryWithDocId = '';
                    for (var i = 0; i < splitDocPath.length; i++) {
                        try {
                            var decodedPathPart = Base64Decode(splitDocPath[i]);
                            if (/user_id=([^&]+)/.test(decodedPathPart)) {
                                indexesToSplice.push(i);
                            }
                            else if (/doc_id=([^&]+)/.test(decodedPathPart)) {
                                indexesToSplice.push(i);
                                queryWithDocId = getQueryFromPathPart(decodedPathPart).replace(/=/g, '/');
                            }
                        }
                        catch (err) { };
                    }
                    if (indexesToSplice.length > 0) {
                        indexesToSplice.reverse().forEach(function (indexToSplit) {
                            splitDocPath.splice(indexToSplit, 1);
                        });
                    }
                    return '/rendition/eppublic/documentService/' + splitDocPath.join('/') + queryWithDocId;
                }
                else if (window.location.search.indexOf('doc_id') != -1) {
                    return pathname + window.location.search;
                }
            }
            return pathname;
        }

        function setCustomVars() {
            var doc_id;
            if (window.HTML_RENDITION && typeof HTML_RENDITION.doc_id !== 'undefined') {
                doc_id = HTML_RENDITION.doc_id;
            } else if (window.frames.HTML_RENDITION &&
                window.frames.HTML_RENDITION.initialData &&
                typeof window.frames.HTML_RENDITION.initialData.doc_id !== 'undefined') {
                doc_id = window.frames.HTML_RENDITION.initialData.doc_id;
            }

            if (typeof doc_id !== 'undefined') {
                window._uxa.push(['setCustomVariable', 1, 'DocID', doc_id, 3]);
            }
        }

        function callTrackingJS() {
            var mt = document.createElement("script");
            mt.type = "text/javascript";
            mt.async = true;
            if (typeof HTML_RENDITION.contentsquareBasePath === 'undefined') {
                mt.src = window.frames.HTML_RENDITION.initialData.contentsquareBasePath + window.frames.HTML_RENDITION.initialData.contentsquareScriptPath;
            } else {
                mt.src = HTML_RENDITION.contentsquareBasePath + HTML_RENDITION.contentsquareScriptPath;
            }
            document.getElementsByTagName("head")[0].appendChild(mt);
        }

        /**
         * a function to return the user type. it seems that E is internal user, while C (for example) is external
         * @returns {!string}
         */
        function getRenditionUserType() {
            var userType = '';
            if (!window.HTML_RENDITION || typeof HTML_RENDITION.RenditionUserType === 'undefined') {
                userType = (window.frames.HTML_RENDITION && window.frames.HTML_RENDITION.initialData && window.frames.HTML_RENDITION.initialData.RenditionUserType) || '';
            } else {
                userType = HTML_RENDITION.RenditionUserType;
            }
            return userType;
        }


        if (getRenditionUserType() === 'E') {
            /*** integrate with CSLive ***/
            if (window.chrome && /^\/rendition\/eppublic\/documentService\/(.+)/i.test(location.pathname) && typeof csLiveIntegrate === 'function') {
                csLiveIntegrate();
            }
        } else {
            /*** do tracking ***/
            setCustomVars();


            if (typeof CS_CONF === 'undefined') {

                window._uxa.push(['setPath', getPathNameWithoutUserId() + window.location.hash.replace('#', '?__')]);
                callTrackingJS(); // call the js file

            } else {
                window._uxa.push(['trackPageview', getPathNameWithoutUserId() + window.location.hash.replace('#', '?__')]);
            }
        }



        // this part is specifically made for CSLive it has dependencies on the code above
        function killCSLiveIntegrate() {
            !!document.querySelector('cslive-desktop-ribbon') && !!document.querySelector('cslive-desktop-ribbon').shadowRoot &&
                !!document.querySelector('cslive-desktop-ribbon').shadowRoot.querySelector('main') &&
                document.querySelector('cslive-desktop-ribbon').shadowRoot.querySelector('cslive-integration-button') && document.querySelector('cslive-desktop-ribbon').shadowRoot.querySelector('cslive-integration-button').remove();
        }

        function csLiveIntegrate() {
            if (window.chrome) {


                function addButton(text, action, containerDocument) {
                    action = action || function () { };
                    killCSLiveIntegrate();
                    var docFrag = document.createDocumentFragment();
                    var buttonWrapper = docFrag.appendChild(document.createElement('cslive-integration-button'));
                    var shadow = buttonWrapper.attachShadow({
                        mode: 'closed'
                    }); //closed so will not be caught by analytics tools.
                    var style = shadow.appendChild(document.createElement('style'));
                    style.innerHTML = 'div {display: flex; width: 200px; z-index: 2000000001;}' +
                        '.actionButton {margin:10px; cursor: pointer; height: 35px; background-color: #4b8ae7; color: #fff; font-size: 16px; padding: 0 16px; border-radius: 4px; width: auto; border: none;}';
                    var containerDiv = shadow.appendChild(document.createElement('div'));
                    var actionButton = containerDiv.appendChild(document.createElement('button'));
                    actionButton.textContent = text;
                    actionButton.className = 'actionButton';
                    actionButton.addEventListener('click', action);

                    if (!!containerDocument.querySelector('cslive-desktop-ribbon') && !!containerDocument.querySelector('cslive-desktop-ribbon').shadowRoot &&
                        !!containerDocument.querySelector('cslive-desktop-ribbon').shadowRoot.querySelector('main div.ribbon__body') && !containerDocument.querySelector('cslive-integration-button')) {
                        containerDocument.querySelector('cslive-desktop-ribbon').shadowRoot.querySelector('main div.ribbon__body').appendChild(docFrag);
                    }
                }

                function sendLoadMessage() {
                    if (window.opener) {
                        window.opener.postMessage({
                            csLoaded: true
                        });
                    }
                }

                /**
                 * 
                 * @param {!Window} win 
                 */
                function listenToCSLive(win) {
                    var openedWindow;
                    var winDoc = win.document;

                    //If CS Live is already opened add the button
                    if (!!winDoc.querySelector('cslive-desktop-ribbon') && !!winDoc.querySelector('cslive-desktop-ribbon').shadowRoot &&
                        !!winDoc.querySelector('cslive-desktop-ribbon').shadowRoot.querySelector('main')) {
                        if (top === self) {
                            addButton('Make URL Generic', function (e) {
                                e.stopPropagation();
                                var url = new URL(getPathNameWithoutUserId(), location.origin);
                                history.pushState({}, '', url);
                                killCSLiveIntegrate();
                            }, winDoc);
                        } else {
                            addButton('Make URL Generic', function (e) {
                                e.stopPropagation();
                                openedWindow = window.open(location.href);
                            }, winDoc);
                        }
                    };

                    //Set a mutation observer to check for whether the CS Live ribbon is added or removed from the DOM
                    const targetNode = winDoc;
                    const config = {
                        childList: true,
                        subtree: true
                    };

                    const callback = (mutationList, observer) => {
                        for (const mutation of mutationList) {
                            for (let node = 0; node < mutation.addedNodes.length; node++) {
                                if (mutation.addedNodes[node].nodeName == 'CSLIVE-DESKTOP-RIBBON') {
                                    if (getPathNameWithoutUserId() !== (location.pathname + location.search)) { // only add button if needed
                                        var times = 10;
                                        var modalInterval = setInterval(function () {
                                            if (!!winDoc.querySelector('cslive-desktop-ribbon') && !!winDoc.querySelector('cslive-desktop-ribbon').shadowRoot &&
                                                !!winDoc.querySelector('cslive-desktop-ribbon').shadowRoot.querySelector('main')) {
                                                clearInterval(modalInterval);
                                                if (top === self) {
                                                    addButton('Make URL Generic', function (e) {
                                                        e.stopPropagation();
                                                        var url = new URL(getPathNameWithoutUserId(), location.origin);
                                                        history.pushState({}, '', url);
                                                        killCSLiveIntegrate();
                                                    }, winDoc);
                                                } else {
                                                    addButton('Make URL Generic', function (e) {
                                                        e.stopPropagation();
                                                        openedWindow = window.open(location.href);
                                                    }, winDoc);
                                                }
                                            } else if (--times <= 0) {
                                                clearInterval(modalInterval);
                                            }
                                        }, 500);
                                    }
                                }
                            }

                            mutation.removedNodes.forEach(x => {
                                if (x.nodeName == 'CSLIVE-DESKTOP-RIBBON') {
                                    killCSLiveIntegrate();
                                }
                            });
                        }
                    };

                    const csLiveObserver = new MutationObserver(callback);
                    csLiveObserver.observe(targetNode, config);

                    window.addEventListener('message', function (e) { // has to be on original window
                        if (e && e.data) {
                            var data = e.data;
                            if (e.source === window.opener && e.origin === location.origin) {
                                if (data && data.doCSURL === true) {
                                    var url = new URL(getPathNameWithoutUserId(), location.origin);
                                    history.pushState({}, '', url);
                                }
                            } else if (openedWindow && e.source === openedWindow && e.origin === location.origin) {
                                if (data && data.csLoaded === true) {
                                    openedWindow.postMessage({
                                        doCSURL: true
                                    });
                                }
                            }
                        }
                    });

                    window.addEventListener('popstate', function () {
                        if (!!winDoc.querySelector('cslive-desktop-ribbon') && !!winDoc.querySelector('cslive-desktop-ribbon').shadowRoot &&
                            !!winDoc.querySelector('cslive-desktop-ribbon').shadowRoot.querySelector('main')) {
                            if (top === self) {
                                addButton('Make URL Generic', function (e) {
                                    e.stopPropagation();
                                    var url = new URL(getPathNameWithoutUserId(), location.origin);
                                    history.pushState({}, '', url);
                                    killCSLiveIntegrate();
                                }, winDoc);
                            } else {
                                addButton('Make URL Generic', function (e) {
                                    e.stopPropagation();
                                    openedWindow = window.open(location.href);
                                }, winDoc);
                            }
                        };
                    });
                }
                if (top === self) {
                    listenToCSLive(window);
                    if (document.readyState === 'complete') {
                        sendLoadMessage();
                    } else {
                        window.addEventListener('load', function () {
                            setTimeout(sendLoadMessage, 5);
                        })
                    }
                } else if (Object.keys(top.location).indexOf('pathname') != -1) {
                    listenToCSLive(top);
                }

            }
        }

    } catch (e) { }
})();