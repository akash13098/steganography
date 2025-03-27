function messageToBinary(message) {
    return message.split("")
        .map(char => char.charCodeAt(0).toString(2).padStart(8, "0"))
        .join("");
}

function binaryToMessage(binary) {
    let chars = binary.match(/.{1,8}/g);
    return chars ? chars.map(char => String.fromCharCode(parseInt(char, 2))).join("") : "";
}

function encodeMessage() {
    let file = document.getElementById("encodeImage").files[0];
    let message = document.getElementById("secretMessage").value;
    let password = document.getElementById("encodePassword").value;

    if (!file || !message || !password) {
        alert("Please select an image, enter a message, and set a password.");
        return;
    }

    let reader = new FileReader();
    reader.onload = function(event) {
        let img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let pixels = imgData.data;

            // Convert message to binary and add a terminator
            let binaryMsg = messageToBinary(password + ":" + message + "\0"); 
            let index = 0;

            for (let i = 0; i < pixels.length; i += 4) { // Modify only red channel
                if (index < binaryMsg.length) {
                    pixels[i] = (pixels[i] & 0xFE) | parseInt(binaryMsg[index]); // Modify LSB
                    index++;
                }
            }

            ctx.putImageData(imgData, 0, 0);

            let encodedImage = canvas.toDataURL("image/png");
            let link = document.createElement("a");
            link.href = encodedImage;
            link.download = "encoded_image.png";
            link.click();
        };
    };
    reader.readAsDataURL(file);
}

function decodeMessage() {
    let file = document.getElementById("decodeImage").files[0];
    let password = document.getElementById("decodePassword").value;

    if (!file || !password) {
        alert("Please select an encoded image and enter a password.");
        return;
    }

    let reader = new FileReader();
    reader.onload = function(event) {
        let img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let pixels = imgData.data;

            let binaryMessage = "";
            for (let i = 0; i < pixels.length; i += 4) { 
                binaryMessage += (pixels[i] & 1).toString();
            }

            let decodedMessage = binaryToMessage(binaryMessage);
            let endIdx = decodedMessage.indexOf("\0");
            if (endIdx !== -1) decodedMessage = decodedMessage.substring(0, endIdx);

            let [storedPassword, secretMessage] = decodedMessage.split(":");

            if (storedPassword === password) {
                document.getElementById("decodedText").innerText = "Decoded Message: " + secretMessage;
            } else {
                document.getElementById("decodedText").innerText = "Error: Incorrect password or corrupted image.";
            }
        };
    };
    reader.readAsDataURL(file);
}
