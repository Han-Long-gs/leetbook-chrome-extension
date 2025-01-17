document.addEventListener("DOMContentLoaded", () => {
    const filter = document.getElementById("dropdown")
    const questionList = document.getElementById("question-list");

    // for test
    const questions = [
        { title: "1. Two Sum", categories: ["array", "hash-table"] },
        { title: "2. Add Two Numbers", categories: ["linked-list", "math"] },
        { title: "3. Longest Substring Without Repeating Characters", categories: ["string", "sliding-window"] },
        { title: "4. Median of Two Sorted Arrays", categories: ["array", "binary-search"] },
        { title: "5. Longest Palindromic Substring", categories: ["string", "dynamic-programming"] },
      ];

    // render all the questions for the given category in question-list
    const renderQuestions = (category) => {
        questionList.innerHTML = "";

        // find all the questions for the given category
        const filteredQuestions = 
            category === "all" ? questions.map((q) => q.title) : questions.filter((q) => q.categories.includes(category)).map((q) => q.title);
        
        // render error message if no questions were found
        if (filteredQuestions.length === 0) {
            const msg = document.createElement("li");
            msg.textContent = "No questions found for this category";
            msg.className = "message"
            questionList.appendChild(msg)
        }

        // render all the questions in the filteredQuestions list && two operational buttons for every question
        filteredQuestions.forEach((qtitle) => {
            const listItem = document.createElement("li");
            listItem.className = "list-item"
            listItem.innerHTML = `
                <span class="question-title" title="${qtitle}">${qtitle}</span>
                <div class="list-button-group">
                    <button class="button" id="redo-btn">Redo</button>
                    <button class="button" id="delete-btn">X</button>
                </div>
            `;
            questionList.appendChild(listItem);
        });
    };

    // re-render all the questions if user selects a new category from the dropdown menu
    filter.addEventListener("change", () => {
        const newCategory = filter.value;
        renderQuestions(newCategory);
    });

    renderQuestions("all")

})

    