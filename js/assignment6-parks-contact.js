// Assignment 6 — Parks and Contact pages
$(document).ready(function () {
    // TASK 5: Animated number counter (Parks page)
    const $counters = $(".a6-counter");

    if ($counters.length) {
        let countersStarted = false;

        function startCounters() {
            if (countersStarted) return;

            const section = $("#park-statistics");
            const sectionTop = section.offset().top;
            const visibleBottom = $(window).scrollTop() + $(window).height();

            if (visibleBottom > sectionTop + 50) {
                countersStarted = true;

                $counters.each(function () {
                    const $counter = $(this);
                    const target = Number($counter.attr("data-target"));

                    $({ value: 0 }).animate(
                        { value: target },
                        {
                            duration: 1600,
                            easing: "swing",
                            step: function (now) {
                                $counter.text(Math.floor(now).toLocaleString());
                            },
                            complete: function () {
                                $counter.text(target.toLocaleString() + "+");
                            }
                        }
                    );
                });
            }
        }

        $(window).on("scroll.a6counter resize.a6counter", startCounters);
        startCounters();
    }

    // TASK 6: Loading spinner on form submit (Contact page)
    $("#contact-form, #popup-form").on("submit", function (event) {
        event.preventDefault();

        const form = this;

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const $form = $(form);
        const $button = $form.find('button[type="submit"]').first();
        const originalButtonHtml = $button.html();

        $button
            .prop("disabled", true)
            .html('<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Please wait...');

        setTimeout(function () {
            if (form.id === "contact-form") {
                $("#contact-form-status").text(
                    "Thank you! Your message was processed in this demo. It was not sent to a server."
                );
            } else {
                $("#popup-status").text(
                    "Thank you! Your message was processed in this demo. No message was sent to a server."
                );
            }

            form.reset();
            $button.prop("disabled", false).html(originalButtonHtml);

            // Use the shared toast helper when it is available.
            let $toast = $("#assignment6-toast");
            if (!$toast.length) {
                $toast = $('<div id="assignment6-toast" role="status" aria-live="polite"></div>');
                $("body").append($toast);
            }
            $toast.stop(true, true)
                .text("Form submitted successfully!")
                .fadeIn(200);

            clearTimeout(window.assignment6ToastTimer);
            window.assignment6ToastTimer = setTimeout(function () {
                $toast.fadeOut(350);
            }, 2200);
        }, 1500);
    });

    // TASK 8: Copy to Clipboard (Parks page)
    $(".a6-copy-button").on("click", async function () {
        const $button = $(this);
        const selector = $button.attr("data-copy-target");
        const textToCopy = $(selector).text().trim();
        const $feedback = $button.siblings(".a6-copy-feedback");

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                const $temporary = $("<textarea>")
                    .val(textToCopy)
                    .css({ position: "fixed", opacity: 0 })
                    .appendTo("body");
                $temporary[0].select();
                document.execCommand("copy");
                $temporary.remove();
            }

            $button.find(".a6-copy-icon").text("✓");
            $button.find(".a6-copy-label").text("Copied");
            $button.attr("title", "Copied to clipboard!");
            $feedback.text("Copied to clipboard!");

            setTimeout(function () {
                $button.find(".a6-copy-icon").text("⧉");
                $button.find(".a6-copy-label").text("Copy");
                $button.attr("title", "Copy text");
                $feedback.text("");
            }, 1800);
        } catch (error) {
            $feedback.text("Copy failed. Please select and copy the text manually.");
        }
    });

    // TASK 9: Lazy loading images (load when close to the viewport)
    const $lazyImages = $(".a6-lazy-image[data-src]");

    function loadVisibleImages() {
        const scrollBottom = $(window).scrollTop() + $(window).height() + 150;

        $lazyImages.each(function () {
            const $image = $(this);

            if ($image.attr("data-src") && $image.offset().top < scrollBottom) {
                $image.attr("src", $image.attr("data-src"));
                $image.removeAttr("data-src");
                $image.removeClass("a6-lazy-image");
            }
        });
    }

    $(window).on("scroll.a6lazy resize.a6lazy", loadVisibleImages);
    loadVisibleImages();
});
