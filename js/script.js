
document.addEventListener('DOMContentLoaded', function() {
  const locationResults = document.getElementById('locationResults');
  const locationQuery = document.getElementById('locationQuery');
  const clearLocationQuery = document.getElementById('clearLocationQuery');
  
  let allLocations = [];

  const leadForm = document.getElementById('leadForm');
  const leadFormAlert = document.getElementById('leadFormAlert');

  const phoneInput = document.getElementById('leadPhone');
  phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
      value = value.substring(0, 10);
      

      if (value.length >= 3 && value.length <= 6) {
        value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
      } else if (value.length > 6) {
        value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
      }
    }
    
    e.target.value = value;
  });
  
  // Zip code validation
  const zipInput = document.getElementById('leadZip');
  zipInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 5);
    e.target.value = value;
  });
  
  // Form submission
  leadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const inputs = leadForm.querySelectorAll('.form-control');
    inputs.forEach(input => {
      input.classList.remove('is-invalid', 'is-valid');
    });
    
    const name = document.getElementById('leadName').value.trim();
    const phone = document.getElementById('leadPhone').value.trim();
    const zip = document.getElementById('leadZip').value.trim();
    
    let isValid = true;
    
    if (!name || name.length < 2) {
      document.getElementById('leadName').classList.add('is-invalid');
      isValid = false;
    } else {
      document.getElementById('leadName').classList.add('is-valid');
    }
    
    // phonec
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone || phoneDigits.length < 10) {
      document.getElementById('leadPhone').classList.add('is-invalid');
      isValid = false;
    } else {
      document.getElementById('leadPhone').classList.add('is-valid');
    }
    
    // zip
    if (!zip || !/^\d{5}$/.test(zip)) {
      document.getElementById('leadZip').classList.add('is-invalid');
      isValid = false;
    } else {
      document.getElementById('leadZip').classList.add('is-valid');
    }
    
    if (!isValid) {
      showAlert('Please fill in all required fields correctly.', 'danger');
      return;
    }
    

    const submitBtn = leadForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      showAlert(`
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill text-success fs-4 me-3"></i>
          <div>
            <strong>Thank you, ${name}!</strong><br>
            Your free roof inspection request has been received. 
          </div>
        </div>
      `, 'success');
      
      leadForm.reset();
      inputs.forEach(input => {
        input.classList.remove('is-valid');
      });
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      
      leadFormAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
    }, 500);
  });
  
  function showAlert(message, type) {
    leadFormAlert.className = `alert alert-${type} alert-dismissible fade show`;
    leadFormAlert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    leadFormAlert.classList.remove('d-none');
  }
  

});



// Locations functionality with JSON data
document.addEventListener('DOMContentLoaded', function() {

  
  // Fetch locations
  async function loadLocations() {
    try {
      const response = await fetch('http://127.0.0.1:5500/data/locations.json');
      if (!response.ok) throw new Error('Failed to load locations');
      
      allLocations = await response.json();
      renderLocations();
    } catch (error) {
      console.error('Error loading locations:', error);
      locationResults.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger mb-0">
            <div class="d-flex align-items-center">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <div>Unable to load locations. Please try again later.</div>
            </div>
          </div>
        </div>
      `;
    }
  }
  
  // Render locations
  function renderLocations(filter = '') {
    const searchTerm = filter.toLowerCase().trim();
    
    const filteredLocations = allLocations.filter(loc => {
      if (!searchTerm) return true;
      
      return (
        loc.city.toLowerCase().includes(searchTerm) ||
        loc.state.toLowerCase().includes(searchTerm) ||
        loc.zip.includes(searchTerm) ||
        loc.name.toLowerCase().includes(searchTerm)
      );
    });
    
    if (filteredLocations.length === 0) {
      locationResults.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning mb-0">
            <div class="d-flex align-items-center">
              <i class="bi bi-exclamation-circle me-2"></i>
              <div>No locations found matching "${searchTerm}"</div>
            </div>
          </div>
        </div>
      `;
      return;
    }
    
    const locationsByState = {};
    filteredLocations.forEach(loc => {
      if (!locationsByState[loc.state]) {
        locationsByState[loc.state] = [];
      }
      locationsByState[loc.state].push(loc);
    });
    
    let html = '';
    
    // If searching, show all results
    if (searchTerm) {
      html = filteredLocations.map(loc => createLocationCard(loc)).join('');
    } else {
      Object.keys(locationsByState).sort().forEach(state => {
        html += `
          <div class="col-12 mb-3">
            <div class="bg-white border-bottom pb-1 mb-2">
              <span class="fw-bold text-muted">${state}</span>
              <span class="badge bg-light text-dark border ms-2">${locationsByState[state].length} locations</span>
            </div>
          </div>
        `;
        
        html += locationsByState[state].map(loc => createLocationCard(loc)).join('');
      });
    }
    
    locationResults.innerHTML = html;
  }
  
  // Create location card HTML
  function createLocationCard(loc) {
    return `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card border h-100 focus-ring" tabindex="0">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h3 class="h6 fw-bold mb-0">${loc.city}</h3>
                <div class="small text-muted">${loc.state} ${loc.zip}</div>
              </div>
              <span class="badge bg-light text-dark border small">${loc.state}</span>
            </div>
            
            <div class="small text-muted mb-3">
              ${loc.name}
            </div>
            
            <div class="mb-3">
              <div class="d-flex align-items-start mb-2">
                <i class="bi bi-geo-alt text-muted me-2 mt-1 small"></i>
                <div class="small">
                  <div>${loc.address1}</div>
                  ${loc.address2 ? `<div>${loc.address2}</div>` : ''}
                  <div>${loc.city}, ${loc.state} ${loc.zip}</div>
                </div>
              </div>
              
              <div class="d-flex align-items-center mb-2">
                <i class="bi bi-telephone text-muted me-2 small"></i>
                <div class="small">${loc.phone}</div>
              </div>
              
              <div class="d-flex align-items-center">
                <i class="bi bi-clock text-muted me-2 small"></i>
                <div class="small">${loc.hours}</div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    `;
  }
  
  // Initial load
  loadLocations();
  
  locationQuery.addEventListener('input', function() {
    const searchValue = this.value;
    renderLocations(searchValue);
    
    if (searchValue.trim()) {
      clearLocationQuery.style.display = 'block';
    } else {
      clearLocationQuery.style.display = 'none';
    }
  });

  clearLocationQuery.addEventListener('click', function() {
    locationQuery.value = '';
    renderLocations();
    this.style.display = 'none';
    locationQuery.focus();
  });
  locationQuery.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      this.value = '';
      renderLocations();
      clearLocationQuery.style.display = 'none';
    }
  });
});


function selectLocation(city, state, zip) {
  const zipInput = document.getElementById('leadZip');
  const nameInput = document.getElementById('leadName');
  
  if (zipInput) {
    zipInput.value = zip;
    
    // Optional: Auto-focus on name field if empty
    if (nameInput && !nameInput.value.trim()) {
      nameInput.focus();
    } else {
      zipInput.focus();
    }
    
    // Scroll to form
    document.getElementById('top')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
    
    // Show brief notification
    const alertDiv = document.getElementById('leadFormAlert');
    if (alertDiv) {
      alertDiv.className = 'alert alert-success alert-dismissible fade show mt-3';
      alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="bi bi-check-circle-fill me-2"></i>
          <div>
            <strong>Location set:</strong> ${city}, ${state} ${zip}
          </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      alertDiv.classList.remove('d-none');
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        if (alertDiv.classList.contains('show')) {
          const bsAlert = new bootstrap.Alert(alertDiv);
          bsAlert.close();
        }
      }, 5000);
    }
  }
}
