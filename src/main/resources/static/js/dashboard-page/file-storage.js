const CHUNK_SIZE = 1024 * 1024; // 1MB
const STORAGE_KEY = 'upload_progress'; // Khóa lưu trữ trạng thái
const MAX_FILES = 5; // Tối đa 5 file
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
// const progressBar = document.getElementById('uploadProgress');
// const progressText = document.getElementById('progressText');

document.getElementById('fileInput').addEventListener('change', (event) => {
    event.preventDefault();
    const files = Array.from(event.target.files); // Lấy danh sách file
    if (files.length > MAX_FILES) {
        alert(`You can upload a maximum of ${MAX_FILES} files at a time.`);
        return;
    }

    // Kiểm tra kích thước từng file
    for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
            alert(`${file.name} exceeds the maximum file size of 50MB.`);
            return;
        }
    }

    // Tạo một container để chứa thanh tiến độ cho từng file
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.innerHTML = ''; // Xóa thanh tiến độ trước đó

    // Upload từng file
    const uploadPromises = files.map((file, index) => uploadFileInChunks(file, index));

    // Chờ tất cả file được upload xong
    Promise.all(uploadPromises).then(() => {
        alert('All files uploaded successfully');
        cleanUpAfterUpload(files); // Xóa dữ liệu và giao diện sau khi upload xong
    }).catch((error) => {
        console.error('Error uploading files:', error);
        alert('An error occurred while uploading files');
    });
});

async function uploadFileInChunks(file, fileIndex) {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const progress = getProgress(file.name) || {};
    let uploadedChunks = Object.keys(progress).length; // Số chunk đã upload

    // Tạo phần tử progress bar cho từng file
    // Tạo phần tử progress bar và tên file cho từng file
    const progressWrapper = document.createElement('div');
    const fileNameLabel = document.createElement('div');
    const progressBar = document.createElement('progress');
    const progressText = document.createElement('span');

    fileNameLabel.innerText = file.name;
    progressBar.id = `uploadProgress_${fileIndex}`;
    progressBar.max = 100;
    progressBar.value = 0;
    progressText.id = `progressText_${fileIndex}`;
    progressText.innerText = '0%';

    progressWrapper.style.display = 'flex';
    progressWrapper.style.flexDirection = 'column';
    progressWrapper.appendChild(fileNameLabel);
    progressWrapper.appendChild(progressBar);
    progressWrapper.appendChild(progressText);

    document.getElementById('progressContainer').appendChild(progressWrapper);

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
            const response = await fetch(SERVER_DOMAIN + '/file/upload-chunk', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) alert('Upload failed');

            saveProgress(file.name, chunkNumber);
            uploadedChunks++;
            updateProgress(uploadedChunks, totalChunks, fileIndex); // Cập nhật tiến độ sau mỗi chunk

        } catch (error) {
            console.error(`Error uploading chunk ${chunkNumber}:`, error);
            alert('Upload failed chunk ' + chunkNumber);
            return; // Dừng lại nếu gặp lỗi, để bảo lưu trạng thái
        }
    }
    clearProgress(file.name); // Xóa trạng thái khi upload hoàn thành
    console.log(`Upload completed for ${file.name}`);
}

function updateProgress(uploadedChunks, totalChunks, fileIndex) {
    const percentage = Math.round((uploadedChunks / totalChunks) * 100);
    const progressBar = document.getElementById(`uploadProgress_${fileIndex}`);
    const progressText = document.getElementById(`progressText_${fileIndex}`);
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

// Xóa tất cả dữ liệu liên quan đến quá trình upload sau khi hoàn tất
function cleanUpAfterUpload(files) {
    // Xóa các thanh tiến độ và dữ liệu của từng file
    files.forEach(file => {
        clearProgress(file.name); // Xóa khỏi localStorage
    });

    // Xóa toàn bộ giao diện upload (thanh progress, tên file)
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.innerHTML = ''; // Loại bỏ các phần tử hiển thị tiến độ

    // Làm mới input file
    document.getElementById('fileInput').value = ''; // Reset input file
}