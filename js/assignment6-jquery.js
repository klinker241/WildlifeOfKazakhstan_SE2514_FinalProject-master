
// Assignment 6 — selected tasks:
// Task 1: Real-time Search
// Task 2: Autocomplete
// Task 3: Search Highlighting
// Task 4: Scroll Progress Bar
// Task 7: Notification System

$(document).ready(function () {
    console.log("jQuery is ready!");

    // TASK 4: Scroll Progress Bar
    $("body").prepend(
        '<div id="scroll-progress-track">' +
        '<div id="scroll-progress-fill"></div></div>'
    );

    function updateScrollProgress() {
        const scrollTop = $(window).scrollTop();
        const scrollableHeight =
            $(document).height() - $(window).height();

        const progress = scrollableHeight > 0
            ? (scrollTop / scrollableHeight) * 100
            : 0;

        $("#scroll-progress-fill").css("width", progress + "%");
    }

    $(window).on(
        "scroll.assignment6 resize.assignment6",
        updateScrollProgress
    );

    updateScrollProgress();

    // TASK 7: Notification System
    function showToast(message) {
        let $toast = $("#assignment6-toast");

        if (!$toast.length) {
            $toast = $(
                '<div id="assignment6-toast" role="status" ' +
                'aria-live="polite"></div>'
            );

            $("body").append($toast);
        }

        $toast.stop(true, true).text(message).fadeIn(200);

        clearTimeout(showToast.timer);

        showToast.timer = setTimeout(function () {
            $toast.fadeOut(350);
        }, 2200);
    }

    // Find Featured Animals section
    const $featuredHeading = $("main h2").filter(function () {
        return $(this).text().trim() === "Featured Animals";
    }).first();

    const $featuredSection = $featuredHeading.closest("section");
    const $animalCards = $featuredSection.find("article.card");

    if ($featuredSection.length && $animalCards.length) {

        // Get animal names
        const animalNames = $animalCards.map(function () {
            return $(this).find(".card-title").first().text().trim();
        }).get();

        // Create search field
        const $searchArea = $(
            '<div class="a6-search-wrap">' +
                '<label for="animal-live-search">Search animals</label>' +
                '<input id="animal-live-search" type="search" ' +
                'placeholder="Start typing an animal name..." ' +
                'autocomplete="off">' +
                '<ul id="animal-suggestions" role="listbox" hidden></ul>' +
                '<p id="animal-search-count" aria-live="polite"></p>' +
            '</div>'
        );

        $featuredHeading.after($searchArea);

        const $searchInput = $("#animal-live-search");
        const $suggestions = $("#animal-suggestions");

        // TASK 3: Search Highlighting
        function clearHighlights() {
            $(".a6-highlight").each(function () {
                $(this).replaceWith(
                    document.createTextNode($(this).text())
                );
            });
        }

        function highlightMatches(term) {
            clearHighlights();

            const query = term.trim();

            if (!query) return;

            const escapedQuery = query.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            const testRegex = new RegExp(escapedQuery, "i");
           const splitRegex = new RegExp("(" + escapedQuery + ")", "gi");

            const walker = document.createTreeWalker(
                $featuredSection[0],
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function (node) {
                        if (!node.nodeValue.trim()) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        const parent = $(node.parentNode);

                        if (parent.closest(
                            "script, style, input, button, " +
                            ".a6-search-wrap, .a6-highlight"
                        ).length) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        return testRegex.test(node.nodeValue)
                            ? NodeFilter.FILTER_ACCEPT
                            : NodeFilter.FILTER_REJECT;
                    }
                }
            );

            const textNodes = [];

            while (walker.nextNode()) {
                textNodes.push(walker.currentNode);
            }

            textNodes.forEach(function (node) {
                const fragment = document.createDocumentFragment();

                node.nodeValue.split(splitRegex).forEach(function (part) {
                    if (part.toLowerCase() === query.toLowerCase()) {
                        const mark = document.createElement("mark");

                        mark.className = "a6-highlight";
                        mark.textContent = part;

                        fragment.appendChild(mark);
                    } else {
                        fragment.appendChild(
                            document.createTextNode(part)
                        );
                    }
                });

                node.parentNode.replaceChild(fragment, node);
            });
        }

        // TASK 1: Real-time Search
        function filterAnimals(query) {
            const normalizedQuery = query.trim().toLowerCase();
            let visibleAnimals = 0;

            $animalCards.each(function () {
                const $card = $(this);
                const cardText = $card.text().toLowerCase();

                const matches =
                    !normalizedQuery ||
                    cardText.includes(normalizedQuery);

                const $column = $card.closest('[class*="col-"]');

                ($column.length ? $column : $card).toggle(matches);

                if (matches) {
                    visibleAnimals++;
                }
            });

            $("#animal-search-count").text(
                visibleAnimals +
                (visibleAnimals === 1
                    ? " animal found"
                    : " animals found")
            );
        }

        // TASK 2: Autocomplete
        $searchInput.on("input", function () {
            const query = $(this).val();
            const normalizedQuery = query.trim().toLowerCase();

            filterAnimals(query);
            highlightMatches(query);

            $suggestions.empty();

            if (normalizedQuery) {
                const matchingNames = animalNames.filter(function (name) {
                    return name.toLowerCase().includes(normalizedQuery);
                });

                matchingNames.forEach(function (name) {
                    $("<li>", {
                        text: name,
                        role: "option",
                        tabindex: 0
                    }).appendTo($suggestions);
                });

                $suggestions.prop(
                    "hidden",
                    matchingNames.length === 0
                );
            } else {
                $suggestions.prop("hidden", true);
            }
        });

        // Select autocomplete suggestion
        $suggestions.on("click keydown", "li", function (event) {
            if (event.type === "click" || event.key === "Enter") {
                event.preventDefault();

                const selectedName = $(this).text();

                $searchInput.val(selectedName);

                filterAnimals(selectedName);
                highlightMatches(selectedName);

                $suggestions.prop("hidden", true);

                showToast("Search suggestion selected.");
            }
        });

        // Close suggestions when clicking outside
        $(document).on("click.assignment6", function (event) {
            if (!$(event.target).closest(".a6-search-wrap").length) {
                $suggestions.prop("hidden", true);
            }
        });
    }

    // Notification for navigation buttons
    $("a.btn").on("click.assignment6toast", function () {
        const label = $(this).text().trim();

        if (label) {
            showToast("Opening: " + label);
        }
    });
});

