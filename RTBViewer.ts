var WidgetTypes;
(WidgetTypes = function () {
    var t = WidgetTypes;
    t.Text = 4;
    t.Sticker = 5;
    t.Image = 1;
})();

enum RendererType {
    html,
    canvas
}

interface ISettings {
    source: string;
    container: HTMLElement;
    typeRender: RendererType;
    width: number;
    height: number;
    maxScale: number;
    minScale: number;
}

interface IBlock {
    x: number;
    y: number;
    height: number;
    width: number;
    style: any;
    scale: number;
    text: any[];
    angle: number;
    id: string;
}

interface IRendererSettings {
    blocks: IBlock[];
    renderTo: HTMLElement;
    scale: number;
}

class RTBViewer {
    settings: ISettings;
    json: string;
    source: any;
    isDraggable: boolean;
    widgets: any[] = [];
    blocks: IBlock[] = [];
    boardBox: HTMLElement;
    prevCursorPosition = { x: 0, y: 0 };
    scale: number = 1;
    htmlRenderer: HTMLRender;
    canvasRenderer: CANVASRender;

    constructor(settings: ISettings) {
        this.settings = settings;
        this.init()
    }

    init() {
        this.loadJSON(this.respLoadJSON);
    }

    respLoadJSON(responseText: string) {
        var widgets,
            stikerIndex: number = 0,
            i;
        this.source = JSON.parse(responseText);
        this.scale = this.getScale();
        widgets = this.source.widgets
        for (i = 0; i < widgets.length; i++) {
            switch (widgets[i].type) {
                case WidgetTypes.Image:
                    WidgetText
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
    }

    render() {
        var content = this.settings.container,
            panel = this.createPanel();

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
    }

    prepareBlocks() {
        var widgets = this.widgets,
            resultBlock: IBlock,
            stikerIndex: number = 0,
            defSettings,
            i;
        for (i = 0; i < widgets.length; i++) {
            resultBlock = <IBlock> {};
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
    }

    createRenderer() {
        var settings = <IRendererSettings> {};

        settings.blocks = this.blocks;
        settings.renderTo = this.boardBox;
        settings.scale = this.scale;
        if (this.settings.typeRender === RendererType.html) {
            if (this.htmlRenderer) {
                this.htmlRenderer.update(settings);
            } else {
                this.canvasRenderer = null;
                settings.renderTo.innerHTML = "";
                this.htmlRenderer = new HTMLRender(settings);
            }
        } else if (this.settings.typeRender === RendererType.canvas){
            if (this.canvasRenderer) {
                this.canvasRenderer.update(settings);
            } else {
                this.htmlRenderer = null;
                settings.renderTo.innerHTML = "";
                this.canvasRenderer = new CANVASRender(settings);
            }
        }
    }

    drag(e: MouseEvent) {
        var i;
        for (i = 0; i < this.blocks.length; i++) {
            //тут проверяем какие виджеты входят в видимую часть холста.
            this.blocks[i].x += e.movementX / this.blocks[i].scale;
            this.blocks[i].y += e.movementY / this.blocks[i].scale;
        }
        this.createRenderer();
    }

    changeScale() {
        var i;//, w,x,y,newX,mewY,r;
        for (i = 0; i < this.blocks.length; i++) {
            this.blocks[i].scale = this.widgets[i].scale * this.scale;
        }
        this.createRenderer();
    }

    getScale() : number{
        var startPos = this.source.startPosition,
            vbWidth,
            vbHeight;
        vbWidth = Math.abs(startPos.a.x) + Math.abs(startPos.b.x);
        vbHeight = Math.abs(startPos.a.y) + Math.abs(startPos.b.y);
        return Math.min(this.settings.width / vbWidth, this.settings.height / vbHeight);
    }

    getStickerImageByIndex(data: string) {
        var oneImage = new Image();

        oneImage.src = data;
        return oneImage;
    }

    createPanel(): HTMLElement {
        var panel = document.createElement('div'),
            zoomUpBtn = document.createElement('div'),
            zoomDownBtn = document.createElement('div'),
            fullscreenBtn = document.createElement('div'),
            labelRTB = document.createElement('div');

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
    }

    loadJSON(callback: Function) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", this.settings.source, true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                callback.call(this, xmlhttp.responseText);
            }
        }.bind(this);
    }

    changeTypeRenderer(typeRenderer: RendererType) {
        if (typeRenderer === this.settings.typeRender) {
            return;
        }
        this.settings.typeRender = typeRenderer;
        this.createRenderer();
    }

    onLabelRTBClick() {
        window.open('https://realtimeboard.com', '_blank')
    }

    onFullScreenBtnClick() {
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
    }

    onZoomUpBtnClick() {
        var maxScale = this.settings.maxScale / 100;
        if (this.scale < maxScale) {
            this.scale += 0.05;
            this.changeScale();
        }
    }

    onZoomDownBtnClick() {
        var minScale = this.settings.minScale / 100;
        if (this.scale > 0.05) {
            this.scale -= 0.05;
            this.changeScale();
        }
    }

    onMouseWheel(e) {
        var maxScale = this.settings.maxScale / 100,
            minScale = this.settings.minScale / 100;

        if (e.wheelDelta < 0 && this.scale > minScale) {
            this.scale -= 0.05;
            this.changeScale();
        } else if (e.wheelDelta > 0 && this.scale < maxScale) {
            this.scale += 0.05;
            this.changeScale();
        }
    }
};