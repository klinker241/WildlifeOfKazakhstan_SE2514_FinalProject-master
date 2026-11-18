// Assignment 5: Contact page
// DOM updates, events, switch, callback, and form feedback.
document.addEventListener("DOMContentLoaded", function () {
    const visitorName = document.getElementById("visitor-name");
    const greeting = document.getElementById("visitor-greeting");
    document.getElementById("greeting-button").addEventListener("click", function () {
        const name = visitorName.value.trim();
        greeting.textContent = name ? "Welcome, " + name + "! Let's explore Kazakhstan's wildlife." : "Please enter your name first.";
        greeting.classList.remove("contact-animate");
        void greeting.offsetWidth;
        greeting.classList.add("contact-animate");
    });
    visitorName.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("greeting-button").click();
        }
    });

    const topic = document.getElementById("contact-topic");
    const result = document.getElementById("topic-result");
    const topicInformation = {
        animals: "Kazakhstan is home to snow leopards, saigas, wolves and golden eagles.",
        parks: "National parks protect landscapes, habitats and wildlife.",
        volunteering: "You can help nature by keeping parks clean and respecting animals."
    };
    document.getElementById("topic-button").addEventListener("click", function () {
        switch (topic.value) {
            case "animals": result.textContent = topicInformation.animals; break;
            case "parks": result.textContent = topicInformation.parks; break;
            case "volunteering": result.textContent = topicInformation.volunteering; break;
            default: result.textContent = "Please select a topic.";
        }
    });

    // Form submission is handled by Assignment 6 jQuery script.

});