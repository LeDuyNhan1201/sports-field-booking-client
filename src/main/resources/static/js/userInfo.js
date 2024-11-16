const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const inputFields = document.querySelectorAll('input');
const displayFields = document.querySelectorAll('span[id$="Display"]');
const selectFields = document.querySelectorAll('select');
const genderMaleText = document.getElementById('gender_male').textContent;
const genderFemaleText = document.getElementById('gender_female').textContent;
const genderOtherText = document.getElementById('gender_other').textContent;
const profilePicture = document.getElementById('profilePicture');
const changePictureInput = document.getElementById('changePictureInput');

let profilePictureData = null; 

document.addEventListener('DOMContentLoaded', function () {
    const userID = JSON.parse(currentUser).id;
    loadUserInfo(userID)
});

editBtn.addEventListener('click', () => {
    inputFields.forEach(input => input.classList.remove('hidden'));
    selectFields.forEach(select => select.classList.remove('hidden'));
    displayFields.forEach(display => display.classList.add('hidden'));
    saveBtn.classList.remove('hidden');

    changePictureInput.classList.add('hidden');
});

async function deleteExistingAvatar(userID) {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/file/delete-file/${userID}`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAccessTokenFromCookie()
            },
        });

        console.log(response);
        
    } catch (error) {
        console.error('Error deleting existing avatar:', error);
    }
}

changePictureInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        const CHUNK_SIZE = 1024 * 1024;
        let chunkStartByte = 0;
        const fileMetadataId = crypto.randomUUID();
        
        while (chunkStartByte < file.size) {
            const chunk = file.slice(chunkStartByte, chunkStartByte + CHUNK_SIZE);
            const chunkHash = await calculateFileHash(chunk);
            
            const formData = new FormData();
            formData.append('file', chunk);
            const request = {
                "fileMetadataId": fileMetadataId,
                "chunkHash": chunkHash,
                "startByte": chunkStartByte,
                "totalSize": file.size,
                "contentType": file.type,
                "ownerId": JSON.parse(currentUser).id,
                "fileMetadataType": "USER_AVATAR"
            };
            //await deleteExistingAvatar(JSON.parse(currentUser).id)
            
            formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));

            try {
                const response = await fetch(`${SERVER_DOMAIN}/users/avatar`, {
                    method: 'POST',
                    body: formData,
                });
                
                if (response.ok) {
                    const data = await response.json();
                    chunkStartByte = data.results;

                    if (chunkStartByte >= file.size)
                        alert("Avatar uploaded successfully!");

                } else {
                    console.error('Error uploading chunk:', response);
                    throw new Error('Upload failed');
                }
            } catch (error) {
                console.error('Error uploading chunk:', error);
                break;
            }
        }

        const reader = new FileReader();
        reader.onload = () => {
            profilePictureData = reader.result;
            profilePicture.src = profilePictureData;
        };
        reader.readAsDataURL(file);
    }
});

async function calculateFileHash(fileChunk) {
    const buffer = await fileChunk.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}


// user info
saveBtn.addEventListener('click', async () => {
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const birthday = document.getElementById('birthday').value;
    const gender = document.getElementById('gender').value;

    const userData = {
        id: JSON.parse(currentUser).id,
        firstName: firstname,
        lastName: lastname,
        mobileNumber: phone,
        email: email,
        birthdate: birthday,
        gender: gender,
    };

    try {
        const response = await fetch(`${SERVER_DOMAIN}/users/${JSON.parse(currentUser).id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAccessTokenFromCookie()
            },
            body: JSON.stringify(userData), 
        });

        console.log(response);
                

        if (response.ok) {
            document.getElementById('firstnameDisplay').textContent = firstname;
            document.getElementById('lastnameDisplay').textContent = lastname;
            document.getElementById('phoneDisplay').textContent = phone;
            document.getElementById('emailDisplay').textContent = email;
            document.getElementById('birthdayDisplay').textContent = birthday;
            document.getElementById('genderDisplay').textContent = gender === 'Male' ? genderMaleText : (gender === 'Female' ? genderFemaleText : genderOtherText);
            
            inputFields.forEach(input => input.classList.add('hidden'));
            selectFields.forEach(select => select.classList.add('hidden'));
            displayFields.forEach(display => display.classList.remove('hidden'));
            saveBtn.classList.add('hidden');

            alert('Save user information successfully');
        } else {
            alert('Failed to save user information successfully');
        }
    } catch (error) {
        console.error("Error saving user info:", error);
    }
});

async function signOutUser() {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/auth/sign-out`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accessToken: getAccessTokenFromCookie(),
                refreshToken: getRefreshTokenFromCookie()
            })
        });

        if (!response.ok) {
            console.error('Failed to log out');
        } else {
            console.log('Logged out successfully');
        }

        localStorage.removeItem('current-user');
        document.cookie.split(";").forEach(cookie => {
            document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
        });

    } catch (error) {
        console.error('Error while logging out:', error);
    }
}

document.getElementById('deleteAccountBtn').addEventListener('click', async () => {
    if (confirm('Do you want to delete your account?')) {
        const userId = JSON.parse(localStorage.getItem('current-user')).id;

        try {
            const response = await fetch(`${SERVER_DOMAIN}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accessToken: getAccessTokenFromCookie(),
                    refreshToken: getRefreshTokenFromCookie()
                })
            });

            if (response.ok) {
                alert('Your account has been deleted successfully.');
                
                await signOutUser();

                window.location.href = CLIENT_DOMAIN; 
            } else {
                alert('Failed to delete your account. Please try again later.');
            }
        } catch (error) {
            console.error('Error while deleting account:', error);
        }
    }
});


async function loadUserInfo(userID) {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/users/${userID}`)
        const data = await response.json()

        const avatarResponse = await fetch(`${SERVER_DOMAIN}/file/metadata-by-user?userId=${userID}`);
        const avatarData = await avatarResponse.json();

        if (avatarData.results) {
            profilePicture.src = avatarData.results;
        }
        document.getElementById('firstnameDisplay').textContent = data.firstName;
        document.getElementById('lastnameDisplay').textContent = data.lastName;
        document.getElementById('phoneDisplay').textContent = data.mobileNumber;
        document.getElementById('emailDisplay').textContent = data.email;
        document.getElementById('birthdayDisplay').textContent = data.birthdate;
        document.getElementById('usernameDisplay').textContent = data.username;

        let textGender;
        if (data.gender === 'Male') {
            textGender = genderMaleText;
        } else if (data.gender === 'Female') {
            textGender = genderFemaleText;
        } else {
            textGender = genderOtherText
        }

        document.getElementById('genderDisplay').textContent = textGender;
        // edit
        document.getElementById('firstname').value = data.firstName;
        document.getElementById('lastname').value = data.lastName;
        document.getElementById('phone').value = data.mobileNumber;
        document.getElementById('email').value = data.email;
        document.getElementById('birthday').value = data.birthdate;
        document.getElementById('gender').value = data.gender;
        document.getElementById('username').value = data.username;
    } catch (error) {
        console.error("Error loading user info:", error);
    }
}