const getProblem = (url) => {
    try {
        const problemHref = url.split("/")[4];
        const problemTitle = document.querySelector(`a[href="/problems/${problemHref}/"]`).textContent.trim();
        const topicElements = document.querySelectorAll('a[href^="/tag/"]');
        if (!problemTitle || topicElements.length === 0) {
            throw new Error();
        }
        // Array.from transform the node list to a real list of DOM node, so that we can use map on it
        const topics = Array.from(topicElements).map((e) => e.textContent.trim());
        const processedUrl = `http://leetcode.com/problems/${problemHref}/description/`;
        console.log("get",problemTitle)
        return { problemTitle, topics, processedUrl };
    } catch (error) {
        alert("Please go to the LeetCode problem's description page!\n example link: leetcode.com/problems/two-sum/description/");
        return null;
    }
}

// message is sent from popup when the add-btn is clicked
// message = { action: describe what action to take, url: the url of the current active tab }
// sendResponse: callback fn, send the parameter as response to popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message.url);

    if (message.action === "GET_PROBLEM_TITLE") {
        if (message.url) {
            const { problemTitle, topics, processedUrl } = getProblem(message.url);
            console.log(problemTitle, processedUrl);
            if (problemTitle && processedUrl) {
                sendResponse({
                    title: problemTitle,
                    topics: topics,
                    newUrl: processedUrl
                });
            } else {
                sendResponse({ error: "Unable to extract problem title." });
            }
        } else {
            sendResponse({ error: "Unable to get tab URL" });
        }
    }
});

// test if this is injected to target leetcode sites
console.log("content.js loaded");
