class WidgetObject {
    angle: number;
    id: string;
    scale: number;
    style: any;
    type: number;
    width: number;
    x: number;
    y: number;
    paddingLeft: number = 0;
    paddingRight: number = 0;
    paddingTop: number = 0;
    paddingBottom: number = 0;
    fontSize: number = 14;

    constructor(settings: any) {
        this.angle = settings.angle || 0;
        this.id = settings.idStr;
        this.scale = settings.scale;
        this.style = this.prepareStyle(settings.style);
        this.type = settings.type;
        this.width = settings.width;
        this.x = settings.x / settings.scale;
        this.y = settings.y / settings.scale;
    }

    prepareStyle(style): any {
        if (!style) {
            return {};
        }

        var resultStyle = {
            textAlign: this.converTextAlign(style.ta),
            backgroundColor: this.convertDecimalToHex(style.bc)
        };
        return resultStyle;
    }

    converTextAlign(alignValue: string): string {
        if (!alignValue) {
            return "";
        }
        var result: string;
        switch (alignValue) {
            case "l":
                result = "left";
                break;
            case "c":
                result = "center";
                break;
            case "r":
                result = "right";
                break;
        }
        return result;
    }

    convertDecimalToHex(decimalValue: number): string {
        var result: string;

        if (!decimalValue)
            return "transparent";
        if (decimalValue === -1) {
            result = "transparent";
        } else {
            result = "#" + decimalValue.toString(16);
        }
        return result;
    }
};

class WidgetText extends WidgetObject {
    text: any[];
    constructor(settings: any) {
        super(settings);
        this.text = this.parseHTMLText(settings.text);
    }

    parseHTMLText(text: string) {
        var htmltext = document.createElement("div"),
            paragraphs,
            i;

        htmltext.innerHTML = text;
        return this.getHtmlElemArray(htmltext);
    }

    getHtmlElemArray(el: any) {
        var paragraphsArray = [],
            i;
        for (i = 0; i < el.childNodes.length; i++) {
            switch (el.childNodes[i].nodeName) {
                case "P":
                    paragraphsArray.push({ type: "p", els: this.getHtmlElemArray(el.childNodes[i]) });
                    break;
                case "F":
                    paragraphsArray.push({ type: "font", text: el.childNodes[i].innerText, color: el.childNodes[i].getAttribute("c") });
                    break;
                case "#text":
                    paragraphsArray.push({ type: "text", text: el.childNodes[i].textContent });
                    break;
            }
        }
        return paragraphsArray;
    }
};

class WidgetImage extends WidgetObject {
    img: HTMLImageElement;
    constructor(settings: any) {
        super(settings);
        this.img = this.createImageFromUrl(settings.url);
    }

    createImageFromUrl(url: string): HTMLImageElement {
        var resultImage = new Image();

        resultImage.src = url;
        return resultImage;
    }

};

class WidgetSticker extends WidgetObject {
    text: any[];
    img: HTMLImageElement;
    constructor(settings) {
        super(settings);
        this.img = new WidgetImage(settings).img;
        this.text = new WidgetText(settings).text;
        this.width = 225;
        this.paddingLeft = 25;
        this.paddingRight = 25;
        this.paddingTop = 20;
        this.paddingBottom = 55;
        this.fontSize = 54;
    }
};