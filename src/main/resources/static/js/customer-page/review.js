let offset = 0;
const limit = 10;
let nextOffset = null;

let tabReview = document.getElementById('tabReview')
let fieldReviewId = tabReview.getAttribute("fieldId");

const user = localStorage.getItem('current-user');
const userComment = JSON.parse(user);

loadReviews();

async function loadImage(id) {
    try {
        const avatarResponse = await fetch(`${SERVER_DOMAIN}/file/metadata-by-user?userId=${id}`);
        const avatarData = await avatarResponse.json();

        return avatarData.results || "/sports-field-booking/image/user-info/user-info.png";
    } catch (error) {

        return "/sports-field-booking/image/user-info/user-info.png";
    }
}


async function loadReviews() {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/reviews/${fieldReviewId}?offset=${offset}&limit=${limit}`);
        const data = await response.json();

        await appendReviews(data.items);

        // Update the next offset
        nextOffset = data.pagination.nextOffset;

        // Hide or disable the load more button if there's no nextOffset
        if (!nextOffset) {
            document.getElementById('loadMoreButton').style.display = 'none';
        }

    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

async function loadReplies(reviewId) {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/reviews/replies/${reviewId}`);
        const data = await response.json();

        return data.items;
    } catch (error) {
        console.error('Error fetching replies:', error);
        return [];
    }
}

async function appendReviews(reviews) {
    const container = document.getElementById('reviews');
    container.innerHTML = '';

    const reviewElement = await appendNewComment()
    container.appendChild(reviewElement)
    // thêm vào form các comment cũ
    for (const review of reviews) {
        if (!review.parentReview) {
            const repliesValue = await loadReplies(review.id)
            const reviewElement = await createReviewElement(review, repliesValue.length);
            container.appendChild(reviewElement);

            const parentReviewElement = document.getElementById('replyInputContainer-' + review.id);

            //ô thêm reply mới
            const newReplyElement = await appendNewReply(review.id)

            parentReviewElement.appendChild(newReplyElement)


            // các comment con trong các cmt cũ
            await appendReplies(review.id, parentReviewElement)
        }
    }

    async function createReviewElement(review, repliesValue) {
        const reviewElement = document.createElement('div');
        reviewElement.classList.add('review');

        const image = await loadImage(review.user.id)

        reviewElement.innerHTML = `
            <div class="border-l-2 rounded-xl p-2 my-4 ml-12">
                <div class="flex flex-col">
                    <div class="flex flex-row items-center">
                        <img src="${image}" class="h-10 w-10 m-2 rounded-full" alt="" />
                        <div class="flex flex-col">
                            <div class="flex items-center">
                                <span class="text-green-600 italic">${review.user.firstName} ${review.user.lastName}</span>
                                <i class="fa-solid fa-code-commit fa-xs ml-5 mr-1 text-gray-500"></i>
                                <span class="text-xs text-gray-500 italic">${formatDate(review.createdAt)}</span>
                            </div>
                            <span class="text-gray-700 text-md">${review.comment}</span>
                        </div>
                    </div>
                    <div class=" ml-5">
                        <i class="fa-solid fa-l text-gray-400"></i>
                        <span class="text-sm text-gray-500 select-none buttonNewChildCmt cursor-pointer">Xem ${repliesValue} phản hồi</span>
                    </div>
                </div>
                <div class="mt-2 reply-input-container hidden" id="repliesContainer-${review.id}">
                    <div class="border-l-2 rounded-xl p-2 my-4 ml-12">
                        <div class="ml-4" id="replyInputContainer-${review.id}">
                            
                        </div>
                    </div>
                </div>
            </div>
        `;

        // mở các comment con và chỗ trả lời bình luận
        const replyButton = reviewElement.querySelector('.buttonNewChildCmt');
        replyButton.addEventListener('click', async () => {
            const repliesElement = document.getElementById(`repliesContainer-${review.id}`)
            repliesElement.classList.toggle('hidden');

        });

        return reviewElement;
    }

}

// element new comment
async function appendNewComment() {
    const reviewElement = document.createElement('div');
    const image = await loadImage(userComment.id)

    reviewElement.classList.add('review');
    reviewElement.innerHTML = `
            <div class="border-l-2 rounded-xl p-2 my-4 ml-12">
                <div class="flex flex-col">
                    <div class="flex flex-row items-center">
                        <img src="${image}" class="h-10 w-10 m-2 rounded-full" alt="" />
                        <div class="flex flex-col">
                            <div class="flex flex-col">
                                <span class="text-red-600 italic">${userComment.firstName} ${userComment.lastName}</span>
                                <input type="text" class="border-0 outline-none rounded-md p-1 text-gray-700 new-review-input" id="newReviewValue" placeholder="Write a review..." />
                            </div>
                        </div>
                    </div>
                    <div class="ml-14">
                        <i class="fa-solid fa-cloud-arrow-up text-green-400 cursor-pointer new-review-submit"></i>
                    </div>
                </div>
            </div>
        `

    //chức năng thêm comment mới
    const reviewInput = reviewElement.querySelector('.new-review-input');
    reviewInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            await submitNewReview(reviewInput);
        }
    });

    async function submitNewReview(inputElement) {
        const reviewInput = inputElement.value;
        if (reviewInput) {
            await sendReview(reviewInput);
            loadReviews();
        }
    }

    return reviewElement
}

// form new reply
async function appendNewReply(reviewId) {
    const element = document.createElement('div')
    const image = await loadImage(JSON.parse(currentUser).id);

    element.innerHTML = `
        <div class="flex flex-col">
            <div class="flex flex-row items-center">
                <img src="${image}" class="h-10 w-10 m-1 rounded-full" alt="" />
                <div class="flex flex-col">
                    <span class="text-red-600 italic">${userComment.firstName} ${userComment.lastName}</span>
                    <input type="text" class="border-0 outline-none rounded-md p-1 text-gray-700 reply-input" placeholder="Write a review..." />
                </div>
            </div>
            <div class="ml-14">
                <i class="fa-solid fa-cloud-arrow-up text-green-400 cursor-pointer new-review-submit"></i>
            </div>
        </div>
    `
    //thêm reply mới

    const replyInput = element.querySelector('.reply-input');
    replyInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            await handleReply(reviewId, replyInput);
        }
    });
    return element
}

//hàm thực hiện thêm reply
async function handleReply(reviewId, inputElement) {
    const replyText = inputElement.value.trim();
    if (replyText) {
        await sendReply(reviewId, replyText);

        //sau khi thêm sử lý lại UI
        const parentReviewElement = document.getElementById('replyInputContainer-' + reviewId);
        parentReviewElement.innerHTML = '';

        //ô thêm reply mới
        const newReplyElement = await appendNewReply(reviewId)
        //thêm các comment con
        parentReviewElement.appendChild(newReplyElement)
        await appendReplies(reviewId, parentReviewElement)
    }
}

// append replies
async function appendReplies(reviewId, container) {
    const data = await loadReplies(reviewId);

    for (const reply of data) {
        try {
            const replyElement = document.createElement('div');
            replyElement.classList.add('reply');

            const image = await loadImage(reply.user.id);

            replyElement.innerHTML = `
                <div class="flex flex-row items-center">
                    <img src="${image}" class="h-10 w-10 m-1 rounded-full mt-5" alt="Avatar" />
                    <div class="flex flex-col">
                        <div class="flex items-center">
                            <span class="text-green-600 italic">${reply.user.firstName} ${reply.user.lastName}</span>
                            <i class="fa-solid fa-code-commit fa-xs ml-5 mr-1 text-gray-500"></i>
                            <span class="text-xs text-gray-500 italic">${formatDate(reply.updatedAt)}</span>
                        </div>
                        <span class="text-gray-700">${reply.comment}</span>
                    </div>
                </div>
            `;
            container.appendChild(replyElement);
        } catch (error) {
            console.error('Error loading reply:', error);
        }
    }
}

// new comment
async function sendReview(content) {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + getAccessTokenFromCookie()
            },
            body: JSON.stringify({
                comment: content,
                userID: userComment.id,
                sportFieldId: getSportFieldIdFromPath()
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to send review:', response.status, errorText);
        } else {
            console.log('Review sent successfully');
        }
    } catch (error) {
        console.error('Error sending review:', error);
    }
}

// reply
async function sendReply(parentID, content) {
    try {
        const url = `${SERVER_DOMAIN}/reviews/${parentID}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parentReviewID: parentID,
                comment: content,
                userID: userComment.id,
                sportFieldId: getSportFieldIdFromPath()
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to send reply:', response.status, errorText);
        } else {
            console.log('Reply sent successfully');
        }
    } catch (error) {
        console.error('Error sending reply:', error);
    }
}


function getSportFieldIdFromPath() {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 2]; // Assuming sportFieldId is the last part of the path
}


// Handle load more button click
document.getElementById('loadMoreButton').addEventListener('click', () => {
    offset = offset + 1;
    loadReviews();
});