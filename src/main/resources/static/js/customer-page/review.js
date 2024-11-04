let offset = 0;
const limit = 10;
let nextOffset = null;

let tabReview = document.getElementById('tabReview')
let fieldReviewId = tabReview.getAttribute("fieldId");

const currentUser = localStorage.getItem('current-user');
const userComment = JSON.parse(currentUser);

loadReviews();

async function loadReviews() {
    try {
        //        showLoading(true);
        const response = await fetch(`${SERVER_DOMAIN}/reviews/${fieldReviewId}?offset=${offset}&limit=${limit}`);
        const data = await response.json();

        // Append reviews to the container
        await appendReviews(data.items);

        // Update the next offset
        nextOffset = data.pagination.nextOffset;

        // Hide or disable the load more button if there's no nextOffset
        if (!nextOffset) {
            document.getElementById('loadMoreButton').style.display = 'none';
        }
        //        showLoading(false);

    } catch (error) {
        //        showLoading(false);
        console.error('Error fetching reviews:', error);
    }
}

async function loadReplies(reviewId) {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/reviews/replies/${reviewId}`);
        const data = await response.json();

        return data.items; // Return the replies for a specific review
    } catch (error) {
        console.error('Error fetching replies:', error);
        return [];
    }
}

async function appendReviews(reviews) {
    const container = document.getElementById('reviews');
    container.innerHTML = '';

    for (let review of reviews) {
        console.log(review);

        if (review.parentReview) continue;

        const reviewElement = document.createElement('div');
        reviewElement.classList.add('review');
        reviewElement.innerHTML = `
            <div class="border-l-2 rounded-xl p-2 my-4 ml-12">
                <div class="flex flex-col">
                    <div class="flex flex-row items-center">
                        <img src="${userComment.avatar}" class="h-10 w-10 m-2 rounded-full" alt="" />
                        <div class="flex flex-col">
                            <span class="text-green-600 italic">${review.user.firstName} ${review.user.lastName}</span>
                            <span class="text-gray-700">${review.comment}</span>
                        </div>
                    </div>
                    <div class="ml-3">
                        <i class="fa-solid fa-cloud-arrow-up text-blue-400 cursor-pointer buttonNewChildCmt"></i>
                    </div>
                </div>
                <div class="ml-10 mt-2 hidden reply-input-container" id="replyInputContainer-${review.id}">
                    <div class="border-l-2 rounded-xl p-2 my-4 ml-12">
                        <div class="flex flex-col">
                            <div class="flex flex-row items-center">
                                <img src="${userComment.avatar}" class="h-10 w-10 m-2" alt="" />
                                <div class="flex flex-col">
                                    <span class="text-red-600 italic">${userComment.firstName} ${userComment.lastName}</span>
                                    <input type="text" class="border-0 outline-none rounded-md p-1 text-gray-700 reply-input" placeholder="Write a reply..." />
                                </div>
                            </div>
                            <div class="ml-3">
                                <i class="fa-solid fa-cloud-arrow-up text-blue-400 cursor-pointer"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ml-12" id="repliesContainer-${review.id}"></div> <!-- Container for replies -->
            </div>
        `;

        reviewElement.querySelector('.buttonNewChildCmt').addEventListener('click', () => {
            const replyInputContainer = document.getElementById(`replyInputContainer-${review.id}`);
            replyInputContainer.classList.toggle('hidden');
        });

        reviewElement.querySelector('.reply-input').addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const replyInput = e.target.value.trim();
                if (replyInput) {
                    await sendReply(review.id, replyInput);

                    e.target.value = '';

                    const replyInputContainer = document.getElementById(`replyInputContainer-${review.id}`);
                    replyInputContainer.classList.add('hidden');

                    const newReplies = await loadReplies(review.id);
                    appendReplies(newReplies, `repliesContainer-${review.id}`);
                }
            }
        });

        container.appendChild(reviewElement);

        const replies = await loadReplies(review.id);
        appendReplies(replies, `repliesContainer-${review.id}`);
    }
}

// add comment section for new user
async function submitNewReview() {
    const reviewInput = newReviewElement.querySelector('.new-review-input').value.trim();
    if (reviewInput) {
        await sendReview(reviewInput);
        newReviewElement.querySelector('.new-review-input').value = '';
        loadReviews();
    }
}

function createCommentSection() {
    const newReviewElement = document.createElement('div');
    newReviewElement.classList.add('new-review');
    newReviewElement.innerHTML = `
    <div class="border-l-2 rounded-xl p-2 my-4 ml-12">
        <div class="flex flex-col">
            <div class="flex flex-row items-center">
                <img src="${userComment.avatar}" class="h-10 w-10 m-2 rounded-full" alt="" />
                <div class="flex flex-col">
                    <span class="text-red-600 italic">${userComment.firstName} ${userComment.lastName}</span>
                    <input type="text" class="border-0 outline-none rounded-md p-1 text-gray-700 new-review-input" placeholder="Write a review..." />
                </div>
            </div>
            <div class="ml-3">
                <i class="fa-solid fa-cloud-arrow-up text-blue-400 cursor-pointer new-review-submit"></i>
            </div>
        </div>
    </div>
`;

    newReviewElement.querySelector('.new-review-input').addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            await submitNewReview();
        }
    });

    container.appendChild(newReviewElement);
}

// new comment
async function sendReview(content) {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
                parentId: parentID,
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

// append replies
function appendReplies(replies, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    replies.forEach(reply => {
        const replyElement = document.createElement('div');
        replyElement.classList.add('reply');
        replyElement.innerHTML = `
            <div class="flex flex-row items-center">
                <img src="${userComment.avatar}" class="h-10 w-10 m-1 rounded-full mt-5" alt="Avatar" />
                <div class="flex flex-col">
                    <span class="text-green-600 italic">${reply.user.firstName} ${reply.user.lastName}</span>
                    <span class="text-gray-700">${reply.comment}</span>
                </div>
            </div>
        `;
        container.appendChild(replyElement);
    });
}



function getSportFieldIdFromPath() {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 2]; // Assuming sportFieldId is the last part of the path
}


// Handle load more button click
document.getElementById('loadMoreButton').addEventListener('click', () => {
    if (nextOffset !== null) {
        offset = nextOffset;
        loadReviews();
    }
});