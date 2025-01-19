const getProblemTitle = (url) => {
    const problemHref = url.split("/")[4];
    console.log(problemHref); // for test
    const problemTitle = document.querySelector(`a[href="/problems/${problemHref}/"]`).textContent.trim();
    console.log(problemTitle); // for test
    processedUrl = `http://leetcode.com/problems/${problemHref}/description`;
    return { problemTitle, processedUrl };
};

const getProblemTopics = (url) => {
    const topicElements = document.querySelectorAll('a[href^="/tag/"]');
    // Array.from transform the node list to a real list of DOM node, so that we can use map on it
    const topics = Array.from(topicElements).map((e) => e.textContent.trim());
    console.log(topics); // for test
    return topics;
}

// message is sent from popup when the add-btn is clicked
// message = { action: describe what action to take, url: the url of the current active tab }
// sendResponse: callback fn, send the parameter as response to popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message.url); // for test

    if (message.action === "GET_PROBLEM_TITLE") {
        if (message.url) {
            // the processedUrl (for redo-btn) will be in this form exactly: leetcode.com/problems/{problemTitle}/description
            const { problemTitle, processedUrl } = getProblemTitle(message.url);
            const topicList = getProblemTopics(message.url);
            console.log(problemTitle, processedUrl); // for test
            if (problemTitle && processedUrl) {
                sendResponse({
                    title: problemTitle,
                    topics: topicList,
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