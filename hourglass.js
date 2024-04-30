const mainCanvas = document.querySelector("canvas");
const mainCtx = mainCanvas.getContext("2d");

let loadingMessage = "";

function adjustElementSize() {
    let mcbcr = mainCanvas.getBoundingClientRect();
    mainCanvas.width = mcbcr.width * devicePixelRatio;
    mainCanvas.height = mcbcr.height * devicePixelRatio;
}
document.addEventListener("load", adjustElementSize);
window.addEventListener("resize", adjustElementSize);
adjustElementSize();

let loadingSince = -1;

let spinDirection = Math.sign(Math.random() - 0.5);

/**
 * I must be crazy to write this function for 3 hours. But it works.
 * Honestly, this is completely unnecessary for the main purpose of this theme.
 * @param {CanvasRenderingContext2D} ctx 
 */
function drawLoading(ctx) {
    ctx.save();
    ctx.translate(mainCanvas.width / 2, mainCanvas.height / 2);
    ctx.save();

    const lenUnit = Math.min(mainCanvas.width, mainCanvas.height) * devicePixelRatio * 0.05;
    const fadeinProportion = 0.3;
    const loadingFadeinDuration = 2000 * fadeinProportion;
    const loadingInterval = 2000;
    const smoothFallingSandSince = 0.93;

    if (loadingSince === -1) loadingSince = Date.now() + loadingFadeinDuration;

    let frameTime = 100;
    // let time = Math.floor((Date.now() - loadingSince) / frameTime) * frameTime;
    let time = Date.now() - loadingSince;

    let loadingProgress = (time % loadingInterval) / loadingInterval;
    let opacity = 1;
    if (loadingSince > Date.now()) { // Fade in the hourglass for first loadingFadeinDuration
        let fadeProgress = (time + loadingFadeinDuration) / loadingFadeinDuration;
        loadingProgress = fadeProgress * fadeinProportion + (1 - fadeinProportion);
        opacity = fadeProgress;
    }
    // 0% - 70%: Sand falling
    // 70% - 80%: Resting
    // 80% - 100%: rotating the hourglass

    // apply opacity
    ctx.globalAlpha = opacity;

    if (loadingProgress > 0.8) {
        let prog = (loadingProgress - 0.8) * 5;
        let progSin = 0.5 * Math.sin(Math.PI * prog - Math.PI / 2) + 0.5;
        ctx.rotate(progSin * Math.PI * spinDirection);
    }

    let fallenSendPercentage = Math.min(1, loadingProgress / 0.7);

    // First, draw the hourglass frame
    ctx.lineWidth = lenUnit / 4;
    ctx.beginPath();
    ctx.moveTo(lenUnit * -0.5, 0);
    ctx.lineTo(lenUnit * -1.5, lenUnit * -0.8);
    ctx.lineTo(lenUnit * -1.5, lenUnit * -2.4);
    ctx.lineTo(lenUnit * -1.2, lenUnit * -2.7);
    ctx.lineTo(lenUnit * 1.2, lenUnit * -2.7);
    ctx.lineTo(lenUnit * 1.5, lenUnit * -2.4);
    ctx.lineTo(lenUnit * 1.5, lenUnit * -0.8);
    ctx.lineTo(lenUnit * 0.5, 0);
    ctx.lineTo(lenUnit * 1.5, lenUnit * 0.8);
    ctx.lineTo(lenUnit * 1.5, lenUnit * 2.4);
    ctx.lineTo(lenUnit * 1.2, lenUnit * 2.7);
    ctx.lineTo(lenUnit * -1.2, lenUnit * 2.7);
    ctx.lineTo(lenUnit * -1.5, lenUnit * 2.4);
    ctx.lineTo(lenUnit * -1.5, lenUnit * 0.8);
    ctx.closePath();
    ctx.strokeStyle = "white";
    ctx.stroke();

    // preapre to draw the sand (very complicated)
    // Based on my note
    const y_1 = lenUnit * 0.95;
    const y_2 = lenUnit * 2.4;
    const half_w = lenUnit * 1.2;
    const k = half_w * 2;
    const S_1 = k * y_1 / 2;
    const S_2 = k * y_2 - S_1;

    function h_high(S_high) {
        if (S_high < S_1) {
            return Math.sqrt(2 * y_1 * S_high / k);
        } else {
            return y_1 / 2 + S_high / k;
        }
    }
    function h_low(S_low) {
        return y_2 - h_high(S_low);
    }

    // Draw upper sand
    let upperFilledRatio = 1 - fallenSendPercentage;
    let upperSandS = S_2 * upperFilledRatio;
    let upperSandY = h_high(upperSandS); // Result of math. It works. Just trust me. --> This value is same for both upper and lower sand
    ctx.fillStyle = `hsl(${Date.now() / 30 % 360}, 45%, 80%)`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    if (upperSandY < y_1) {
        let xForY = upperSandY * half_w / y_1;
        ctx.lineTo(-xForY, -upperSandY);
        ctx.lineTo(xForY, -upperSandY);
    } else {
        ctx.lineTo(-half_w, -y_1);
        ctx.lineTo(-half_w, -upperSandY);
        ctx.lineTo(half_w, -upperSandY);
        ctx.lineTo(half_w, -y_1);
    }
    ctx.closePath();
    ctx.fill();

    // Draw lower sand
    let lowerSandS = S_2 * upperFilledRatio;
    let lowerSandY = h_low(lowerSandS);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    if (lowerSandY < y_2 - y_1) {
        ctx.moveTo(-half_w, y_2);
        ctx.lineTo(-half_w, y_2 - lowerSandY);
        ctx.lineTo(half_w, y_2 - lowerSandY);
        ctx.lineTo(half_w, y_2);
    } else {
        let t = (lowerSandY - (y_2 - y_1)) / y_1;
        let xForY = half_w * (1 - t);
        ctx.moveTo(-half_w, y_2);
        ctx.lineTo(-half_w, y_2 - (y_2 - y_1));
        ctx.lineTo(-xForY, y_2 - lowerSandY);
        ctx.lineTo(xForY, y_2 - lowerSandY);
        ctx.lineTo(half_w, y_2 - (y_2 - y_1));
        ctx.lineTo(half_w, y_2);
    }
    ctx.closePath();
    ctx.fill();

    // Draw falling sand
    if (fallenSendPercentage > 0 && fallenSendPercentage < 1) {
        ctx.beginPath();
        ctx.rect(lenUnit * -0.05, -lenUnit * 0.1, lenUnit * 0.1, y_2 + lenUnit * 0.1);
        ctx.fill();
    }
    if (loadingProgress > smoothFallingSandSince) {
        let smoothFalling = (loadingProgress - smoothFallingSandSince) / (1 - smoothFallingSandSince);
        let h = y_2 * smoothFalling;
        ctx.beginPath();
        ctx.rect(lenUnit * -0.05, lenUnit * 0.1 - h, lenUnit * 0.1, h + lenUnit * 0.1);
        ctx.fill();
    }

    ctx.restore();

    // Draw flashing message
    ctx.save();
    ctx.fillStyle = "white";
    ctx.globalAlpha = opacity * (Math.sin(time / 150) * 0.5 + 0.5);
    ctx.font = `${lenUnit * 1.5}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(loadingMessage, 0, lenUnit * 5);
    ctx.restore();

    ctx.restore();
}

function render() {
    let ctx = mainCtx;
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    if (loadingMessage !== "")
        drawLoading(ctx);
    else
        loadingSince = -1;
}

function renderLoop() {
    render();
    requestAnimationFrame(renderLoop);
}
requestAnimationFrame(renderLoop);

document.onclick = () => {
    if (loadingMessage === "") {
        loadingMessage = " ";
        spinDirection = -spinDirection;
    }
    else
        loadingMessage = "";
}
