import { Chart } from "@/components/ui/chart"
// Global variables
const currentUser = null
let isLoading = false
let lucide // Declare lucide variable
let openAddModal // Declare openAddModal variable
let editEntry // Declare editEntry variable
let confirmDelete // Declare confirmDelete variable

// Sidebar Toggle
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons()
  }

  // Initialize sidebar
  initializeSidebar()

  // Initialize flash messages
  initializeFlashMessages()

  // Initialize forms
  initializeForms()

  // Initialize tooltips
  initializeTooltips()

  // Initialize progress bars
  animateProgressBars()

  // Initialize calendar if present
  if (document.getElementById("calendar-container")) {
    initializeCalendar()
  }

  // Initialize route tester if present
  if (document.getElementById("routes-list")) {
    initializeRouteTester()
  }

  // Initialize modals
  initializeModals()

  // Initialize file uploads
  initializeFileUploads()

  // Auto-refresh functionality
  initializeAutoRefresh()

  console.log("StudyTracker initialized successfully!")
}

function initializeSidebar() {
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const sidebar = document.getElementById("sidebar")

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (event) => {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
          sidebar.classList.remove("open")
        }
      }
    })

    // Close sidebar with Escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && window.innerWidth <= 768) {
        sidebar.classList.remove("open")
      }
    })
  }
}

function initializeFlashMessages() {
  // Auto-hide flash messages after 5 seconds
  setTimeout(() => {
    const flashMessages = document.querySelectorAll(".flash-message")
    flashMessages.forEach((message) => {
      message.style.opacity = "0"
      setTimeout(() => {
        if (message.parentNode) {
          message.remove()
        }
      }, 300)
    })
  }, 5000)
}

// Mark Attendance Function
function markAttendance(subjectName, status) {
  if (isLoading) return

  isLoading = true
  const formData = new FormData()
  formData.append("subject_name", subjectName)
  formData.append("status", status)

  fetch("/mark_attendance", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Show success message
        showFlashMessage(`Attendance marked: ${status} for ${subjectName}`, "success")
        // Reload the page to update the recent records
        setTimeout(() => {
          location.reload()
        }, 1000)
      } else {
        showFlashMessage(data.message || "Error marking attendance", "error")
      }
    })
    .catch((error) => {
      console.error("Error:", error)
      showFlashMessage("Error marking attendance", "error")
    })
    .finally(() => {
      isLoading = false
    })
}

// Show Flash Message Function
function showFlashMessage(message, type = "success") {
  const flashContainer = document.querySelector(".flash-messages") || createFlashContainer()

  const flashDiv = document.createElement("div")
  flashDiv.className = `flash-message flash-${type}`
  flashDiv.innerHTML = `
        ${message}
        <button onclick="this.parentElement.remove()" class="flash-close">×</button>
    `

  flashContainer.appendChild(flashDiv)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (flashDiv.parentNode) {
      flashDiv.remove()
    }
  }, 5000)
}

function createFlashContainer() {
  const container = document.createElement("div")
  container.className = "flash-messages"
  const mainContent = document.querySelector(".main-content")
  if (mainContent) {
    mainContent.insertBefore(container, mainContent.firstChild)
  }
  return container
}

// Form Validation
function initializeForms() {
  // Add loading states to forms
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      const submitBtn = form.querySelector('button[type="submit"]')
      if (submitBtn && !submitBtn.disabled) {
        const originalText = submitBtn.innerHTML
        submitBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 mr-2 animate-spin"></i>Loading...'
        submitBtn.disabled = true

        // Re-enable after 3 seconds as fallback
        setTimeout(() => {
          submitBtn.innerHTML = originalText
          submitBtn.disabled = false
          if (typeof lucide !== "undefined") {
            lucide.createIcons()
          }
        }, 3000)
      }
    })
  })

  // Real-time form validation
  const inputs = document.querySelectorAll("input[required], select[required], textarea[required]")
  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      validateField(input)
    })

    input.addEventListener("input", () => {
      if (input.classList.contains("error")) {
        validateField(input)
      }
    })
  })
}

function validateField(field) {
  const isValid = field.checkValidity()

  if (isValid) {
    field.classList.remove("error")
    field.style.borderColor = "rgba(255, 215, 0, 0.5)"
  } else {
    field.classList.add("error")
    field.style.borderColor = "#ef4444"
  }

  return isValid
}

function validateForm(formId) {
  const form = document.getElementById(formId)
  if (!form) return true

  const inputs = form.querySelectorAll("input[required], select[required], textarea[required]")
  let isValid = true

  inputs.forEach((input) => {
    if (!validateField(input)) {
      isValid = false
    }
  })

  return isValid
}

// Progress Bar Animation
function animateProgressBars() {
  const progressBars = document.querySelectorAll(".progress-fill")
  progressBars.forEach((bar) => {
    const width = bar.style.width || bar.getAttribute("data-width") || "0%"
    bar.style.width = "0%"
    setTimeout(() => {
      bar.style.width = width
    }, 100)
  })
}

// Tooltip functionality
function initializeTooltips() {
  const tooltipElements = document.querySelectorAll("[title]")
  tooltipElements.forEach((element) => {
    element.addEventListener("mouseenter", (e) => {
      showTooltip(e.target, e.target.getAttribute("title"))
    })

    element.addEventListener("mouseleave", () => {
      hideTooltip()
    })
  })
}

function showTooltip(element, text) {
  const tooltip = document.createElement("div")
  tooltip.className = "tooltip"
  tooltip.textContent = text
  tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        z-index: 1000;
        pointer-events: none;
        border: 1px solid rgba(255, 215, 0, 0.3);
    `

  document.body.appendChild(tooltip)

  const rect = element.getBoundingClientRect()
  tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + "px"
  tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + "px"
}

function hideTooltip() {
  const tooltip = document.querySelector(".tooltip")
  if (tooltip) {
    tooltip.remove()
  }
}

// Modal functionality
function initializeModals() {
  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    const modals = document.querySelectorAll(".modal")
    modals.forEach((modal) => {
      if (event.target === modal) {
        closeModal(modal.id)
      }
    })
  })

  // Close modals with Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const openModals = document.querySelectorAll('.modal[style*="block"]')
      openModals.forEach((modal) => {
        closeModal(modal.id)
      })
    }
  })
}

function openModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "block"
    document.body.style.overflow = "hidden"

    // Focus first input
    const firstInput = modal.querySelector("input, select, textarea")
    if (firstInput) {
      setTimeout(() => {
        firstInput.focus()
      }, 100)
    }
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "none"
    document.body.style.overflow = "auto"
  }
}

// File Upload Preview
function initializeFileUploads() {
  const fileInputs = document.querySelectorAll('input[type="file"]')
  fileInputs.forEach((input) => {
    input.addEventListener("change", (e) => {
      handleFileSelect(e)
    })
  })
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  const preview = document.getElementById("file-preview")

  if (file && preview) {
    const fileSize = (file.size / (1024 * 1024)).toFixed(1)
    const fileType = file.type

    let icon = "file"
    if (fileType.includes("pdf")) icon = "file-text"
    else if (fileType.includes("image")) icon = "image"
    else if (fileType.includes("video")) icon = "video"

    preview.innerHTML = `
            <div class="file-preview-item flex items-center gap-3 p-3 border border-yellow-400/30 rounded-lg bg-yellow-400/5">
                <i data-lucide="${icon}" class="w-8 h-8 text-yellow-400"></i>
                <div class="flex-1">
                    <div class="font-medium text-white">${file.name}</div>
                    <div class="text-sm text-gray-400">${fileSize} MB • ${fileType}</div>
                </div>
                <button type="button" onclick="clearFilePreview()" class="text-red-400 hover:text-red-300">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
        `

    if (typeof lucide !== "undefined") {
      lucide.createIcons()
    }
  }
}

function clearFilePreview() {
  const preview = document.getElementById("file-preview")
  const fileInput = document.querySelector('input[type="file"]')

  if (preview) preview.innerHTML = ""
  if (fileInput) fileInput.value = ""
}

// Calendar functionality
function initializeCalendar() {
  const calendarContainer = document.getElementById("calendar-container")
  if (!calendarContainer) return

  const currentDate = new Date()
  let currentMonth = currentDate.getMonth()
  let currentYear = currentDate.getFullYear()

  renderCalendar()

  function renderCalendar() {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()

    let calendarHTML = `
            <div class="calendar-header">
                <button class="calendar-nav-btn" onclick="previousMonth()">
                    <i data-lucide="chevron-left" class="w-5 h-5"></i>
                </button>
                <h3 class="text-lg font-semibold text-yellow-400">
                    ${monthNames[currentMonth]} ${currentYear}
                </h3>
                <button class="calendar-nav-btn" onclick="nextMonth()">
                    <i data-lucide="chevron-right" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day-header">Sun</div>
                <div class="calendar-day-header">Mon</div>
                <div class="calendar-day-header">Tue</div>
                <div class="calendar-day-header">Wed</div>
                <div class="calendar-day-header">Thu</div>
                <div class="calendar-day-header">Fri</div>
                <div class="calendar-day-header">Sat</div>
        `

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      const prevMonthDay = new Date(currentYear, currentMonth, 0 - (firstDay - 1 - i)).getDate()
      calendarHTML += `<div class="calendar-day other-month">${prevMonthDay}</div>`
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const isToday = date.toDateString() === new Date().toDateString()
      const isWeekend = date.getDay() === 0 || date.getDay() === 6

      let dayClass = "calendar-day"
      if (isToday) dayClass += " today"
      if (isWeekend) dayClass += " weekend"

      calendarHTML += `
                <div class="${dayClass}" onclick="selectDate('${date.toISOString().split("T")[0]}')">
                    ${day}
                </div>
            `
    }

    // Add empty cells for days after the last day of the month
    const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7
    const remainingCells = totalCells - (daysInMonth + firstDay)
    for (let i = 1; i <= remainingCells; i++) {
      calendarHTML += `<div class="calendar-day other-month">${i}</div>`
    }

    calendarHTML += "</div>"
    calendarContainer.innerHTML = calendarHTML

    if (typeof lucide !== "undefined") {
      lucide.createIcons()
    }
  }

  window.previousMonth = () => {
    currentMonth--
    if (currentMonth < 0) {
      currentMonth = 11
      currentYear--
    }
    renderCalendar()
  }

  window.nextMonth = () => {
    currentMonth++
    if (currentMonth > 11) {
      currentMonth = 0
      currentYear++
    }
    renderCalendar()
  }

  window.selectDate = (dateString) => {
    console.log("Selected date:", dateString)
    showFlashMessage(`Selected date: ${dateString}`, "success")
  }
}

// Route testing functionality
function initializeRouteTester() {
  const routes = [
    { name: "Dashboard", path: "/", description: "Main dashboard with statistics" },
    { name: "Subjects", path: "/subjects", description: "Subject management" },
    { name: "Timetable", path: "/timetable", description: "Weekly schedule management" },
    { name: "Academic Calendar", path: "/academic_calendar", description: "Calendar configuration" },
    { name: "Attendance", path: "/attendance", description: "Mark attendance" },
    { name: "Reports", path: "/reports", description: "Attendance analytics" },
    { name: "Notes", path: "/notes", description: "PDF upload and management" },
    { name: "Settings", path: "/settings", description: "User preferences" },
    { name: "Route Testing", path: "/route_testing", description: "Route testing dashboard" },
  ]

  let testResults = {}
  let isRunning = false

  function initializeRoutes() {
    const routesList = document.getElementById("routes-list")
    if (!routesList) return

    routesList.innerHTML = ""

    routes.forEach((route, index) => {
      const routeDiv = document.createElement("div")
      routeDiv.className =
        "flex items-center justify-between p-3 border border-yellow-400/20 rounded-lg hover:bg-yellow-400/5 transition-colors"
      routeDiv.id = `route-${index}`

      routeDiv.innerHTML = `
                <div class="flex items-center gap-3">
                    <i data-lucide="clock" class="w-4 h-4 text-gray-400" id="icon-${index}"></i>
                    <div>
                        <div class="font-medium text-white">${route.name}</div>
                        <div class="text-sm text-gray-400">${route.description}</div>
                        <div class="text-xs text-gray-500">${route.path}</div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="text-xs text-gray-400" id="time-${index}"></div>
                    <div class="text-xs text-red-400" id="error-${index}"></div>
                    <span class="px-2 py-1 rounded text-xs font-semibold bg-gray-500/20 text-gray-400" id="status-${index}">PENDING</span>
                    <a href="${route.path}" class="btn btn-primary btn-sm">
                        <i data-lucide="external-link" class="w-4 h-4"></i>
                    </a>
                </div>
            `

      routesList.appendChild(routeDiv)
    })

    if (typeof lucide !== "undefined") {
      lucide.createIcons()
    }
  }

  async function testRoute(route, index) {
    const startTime = Date.now()

    try {
      const response = await fetch(route.path, { method: "HEAD" })
      const responseTime = Date.now() - startTime

      return {
        success: response.ok || response.status === 405,
        responseTime,
        error: response.ok ? null : `HTTP ${response.status}`,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        success: false,
        responseTime,
        error: error.message,
      }
    }
  }

  function updateRouteStatus(index, status, result = null) {
    const icon = document.getElementById(`icon-${index}`)
    const statusBadge = document.getElementById(`status-${index}`)
    const timeElement = document.getElementById(`time-${index}`)
    const errorElement = document.getElementById(`error-${index}`)

    if (!icon || !statusBadge) return

    switch (status) {
      case "testing":
        icon.setAttribute("data-lucide", "clock")
        icon.className = "w-4 h-4 text-yellow-400 animate-spin"
        statusBadge.className = "px-2 py-1 rounded text-xs font-semibold bg-yellow-500/20 text-yellow-400"
        statusBadge.textContent = "TESTING"
        break
      case "passed":
        icon.setAttribute("data-lucide", "check-circle")
        icon.className = "w-4 h-4 text-green-400"
        statusBadge.className = "px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-400"
        statusBadge.textContent = "PASSED"
        if (result && timeElement) {
          timeElement.textContent = `${result.responseTime}ms`
        }
        break
      case "failed":
        icon.setAttribute("data-lucide", "x-circle")
        icon.className = "w-4 h-4 text-red-400"
        statusBadge.className = "px-2 py-1 rounded text-xs font-semibold bg-red-500/20 text-red-400"
        statusBadge.textContent = "FAILED"
        if (result && timeElement) {
          timeElement.textContent = `${result.responseTime}ms`
          if (result.error && errorElement) {
            errorElement.textContent = result.error
          }
        }
        break
      default:
        icon.setAttribute("data-lucide", "clock")
        icon.className = "w-4 h-4 text-gray-400"
        statusBadge.className = "px-2 py-1 rounded text-xs font-semibold bg-gray-500/20 text-gray-400"
        statusBadge.textContent = "PENDING"
        if (timeElement) timeElement.textContent = ""
        if (errorElement) errorElement.textContent = ""
    }

    if (typeof lucide !== "undefined") {
      lucide.createIcons()
    }
  }

  function updateProgress() {
    const completed = Object.keys(testResults).length
    const total = routes.length
    const percentage = (completed / total) * 100

    const progressFill = document.getElementById("progress-fill")
    const progressText = document.getElementById("progress-text")

    if (progressFill) progressFill.style.width = `${percentage}%`
    if (progressText) progressText.textContent = `${completed} / ${total}`

    const passed = Object.values(testResults).filter((r) => r.success).length
    const failed = Object.values(testResults).filter((r) => !r.success).length

    const passedCount = document.getElementById("passed-count")
    const failedCount = document.getElementById("failed-count")

    if (passedCount) passedCount.textContent = passed
    if (failedCount) failedCount.textContent = failed
  }

  window.runAllTests = async () => {
    if (isRunning) return

    isRunning = true
    testResults = {}

    const runBtn = document.getElementById("run-btn")
    const currentTestDiv = document.getElementById("current-test")
    const progressContainer = document.getElementById("progress-container")

    if (runBtn) {
      runBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 mr-2 animate-spin"></i>Running...'
      runBtn.disabled = true
    }
    if (currentTestDiv) currentTestDiv.classList.remove("hidden")
    if (progressContainer) progressContainer.classList.remove("hidden")

    // Reset all routes
    routes.forEach((_, index) => {
      updateRouteStatus(index, "pending")
    })
    updateProgress()

    // Run tests sequentially
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i]

      // Update current test
      const currentTestName = document.getElementById("current-test-name")
      if (currentTestName) currentTestName.textContent = route.name
      updateRouteStatus(i, "testing")

      // Wait a bit for visual effect
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Run test
      const result = await testRoute(route, i)
      testResults[i] = result

      // Update status
      updateRouteStatus(i, result.success ? "passed" : "failed", result)
      updateProgress()
    }

    // Cleanup
    if (currentTestDiv) currentTestDiv.classList.add("hidden")
    if (runBtn) {
      runBtn.innerHTML = '<i data-lucide="play" class="w-4 h-4 mr-2"></i>Run All Tests'
      runBtn.disabled = false
    }
    isRunning = false

    if (typeof lucide !== "undefined") {
      lucide.createIcons()
    }
  }

  window.resetTests = () => {
    if (isRunning) return

    testResults = {}
    routes.forEach((_, index) => {
      updateRouteStatus(index, "pending")
    })

    const passedCount = document.getElementById("passed-count")
    const failedCount = document.getElementById("failed-count")
    const progressFill = document.getElementById("progress-fill")
    const progressText = document.getElementById("progress-text")
    const currentTest = document.getElementById("current-test")
    const progressContainer = document.getElementById("progress-container")

    if (passedCount) passedCount.textContent = "0"
    if (failedCount) failedCount.textContent = "0"
    if (progressFill) progressFill.style.width = "0%"
    if (progressText) progressText.textContent = "0 / 9"
    if (currentTest) currentTest.classList.add("hidden")
    if (progressContainer) progressContainer.classList.add("hidden")
  }

  // Initialize routes on page load
  initializeRoutes()
}

// Auto-refresh functionality
function initializeAutoRefresh() {
  let lastActivity = Date.now()

  document.addEventListener("click", () => {
    lastActivity = Date.now()
  })

  document.addEventListener("keypress", () => {
    lastActivity = Date.now()
  })

  setInterval(() => {
    if (Date.now() - lastActivity > 300000) {
      // 5 minutes
      if (window.location.pathname === "/attendance") {
        location.reload()
      }
    }
  }, 60000) // Check every minute
}

// Search Functionality
function searchTable(inputId, tableId) {
  const input = document.getElementById(inputId)
  const table = document.getElementById(tableId)

  if (input && table) {
    input.addEventListener("keyup", () => {
      const filter = input.value.toLowerCase()
      const rows = table.getElementsByTagName("tr")

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        const cells = row.getElementsByTagName("td")
        let found = false

        for (let j = 0; j < cells.length; j++) {
          if (cells[j].textContent.toLowerCase().indexOf(filter) > -1) {
            found = true
            break
          }
        }

        row.style.display = found ? "" : "none"
      }
    })
  }
}

// Academic calendar functions
function updateWeekendSummary() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="weekend_"]')
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const selectedDays = []

  checkboxes.forEach((checkbox, index) => {
    if (checkbox.checked) {
      selectedDays.push(dayNames[index])
    }
  })

  const weekendDaysList = document.getElementById("weekendDaysList")
  const workingDaysPerWeek = document.getElementById("workingDaysPerWeek")

  if (weekendDaysList) {
    weekendDaysList.textContent = selectedDays.length > 0 ? selectedDays.join(", ") : "None selected"
  }
  if (workingDaysPerWeek) {
    workingDaysPerWeek.textContent = 7 - selectedDays.length
  }
}

function saveCalendar() {
  const form = document.getElementById("calendarForm")
  if (!form) return

  const formData = new FormData(form)

  // Add weekend day checkboxes to form data
  const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="weekend_"]')
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      formData.append(checkbox.name, "on")
    }
  })

  fetch("/save_academic_calendar", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        showFlashMessage("Academic calendar saved successfully!", "success")
        setTimeout(() => {
          location.reload()
        }, 1000)
      } else {
        showFlashMessage("Error saving calendar", "error")
      }
    })
    .catch((error) => {
      console.error("Error:", error)
      showFlashMessage("Error saving calendar", "error")
    })
}

// Password strength checker for signup
function checkPasswordStrength(password) {
  let score = 0

  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  switch (score) {
    case 0:
    case 1:
      return { level: "weak", text: "Weak password", color: "bg-red-500", width: "20%" }
    case 2:
      return { level: "fair", text: "Fair password", color: "bg-yellow-500", width: "40%" }
    case 3:
    case 4:
      return { level: "good", text: "Good password", color: "bg-blue-500", width: "80%" }
    case 5:
      return { level: "strong", text: "Strong password", color: "bg-green-500", width: "100%" }
    default:
      return { level: "weak", text: "Password strength", color: "bg-gray-500", width: "0%" }
  }
}

// Chart functionality (if Chart.js is available)
function initializeCharts() {
  if (typeof Chart === "undefined") return

  // Attendance chart
  const attendanceChart = document.getElementById("attendanceChart")
  if (attendanceChart) {
    const ctx = attendanceChart.getContext("2d")
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Present", "Absent"],
        datasets: [
          {
            data: [75, 25],
            backgroundColor: ["#10b981", "#ef4444"],
            borderColor: ["#059669", "#dc2626"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "#ffffff",
            },
          },
        },
      },
    })
  }
}

// Keyboard shortcuts
function initializeKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    // Ctrl/Cmd + K for search
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault()
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]')
      if (searchInput) {
        searchInput.focus()
      }
    }

    // Ctrl/Cmd + B for sidebar toggle
    if ((event.ctrlKey || event.metaKey) && event.key === "b") {
      event.preventDefault()
      const sidebarToggle = document.getElementById("sidebar-toggle")
      if (sidebarToggle) {
        sidebarToggle.click()
      }
    }

    // Escape to close modals
    if (event.key === "Escape") {
      const openModals = document.querySelectorAll('.modal[style*="block"]')
      openModals.forEach((modal) => {
        closeModal(modal.id)
      })
    }
  })
}

// Initialize keyboard shortcuts
document.addEventListener("DOMContentLoaded", () => {
  initializeKeyboardShortcuts()
})

// Export functions for global access
window.showFlashMessage = showFlashMessage
window.markAttendance = markAttendance
window.openAddModal = openAddModal
window.editEntry = editEntry
window.openModal = openModal
window.closeModal = closeModal
window.confirmDelete = confirmDelete
window.updateWeekendSummary = updateWeekendSummary
window.saveCalendar = saveCalendar
window.checkPasswordStrength = checkPasswordStrength
window.validateForm = validateForm
window.clearFilePreview = clearFilePreview

// Console welcome message
console.log(`
🎓 StudyTracker - Student Attendance Management System
📚 All features loaded and ready!
⚡ Performance optimized
🎨 Golden theme active
🔧 Debug mode: ${window.location.hostname === "localhost" ? "ON" : "OFF"}
`)
