// const CHUNK_SIZE = 1024 * 1024; // 1MB
// const STORAGE_KEY = 'upload_progress'; // Khóa lưu trữ trạng thái
// const MAX_FILES = 10; // Tối đa 5 file
// const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
// const fileUploadStatus = {
//     UPLOADING: 'UPLOADING',
//     UPLOADED: 'UPLOADED',
// };
// const selectedFiles = [];
//
// document.getElementById('fileInput').addEventListener('change', handleFileSelection);
// document.getElementById('submitFilesBtn').addEventListener('click', handleSubmitFiles);
//
// function handleFileSelection(event) {
//     const files = Array.from(event.target.files); // Lấy danh sách file
//     selectedFiles.length = 0; // Clear previously selected files
//     const previewContainer = document.getElementById('previewContainer');
//     previewContainer.innerHTML = ''; // Clear previous previews
//
//     if (files.length > MAX_FILES) {
//         alert(`You can upload a maximum of ${MAX_FILES} files at a time.`);
//         cleanUpAfterUpload(files);
//         return;
//     }
//
//     // Kiểm tra kích thước từng file
//     files.forEach((file, index) => {
//         if (file.size > MAX_FILE_SIZE) {
//             alert(`${file.name} exceeds the maximum file size of 50MB.`);
//             cleanUpAfterUpload(files);
//             return;
//         }
//         selectedFiles.push(file);
//
//         const preview = document.createElement('div');
//         preview.style.display = 'flex';
//         preview.style.flexDirection = 'column';
//         preview.style.alignItems = 'center';
//         preview.style.position = 'relative';
//
//         const fileLabel = document.createElement('div');
//         fileLabel.innerText = file.name;
//         preview.appendChild(fileLabel);
//
//         if (file.type.startsWith('video/')) {
//             const video = document.createElement('video');
//             video.controls = true;
//             video.style.width = '300px';
//             video.src = URL.createObjectURL(file);
//             preview.appendChild(video);
//
//         } else if (file.type.startsWith('image/')) {
//             const img = document.createElement('img');
//             img.style.width = '300px';
//             img.src = URL.createObjectURL(file);
//             preview.appendChild(img);
//         }
//
//         previewContainer.appendChild(preview);
//     });
//
//     document.getElementById('submitFilesBtn').disabled = selectedFiles.length === 0;
// }
//
// function handleSubmitFiles() {
//     if (selectedFiles.length === 0) return;
//
//     // Tạo một container để chứa thanh tiến độ cho từng file
//     const progressContainer = document.getElementById('progressContainer');
//     progressContainer.innerHTML = ''; // Xóa thanh tiến độ trước đó
//
//     // Upload từng file
//     const uploadPromises = selectedFiles.map((file, index)=> uploadFileInChunks(file, index));
//
//     /*const uploadPromiseFns = selectedFiles
//         .map((file, index)=> ()=> uploadFileInChunks(file, index));*/
//
//     // Chờ tất cả file được upload xong
//     Promise.all(uploadPromises).then(() => {
//         alert('All files uploaded successfully');
//         cleanUpAfterUpload(selectedFiles); // Xóa dữ liệu và giao diện sau khi upload xong
//
//     }).catch((error) => {
//         console.error('Error uploading files:', error);
//         alert('An error occurred while uploading files');
//         window.location.reload(); // Refresh trang
//     });
// }
//
// async function uploadFileInChunks(file, fileIndex) {
//     const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
//     const progress = getProgress(file.name) || {};
//     let uploadedChunks = Object.keys(progress).length; // Số chunk đã upload
//     const realFileName = progress[0]?.realName || generateFileName(file.type.split('/')[0], file.type.split('/')[1]);
//
//     // Tạo phần tử progress bar cho từng file
//     // Tạo phần tử progress bar và tên file cho từng file
//     const progressWrapper = document.createElement('div');
//     const fileNameLabel = document.createElement('div');
//     const progressBar = document.createElement('progress');
//     const progressText = document.createElement('span');
//
//     fileNameLabel.innerText = `Uploading as: ${file.name}`;
//     progressBar.id = `uploadProgress_${fileIndex}`;
//     progressBar.max = 100;
//     progressBar.value = 0;
//     progressText.id = `progressText_${fileIndex}`;
//     progressText.innerText = '0%';
//
//     progressWrapper.style.display = 'flex';
//     progressWrapper.style.flexDirection = 'column';
//     progressWrapper.appendChild(fileNameLabel);
//     progressWrapper.appendChild(progressBar);
//     progressWrapper.appendChild(progressText);
//
//     document.getElementById('progressContainer').appendChild(progressWrapper);
//
//     let isFailed = false;
//     let chunkNumber = 0;
//     while (true) {
// /*        if (progress[chunkNumber]?.uploaded) {
//             console.log(`Chunk ${chunkNumber} already uploaded, skipping...`);
//             continue; // Skip chunk đã upload
//         }*/
//
//         const start = chunkNumber * CHUNK_SIZE;
//         const end = Math.min(file.size, start + CHUNK_SIZE);
//         const chunk = file.slice(start, end);
//
//         const formData = new FormData();
//         formData.append('file', chunk);
//         const request = {
//             "fileName": realFileName,
//             "chunkNumber": chunkNumber,
//             "totalChunks": totalChunks,
//             "contentType": file.type
//         };
//         formData.append('request',
//             new Blob([JSON.stringify(request)], { type: 'application/json' })); // Đảm bảo là Blob JSON
//
//         console.log((file.type));
//         try {
//             const response = await fetch(SERVER_DOMAIN + '/file/upload-chunk', {
//                 method: 'POST',
//                 body: formData,
//             });
//
//             if (response.status === 400) {
//                 alert('Upload failed');
//                 isFailed = true;
//                 break;
//             }
//             else if (response.status === 201) {
//                 const data = await response.json()
//                 console.log(data);
//                 switch (data.results) {
//                     case fileUploadStatus.UPLOADED:
//                         clearProgress(file.name);
//                         return;
//                     case fileUploadStatus.UPLOADING:
//                         saveProgress(file.name, realFileName, chunkNumber);
//                         uploadedChunks++;
//                         updateProgress(uploadedChunks, totalChunks, fileIndex);
//                         chunkNumber++
//                         break;
//                     default:
//                         break;
//                 }
//             }
//             else if (response.status === 200) {
//                 chunkNumber++;
//             }
//             else {
//                 break;
//             }
//
//         } catch (error) {
//             console.error(`Error uploading chunk ${chunkNumber}:`, error);
//             //alert('Upload failed chunk ' + chunkNumber);
//             isFailed = true;
//             break;
//         }
//     }
//     if(isFailed) throw new Error('Upload failed');
//     console.log(`Upload completed for ${file.name}`);
// }
//
// function generateFileName(fileType, extension) {
//     // Get the current date and time in the format yyyyMMdd_HHmmss
//     const date = new Date();
//     const timestamp = date.toISOString().replace(/[-:T.]/g, '').slice(0, 15);
//
//     // Generate a unique UUID
//     const uniqueId = crypto.randomUUID();
//
//     // Construct the filename
//     return `${fileType}_${timestamp}_${uniqueId}.${extension}`;
// }
//
// function updateProgress(uploadedChunks, totalChunks, fileIndex) {
//     const percentage = Math.round((uploadedChunks / totalChunks) * 100);
//     const progressBar = document.getElementById(`uploadProgress_${fileIndex}`);
//     const progressText = document.getElementById(`progressText_${fileIndex}`);
//     progressBar.value = percentage;
//     progressText.innerText = `${percentage}%`;
// }
//
// function saveProgress(fileName, realFileName, chunkNumber) {
//     const progress = getProgress(fileName) || {};
//     progress[chunkNumber] = {
//         realName: realFileName,
//         uploaded: true
//     };
//     localStorage.setItem(`${STORAGE_KEY}_${fileName}`, JSON.stringify(progress));
// }
//
// function getProgress(fileName) {
//     return JSON.parse(localStorage.getItem(`${STORAGE_KEY}_${fileName}`));
// }
//
// function clearProgress(fileName) {
//     localStorage.removeItem(`${STORAGE_KEY}_${fileName}`);
// }
//
// // Xóa tất cả dữ liệu liên quan đến quá trình upload sau khi hoàn tất
// function cleanUpAfterUpload(files) {
//     // Xóa các thanh tiến độ và dữ liệu của từng file
//     files.forEach(file => {
//         clearProgress(file.name); // Xóa khỏi localStorage
//     });
//
//     // Xóa toàn bộ giao diện upload (thanh progress, tên file)
//     const progressContainer = document.getElementById('progressContainer');
//     progressContainer.innerHTML = ''; // Loại bỏ các phần tử hiển thị tiến độ
//
//     // Làm mới input file
//     document.getElementById('fileInput').value = ''; // Reset input file
// }



///////////////////////////////////////////////////////////////////////////////////////////////
const MAX_FILES = 10; // Tối đa 10 file
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const selectedFiles = [];

document.getElementById('fileInput').addEventListener('change', handleFileSelection);
document.getElementById('submitFilesBtn').addEventListener('click', handleSubmitFiles);

function handleFileSelection(event) {
    const files = Array.from(event.target.files); // Lấy danh sách file
    selectedFiles.length = 0; // Clear previously selected files
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = ''; // Clear previous previews

    if (files.length > MAX_FILES) {
        alert(`You can upload a maximum of ${MAX_FILES} files at a time.`);
        cleanUpAfterUpload(files);
        return;
    }

    // Kiểm tra kích thước từng file
    files.forEach((file, index) => {
        if (file.size > MAX_FILE_SIZE) {
            alert(`${file.name} exceeds the maximum file size of 50MB.`);
            cleanUpAfterUpload(files);
            return;
        }
        selectedFiles.push(file);

        const preview = document.createElement('div');
        preview.style.display = 'flex';
        preview.style.flexDirection = 'column';
        preview.style.alignItems = 'center';
        preview.style.position = 'relative';

        const fileLabel = document.createElement('div');
        fileLabel.innerText = file.name;
        preview.appendChild(fileLabel);

        if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.controls = true;
            video.style.width = '300px';
            video.src = URL.createObjectURL(file);
            preview.appendChild(video);

        } else if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.style.width = '300px';
            img.src = URL.createObjectURL(file);
            preview.appendChild(img);
        }

        previewContainer.appendChild(preview);
    });

    document.getElementById('submitFilesBtn').disabled = selectedFiles.length === 0;
}

function handleSubmitFiles() {
    if (selectedFiles.length === 0) return;

    // Tạo một container để chứa thanh tiến độ cho từng file
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.innerHTML = ''; // Xóa thanh tiến độ trước đó

    // Upload từng file
    const uploadPromises = selectedFiles.map((file, index)=> uploadFileInChunks(file, index));

    // Chờ tất cả file được upload xong
    Promise.all(uploadPromises).then(() => {
        alert('All files uploaded successfully');
        cleanUpAfterUpload(selectedFiles); // Xóa dữ liệu và giao diện sau khi upload xong

    }).catch((error) => {
        console.error('Error uploading files:', error);
        alert('An error occurred while uploading files');
        window.location.reload(); // Refresh trang
    });
}

function updateProgress(uploadedChunksSize, totalFileSize, fileIndex) {
    const percentage = Math.round((uploadedChunksSize / totalFileSize) * 100);
    const progressBar = document.getElementById(`uploadProgress_${fileIndex}`);
    const progressText = document.getElementById(`progressText_${fileIndex}`);
    progressBar.value = percentage;
    progressText.innerText = `${percentage}%`;
}

// Xóa tất cả dữ liệu liên quan đến quá trình upload sau khi hoàn tất
function cleanUpAfterUpload() {
    // Xóa toàn bộ giao diện upload (thanh progress, tên file)
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.innerHTML = ''; // Loại bỏ các phần tử hiển thị tiến độ

    // Làm mới input file
    document.getElementById('fileInput').value = ''; // Reset input file
}

async function getNetworkSpeed(imageUrl, fileSizeBytes) {
    const start = Date.now();
    await fetch(imageUrl); // Tải ảnh để đo thời gian tải
    const end = Date.now();
    const durationSeconds = (end - start) / 1000; // Thời gian tải (giây)
    // Tính tốc độ Mbps
    return (fileSizeBytes * 8) / (durationSeconds * 1024 * 1024);
}

async function calculateChunkSize(imageUrl, fileSizeBytes) {
    const speed = await getNetworkSpeed(imageUrl, fileSizeBytes);

    // Xác định kích thước chunk dựa trên tốc độ mạng
    let chunkSize;
    if (speed < 1) chunkSize = 1024 * 1024;

    else if (speed < 5) chunkSize = 2 * 1024 * 1024;

    else if (speed < 10) chunkSize = 5 * 1024 * 1024;

    else chunkSize = 10 * 1024 * 1024;

    console.log(`Network speed: ${speed.toFixed(2)} Mbps, Chunk size: ${chunkSize / 1024} KB`);
    return chunkSize;
}

async function calculateFileHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

const imageUrl = "https://drive.google.com/file/d/1RTjV5ilssq5dITImalU6hhi0Xz1fLyQ6/view?usp=sharing";
const fileSizeBytes = 90112; // Kích thước file
document.getElementById('test').addEventListener('click', async () => {
    const speed = await getNetworkSpeed(imageUrl, fileSizeBytes);
    console.log(`Network Speed: ${speed} Mbps`);
});

async function uploadFileInChunks(file, fileIndex) {
    let chunkStartByte = 0;

    // Tạo phần tử progress bar cho từng file
    // Tạo phần tử progress bar và tên file cho từng file
    const progressWrapper = document.createElement('div');
    const fileNameLabel = document.createElement('div');
    const progressBar = document.createElement('progress');
    const progressText = document.createElement('span');

    fileNameLabel.innerText = `Uploading as: ${file.name}`;
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

    let isFailed = false;
    const fileMetadataId = crypto.randomUUID();
    while (chunkStartByte < file.size) {
        const chunkSize = await calculateChunkSize(imageUrl, fileSizeBytes);
        const chunk = file.slice(chunkStartByte, chunkStartByte + chunkSize);

        const formData = new FormData();
        formData.append('file', chunk);
        const request = {
            "fileMetadataId": fileMetadataId,
            "chunkHash": await calculateFileHash(chunk),
            "startByte": chunkStartByte,
            "totalSize": file.size,
            "contentType": file.type
        };
        formData.append('request',
            new Blob([JSON.stringify(request)], { type: 'application/json' })); // Đảm bảo là Blob JSON

        console.log((file.type));
        try {
            const response = await fetch(SERVER_DOMAIN + '/file/upload-chunk', {
                method: 'POST',
                body: formData,
            });
            if (response.status === 200 || 201) {
                const data = await response.json()
                chunkStartByte = data.results;
                updateProgress(chunkStartByte, file.size, fileIndex);

            } else {
                isFailed = true;
                break;
            }

        } catch (error) {
            console.error(`Error uploading chunk ${chunkStartByte}:`, error);
            throw new Error('Upload failed');
        }
    }
    if(isFailed) throw new Error('Upload failed');
    console.log(`Upload completed for ${file.name}`);
}