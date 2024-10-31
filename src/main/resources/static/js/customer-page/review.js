let offset = 0;
const limit = 10;
let nextOffset = null;
id = container.getAttribute("fieldId");

loadReviews();

async function loadReviews() {
    try {
//        showLoading(true);
        const response = await fetch(`${SERVER_DOMAIN}/reviews/${id}?offset=${offset}&limit=${limit}`);
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

    for (let review of reviews) {
        const reviewElement = document.createElement('div');
        reviewElement.classList.add('review');
        reviewElement.innerHTML = `
            <div class="border-l-2 rounded-xl p-2 my-4 ml-12">
                <div class="flex flex-col">
                    <div class="flex flex-row items-center">
                        <img src="https://placehold.co/600x400" class="h-10 w-10 m-2 rounded-full" alt="" />
                        <div class="flex flex-col">
                            <span class="text-green-600 italic">${review.user.firstName} ${review.user.lastName}</span>
                            <span class="text-gray-700">${review.comment}</span>
                        </div>
                    </div>
                    <div class="ml-3">
                        <i class="fa-solid fa-cloud-arrow-up text-blue-400 cursor-pointer buttonNewChildCmt"></i>
                    </div>
                </div>
                <div class="ml-10" id="repliesContainer-${review.id}">
                    <!-- Replies will be loaded here -->
                </div>
            </div>
        `;

        container.appendChild(reviewElement);
    
        // Load replies for the current review
        const replies = await loadReplies(review.id);
        appendReplies(replies, `repliesContainer-${review.id}`);
    }
}

function appendReplies(replies, containerId) {
    const container = document.getElementById(containerId);
    replies.forEach(reply => {
        const replyElement = document.createElement('div');
        replyElement.classList.add('reply');
        replyElement.innerHTML = `
            <div class="flex flex-row items-center">
                <img src="https://placehold.co/600x400" class="h-10 w-10 m-1 rounded-full" alt="Avatar" />
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
    return segments[segments.length - 1]; // Assuming sportFieldId is the last part of the path
}


// Handle load more button click
document.getElementById('loadMoreButton').addEventListener('click', () => {
    if (nextOffset !== null) {
        offset = nextOffset;
        loadReviews();
    }
});