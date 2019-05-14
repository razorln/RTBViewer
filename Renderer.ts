
class HTMLRender {
    settings: IRendererSettings;
    constructor(settings: IRendererSettings) {
        this.settings = settings;
        this.render();
    }

    render() {
        var blocks = this.settings.blocks,
            container = this.settings.renderTo,
            newBlock: HTMLElement,
            curBlock, box,
            x, y, i;

        for (i = 0; i < blocks.length; i++) {
            curBlock = blocks[i];
            newBlock = document.createElement("div");
            newBlock.id = curBlock.id;
            container.appendChild(newBlock);
            newBlock.style.position = "absolute";
            newBlock.style.overflow = "hidden";
            this.setHTMLText(curBlock.text, newBlock);
            this.updateBlock(curBlock, newBlock);
        }
    }

    public update(settings: IRendererSettings) {
        var blocks = settings.blocks,
            container = this.settings.renderTo,
            selBlock: HTMLElement,
            curBlock, box,
            x, y, i;

        for (i = 0; i < blocks.length; i++) {
            curBlock = blocks[i];
            selBlock = document.getElementById(curBlock.id);
            this.updateBlock(curBlock, selBlock);
        }
    }

    updateBlock(curBlock, targetBlock) {
        var curBlock, box,
            x, y, i;
        if (curBlock.width)
            targetBlock.style.width = curBlock.width + "px";
        if (curBlock.height)
            targetBlock.style.height = curBlock.height ? (curBlock.height - curBlock.style.paddingTop - curBlock.style.paddingBottom) + "px" : "auto";
        if (curBlock.style) {
            targetBlock.style.backgroundColor = curBlock.style.backgroundColor;
            if (curBlock.style.paddingTop && curBlock.style.paddingRight && curBlock.style.paddingBottom && curBlock.style.paddingLeft) {
                targetBlock.style.padding = curBlock.style.paddingTop + "px " + curBlock.style.paddingRight + "px " + curBlock.style.paddingBottom + "px " + curBlock.style.paddingLeft + "px";
            }
            if (curBlock.style.backgroundImage) {
                targetBlock.appendChild(curBlock.style.backgroundImage);
                curBlock.style.backgroundImage.style.width = targetBlock.style.width;
            }
        }

        box = targetBlock.getBoundingClientRect();
        x = curBlock.x + ((box.width / 2) * curBlock.scale - (box.width / 2)) / curBlock.scale;
        y = curBlock.y + ((box.height / 2) * curBlock.scale - (box.height / 2)) / curBlock.scale;
        targetBlock.style.transformOrigin = box.width / 2 + "px " + box.height / 2 + "px";
        targetBlock.style.transform = "scale(" + (curBlock.scale) + ") translate(" + x + "px, " + y + "px) rotate(" + curBlock.angle + "deg)";
        targetBlock.style.fontSize = (curBlock.style ? curBlock.style.fontSize || 14 : 14) + "px";
        targetBlock.style.fontFamily = "Arial";
    }

    setHTMLText(arrayElems, el) {
        var paragraphsArray = [],
            newEl,
            i;

        if (!arrayElems)
            return;

        for (i = 0; i < arrayElems.length; i++) {
            switch (arrayElems[i].type) {
                case "p":
                    newEl = document.createElement(arrayElems[i].type);
                    this.setHTMLText(arrayElems[i].els, newEl);
                    el.appendChild(newEl);
                    break;
                case "font":
                    newEl = document.createElement(arrayElems[i].type);
                    newEl.style.color = arrayElems[i].color;
                    newEl.innerHTML = arrayElems[i].text;
                    el.appendChild(newEl);
                    break;
                case "text":
                    newEl = document.createElement(arrayElems[i].type);
                    newEl.innerHTML = arrayElems[i].text;
                    newEl.style.position = "absolute";
                    el.appendChild(newEl);
                    break;
            }
        }
    }
};

class CANVASRender {
    settings: IRendererSettings;
    constructor(settings: IRendererSettings) {
        this.settings = settings;
        this.render();
    }

    render() {
        var blocks = this.settings.blocks,
            container = this.settings.renderTo,
            canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d"),
            newBlock: HTMLElement,
            blockWidth,
            blockHeight,
            angle,
            x, y,
            i;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        for (i = 0; i < blocks.length; i++) {
            blockWidth = blocks[i].width || blocks[i].style.backgroundImage.width;
            angle = blocks[i].angle * Math.PI / 180;
            x = blocks[i].x * Math.cos(angle) - blocks[i].y * Math.sin(angle);
            y = blocks[i].x * Math.sin(angle) + blocks[i].y * Math.cos(angle);

            ctx.beginPath();
            ctx.rect(blocks[i].x, blocks[i].y, blocks[i].width, 100);
            if (blocks[i].style.backgroundImage) {
                blockHeight = blocks[i].style.backgroundImage.height * (blockWidth / blocks[i].style.backgroundImage.width);
                ctx.save();
                ctx.beginPath();
                ctx.rotate(angle);
                ctx.scale(blocks[i].scale, blocks[i].scale);
                ctx.drawImage(blocks[i].style.backgroundImage, x, y, blockWidth, blockHeight);
                ctx.closePath();
                ctx.restore();

            }
            var lineHeight = blocks[i].style ? blocks[i].style.fontSize || 14 : 14;

            if (blocks[i].style.backgroundColor) {
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = blocks[i].style.backgroundColor;
                ctx.scale(blocks[i].scale, blocks[i].scale);
                ctx.fillRect(blocks[i].x, blocks[i].y, blockWidth, lineHeight);
                ctx.closePath();
                ctx.restore();
            }

            if (blocks[i].text) {
                ctx.save();
                ctx.beginPath();
                ctx.scale(blocks[i].scale, blocks[i].scale);
                ctx.font = blocks[i].style ? blocks[i].style.fontSize + "px Arial" : "14px Arial";
                this.setCANVASText(blocks[i].text, ctx, blocks[i].x, blocks[i].y, blockWidth, lineHeight);
                ctx.closePath();
                ctx.restore();
            }
            ctx.closePath();
        }
        container.appendChild(canvas);
    }

    public update(settings: IRendererSettings) {
        this.settings = settings;
        this.settings.renderTo.innerHTML = "";
        this.render();
    }

    setCANVASText(arrayElems, ctx, x, y, maxWidth, lineHeight) {
        var paragraphsArray = [],
            text = "",
            i;

        for (i = 0; i < arrayElems.length; i++) {
            switch (arrayElems[i].type) {
                case "p":
                    this.setCANVASText(arrayElems[i].els, ctx, x, y, maxWidth, lineHeight);
                    y += lineHeight
                    break;
                case "font":
                case "text":
                    ctx.save();
                    ctx.fillStyle = arrayElems[i].color || "#000000";
                    this.wrapText(ctx, arrayElems[i].text, x, y, maxWidth, lineHeight);
                    break;
            }
        }
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');

        var line = '';

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = ctx.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y + lineHeight);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y + lineHeight);
        ctx.restore();
    }
}; 