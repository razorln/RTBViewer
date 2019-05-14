var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var WidgetObject = (function () {
    function WidgetObject(settings) {
        this.paddingLeft = 0;
        this.paddingRight = 0;
        this.paddingTop = 0;
        this.paddingBottom = 0;
        this.fontSize = 14;
        this.angle = settings.angle || 0;
        this.id = settings.idStr;
        this.scale = settings.scale;
        this.style = this.prepareStyle(settings.style);
        this.type = settings.type;
        this.width = settings.width;
        this.x = settings.x / settings.scale;
        this.y = settings.y / settings.scale;
    }
    WidgetObject.prototype.prepareStyle = function (style) {
        if (!style) {
            return {};
        }

        var resultStyle = {
            textAlign: this.converTextAlign(style.ta),
            backgroundColor: this.convertDecimalToHex(style.bc)
        };
        return resultStyle;
    };

    WidgetObject.prototype.converTextAlign = function (alignValue) {
        if (!alignValue) {
            return "";
        }
        var result;
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
    };

    WidgetObject.prototype.convertDecimalToHex = function (decimalValue) {
        var result;

        if (!decimalValue)
            return "transparent";
        if (decimalValue === -1) {
            result = "transparent";
        } else {
            result = "#" + decimalValue.toString(16);
        }
        return result;
    };
    return WidgetObject;
})();
;

var WidgetText = (function (_super) {
    __extends(WidgetText, _super);
    function WidgetText(settings) {
        _super.call(this, settings);
        this.text = this.parseHTMLText(settings.text);
    }
    WidgetText.prototype.parseHTMLText = function (text) {
        var htmltext = document.createElement("div"), paragraphs, i;

        htmltext.innerHTML = text;
        return this.getHtmlElemArray(htmltext);
    };

    WidgetText.prototype.getHtmlElemArray = function (el) {
        var paragraphsArray = [], i;
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
    };
    return WidgetText;
})(WidgetObject);
;

var WidgetImage = (function (_super) {
    __extends(WidgetImage, _super);
    function WidgetImage(settings) {
        _super.call(this, settings);
        this.img = this.createImageFromUrl(settings.url);
    }
    WidgetImage.prototype.createImageFromUrl = function (url) {
        var resultImage = new Image();

        resultImage.src = url;
        return resultImage;
    };
    return WidgetImage;
})(WidgetObject);
;

var WidgetSticker = (function (_super) {
    __extends(WidgetSticker, _super);
    function WidgetSticker(settings) {
        _super.call(this, settings);
        this.img = new WidgetImage(settings).img;
        this.text = new WidgetText(settings).text;
        this.width = 225;
        this.paddingLeft = 25;
        this.paddingRight = 25;
        this.paddingTop = 20;
        this.paddingBottom = 55;
        this.fontSize = 54;
    }
    return WidgetSticker;
})(WidgetObject);
;
//# sourceMappingURL=Widgets.js.map
