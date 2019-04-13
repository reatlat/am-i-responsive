"use strict";

(function ($) {

    //@prepros-prepend vendor/_mdl-jquery-modal-dialog.js
    //@prepros-prepend vendor/_jquery-donetyping.js

    class AMI {

        constructor({
                        debug = false
                    }) {
            this.debug = debug;
        }


        /**
         * Initial base scripts
         */
        _init() {
            this._debugLog('_init() =>', this);
            this._initTriggers();
            this._initDraggable();
            this._EuAccCookies();
        }


        /**
         * Debug console output, and show hidden params
         *
         * @param args
         */
        _debugLog(...args) {
            if (this.debug) {
                console.log('🦄 AMI:', ...args);
            }
        }


        /**
         * Initial triggers
         */
        _initTriggers() {
            this._debugLog('_initTriggers()');

            $('#ami-share-buttons').on('click', function (e) {
                $('.addthis_toolbox_wrapper').toggleClass('active');
            });
            $('#domain').donetyping(function () {
                window.AMI._debugLog('donetiping');
                let url = window.AMI._checkUrl($('#domain').val());

                // update url address bar
                window.history.pushState(null, null, location.origin + '/?url=' + url);

                // update addThis @link https://www.addthis.com/academy/
                window.addthis_share.url = window.location.href;
                window.addthis_share.title = window.document.title + " - " + url;
                window.addthis.toolbox('.addthis_toolbox');

                $("iframe").attr('src', url);
            }, 1000);

            if (this._GET('url')) {
                window.AMI._debugLog('Use URL params');
                let url = window.AMI._checkUrl(this._GET('url'));
                $('#domain-input-wrapper').addClass('is-dirty');
                $('#domain').val(url);
                $("iframe").attr('src', url);
            }

            $('.mdl-js-popup').on('click', function (event) {
                event.preventDefault();
                let target = $(event.target).attr('data-mdl-popup-action');
                window.AMI._debugLog('Popup target', target);
                window.AMI._openPopup(target);
            });
        }


        /**
         * Open Popups
         * @param target
         * @private
         */
        _openPopup(target) {
            switch (target) {
                case "tos":
                    showDialog({
                        title: window.ami_config.tos.title,
                        text: window.ami_config.tos.content
                    });
                    break;
                case "gdpr":
                    showDialog({
                        title: window.ami_config.gdpr.title,
                        text: window.ami_config.gdpr.content,
                        onHidden: function (e) {
                            // only for EU countries we made loop to get accept cookies :) F@ck GDPR law!
                            window.AMI._EuAccCookies();
                        }
                    });
                    break;
                case "mit":
                    showDialog({
                        title: window.ami_config.mit.title,
                        text: window.ami_config.mit.content
                    });
                    break;
                case "cookies":
                    showDialog({
                        title: window.ami_config.cookies.title,
                        text: window.ami_config.cookies.content,
                        cancelable: false,
                        negative: {
                            title: window.ami_config.cookies.negative_title,
                            onClick: function (e) {
                                window.AMI._openPopup('gdpr');
                            }
                        },
                        positive: {
                            title: window.ami_config.cookies.positive_title,
                            onClick: function (e) {
                                window.AMI._debugLog('EuAccCookies accepted');
                                Cookies.set('EuAccCookies', '1', {expires: 30, path: '/'});
                            }
                        }
                    });
                    break;
                default:
                // TODO: default code block :)
            }
        }

        /**
         * Is user come from Europe
         * This part integrated with my NGINX server
         */
        _isEurope() {
            let req = new XMLHttpRequest();
            req.open('GET', document.location, false);
            req.send(null);

            let euCountries = ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HU', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];

            let isEU = euCountries.includes(req.getResponseHeader("x-country"));
            window.AMI._debugLog('_isEurope()', isEU);

            return isEU;
        }


        /**
         * Set EU cookies
         * @private
         */
        _EuAccCookies() {
            if (!Cookies.get('EuAccCookies') && this._isEurope()) {
                this._openPopup('cookies');
            }
        }

        /**
         * Check URL
         * @param url
         * @returns {string}
         * @private
         */
        _checkUrl(url) {
            if (!url.match(/^[a-zA-Z]+:\/\//)) {
                url = 'http://' + url;
                $('#domain').val(url)
            }

            return url;
        }


        /**
         * Make devices draggable
         * @private
         */
        _initDraggable() {
            let a = 3;
            $('.desktop,.laptop,.tablet,.mobile').draggable({
                start: function (event, ui) {
                    $(this).css("z-index", a++);
                }
            });
            $('.display div').click(function () {
                $(this).addClass('top').removeClass('bottom');
                $(this).siblings().removeClass('top').addClass('bottom');
                $(this).css("z-index", a++);
            });
        }


        /**
         * GET requests from links
         *
         * @param {string} param
         * @param {string} url
         * @returns {*}
         */
        _GET(param, url) {
            url = url ? url : window.location.href;
            this._debugLog('_GET() => ', param, url);
            let vars = {};
            url.replace(location.hash, '').replace(/[?&]+([^=&]+)=?([^&]*)?/gi, function (m, key, value) {
                vars[key] = value !== void 0 ? value : '';
            });
            if (param) {
                if (vars[param]) {
                    return vars[param];
                } else {
                    return null;
                }
            }
            return vars;
        };

    }

    window.AMI = new AMI({
        debug: false
    });

    window.AMI._init();


})(jQuery);