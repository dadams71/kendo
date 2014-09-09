// JavaScript source code
define("components/epg/config", [], function() {
    return {
        Global: {
            debug: !1,
            streamContainer: "#stream-container"
        },
        Arrow: {
            arrows: {
                left: "#scroll-left",
                right: "#scroll-right",
                clone: "#arrow-clone",
                all: ".scroll-button"
            },
            values: {
                animationTime: 300,
                stepSize: 600,
                threshold: 585,
                channelListWidth: 96
            },
            controlBar: "#control-bar",
            epgMain: "#epg"
        },
        Stream: {
            values: {
                panelWidth: 200,
                primeTime: 4049,
                timebarWidth: 150,
                latePrime: "2000",
                earlyPrime: "0700"
            }
        }
    }
}), define("components/epg/modules/arrowModule", ["jquery", "jssignals-1", "superclasses/facade", "locales!nls/all", "utils/browser"], function($, Signals, Facade, epglocal, browser) {
    var Signal = Signals.Signal;
    return function Arrow(settings, mediatorConfig) {
        var cache = {},
            params = {
                _streamLengthWithoutViewport: ""
            },
            methods = {};
        return Facade.extend({
            init: function() {
                params = this.merge(params, settings), browser.isTouchEnabled || this._super()
            },
            scrollButtonHtml: function(direction, text) {
                return '<a id="scroll-' + direction + '" class="scroll-button" title="' + text + '" href=""><div class="scroll-inner">' + text + "</div></a>"
            },
            enableDisableArrows: function(offset, panelFlag) {
                if (browser.isTouchEnabled) return;
                params._streamLengthWithoutViewport = this.calculateStreamWidthMinusViewport(), offset === undefined && (offset = cache.streamContainer.scrollLeft()), offset < 10 && this.isEnabled(cache.arrows.left) ? this.disableArrow(cache.arrows.left) : offset > params._streamLengthWithoutViewport - 10 && this.isEnabled(cache.arrows.right) ? this.disableArrow(cache.arrows.right) : offset >= 10 && !this.isEnabled(cache.arrows.left) ? this.enableArrow(cache.arrows.left) : offset <= params._streamLengthWithoutViewport - 10 && !this.isEnabled(cache.arrows.right) && this.enableArrow(cache.arrows.right)
            },
            calculateStreamWidthMinusViewport: function() {
                return cache.streamContainer.children("ol").width() - cache.streamContainer.width() + params.values.channelListWidth
            },
            enableArrow: function(arrow) {
                var direction = this.getArrowDirection(arrow),
                    translations = {
                        left: epglocal.get("tv_guide_js_arrow_scroll_left_title"),
                        right: epglocal.get("tv_guide_js_arrow_scroll_right_title")
                    };
                arrow.removeClass("disabled").removeAttr("disabled").attr("title", translations[direction]).children("scroll-inner").text(translations[direction])
            },
            disableArrow: function(arrow) {
                var direction = this.getArrowDirection(arrow);
                arrow.addClass("disabled").attr("disabled", "disabled").children("scroll-inner")
            },
            isEnabled: function(arrow) {
                return !arrow.attr("disabled") && !arrow.hasClass("disabled")
            },
            getArrowDirection: function(arrow) {
                var id = arrow.attr("id");
                return id.split("-")[1]
            },
            positionArrowsVertically: function() {
                if (browser.isTouchEnabled) return;
                var threshold = params.values.threshold,
                    arrows = cache.arrows.both.find(".scroll-inner"),
                    arrowOffset = arrows.offset(),
                    windowTop = $(window).scrollTop(),
                    arrowHeight = cache.arrows.both.height(),
                    margin;
                windowTop > 113 ? (windowTop - 153 > arrowHeight / 2 - 108 ? margin = arrowHeight / 2 - 108 : margin = windowTop - 153, arrows.stop(!0).animate({
                    "margin-top": margin
                }, {
                    duration: "fast"
                })) : arrows.attr("style") && arrows.stop(!0).animate({
                    "margin-top": -40
                }, {
                    duration: "fast",
                    complete: function() {
                        $(this).removeAttr("style")
                    }
                })
            },
            attach: function() {
                var that = this;
                $(function() {
                    cache.streamContainer = cache.streamContainer || $(mediatorConfig.streamContainer), cache.epgMain = cache.epgMain || $(params.epgMain), cache.epgMain.append(that.scrollButtonHtml("left", epglocal.get("tv_guide_js_arrow_scroll_left_title")) + that.scrollButtonHtml("right", epglocal.get("tv_guide_js_arrow_scroll_right_title")));
                    var arrowClone = $(params.arrows.left).clone().attr({
                        id: "arrow-clone",
                        title: " ",
                        tabindex: "-1"
                    }).css({
                        left: -5e3,
                        top: 270
                    });
                    cache.epgMain.append(arrowClone), cache.arrows = cache.arrows || {
                        left: $(params.arrows.left),
                        right: $(params.arrows.right),
                        both: $(params.arrows.all).not(params.arrows.clone),
                        clone: $(params.arrows.clone)
                    }, cache.arrows.both.click(function(event, el) {
                        event.preventDefault(), event.stopPropagation();
                        if (that.isEnabled($(this))) {
                            var direction = $(this).attr("id") === "scroll-left" ? -1 : 1;
                            that.signals.ScrollStream.dispatch(direction, params.values.stepSize, params.values.animationTime)
                        }
                    }), $(window).resize(function() {
                        that.enableDisableArrows(cache.streamContainer.scrollLeft())
                    })
                }), this._super()
            },
            signals: {
                ScrollStream: new Signal
            }
        })
    }
}), define("components/epg/modules/fixedHeaderModule", ["jquery", "jssignals-1", "superclasses/facade"], function($, Signals, Facade) {
    var Signal = Signals.Signal;
    return function FixedHeader(settings, mediatorConfig) {
        var cache = {
                time: $("#time"),
                streamContainer: $("#stream-container"),
                dayNav: $(".daynav"),
                scrollButtons: $(".scroll-button")
            },
            params = {
                _fixed: !1
            },
            methods = {};
        return Facade.extend({
            init: function() {
                params = this.merge(params, settings), this._super()
            },
            fixHeader: function() {
                cache.time.scrollLeft(cache.streamContainer.scrollLeft()).css({
                    top: cache.dayNav.height()
                }), params._fixed || (params._fixed = cache.streamContainer.on("scroll.fixedHeader", function() {
                    cache.time.scrollLeft(cache.streamContainer.scrollLeft())
                }))
            },
            unfixHeader: function() {
                params._fixed = !1, cache.streamContainer.off("scroll.fixedHeader"), cache.time.scrollLeft(0).css({
                    top: "auto"
                }), cache.scrollButtons.css("height", "100%")
            },
            signals: {}
        })
    }
}), define("components/epg/modules/streamModule", ["jquery", "jssignals-1", "superclasses/facade", "utils/browser", "utils/istats", "pal/config-mfm"], function($, Signals, Facade, browserUtil, istats, config) {
    var Signal = Signals.Signal;
    return function Stream(settings, mediatorConfig) {
        var cache = {
                endOfDayWidth: $("li.eod").width(),
                shadowRight: $(".shadowRight"),
                scheduleLis: $(".schedule li")
            },
            params = {
                _dragging: !1,
                _click: !0,
                _maxScrollValue: "",
                _streamWidth: ""
            },
            methods = {
                cellMouseEnter: function(cell) {
                    var li = cell.closest("li"),
                        programme = cell.find('a:not(".ellipsis")'),
                        ellipsis = cell.find("a.ellipsis"),
                        spanWidth, padding;
                    if (li.hasClass("hover")) return;
                    spanWidth = Math.max(cell.find("span.title").outerWidth(!0), cell.find("span.time").outerWidth(!0), cell.find("span span").outerWidth(!0)) || cell.find("span").outerWidth(!0), li.addClass("hover"), ellipsis.hide(), programme.focus(), li.hasClass("catchup") || li.hasClass("simulcast") ? padding = 40 : padding = 15, spanWidth += padding;
                    if (spanWidth > li.width() || li.hasClass("continues")) li.hasClass("continues") && (spanWidth = li.width() + cache.endOfDayWidth), li.addClass("expanded"), cell.stop(!0).css("width", "+=5").css("z-index", "105").animate({
                        width: spanWidth
                    }, 300, function() {
                        cell.css("overflow", "visible")
                    })
                },
                cellMouseLeave: function(cell) {
                    var li = cell.closest("li"),
                        ellipsis = cell.find("a.ellipsis"),
                        width = cell.parent().width();
                    cell.stop(!0).animate({
                        width: width
                    }, 100, function() {
                        li.removeClass("hover").removeClass("expanded"), cell.css("z-index", "0"), ellipsis.show()
                    })
                }
            };
        return Facade.extend({
            init: function() {
                params = this.merge(params, settings), this._super()
            },
            initialStreamPositioning: function() {
                var that = this;
                $("#on-now").length ? this.scrollToOnNow() : cache.streamContainer.animate({
                    scrollLeft: params.values.primeTime
                }, function() {
                    that.signals.OnNowFocused.dispatch(cache.streamContainer.scrollLeft())
                })
            },
            scrollToOnNow: function() {
                var that = this,
                    scrollTo = parseInt($("#on-now").css("left"), 10) - cache.streamContainer.width() / 2;
                cache.streamContainer.animate({
                    scrollLeft: scrollTo
                }, function() {
                    that.signals.OnNowFocused.dispatch(), $("#now-on a").css("display", "none");
                    var first = !1,
                        scrolling = cache.streamContainer.on("scroll.stream", function() {
                            first === !0 && !$("#now-on a").is(":visible") ? ($("#now-on a").css("display", "block"), cache.streamContainer.unbind("scroll.stream")) : first === !1 && (first = !0)
                        })
                })
            },
            scrollStream: function(direction, offset, time) {
                var offsetPrefix = direction > 0 ? "+=" : "-=",
                    that = this;
                cache.streamContainer.stop(!0, !0).animate({
                    scrollLeft: offsetPrefix + offset
                }, time, function() {
                    that.signals.ScrollStreamCompleted.dispatch(cache.streamContainer.scrollLeft())
                })
            },
            slideStream: function() {
                var streamContainerOuter = $("#stream-container-outer"),
                    start = 0,
                    that = this;
                browserUtil.isTouchEnabled || (streamContainerOuter.mousedown(function(event) {
                    event.preventDefault(), event.stopPropagation(), that.ieDragging(!1), params._click = !0, params._dragging = !0, start = event.clientX
                }).mousemove(function(event) {
                    params._dragging && (event.preventDefault(), event.stopPropagation(), params._click = !1, start = that.slideStreamLogic(start, event.clientX))
                }), $("body.epg").bind("mouseup mouseleave", function(event) {
                    params._dragging && (event.preventDefault(), event.stopPropagation(), params._dragging = !1, that.ieDragging(!0))
                })), browserUtil.isTouchEnabled && (browserUtil.isIOS && !browserUtil.hasAtLeastIOSVersion(5, 0, 0) || browserUtil.isAndroid && browserUtil.androidVersion < 4.1 || browserUtil.isKindle) && streamContainerOuter.bind("touchstart", function(event) {
                    params._click = !0, params._dragging = !0, start = event.originalEvent.targetTouches[0].pageX
                }).bind("touchmove", function(event) {
                    params._dragging && (params._click = !1, start = that.slideStreamLogic(start, event.originalEvent.targetTouches[0].pageX))
                }).bind("touchend", function(event) {
                    browserUtil.isPlayBook || event.preventDefault(), params._dragging = !1
                })
            },
            slideStreamLogic: function(startPosition, mousePosition) {
                var newLeft = parseInt(cache.streamContainer.scrollLeft() + (startPosition - mousePosition), 10);
                return newLeft = newLeft < 0 ? 0 : newLeft > params._maxScrollValue ? params._maxScrollValue : newLeft, cache.streamContainer.scrollLeft(newLeft), this.signals.SlideStreamCompleted.dispatch(cache.streamContainer.scrollLeft()), mousePosition
            },
            adjustStream: function(item) {
                var scrollAmount = item.position().left + item.width() / 2 - cache.streamContainer.width() / 2,
                    that = this;
                cache.scheduleLis.removeClass("highlight"), item.closest("li").addClass("highlight"), cache.streamContainer.stop().animate({
                    scrollLeft: "+=" + scrollAmount
                }, function() {
                    that.signals.StreamAdjusted.dispatch(cache.streamContainer.scrollLeft())
                })
            },
            resizeStream: function(panelOpen) {
                var width, that = this;
                panelOpen ? (width = params._streamWidth + params.values.panelWidth, cache.shadowRight.hide()) : (cache.shadowRight.show(), width = params._streamWidth), params._maxScrollValue = width, $("#stream-container ol").animate({
                    width: width
                }).promise().done(function() {
                    that.signals.StreamResized.dispatch(cache.streamContainer.scrollLeft(), panelOpen)
                })
            },
            ieDragging: function(flag) {
                document.body.onselectstart = function() {
                    return flag
                }, document.body.ondragstart = function() {
                    return flag
                }
            },
            attach: function() {
                var that = this;
                $(document).ready(function() {
                    cache.streamContainer = cache.streamContainer || $(mediatorConfig.streamContainer), $(".schedule").on({
                        mouseenter: function() {
                            methods.cellMouseEnter($(this))
                        },
                        mouseleave: function() {
                            methods.cellMouseLeave($(this))
                        },
                        focusin: function() {
                            methods.cellMouseEnter($(this))
                        },
                        focusout: function() {
                            methods.cellMouseLeave($(this))
                        }
                    }, "li div.outer"), $("#on-now").length && ($("#now-on a").css("display", "none"), $("#on-now a").on("click", function() {
                        return that.initialStreamPositioning(), istats.fireLog({}, "on-now-in-schedule", "click"), !1
                    }), $("#now-on a").on("click", function() {
                        return that.initialStreamPositioning(), istats.fireLog({}, "on-now-left", "click"), !1
                    })), $(".skip-link").click(function(event, el) {
                        event.preventDefault(), event.stopPropagation();
                        var channel, time, element, pixelstoScroll;
                        channel = $(this).parent("li").attr("id").substr(8), $("#on-now").length ? ($("#" + channel + "-on-now").focus(), that.scrollToOnNow()) : (element = $("#" + channel + "-primetime").focus(), time = config.primetime[channel] || config.primetime.defaultTime, time === params.values.latePrime ? pixelstoScroll = params.values.primeTime + params.values.timebarWidth : time === params.values.earlyPrime ? pixelstoScroll = params.values.primeTime - params.values.timebarWidth * 12 : pixelstoScroll = params.values.primeTime, cache.streamContainer.animate({
                            scrollLeft: pixelstoScroll - cache.streamContainer.width() / 2
                        }))
                    }), params._streamWidth = params._maxScrollValue = cache.streamContainer.children("ol").width()
                }), $("#stream-container .schedule").on("click", "li:not(.sod, .eod)", function(event, el) {
                    event.preventDefault(), event.stopPropagation(), params._click && (that.adjustStream($(this)), that.resizeStream(!0), that.signals.ShowPanel.dispatch($(this)))
                }), this._super()
            },
            signals: {
                ScrollStreamCompleted: new Signal,
                SlideStreamCompleted: new Signal,
                StreamAdjusted: new Signal,
                StreamResized: new Signal,
                OnNowFocused: new Signal,
                ShowPanel: new Signal
            }
        })
    }
}), define("components/epg/modules/stickyModule", ["jquery", "jssignals-1", "superclasses/facade"], function($, Signals, Facade) {
    var Signal = Signals.Signal;
    return function Sticky(settings, mediatorConfig) {
        var cache = {
                _items: []
            },
            params = {},
            methods = {};
        return Facade.extend({
            init: function() {
                this._super()
            },
            attach: function() {
                $(document).ready(function() {
                    cache._selector = $("#stream-container .stickytext");
                    var i = cache._selector.length,
                        item, channels_container = $("#channels"),
                        container_outer = $("#stream-container-outer");
                    while (i--) item = $(cache._selector[i]), cache._items[i] = {
                        stickyElement: item,
                        stickyElementParent: item.parent(),
                        stickyElementParentWidth: item.parent().width()
                    };
                    document.getElementById("stream-container").onscroll = function() {
                        cache._containerOffset = container_outer.offset().left + channels_container.width();
                        var stickyPosition, item, i = cache._selector.length;
                        while (i--) item = cache._items[i], stickyPosition = cache._containerOffset - item.stickyElementParent.offset().left, stickyPosition > 0 && stickyPosition < item.stickyElementParentWidth ? cache._selector[i].style.left = stickyPosition + "px" : parseInt(cache._selector[i].style.left, 10) !== 0 && (cache._selector[i].style.left = "0px")
                    }
                }), this._super()
            },
            signals: {}
        })
    }
}), define("components/epg/mediator", ["require", "jquery", "jssignals-1", "superclasses/mediator", "components/epg/config", "./modules/arrowModule", "./modules/fixedHeaderModule", "./modules/streamModule", "./modules/stickyModule", "utils/browser", "utils/istats"], function(require, $, Signals, Mediator, config, Arrow, FixedHeader, Stream, Sticky, browser, istats) {
    var Signal = Signals.Signal,
        mediator = Mediator.extend({
            config: config,
            modules: {},
            moduleConstructors: [],
            init: function(settings) {
                browser.isTouchEnabled || this.addModules(Sticky), this.addModules(Arrow, Stream, FixedHeader), this._super(settings)
            },
            run: function() {
                var that = this;
                this.modules.Stream.slideStream(), this.modules.Stream.initialStreamPositioning(), $("#bbc_one").on("focus", "a", function() {
                    window.scrollTo(0, 0)
                }), $("#startofday a").on("focus", function() {
                    $("#stream-container").scrollLeft(0)
                }), $(window).scroll(function() {
                    that.modules.Arrow.positionArrowsVertically()
                })
            },
            adjustStream: function() {
                var item = arguments[0];
                this.modules.Stream.adjustStream(item)
            },
            resizeStream: function() {
                var panelOpen = arguments[0];
                this.modules.Stream.resizeStream(panelOpen)
            },
            onArrowScrollStream: function() {
                var direction = arguments[0],
                    offset = arguments[1],
                    time = arguments[2];
                direction === 1 ? istats.fireLog({}, "paginate-right", "click") : istats.fireLog({}, "paginate-left", "click"), this.modules.Stream.scrollStream(direction, offset, time)
            },
            onStreamScrollStreamCompleted: function() {
                var offset = arguments[0];
                this.enableDisableArrows(offset)
            },
            onStreamSlideStreamCompleted: function() {
                var offset = arguments[0];
                this.enableDisableArrows(offset)
            },
            onStreamShowPanel: function() {
                var item = arguments[0];
                this.signals.ShowPanel.dispatch(item)
            },
            onStreamStreamAdjusted: function() {
                var offset = arguments[0];
                this.enableDisableArrows(offset)
            },
            onStreamStreamResized: function() {
                var offset = arguments[0],
                    panelIsOpen = arguments[1];
                this.enableDisableArrows(offset, panelIsOpen)
            },
            onStreamOnNowFocused: function() {
                this.modules.Arrow.enableDisableArrows()
            },
            fixHeader: function() {
                this.modules.Arrow.positionArrowsVertically(), this.modules.FixedHeader.fixHeader()
            },
            unfixHeader: function() {
                this.modules.Arrow.positionArrowsVertically(), this.modules.FixedHeader.unfixHeader()
            },
            enableDisableArrows: function(offset, panelIsOpen) {
                panelIsOpen !== undefined ? this.modules.Arrow.enableDisableArrows(offset, panelIsOpen) : this.modules.Arrow.enableDisableArrows(offset)
            },
            signals: {
                ShowPanel: new Signal
            }
        });
    return mediator
}), define("utils/throttle", [], function() {
    return function throttle(fn, threshhold, scope) {
        threshhold = threshhold || 250;
        var last, deferTimer;
        return function() {
            var context = scope || this,
                now = +(new Date),
                args = arguments;
            last && now < last + threshhold ? (clearTimeout(deferTimer), deferTimer = setTimeout(function() {
                last = now, fn.apply(context, args)
            }, threshhold)) : (last = now, fn.apply(context, args))
        }
    }
}), define("components/dayNav/modules/daynav", ["jquery", "jssignals-1", "superclasses/facade", "utils/browser", "utils/throttle"], function($, Signals, Facade, browser, throttle) {
    var Signal = Signals.Signal;
    return function Daynav(settings, mediatorConfig) {
        settings = settings || {};
        var cache = {
                windowOb: $(window),
                nav: $(".daynav"),
                mainDiv: $(".main"),
                ghostHeight: 0,
                widthFollowers: $(settings.widthFollowers)
            },
            navGhost = $("<div/>", {
                "class": "daynav daynavGhost",
                height: 0
            }).insertAfter(cache.nav),
            cachedTop, enableSticky = (browser.isAndroid === !1 || browser.isChrome) && browser.isIOS === !1 && browser.isWindowsPhoneApp === !1 && (browser.msieVersion === !1 || browser.msieVersion > 7);
        return Facade.extend({
            config: {},
            modules: {},
            moduleConstructors: [],
            init: function() {
                settings && "heightSelectors" in settings ? $.each(settings.heightSelectors, function(i, x) {
                    cache.ghostHeight += $(x).height()
                }) : cache.ghostHeight = cache.nav.height(), this._super(settings)
            },
            attach: function() {
                var that = this,
                    scrolled;
                enableSticky && (scrolled = function() {
                    var scrollTop = cache.windowOb.scrollTop();
                    !cache.nav.hasClass("fixed") && scrollTop > cache.nav.offset().top ? (cachedTop = cache.nav.offset().top, cache.nav.addClass("fixed"), cache.mainDiv.addClass("fixed"), cache.widthFollowers.width(navGhost.width()), navGhost.height(cache.ghostHeight), that.signals.Fix.dispatch()) : cache.nav.hasClass("fixed") && scrollTop < cachedTop && (cache.nav.removeClass("fixed"), cache.mainDiv.removeClass("fixed"), cache.widthFollowers.width(""), navGhost.height(0), that.signals.Unfix.dispatch())
                }, browser.isAndroid && (scrolled = throttle(scrolled, 0)), cache.windowOb.on("scroll.daynav", scrolled), cache.windowOb.on("resize.daynav", function() {
                    cache.nav.hasClass("fixed") && cache.widthFollowers.width(navGhost.width())
                }))
            },
            signals: {
                Fix: new Signal,
                Unfix: new Signal
            }
        })
    }
}), define("components/dayNav/config", [], function() {
    return {
        Global: {
            debug: !1
        }
    }
}), define("components/dayNav/mediator", ["jquery", "jssignals-1", "superclasses/mediator", "./modules/daynav", "components/dayNav/config"], function($, Signals, Mediator, Daynav, config) {
    var Signal = Signals.Signal,
        mediator = Mediator.extend({
            config: config,
            modules: {},
            moduleConstructors: [],
            init: function(settings) {
                config.Daynav = settings, this.addModules(Daynav), this._super()
            },
            run: function() {
                this._super()
            },
            onDaynavFix: function() {
                this.signals.Fix.dispatch()
            },
            onDaynavUnfix: function() {
                this.signals.Unfix.dispatch()
            },
            signals: {
                Fix: new Signal,
                Unfix: new Signal
            }
        });
    return mediator
}), define("components/panel/config", [], function() {
    return {
        Global: {
            debug: !1
        },
        Panel: {
            imageWidth: 178,
            imageHeight: 100,
            titleLength: 30,
            subtitleLength: 23,
            shortSynopsis: 75
        }
    }
}), define("components/panel/modules/panelModule", ["jquery", "jssignals-1", "superclasses/facade", "locales!nls/all", "utils/date", "mustache", "orb/fig"], function($, Signals, Facade, locales, dateUtil, Mustache, fig) {
    var Signal = Signals.Signal;
    return function Panel(settings, mediatorConfig) {
        var cache = {
                closeButton: null,
                programmesButton: $(".panel a.info")
            },
            templates = {
                main: $("#panel-template").remove().html(),
                offair: $("#panel-offair-template").remove().html(),
                error: $("#panel-error-template").remove().html()
            },
            params = {
                _schedule: [],
                _currentPid: "",
                _serviceId: "",
                _clickedItem: ""
            },
            methods = {};
        return Facade.extend({
            init: function() {
                params = this.merge(params, settings), this._super()
            },
            getPanelHtml: function(episodeData, content) {
                return '<div class="panel"><div class="panel-container"><div class="content">' + this.getPanelContent(episodeData, content) + "</div>" + "</div>" + "</div>" + '<div class="panel-shadow"></div>'
            },
            getPanelContent: function(episodeData, content) {
                var html, isOffair = episodeData === "offair",
                    isLoading = episodeData === "loading",
                    isError = episodeData === "error",
                    dayPhrase, onNow, epgTemplateData, startTime, endTime;
                return isLoading ? html = '<div id="panel-loading">' + locales.get("tv_guide_js_loading_wait") + "</div>" : isError ? html = Mustache.render(templates.error, {
                    closeButtonText: locales.get("tv_guide_js_close_button_action")
                }) : isOffair ? html = Mustache.render(templates.offair, {
                    offline: locales.get("tv_guide_js_channel_off_air"),
                    title: params._clickedItem.find("span span").text(),
                    closeButtonText: locales.get("tv_guide_js_close_button_action")
                }) : (onNow = episodeData.startTime <= Math.round((new Date).getTime() / 1e3) && Math.round((new Date).getTime() / 1e3) <= episodeData.endTime ? !0 : !1, epgTemplateData = {
                    startTime: dateUtil.getHoursMinutes(episodeData.startTime, !0),
                    endTime: dateUtil.getHoursMinutes(episodeData.endTime, !0),
                    episode: {
                        url: fig.uk ? episodeData.url : "http://www.bbc.co.uk/programmes/" + episodeData.pid,
                        imageUrl: episodeData.imageTemplate.replace("$w", params.imageWidth).replace("$h", params.imageHeight),
                        synopsis: this.truncate(episodeData.shortSynopsis, params.shortSynopsis),
                        subTitle: episodeData.subtitle,
                        title: episodeData.title,
                        pid: episodeData.pid
                    },
                    versions: {
                        ad: episodeData.isAD ? locales.get("audio_described") : !1,
                        signed: episodeData.isSigned ? locales.get("signed") : !1,
                        hd: episodeData.isHD ? locales.get("high_definition") : !1
                    },
                    repeatIndicator: episodeData.isRepeat ? "R" : !1,
                    catchupType: !1,
                    onNow: onNow,
                    showProgrammeLink: !episodeData.isPartner,
                    locals: {
                        epgOnNow: locales.get("tv_guide_js_on_now_badge"),
                        comingSoonCta: !1,
                        channelName: locales.get(content.unregional_id),
                        programmesLink: locales.get("tv_guide_js_panel_programmes_link")
                    },
                    closeButtonText: locales.get("tv_guide_js_close_button_action"),
                    channelId: content.channel_id
                }, episodeData.isPartner && (epgTemplateData.onNow = !1), onNow && !episodeData.isPartner ? epgTemplateData.catchupType = "iplayer" : episodeData.isCatchup ? epgTemplateData.catchupType = episodeData.isPartner ? "play" : "iplayer" : episodeData.isAvailable === "FUTURE" && !onNow ? epgTemplateData.locals.comingSoonCta = locales.get("tv_guide_js_episode_coming_soon") : episodeData.isAvailable !== "FUTURE" && !episodeData.isCatchup && (epgTemplateData.locals.unvailableCta = locales.get("tv_guide_js_episode_unavailable")), html = Mustache.render(templates.main, epgTemplateData)), html
            },
            showPanel: function(item) {
                params._clickedItem = item, this.setPanelData(params._clickedItem.closest("ol").attr("data-src"), params._clickedItem.closest("li").attr("data-pid"))
            },
            setPanelData: function(service, pid) {
                params._serviceId = service, params._currentPid = pid, params._currentPid === undefined || params._schedule[params._serviceId] === undefined ? (this.displayPanel("loading", "loading"), this.getScheduleInformation(params._currentPid, params._serviceId)) : this.displayPanel(params._schedule[params._serviceId], params._currentPid)
            },
            displayPanel: function(content, pid) {
                var that = this,
                    data = pid === "loading" ? "loading" : pid === "error" ? "error" : pid === "offair" ? "offair" : content.schedule[pid],
                    scrollRightButton;
                $(".panel").length === 0 ? ($("#epg-wrapper").append(this.getPanelHtml(data, content)), scrollRightButton = $("#scroll-right").hide(), $(".panel, .panel-shadow").animate({
                    right: 0
                }).promise().done(function() {
                    scrollRightButton.show(), that.panelButtonSetup(), that.signals.PanelOpened.dispatch(params._clickedItem)
                })) : ($(".panel .content").html(this.getPanelContent(data, content)), that.panelButtonSetup(), that.signals.PanelUpdate.dispatch(params._clickedItem))
            },
            panelButtonSetup: function() {
                var that = this,
                    TAB_KEYCODE = 9;
                cache.closeButton = $(".panel .close"), cache.lastLink = $(".panel a").last(), cache.closeButton.focus().on("click.panel", function(e) {
                    e.preventDefault(), e.stopPropagation(), that.destroyPanel()
                }), cache.closeButton.on("keydown", function(event) {
                    event.keyCode === TAB_KEYCODE && event.shiftKey && (event.preventDefault(), cache.lastLink.focus())
                }), cache.lastLink.on("keydown", function(event) {
                    event.keyCode === TAB_KEYCODE && !event.shiftKey && (event.preventDefault(), cache.closeButton.focus())
                })
            },
            destroyPanel: function() {
                var that = this;
                $(".schedule li").removeClass("highlight"), $(".panel, .panel-shadow").animate({
                    right: -200
                }, function() {
                    $(this).remove()
                }), that.signals.PanelClosed.dispatch(params._clickedItem)
            },
            getScheduleInformation: function(pid, serviceId) {
                var that = this,
                    startTime = mediatorConfig.date;
                $.getJSON("/iplayer/pagecomponents/nownext/schedule.json", {
                    service: serviceId,
                    start: startTime
                }).done(function(data) {
                    mediatorConfig.debug && console.log("got programme data: " + serviceId + " from " + startTime), params._schedule[serviceId] = data, pid === undefined ? that.displayPanel(data, "offair") : that.displayPanel(data, pid)
                }).fail(function() {
                    mediatorConfig.debug && console.log("failed programme data: " + serviceId + " from " + startTime), that.displayPanel("error", "error")
                })
            },
            truncate: function(string, length) {
                return string.length > length ? string.substr(0, length) + "..." : string
            },
            attach: function() {
                this._super()
            },
            signals: {
                PanelClosed: new Signal,
                PanelOpened: new Signal,
                PanelUpdate: new Signal
            }
        })
    }
}), define("components/linkTracking/modules/epgPanelTracking", ["jquery", "superclasses/facade", "utils/istats"], function($, Facade, istatsUtil) {
    return function EpgPanelTracking(settings, mediatorConfig) {
        var cache = {
                region: $("#epg .panel"),
                links: $("#epg .panel .stat")
            },
            stats = {
                prev_timeliness_type: null,
                prev_schedule_channel: null
            };
        return Facade.extend({
            init: function() {
                istatsUtil.addTrackingRegion(cache.region, "none"), cache.links.each(this.addLinkStat), this._super()
            },
            update: function() {
                cache.region = $("#epg .panel"), cache.links = $("#epg .panel .stat"), istatsUtil.addTrackingRegion(cache.region, "none"), cache.links.each(this.addLinkStat)
            },
            addLinkStat: function(i, el) {
                var options = $.extend({}, stats),
                    $el = $(el),
                    $content = $el.closest(".content"),
                    trackingStr = istatsUtil.getTrackingString(),
                    key, params;
                el.linktrack = trackingStr, options.prev_schedule_channel = $el.attr("data-channel"), $content.find(".coming-soon").length ? options.prev_timeliness_type = "coming-soon" : $content.find(".unavailable").length ? options.prev_timeliness_type = "not-available" : $content.find(".on-now").length && (options.prev_timeliness_type = "on-now");
                for (key in options) options[key] === null && delete options[key];
                params = $.param(options), params && (el.linktrack += "&" + params)
            }
        })
    }
}), define("components/panel/mediator", ["require", "jquery", "jssignals-1", "superclasses/mediator", "components/panel/config", "./modules/panelModule", "components/linkTracking/modules/epgPanelTracking"], function(require, $, Signals, Mediator, config, Panel, EpgPanelTracking) {
    var Signal = Signals.Signal,
        mediator = Mediator.extend({
            config: config,
            modules: {},
            moduleConstructors: [],
            init: function(settings) {
                this._super(settings), this.addModules(Panel, EpgPanelTracking)
            },
            run: function() {
                this._super()
            },
            showPanelData: function() {
                var item = arguments[0];
                this.modules.Panel.showPanel(item)
            },
            onPanelPanelOpened: function() {
                var item = arguments[0];
                this.signals.PanelOpened.dispatch(item), this.modules.EpgPanelTracking.update()
            },
            onPanelPanelClosed: function() {
                var item = arguments[0];
                this.signals.PanelClosed.dispatch(item)
            },
            onPanelPanelUpdate: function() {
                var item = arguments[0];
                this.signals.PanelUpdate.dispatch(item), this.modules.EpgPanelTracking.update()
            },
            signals: {
                AdjustStream: new Signal,
                PanelOpened: new Signal,
                PanelClosed: new Signal,
                PanelUpdate: new Signal
            }
        });
    return mediator
}), define("pageMediators/epgMediator", ["jquery", "jRespond", "components/epg/mediator", "components/dayNav/mediator", "components/panel/mediator", "utils/browser", "utils/istats", "module"], function($, jRespond, Epg, DayNav, Panel, browser, istats, module) {
    var config = module.config(),
        epg, panel, daynav, focussedItem;
    config.epgError || (epg = new Epg, panel = new Panel(config), daynav = new DayNav({
        widthFollowers: ".daynav, .curved-shadow.horizontal"
    })), config.epgError || (epg.signals.ShowPanel.add(function() {
        var item = arguments[0];
        focussedItem = item.find("a"), panel.showPanelData(item), window.scrollTo(0, 0)
    }), panel.signals.PanelOpened.add(function() {
        var item = arguments[0];
        istats.fireLog({
            schedule_channel: $(item).closest("ol").attr("data-src"),
            episode_id: $(item).attr("data-pid"),
            episode_title: $(".title", item).text()
        }, "sidepanel-open", "click")
    }), panel.signals.PanelClosed.add(function() {
        var item = arguments[0];
        epg.resizeStream(!1), istats.fireLog({
            schedule_channel: $(item).closest("ol").attr("data-src"),
            episode_id: $(item).attr("data-pid"),
            episode_title: $(".title", item).text()
        }, "sidepanel-close", "click"), focussedItem.focus()
    }), panel.signals.PanelUpdate.add(function() {
        var item = arguments[0];
        epg.adjustStream(item), epg.resizeStream(!0), istats.fireLog({
            schedule_channel: $(item).closest("ol").attr("data-src"),
            episode_id: $(item).attr("data-pid"),
            episode_title: $(".title", item).text()
        }, "sidepanel-refresh", "click")
    }), daynav.signals.Fix.add(function() {
        epg.fixHeader()
    }), daynav.signals.Unfix.add(function() {
        epg.unfixHeader()
    })), $(document).ready(function() {
        browser.isAndroid && browser.androidVersion < 4.1 && $("#stream-container").css({
            overflow: "hidden",
            "overflow-x": "hidden",
            "overflow-y": "hidden"
        }), config.epgError || epg.run(), $(window).trigger("scroll")
    })
});