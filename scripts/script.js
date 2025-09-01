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
  let currentTestimonial = 0;

  function updateCarousel() {
    carousel.style.transform = `translateX(-${currentTestimonial * 100}%)`;
  }

  prevBtn.addEventListener("click", function () {
    currentTestimonial =
      (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    updateCarousel();
  });

  nextBtn.addEventListener("click", function () {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    updateCarousel();
  });

  // Auto-advance carousel
  setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    updateCarousel();
  }, 10000);

  // Update active nav link on scroll
  window.addEventListener("scroll", function () {
    const scrollPosition = window.scrollY;

    // Add padding to offset fixed header height
    const home = document.getElementById("home");
    const about = document.getElementById("about");
    const knowledge = document.getElementById("knowledge");
    const blogs = document.getElementById("blogs");
    const contact = document.getElementById("contact");

    const homeOffset = home.offsetTop - 100;
    const aboutOffset = about.offsetTop - 100;
    const knowledgeOffset = knowledge.offsetTop - 100;
    const blogsOffset = blogs.offsetTop - 100;
    const contactOffset = contact.offsetTop - 100;

    if (scrollPosition >= contactOffset) {
      setActiveNavLink("contact");
    } else if (scrollPosition >= blogsOffset) {
      setActiveNavLink("blogs");
    } else if (scrollPosition >= knowledgeOffset) {
      setActiveNavLink("knowledge");
    } else if (scrollPosition >= aboutOffset) {
      setActiveNavLink("about");
    } else if (scrollPosition >= homeOffset) {
      setActiveNavLink("home");
    }
  });

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
            alert('Thank you! Your message has been successfully sent!');
            formMessage.classList.add("success");

            // Reset form
            contactForm.reset();

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
