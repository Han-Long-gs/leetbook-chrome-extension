document.addEventListener("DOMContentLoaded", () => {
    const filter = document.getElementById("dropdown")
    const problemList = document.getElementById("problem-list");
    const addBtn = document.getElementById("add-btn");

    let storageCache = {}; 
    let allProblems = [];

    // get all the problems from storage and save them to the storageCache
    chrome.storage.local.get("problems", (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error reading from storage: ", chrome.runtime.lastError);
        } else {
            console.log(result.problems);
            console.log("Successfully read from storage");
            storageCache = result.problems || {};
            allProblems = Object.values(storageCache);
            renderProblems("all");
        }
    });

    // save all the changes to the storage
    const saveAll = () => {
        chrome.storage.local.set({"problems": storageCache}, () => {
            if (chrome.runtime.lastError) {
                console.error("Error saving to storage: ", chrome.runtime.lastError);
            } else {
                console.log("Successfully saved all the changes to the storage");
            }
        });
    }
    
    // add a new problem manually by using the add-btn
    // read the new problem's title from the current tab's page
    addBtn.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];

            // console.log(tab.url); // for test

            // send message to content.js to retrieve the problem title from leetcode DOM
            if (tab.url && 
                tab.url.includes("leetcode.com/problems/")) {
                    chrome.tabs.sendMessage(tab.id, { 
                        action: "GET_PROBLEM_TITLE",
                        url: tab.url
                    }, (response) => {
                        if (response) {
                            // retrieve new problem's title and topics and url from the response sent by content.js
                            const { title, topics, newUrl } = response;
                            console.log("New Problem:", title); // for test
                            console.log("New Problem Topics:", topics); // for test
                            console.log("New Problem url:", newUrl); // for test
                            addNewProblemByBtn(title, topics, newUrl);
                        }
                    });
                } else {
                    // TODO
                    console.log("Please go to the LeetCode Problem's description page");
                }
        });
    });

    // add a new failed problem by add-btn
    const addNewProblemByBtn = (title, topics, newUrl) => {
        if (storageCache[title]) {
            storageCache[title].failedTimes++;
        } else {
            let newProblem = { title: title, topics: topics, url: newUrl, failedTimes: 1 };
            storageCache[title] = newProblem;
        }
        allProblems = Object.values(storageCache);
        saveAll();
        renderProblems(filter.value);
    };

    // delete a problem by delete-btn
    const deleteProblem = (qtitle) => {
        delete storageCache[qtitle];
        allProblems = Object.values(storageCache);
        saveAll();
        renderProblems(filter.value);
    }
    
    // render all the problems for the given topic in problem-list
    const renderProblems = (topic) => {
        problemList.innerHTML = "";

        // find all the problems for the given topic
        const filteredProblems = 
            topic === "all" ? allProblems.map((p) => p.title) : allProblems.filter((p) => p.topics.includes(topic)).map((p) => p.title);
        
        // render error message if no problems were found
        if (filteredProblems.length === 0) {
            const msg = document.createElement("li");
            msg.textContent = "No problems found for this topic";
            msg.className = "message"
            problemList.appendChild(msg)
        }

        // render all the problems in the filteredProblems list && two operational buttons for every problem
        filteredProblems.forEach((qtitle) => {
            const listItem = document.createElement("li");
            listItem.className = "list-item"
            listItem.innerHTML = `
                <span class="problem-title" title="${qtitle}">${qtitle}</span>
                <div class="list-button-group">
                    <button class="button redo-btn">Redo</button>
                    <button class="button delete-btn">X</button>
                </div>
            `;
            problemList.appendChild(listItem);

            const redoBtn = listItem.querySelector(".redo-btn");
            redoBtn.addEventListener("click", () => {
                const url = storageCache[qtitle].url;
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const currentTabId = tabs[0].id;
                    chrome.tabs.update(currentTabId, {
                        url: url,
                        active: true
                    });
                });
            });

            const deleteBtn = listItem.querySelector(".delete-btn");
            deleteBtn.addEventListener("click", () => {
                deleteProblem(qtitle);
            })
        });
    };

    // re-render all the problems if user selects a new topic from the dropdown menu
    filter.addEventListener("change", () => {
        const newTopic = filter.value;
        renderProblems(newTopic);
    });
})

// for test
    // const problems = [
    //     { title: "Two Sum", 
    //       topics: ["array", "hash-table"], 
    //       url: "https://leetcode.com/problems/two-sum/description/", 
    //       failedTimes: 3 },
    //     { title: "Add Two Numbers", 
    //       topics: ["linked-list", "math"], 
    //       url: "https://leetcode.com/problems/add-two-numbers/description/", 
    //       failedTimes: 1 },
    //     { title: "Longest Substring Without Repeating Characters", 
    //       topics: ["string", "sliding-window"], 
    //       url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/description/",
    //       failedTimes: 5 },
    //     { title: "Median of Two Sorted Arrays", 
    //       topics: ["array", "binary-search"],
    //       url: "https://leetcode.com/problems/median-of-two-sorted-arrays/description/",
    //       failedTimes: 2 },
    //     { title: "Longest Palindromic Substring", 
    //       topics: ["string", "dynamic-programming"],
    //       url: "https://leetcode.com/problems/longest-palindromic-substring/description/",
    //       failedTimes: 4 },
    //   ];    