"use strict";

(function ($) {

    /**
     * $('#element').donetyping(callback[, timeout=1000])
     *
     * source: http://stackoverflow.com/a/14042239/3705299
     *
     * Fires callback when a user has finished typing. This is determined by the time elapsed
     * @callback: function to be called when even triggers
     * @timeout:  (default=1000) timeout, in ms, to to wait before triggering event if not caused by blur.
     * Requires jQuery 1.7+
     * Tested with jQuery 1.11.3
     * @link https://gist.github.com/reatlat/88aed7c17acaeea99fbd58a5d99cb7e3
     */
    $.fn.extend({

        donetyping: function (callback, timeout) {

            timeout = timeout || 1e3; // 1 second default timeout

            var timeoutReference,

                doneTyping = function (el) {

                    if (!timeoutReference) return;
                    timeoutReference = null;
                    callback.call(el);
                };
            return this.each(function (i, el) {
                var $el = $(el);
                // Chrome Fix (Use keyup over keypress to detect backspace)
                // thank you @palerdot
                $el.is(':input') && $el.on('keyup keypress paste', function (e) {
                    // This catches the backspace button in chrome, but also prevents
                    // the event from triggering too preemptively. Without this line,
                    // using tab/shift+tab will make the focused element fire the callback.
                    if (e.type == 'keyup' && e.keyCode != 8) return;

                    // Check if timeout has been set. If it has, "reset" the clock and
                    // start over again.
                    if (timeoutReference) clearTimeout(timeoutReference);
                    timeoutReference = setTimeout(function () {
                        // if we made it here, our timeout has elapsed. Fire the
                        // callback
                        doneTyping(el);
                    }, timeout);
                }).on('blur', function () {
                    // If we can, fire the event since we're leaving the field
                    doneTyping(el);
                });
            });
        }
    });


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
                let url = window.AMI._checkUrl( $('#domain').val() );

                // update url address bar
                window.history.pushState(null,null, location.origin + '/?url=' + url);

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
        debug: true
    });

    window.AMI._init();


})(jQuery);