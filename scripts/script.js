document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".nav-link");
  const menuBtn = document.getElementById("menu-btn");
  const navLinksContainer = document.querySelector(".nav-links");
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = themeToggle.querySelector("i");

  // Testimonial Carousel
  const carousel = document.getElementById("testimonial-carousel");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const testimonials = document.querySelectorAll(".testimonial");
  const reduceMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  let currentTestimonial = 0;
  let autoplayTimer = null;
  let syncDots = function () {}; // no-op until dots are built below

  // Checked live (not just once on load) so rotating a tablet or resizing
  // a desktop window across the 768px breakpoint never leaves the
  // carousel in a broken, half-bound state.
  function isCarouselMode() {
    return window.innerWidth > 768;
  }

  function updateCarousel() {
    if (isCarouselMode()) {
      carousel.style.transform = `translateX(-${
        currentTestimonial * 100
      }%)`;
    } else {
      // On mobile/tablet: reset transform so items just stack
      carousel.style.transform = "none";
    }
    syncDots();
  }

  function startAutoplay() {
    if (autoplayTimer || !isCarouselMode() || reduceMotionQuery.matches) {
      return;
    }
    autoplayTimer = setInterval(() => {
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
      updateCarousel();
    }, 10000);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function refreshAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  if (prevBtn && nextBtn && carousel && testimonials.length) {
    const dotsContainer = document.getElementById("carousel-dots");
    const recommendationsWrap = document.querySelector(".recommendations");

    // Build one dot per testimonial
    if (dotsContainer) {
      testimonials.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.className = "carousel-dot";
        dot.type = "button";
        dot.setAttribute("aria-label", `Go to testimonial ${index + 1}`);
        dot.addEventListener("click", function () {
          currentTestimonial = index;
          updateCarousel();
        });
        dotsContainer.appendChild(dot);
      });
    }

    syncDots = function () {
      if (!dotsContainer) return;
      dotsContainer.querySelectorAll(".carousel-dot").forEach((dot, index) => {
        dot.classList.toggle("active", index === currentTestimonial);
      });
    };

    prevBtn.addEventListener("click", function () {
      currentTestimonial =
        (currentTestimonial - 1 + testimonials.length) % testimonials.length;
      updateCarousel();
    });

    nextBtn.addEventListener("click", function () {
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
      updateCarousel();
    });

    updateCarousel();
    startAutoplay();

    // Re-evaluate carousel/autoplay state on resize and orientation change
    window.addEventListener("resize", function () {
      updateCarousel();
      refreshAutoplay();
    });

    // Respect the user toggling reduced-motion mid-session
    reduceMotionQuery.addEventListener("change", refreshAutoplay);

    // Pause auto-advance while the user is looking at or interacting
    // with the carousel, so it doesn't jump away mid-read
    if (recommendationsWrap) {
      recommendationsWrap.addEventListener("mouseenter", stopAutoplay);
      recommendationsWrap.addEventListener("mouseleave", startAutoplay);
      recommendationsWrap.addEventListener("focusin", stopAutoplay);
      recommendationsWrap.addEventListener("focusout", startAutoplay);
    }
  }

  // Header scroll-edge material: only show the glass border/shadow once
  // content has actually scrolled underneath the fixed header
  const siteHeader = document.querySelector("header");
  const scrollProgress = document.getElementById("scroll-progress");
  const backToTopBtn = document.getElementById("back-to-top");

  // Update active nav link on scroll
  window.addEventListener("scroll", function () {
    const scrollPosition = window.scrollY;

    if (siteHeader) {
      siteHeader.classList.toggle("is-scrolled", scrollPosition > 8);
    }

    // Scroll progress bar: tracks 1:1 with scroll position, no easing,
    // so it reads as directly attached to the user's input
    if (scrollProgress) {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? scrollPosition / scrollHeight : 0;
      scrollProgress.style.transform = `scaleX(${Math.min(
        Math.max(progress, 0),
        1
      )})`;
    }

    // Back-to-top: appears once the user has scrolled roughly one
    // viewport height down
    if (backToTopBtn) {
      backToTopBtn.classList.toggle("visible", scrollPosition > window.innerHeight * 0.6);
    }

    // Add padding to offset fixed header height
    const home = document.getElementById("home");
    const about = document.getElementById("about");
    const knowledge = document.getElementById("knowledge");
    const recommendations = document.getElementById("recommendations");
    const blogs = document.getElementById("blogs");
    const contact = document.getElementById("contact");

    const homeOffset = home.offsetTop - 100;
    const aboutOffset = about.offsetTop - 100;
    const knowledgeOffset = knowledge.offsetTop - 100;
    const recommendationsOffset = recommendations.offsetTop - 100;
    const blogsOffset = blogs.offsetTop - 100;
    const contactOffset = contact.offsetTop - 100;

    if (scrollPosition >= contactOffset) {
      setActiveNavLink("contact");
    } else if (scrollPosition >= blogsOffset) {
      setActiveNavLink("blogs");
    } else if (scrollPosition >= knowledgeOffset) {
      setActiveNavLink("knowledge");
    } else if (scrollPosition >= recommendationsOffset) {
      setActiveNavLink("recommendations");
    } else if (scrollPosition >= aboutOffset) {
      setActiveNavLink("about");
    } else if (scrollPosition >= homeOffset) {
      setActiveNavLink("home");
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotionQuery.matches ? "auto" : "smooth",
      });
    });
  }

  function setActiveNavLink(id) {
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${id}`) {
        link.classList.add("active");
      }
    });
  }

  // Mobile menu toggle
  menuBtn.addEventListener("click", function () {
    navLinksContainer.classList.toggle("active");
  });

  // Close the mobile menu once a destination is chosen
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      navLinksContainer.classList.remove("active");
    });
  });

  // Close the mobile menu with Escape, and return focus to the menu button
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navLinksContainer.classList.contains("active")) {
      navLinksContainer.classList.remove("active");
      menuBtn.focus();
    }
  });

  // Theme toggle
  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      themeIcon.classList.remove("fa-moon");
      themeIcon.classList.add("fa-sun");
    } else {
      themeIcon.classList.remove("fa-sun");
      themeIcon.classList.add("fa-moon");
    }

    // Quick rotate + settle animation on the swapped icon
    themeIcon.classList.remove("icon-swap-anim");
    // Force reflow so the animation can be re-triggered on rapid toggles
    void themeIcon.offsetWidth;
    themeIcon.classList.add("icon-swap-anim");
  });

  // Contact form submission

  // Initialize EmailJS with your Public Key
  (function () {
    // Replace with your actual EmailJS Public Key
    emailjs.init("SVGG2rcl0GAtjc2D5");
  })();

  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("form-message");
  const submitBtn = document.getElementById("submit-btn");
  const senderName = document.getElementById("name");

  // Inline validation: mark a field "touched" once the user leaves it,
  // then keep the valid/invalid border in sync as they keep typing
  if (contactForm) {
    const validatableFields = contactForm.querySelectorAll(".form-control");
    validatableFields.forEach((field) => {
      field.addEventListener("blur", function () {
        field.classList.add("touched");
      });
      field.addEventListener("input", function () {
        if (field.classList.contains("touched")) {
          // re-render validity state live while correcting a flagged field
          field.classList.remove("touched");
          void field.offsetWidth;
          field.classList.add("touched");
        }
      });
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Show loading state
      submitBtn.innerHTML = "Sending...";
      submitBtn.disabled = true;

      // Send form data using EmailJS
      emailjs
        .sendForm("service_0z9ijp9", "template_ng24h1n", this)
        .then(
          function () {
            // Show success message
            // formMessage.textContent = "Message sent successfully!";
            alert("Thank you! Your message has been successfully sent!");
            formMessage.classList.add("success");

            // Reset form
            contactForm.reset();
            contactForm
              .querySelectorAll(".form-control.touched")
              .forEach((field) => field.classList.remove("touched"));

            // Hide message after 5 seconds
            setTimeout(() => {
              formMessage.classList.remove("success");
            }, 5000);
          },
          function (error) {
            // Show error message
            formMessage.textContent =
              "Failed to send message. Please try again.";
            formMessage.classList.add("error");

            // Hide message after 5 seconds
            setTimeout(() => {
              formMessage.classList.remove("error");
            }, 5000);
          }
        )
        .finally(() => {
          // Reset button state
          submitBtn.innerHTML = "Send Message";
          submitBtn.disabled = false;
        });
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-links") && !e.target.closest(".menu-btn")) {
      navLinksContainer.classList.remove("active");
    }
  });
});