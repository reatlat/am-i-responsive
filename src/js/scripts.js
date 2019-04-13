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


            $('#show-info').click(function () {
                showDialog({
                    title: window.ami_config.information.title,
                    text: window.ami_config.information.content
                })
            });
            $('#show-action').click(function () {
                showDialog({
                    title: window.ami_config.action.title,
                    text: window.ami_config.action.content,
                    positive: {
                        title: window.ami_config.action.positive_title,
                        onClick: function (e) {
                            alert('Action performed!');
                        }
                    }
                });
            });

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