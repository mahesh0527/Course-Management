// StudyTracker - Professional Edition - Main JavaScript

// Global Variables
let sidebarOpen = false
let lucide // Declare the lucide variable

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

// Initialize Application
function initializeApp() {
  setupSidebar()
  setupFlashMessages()
  setupFormValidation()
  setupTooltips()
  setupAnimations()

  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons()
  }

  console.log("✅ StudyTracker Professional Edition initialized")
}

// Sidebar Management
function setupSidebar() {
  const sidebar = document.getElementById("sidebar")
  const overlay = document.getElementById("sidebarOverlay")
  const toggleBtn = document.querySelector(".sidebar-toggle")

  if (!sidebar || !overlay) return

  // Close sidebar when clicking overlay
  overlay.addEventListener("click", closeSidebar)

  // Close sidebar on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebarOpen) {
      closeSidebar()
    }
  })

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024 && sidebarOpen) {
      closeSidebar()
    }
  })
}

function toggleSidebar() {
  if (sidebarOpen) {
    closeSidebar()
  } else {
    openSidebar()
  }
}

function openSidebar() {
  const sidebar = document.getElementById("sidebar")
  const overlay = document.getElementById("sidebarOverlay")

  if (sidebar && overlay) {
    sidebar.classList.add("open")
    overlay.classList.add("active")
    sidebarOpen = true
    document.body.style.overflow = "hidden"
  }
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar")
  const overlay = document.getElementById("sidebarOverlay")

  if (sidebar && overlay) {
    sidebar.classList.remove("open")
    overlay.classList.remove("active")
    sidebarOpen = false
    document.body.style.overflow = ""
  }
}

// Flash Messages
function setupFlashMessages() {
  const flashMessages = document.querySelectorAll(".flash-message")

  flashMessages.forEach((message) => {
    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideFlashMessage(message)
    }, 5000)

    // Close button functionality
    const closeBtn = message.querySelector(".flash-close")
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        hideFlashMessage(message)
      })
    }
  })
}

function hideFlashMessage(message) {
  message.style.opacity = "0"
  message.style.transform = "translateX(100%)"

  setTimeout(() => {
    if (message.parentNode) {
      message.remove()
    }
  }, 300)
}

function showFlashMessage(text, type = "info") {
  const flashContainer = document.querySelector(".flash-messages") || createFlashContainer()

  const message = document.createElement("div")
  message.className = `flash-message flash-${type}`
  message.innerHTML = `
        <span>${text}</span>
        <button onclick="hideFlashMessage(this.parentElement)" class="flash-close">&times;</button>
    `

  flashContainer.appendChild(message)

  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideFlashMessage(message)
  }, 5000)

  return message
}

function createFlashContainer() {
  const container = document.createElement("div")
  container.className = "flash-messages"
  document.body.appendChild(container)
  return container
}

// Form Validation
function setupFormValidation() {
  const forms = document.querySelectorAll("form")

  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      if (!validateForm(this)) {
        e.preventDefault()
      }
    })

    // Real-time validation
    const inputs = form.querySelectorAll("input, textarea, select")
    inputs.forEach((input) => {
      input.addEventListener("blur", () => validateField(input))
      input.addEventListener("input", () => clearFieldError(input))
    })
  })
}

function validateForm(form) {
  let isValid = true
  const inputs = form.querySelectorAll("input[required], textarea[required], select[required]")

  inputs.forEach((input) => {
    if (!validateField(input)) {
      isValid = false
    }
  })

  return isValid
}

function validateField(field) {
  const value = field.value.trim()
  const type = field.type
  let isValid = true
  let errorMessage = ""

  // Required field validation
  if (field.hasAttribute("required") && !value) {
    isValid = false
    errorMessage = "This field is required"
  }

  // Email validation
  else if (type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      isValid = false
      errorMessage = "Please enter a valid email address"
    }
  }

  // Password validation
  else if (type === "password" && value) {
    if (value.length < 6) {
      isValid = false
      errorMessage = "Password must be at least 6 characters long"
    }
  }

  // Number validation
  else if (type === "number" && value) {
    const min = field.getAttribute("min")
    const max = field.getAttribute("max")
    const numValue = Number.parseFloat(value)

    if (min && numValue < Number.parseFloat(min)) {
      isValid = false
      errorMessage = `Value must be at least ${min}`
    } else if (max && numValue > Number.parseFloat(max)) {
      isValid = false
      errorMessage = `Value must be at most ${max}`
    }
  }

  // Display validation result
  if (isValid) {
    clearFieldError(field)
  } else {
    showFieldError(field, errorMessage)
  }

  return isValid
}

function showFieldError(field, message) {
  clearFieldError(field)

  field.classList.add("error")
  field.style.borderColor = "var(--color-error)"

  const errorDiv = document.createElement("div")
  errorDiv.className = "field-error"
  errorDiv.style.color = "var(--color-error)"
  errorDiv.style.fontSize = "var(--font-size-xs)"
  errorDiv.style.marginTop = "var(--spacing-1)"
  errorDiv.textContent = message

  field.parentNode.appendChild(errorDiv)
}

function clearFieldError(field) {
  field.classList.remove("error")
  field.style.borderColor = ""

  const errorDiv = field.parentNode.querySelector(".field-error")
  if (errorDiv) {
    errorDiv.remove()
  }
}

// Tooltips
function setupTooltips() {
  const tooltipElements = document.querySelectorAll("[title]")

  tooltipElements.forEach((element) => {
    element.addEventListener("mouseenter", showTooltip)
    element.addEventListener("mouseleave", hideTooltip)
  })
}

function showTooltip(e) {
  const element = e.target
  const title = element.getAttribute("title")

  if (!title) return

  // Remove title to prevent default tooltip
  element.setAttribute("data-title", title)
  element.removeAttribute("title")

  const tooltip = document.createElement("div")
  tooltip.className = "custom-tooltip"
  tooltip.textContent = title
  tooltip.style.cssText = `
        position: absolute;
        background: var(--bg-card);
        color: var(--color-primary);
        padding: var(--spacing-2) var(--spacing-3);
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        border: 1px solid var(--border-primary);
        box-shadow: var(--shadow-md);
        z-index: 1000;
        pointer-events: none;
        white-space: nowrap;
    `

  document.body.appendChild(tooltip)

  const rect = element.getBoundingClientRect()
  tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + "px"
  tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + "px"

  element._tooltip = tooltip
}

function hideTooltip(e) {
  const element = e.target
  const title = element.getAttribute("data-title")

  if (title) {
    element.setAttribute("title", title)
    element.removeAttribute("data-title")
  }

  if (element._tooltip) {
    element._tooltip.remove()
    delete element._tooltip
  }
}

// Animations
function setupAnimations() {
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
      }
    })
  }, observerOptions)

  // Observe elements with fade-in class
  document.querySelectorAll(".fade-in").forEach((el) => {
    observer.observe(el)
  })
}

// Utility Functions
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function throttle(func, limit) {
  let inThrottle
  return function () {
    const args = arguments
    
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// API Helper Functions
async function apiRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  }

  const config = { ...defaultOptions, ...options }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      return await response.json()
    } else {
      return await response.text()
    }
  } catch (error) {
    console.error("API request failed:", error)
    showFlashMessage("An error occurred. Please try again.", "error")
    throw error
  }
}

// Local Storage Helpers
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

function loadFromLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error("Failed to load from localStorage:", error)
    return defaultValue
  }
}

function removeFromLocalStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error("Failed to remove from localStorage:", error)
  }
}

// Theme Management
function initializeTheme() {
  const savedTheme = loadFromLocalStorage("theme", "dark")
  applyTheme(savedTheme)
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme)
  saveToLocalStorage("theme", theme)
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark"
  const newTheme = currentTheme === "dark" ? "light" : "dark"
  applyTheme(newTheme)
}

// Performance Monitoring
function measurePerformance(name, fn) {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  console.log(`${name} took ${end - start} milliseconds`)
  return result
}

// Error Handling
window.addEventListener("error", (e) => {
  console.error("Global error:", e.error)
  showFlashMessage("An unexpected error occurred. Please refresh the page.", "error")
})

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason)
  showFlashMessage("An error occurred while processing your request.", "error")
})

// Service Worker Registration (if available)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful")
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed")
      })
  })
}

// Export functions for global use
window.StudyTracker = {
  toggleSidebar,
  showFlashMessage,
  hideFlashMessage,
  formatDate,
  formatTime,
  formatFileSize,
  apiRequest,
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
  toggleTheme,
}

// Initialize theme on load
initializeTheme()

console.log("🚀 StudyTracker Professional Edition - JavaScript Loaded")
