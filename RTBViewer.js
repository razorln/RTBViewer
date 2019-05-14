var WidgetTypes;
(WidgetTypes = function () {
    var t = WidgetTypes;
    t.Text = 4;
    t.Sticker = 5;
    t.Image = 1;
})();

var RendererType;
(function (RendererType) {
    RendererType[RendererType["html"] = 0] = "html";
    RendererType[RendererType["canvas"] = 1] = "canvas";
})(RendererType || (RendererType = {}));

var RTBViewer = (function () {
    function RTBViewer(settings) {
        this.widgets = [];
        this.blocks = [];
        this.prevCursorPosition = { x: 0, y: 0 };
        this.scale = 1;
        this.settings = settings;
        this.init();
    }
    RTBViewer.prototype.init = function () {
        this.loadJSON(this.respLoadJSON);
    };

    RTBViewer.prototype.respLoadJSON = function (responseText) {
        var widgets, stikerIndex = 0, i;
        this.source = JSON.parse(responseText);
        this.scale = this.getScale();
        widgets = this.source.widgets;
        for (i = 0; i < widgets.length; i++) {
            switch (widgets[i].type) {
                case WidgetTypes.Image:
                    WidgetText;
                    this.widgets.push(new WidgetImage(widgets[i]));
                    break;
                case WidgetTypes.Text:
                    this.widgets.push(new WidgetText(widgets[i]));
                    break;
                case WidgetTypes.Sticker:
                    widgets[i].url = ImageRes.stickerBg[stikerIndex % ImageRes.stickerBg.length];
                    stikerIndex++;
                    this.widgets.push(new WidgetSticker(widgets[i]));
                    break;
            }
        }

        this.render();
        this.prepareBlocks();
        this.createRenderer();
    };

    RTBViewer.prototype.render = function () {
        var content = this.settings.container, panel = this.createPanel();

        this.boardBox = document.createElement('div');
        this.boardBox.className = "BoardBox";

        content.className = "RTBViewer";
        content.style.width = this.settings.width + "px";
        content.style.height = this.settings.height + "px";

        this.boardBox.addEventListener("mousedown", function () {
            this.isDraggable = true;
        }.bind(this), false);

        this.boardBox.addEventListener("mouseup", function () {
            this.isDraggable = false;
        }.bind(this), false);

        this.boardBox.addEventListener("mousewheel", this.onMouseWheel.bind(this), false);

        this.boardBox.addEventListener("mousemove", function (e) {
            if (this.isDraggable) {
                this.drag(e);
            }
        }.bind(this), false);

        content.appendChild(this.boardBox);
        content.appendChild(panel);
    };

    RTBViewer.prototype.prepareBlocks = function () {
        var widgets = this.widgets, resultBlock, stikerIndex = 0, defSettings, i;
        for (i = 0; i < widgets.length; i++) {
            resultBlock = {};
            resultBlock.id = widgets[i].id;
            resultBlock.x = widgets[i].x;
            resultBlock.y = widgets[i].y;
            resultBlock.width = widgets[i].width;
            resultBlock.angle = widgets[i].angle;
            resultBlock.text = widgets[i].text;
            resultBlock.scale = widgets[i].scale * this.scale;
            resultBlock.style = widgets[i].style;
            resultBlock.style.fontSize = widgets[i].fontSize;
            resultBlock.style.backgroundImage = widgets[i].img;
            this.blocks.push(resultBlock);
        }
    };

    RTBViewer.prototype.createRenderer = function () {
        var settings = {};

        settings.blocks = this.blocks;
        settings.renderTo = this.boardBox;
        settings.scale = this.scale;
        if (this.settings.typeRender === 0 /* html */) {
            if (this.htmlRenderer) {
                this.htmlRenderer.update(settings);
            } else {
                this.canvasRenderer = null;
                settings.renderTo.innerHTML = "";
                this.htmlRenderer = new HTMLRender(settings);
            }
        } else if (this.settings.typeRender === 1 /* canvas */) {
            if (this.canvasRenderer) {
                this.canvasRenderer.update(settings);
            } else {
                this.htmlRenderer = null;
                settings.renderTo.innerHTML = "";
                this.canvasRenderer = new CANVASRender(settings);
            }
        }
    };

    RTBViewer.prototype.drag = function (e) {
        var i;
        for (i = 0; i < this.blocks.length; i++) {
            //тут проверяем какие виджеты входят в видимую часть холста.
            this.blocks[i].x += e.movementX / this.blocks[i].scale;
            this.blocks[i].y += e.movementY / this.blocks[i].scale;
        }
        this.createRenderer();
    };

    RTBViewer.prototype.changeScale = function () {
        var i;
        for (i = 0; i < this.blocks.length; i++) {
            this.blocks[i].scale = this.widgets[i].scale * this.scale;
        }
        this.createRenderer();
    };

    RTBViewer.prototype.getScale = function () {
        var startPos = this.source.startPosition, vbWidth, vbHeight;
        vbWidth = Math.abs(startPos.a.x) + Math.abs(startPos.b.x);
        vbHeight = Math.abs(startPos.a.y) + Math.abs(startPos.b.y);
        return Math.min(this.settings.width / vbWidth, this.settings.height / vbHeight);
    };

    RTBViewer.prototype.getStickerImageByIndex = function (data) {
        var oneImage = new Image();

        oneImage.src = data;
        return oneImage;
    };

    RTBViewer.prototype.createPanel = function () {
        var panel = document.createElement('div'), zoomUpBtn = document.createElement('div'), zoomDownBtn = document.createElement('div'), fullscreenBtn = document.createElement('div'), labelRTB = document.createElement('div');

        zoomUpBtn.className = zoomDownBtn.className = fullscreenBtn.className = "leftCtrl";
        labelRTB.className = "rightCtrl";

        zoomUpBtn.id = 'zoomUpBtn';
        zoomDownBtn.id = 'zoomDownBtn';
        fullscreenBtn.id = 'fullscreenBtn';
        labelRTB.id = 'labelRTB';

        fullscreenBtn.addEventListener("click", this.onFullScreenBtnClick.bind(this));
        zoomUpBtn.addEventListener("click", this.onZoomUpBtnClick.bind(this));
        zoomDownBtn.addEventListener("click", this.onZoomDownBtnClick.bind(this));
        labelRTB.addEventListener("click", this.onLabelRTBClick);

        panel.appendChild(zoomUpBtn);
        panel.appendChild(zoomDownBtn);
        panel.appendChild(fullscreenBtn);
        panel.appendChild(labelRTB);

        panel.className = "Panel";

        return panel;
    };

    RTBViewer.prototype.loadJSON = function (callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", this.settings.source, true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                callback.call(this, xmlhttp.responseText);
            }
        }.bind(this);
    };

    RTBViewer.prototype.changeTypeRenderer = function (typeRenderer) {
        if (typeRenderer === this.settings.typeRender) {
            return;
        }
        this.settings.typeRender = typeRenderer;
        this.createRenderer();
    };

    RTBViewer.prototype.onLabelRTBClick = function () {
        window.open('https://realtimeboard.com', '_blank');
    };

    RTBViewer.prototype.onFullScreenBtnClick = function () {
        var elem = this.settings.container;
        if (!this.fullScreen) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
            this.fullScreen = true;
        } else {
            if (elem.exitFullscreen) {
                elem.exitFullscreen();
            } else if (elem.msCancleFullscreen) {
                elem.msCancleFullscreen();
            } else if (elem.mozCancelFullScreen) {
                elem.mozCancelFullScreen();
            } else if (elem.webkitCancleFullscreen) {
                elem.webkitCancleFullscreen();
            }
            this.fullScreen = false;
        }
    };

    RTBViewer.prototype.onZoomUpBtnClick = function () {
        var maxScale = this.settings.maxScale / 100;
        if (this.scale < maxScale) {
            this.scale += 0.05;
            this.changeScale();
        }
    };

    RTBViewer.prototype.onZoomDownBtnClick = function () {
        var minScale = this.settings.minScale / 100;
        if (this.scale > 0.05) {
            this.scale -= 0.05;
            this.changeScale();
        }
    };

    RTBViewer.prototype.onMouseWheel = function (e) {
        var maxScale = this.settings.maxScale / 100, minScale = this.settings.minScale / 100;

        if (e.wheelDelta < 0 && this.scale > minScale) {
            this.scale -= 0.05;
            this.changeScale();
        } else if (e.wheelDelta > 0 && this.scale < maxScale) {
            this.scale += 0.05;
            this.changeScale();
        }
    };
    return RTBViewer;
})();
;
//# sourceMappingURL=RTBViewer.js.map
