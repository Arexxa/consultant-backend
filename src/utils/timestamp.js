const malaysiaOptions = { timeZone: 'Asia/Kuala_Lumpur' };

function generateTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Malaysia Format timezone
function dateTime() {
    const dateTime = new Date().toLocaleString('en-GB', malaysiaOptions);
    return dateTime;
}

module.exports = { generateTimestamp, dateTime };
