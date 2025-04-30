
 // Firebase configuration for operations and statistics
 const firebaseConfig = {
    apiKey: "AIzaSyC7GeP3yxb0UJIPmE6e-PeA5V3CTK0mevc",
    authDomain: "gangsgallery.firebaseapp.com",
    databaseURL: "https://gangsgallery-default-rtdb.firebaseio.com",
    projectId: "gangsgallery",
    storageBucket: "gangsgallery.appspot.com",
    messagingSenderId: "622725528053",
    appId: "1:622725528053:web:cf27dab0632c51914208bc",
    measurementId: "G-3BWT2GWFZR"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM elements
const totalLocationCheck = document.getElementById('total-locationCheck');
const totalInteraction = document.getElementById('total-interaction');
const totalArrest = document.getElementById('total-arrest');
const totalDetention = document.getElementById('total-detention');
const totalVehicleCheck = document.getElementById('total-vehicleCheck');
const totalTowVehicles = document.getElementById('total-towVehicles');
const recentOperations = document.getElementById('recentOperations');
const allOperations = document.getElementById('allOperations');
const areaBtns = document.querySelectorAll('.area-btn');
const currentDateElement = document.getElementById('current-date');
const dateRangeInput = document.getElementById('date-range');
const resetDatesBtn = document.getElementById('reset-dates');
const toggleOperationsBtn = document.getElementById('toggle-operations');
const totalOperationsCount = document.getElementById('total-operations-count');
const addStatisticsBtn = document.getElementById('add-statistics-btn');
const addStatisticsModal = document.getElementById('add-statistics-modal');
const closeModalBtn = document.getElementById('close-modal');
const operationForm = document.getElementById('operation-form');
const statisticsForm = document.getElementById('statistics-form');
const operationDateInput = document.getElementById('operation-date');
const statisticsDateInput = document.getElementById('statistics-date');
const mainContent = document.getElementById('main-content');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarBtns = document.querySelectorAll('.sidebar-btn');
const externalContents = document.querySelectorAll('.external-content');
const closeExternalBtns = document.querySelectorAll('.close-external');
const modalTabs = document.querySelectorAll('.modal-tab');
const tabContents = document.querySelectorAll('.tab-content');
const viewEntriesBtn = document.getElementById('view-entries-btn');
const entriesModal = document.getElementById('entries-modal');
const closeEntriesModalBtn = document.getElementById('close-entries-modal');
const entriesTableBody = document.getElementById('entries-table-body');
const totalEntriesCount = document.getElementById('total-entries-count');
const entriesDateRangeInput = document.getElementById('entries-date-range');
const resetEntriesDatesBtn = document.getElementById('reset-entries-dates');

// Current date
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = now.toLocaleDateString('en-US', options);
}
updateCurrentDate();

// Initialize date range picker
$(dateRangeInput).daterangepicker({
    opens: 'left',
    autoUpdateInput: false,
    locale: {
        cancelLabel: 'Clear',
        format: 'YYYY-MM-DD'
    }
});

$(dateRangeInput).on('apply.daterangepicker', function(ev, picker) {
    $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
    fetchData();
});

$(dateRangeInput).on('cancel.daterangepicker', function(ev, picker) {
    $(this).val('');
    fetchData();
});

// Initialize entries date range picker
$(entriesDateRangeInput).daterangepicker({
    opens: 'left',
    autoUpdateInput: false,
    locale: {
        cancelLabel: 'Clear',
        format: 'YYYY-MM-DD'
    }
});

$(entriesDateRangeInput).on('apply.daterangepicker', function(ev, picker) {
    $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
    fetchEntries();
});

$(entriesDateRangeInput).on('cancel.daterangepicker', function(ev, picker) {
    $(this).val('');
    fetchEntries();
});

// Initialize date pickers for forms
$(operationDateInput).daterangepicker({
    singleDatePicker: true,
    showDropdowns: true,
    minYear: 2000,
    maxYear: parseInt(moment().format('YYYY'), 10),
    locale: {
        format: 'YYYY-MM-DD'
    },
    autoUpdateInput: true
});

$(statisticsDateInput).daterangepicker({
    singleDatePicker: true,
    showDropdowns: true,
    minYear: 2000,
    maxYear: parseInt(moment().format('YYYY'), 10),
    locale: {
        format: 'YYYY-MM-DD'
    },
    autoUpdateInput: true
});

// Toggle sidebar
sidebarToggle.addEventListener('click', function() {
    sidebar.classList.toggle('open');
    this.classList.toggle('open');
    
    // Change icon based on state
    const icon = this.querySelector('i');
    if (sidebar.classList.contains('open')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Modal tab switching
modalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        modalTabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        const tabId = tab.dataset.tab;
        document.getElementById(tabId).classList.add('active');
    });
});

// Reset dates
resetDatesBtn.addEventListener('click', function() {
    $(dateRangeInput).val('');
    fetchData();
});

// Reset entries dates
resetEntriesDatesBtn.addEventListener('click', function() {
    $(entriesDateRangeInput).val('');
    fetchEntries();
});

// Filter by area
let currentArea = 'All';
areaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        areaBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentArea = btn.dataset.area;
        fetchData();
    });
});

// Toggle between recent and all operations
toggleOperationsBtn.addEventListener('click', function() {
    if (allOperations.classList.contains('hidden')) {
        // Show all operations
        recentOperations.classList.add('hidden');
        allOperations.classList.remove('hidden');
        this.textContent = 'Show Recent Only';
    } else {
        // Show recent operations only
        recentOperations.classList.remove('hidden');
        allOperations.classList.add('hidden');
        this.textContent = 'Show All Operations';
    }
});

// Modal controls
addStatisticsBtn.addEventListener('click', function() {
    addStatisticsModal.style.display = 'flex';
    // Set default date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    operationDateInput.value = formattedDate;
    statisticsDateInput.value = formattedDate;
});

closeModalBtn.addEventListener('click', function() {
    addStatisticsModal.style.display = 'none';
});

// View entries modal
viewEntriesBtn.addEventListener('click', function() {
    entriesModal.style.display = 'flex';
    fetchEntries();
});

closeEntriesModalBtn.addEventListener('click', function() {
    entriesModal.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target === addStatisticsModal) {
        addStatisticsModal.style.display = 'none';
    }
    if (event.target === entriesModal) {
        entriesModal.style.display = 'none';
    }
});

// Operation Form submission
operationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const operationData = {
        date: operationDateInput.value,
        operation: document.getElementById('operation-name').value,
        location: document.getElementById('operation-location').value,
        details: document.getElementById('operation-details').value,
        city: document.getElementById('operation-city').value,
        type: 'operation'
    };

    // Push data to Firebase
    database.ref('entries').push(operationData)
        .then(() => {
            alert('Operation added successfully!');
            operationForm.reset();
            addStatisticsModal.style.display = 'none';
            fetchData(); // Refresh the data
            fetchEntries(); // Refresh entries table
        })
        .catch(error => {
            console.error('Error adding document: ', error);
            alert('Error adding operation: ' + error.message);
        });
});

// Statistics Form submission
statisticsForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const statisticsData = {
        date: statisticsDateInput.value,
        city: document.getElementById('statistics-city').value,
        locationCheck: parseInt(document.getElementById('location-check').value) || 0,
        interaction: parseInt(document.getElementById('interaction').value) || 0,
        arrest: parseInt(document.getElementById('arrest').value) || 0,
        detention: parseInt(document.getElementById('detention').value) || 0,
        vehicleCheck: parseInt(document.getElementById('vehicle-check').value) || 0,
        towVehicles: parseInt(document.getElementById('tow-vehicles').value) || 0,
        type: 'statistics'
    };

    // Push data to Firebase
    database.ref('entries').push(statisticsData)
        .then(() => {
            alert('Statistics added successfully!');
            statisticsForm.reset();
            addStatisticsModal.style.display = 'none';
            fetchData(); // Refresh the data
            fetchEntries(); // Refresh entries table
        })
        .catch(error => {
            console.error('Error adding document: ', error);
            alert('Error adding statistics: ' + error.message);
        });
});

// Sidebar button functionality
sidebarBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const targetId = this.dataset.target;
        
        // Hide all external content
        externalContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Show the selected content
        document.getElementById(targetId).classList.add('active');
        
        // Hide the main content
        mainContent.style.display = 'none';
        
        // Close the sidebar
        sidebar.classList.remove('open');
        sidebarToggle.classList.remove('open');
        sidebarToggle.querySelector('i').classList.remove('fa-times');
        sidebarToggle.querySelector('i').classList.add('fa-bars');
    });
});

// Close external content buttons
closeExternalBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const targetId = this.dataset.target;
        document.getElementById(targetId).classList.remove('active');
        mainContent.style.display = 'block';
    });
});

// Delete entry
function deleteEntry(entryId) {
    if (confirm('Are you sure you want to delete this entry?')) {
        database.ref('entries/' + entryId).remove()
            .then(() => {
                alert('Entry deleted successfully!');
                fetchData(); // Refresh the data
                fetchEntries(); // Refresh entries table
            })
            .catch(error => {
                console.error('Error deleting entry: ', error);
                alert('Error deleting entry: ' + error.message);
            });
    }
}

// Fetch entries for the entries table
function fetchEntries() {
    let ref = database.ref('entries');
    
    // Get date range filter
    const dateRange = $(entriesDateRangeInput).val();
    let startDate, endDate;
    
    if (dateRange) {
        const dates = dateRange.split(' - ');
        startDate = new Date(dates[0]);
        endDate = new Date(dates[1]);
        endDate.setHours(23, 59, 59, 999);
    }
    
    ref.once('value').then(snapshot => {
        const data = snapshot.val();
        const entries = [];
        
        if (data) {
            Object.keys(data).forEach(key => {
                const entry = data[key];
                const entryDate = new Date(entry.date);
                
                // Apply date filter if set
                if (dateRange) {
                    if (entryDate < startDate || entryDate > endDate) {
                        return;
                    }
                }
                
                // Prepare entry for display
                const displayEntry = {
                    id: key,
                    date: entry.date || 'N/A',
                    type: entry.type || 'N/A',
                    details: '',
                    city: entry.city || 'N/A'
                };
                
                if (entry.type === 'operation') {
                    displayEntry.details = `${entry.operation || 'N/A'} - ${entry.details || 'No details'}`;
                } else if (entry.type === 'statistics') {
                    displayEntry.details = `Location Checks: ${entry.locationCheck || 0}, ` +
                                        `Interactions: ${entry.interaction || 0}, ` +
                                        `Arrests: ${entry.arrest || 0}, ` +
                                        `Detentions: ${entry.detention || 0}, ` +
                                        `Vehicle Checks: ${entry.vehicleCheck || 0}, ` +
                                        `Tow Vehicles: ${entry.towVehicles || 0}`;
                }
                
                entries.push(displayEntry);
            });
        }
        
        // Sort entries by date (newest first)
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Update entries table
        updateEntriesTable(entries);
    });
}

// Update entries table
function updateEntriesTable(entries) {
    entriesTableBody.innerHTML = '';
    totalEntriesCount.textContent = entries.length;
    
    if (entries.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" style="text-align: center;">No entries found for selected filters</td>';
        entriesTableBody.appendChild(row);
        return;
    }
    
    entries.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.date}</td>
            <td><span class="badge">${entry.type}</span></td>
            <td>${entry.details}</td>
            <td>${entry.city}</td>
            <td><button class="delete-btn" onclick="deleteEntry('${entry.id}')">Delete</button></td>
        `;
        entriesTableBody.appendChild(row);
    });
}

// Fetch data from Firebase
function fetchData() {
    let ref = database.ref('entries');
    
    if (currentArea !== 'All') {
        ref = ref.orderByChild('city').equalTo(currentArea);
    }

    ref.once('value').then(snapshot => {
        const data = snapshot.val();
        processData(data);
    });
}

// Process data and update UI
function processData(data) {
    let totals = {
        locationCheck: 0,
        interaction: 0,
        arrest: 0,
        detention: 0,
        vehicleCheck: 0,
        towVehicles: 0
    };
    
    const operations = [];
    const uniqueOperations = new Set();
    
    // Get date range filter
    const dateRange = $(dateRangeInput).val();
    let startDate, endDate;
    
    if (dateRange) {
        const dates = dateRange.split(' - ');
        startDate = new Date(dates[0]);
        endDate = new Date(dates[1]);
        endDate.setHours(23, 59, 59, 999);
    }
    
    if (data) {
        Object.keys(data).forEach(key => {
            const entry = data[key];
            const entryDate = new Date(entry.date);
            
            // Apply date filter if set
            if (dateRange) {
                if (entryDate < startDate || entryDate > endDate) {
                    return;
                }
            }
            
            // Process statistics data
            if (entry.type === 'statistics') {
                totals.locationCheck += entry.locationCheck || 0;
                totals.interaction += entry.interaction || 0;
                totals.arrest += entry.arrest || 0;
                totals.detention += entry.detention || 0;
                totals.vehicleCheck += entry.vehicleCheck || 0;
                totals.towVehicles += entry.towVehicles || 0;
            }
            
            // Process operation data
            if (entry.type === 'operation') {
                const operationName = entry.operation || '';
                const operationDetails = entry.details || '';
                const operationLocation = entry.location || '';
                
                // Create unique key for operation (name + details + location)
                const operationKey = `${operationName}|${operationDetails}|${operationLocation}`;
                
                // Add to unique operations set if not empty/dash
                if (operationName && operationName !== '-') {
                    uniqueOperations.add(operationKey);
                }
                
                // Add operation to list
                operations.push({
                    date: entry.date,
                    operation: operationName || 'N/A',
                    details: operationDetails || 'No details',
                    area: entry.city || 'N/A'
                });
            }
        });
    }
    
    // Sort operations by date (newest first)
    operations.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update totals
    totalLocationCheck.textContent = totals.locationCheck;
    totalInteraction.textContent = totals.interaction;
    totalArrest.textContent = totals.arrest;
    totalDetention.textContent = totals.detention;
    totalVehicleCheck.textContent = totals.vehicleCheck;
    totalTowVehicles.textContent = totals.towVehicles;
    
    // Update operations count (only unique operations)
    totalOperationsCount.textContent = uniqueOperations.size;
    
    // Update operations tables
    updateOperationsTable(recentOperations, operations.slice(0, 5));
    updateOperationsTable(allOperations, operations);
}

// Update operations table
function updateOperationsTable(tableElement, operations) {
    tableElement.innerHTML = '';
    
    if (operations.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" style="text-align: center;">No operations found for selected filters</td>';
        tableElement.appendChild(row);
        return;
    }
    
    operations.forEach(op => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${op.date}</td>
            <td>${op.operation}</td>
            <td>${op.details}</td>
            <td><span class="badge">${op.area}</span></td>
        `;
        tableElement.appendChild(row);
    });
}

// Make deleteEntry function available globally
window.deleteEntry = deleteEntry;

// Initial load
fetchData();