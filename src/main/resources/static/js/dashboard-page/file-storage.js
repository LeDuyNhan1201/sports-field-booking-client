const CHUNK_SIZE = 1024 * 1024; // 1MB
const STORAGE_KEY = 'upload_progress'; // Khóa lưu trữ trạng thái
const progressBar = document.getElementById('uploadProgress');
const progressText = document.getElementById('progressText');

document.getElementById('fileInput').addEventListener('change', (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (file) {
        uploadFileInChunks(file);
    }
});

async function uploadFileInChunks(file) {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const progress = getProgress(file.name) || {};
    let uploadedChunks = Object.keys(progress).length; // Số chunk đã upload

    for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
        if (progress[chunkNumber]) {
            console.log(`Chunk ${chunkNumber} already uploaded, skipping...`);
            continue; // Skip chunk đã upload
        }

        const start = chunkNumber * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('file', chunk);
        const request = {
            "fileName": file.name,
            "chunkNumber": chunkNumber,
            "totalChunks": totalChunks,
            "contentType": file.type
        };
        formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' })); // Đảm bảo là Blob JSON

        try {
            // const response = await fetchCustom({
            //     url: SERVER_DOMAIN + '/file/upload-chunk',
            //     method: 'POST',
            //     body: formData
            // });
            const response = await fetch(SERVER_DOMAIN + '/file/upload-chunk', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                alert('Upload failed');
            }

            saveProgress(file.name, chunkNumber);
            uploadedChunks++;
            updateProgress(uploadedChunks, totalChunks); // Cập nhật tiến độ sau mỗi chunk

        } catch (error) {
            console.error(`Error uploading chunk ${chunkNumber}:`, error);
            alert('Upload failed chunk ' + chunkNumber);
            return; // Dừng lại nếu gặp lỗi, để bảo lưu trạng thái
        }
    }
    clearProgress(file.name); // Xóa trạng thái khi upload hoàn thành
    alert('Upload completed');
    window.location.reload();
}

function updateProgress(uploadedChunks, totalChunks) {
    const percentage = Math.round((uploadedChunks / totalChunks) * 100);
    progressBar.value = percentage;
    progressText.innerText = `${percentage}%`;
}

function saveProgress(fileName, chunkNumber) {
    const progress = getProgress(fileName) || {};
    progress[chunkNumber] = true;
    localStorage.setItem(`${STORAGE_KEY}_${fileName}`, JSON.stringify(progress));
}

function getProgress(fileName) {
    return JSON.parse(localStorage.getItem(`${STORAGE_KEY}_${fileName}`));
}

function clearProgress(fileName) {
    localStorage.removeItem(`${STORAGE_KEY}_${fileName}`);
}