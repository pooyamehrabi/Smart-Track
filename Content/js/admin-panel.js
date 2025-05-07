//Show this page or not

document.addEventListener("DOMContentLoaded", async () => {
    const loadingOverlay = document.getElementById("loading-overlay");
    const adminPanelContent = document.getElementById("admin-panel-content");

    loadingOverlay.style.display = "block";

    try {
        const userRole = await getUserRole(); 

        if (!userRole) {
            window.location.href = "login.html";
        } else if (userRole !== "admin") {
            window.location.href = "index.html";
        } else {
            adminPanelContent.style.display = "grid";
        }
    } catch (error) {
        console.error("Error verifying user:", error.message);
        window.location.href = "login.html";
    } finally {
        loadingOverlay.style.display = "none";
    }
});

//Show this page or not

//Show User Menu

document.addEventListener("DOMContentLoaded", async () => {
    const firstName = localStorage.getItem('firstName');
    const userEmail = localStorage.getItem('userEmail');

    const userNameMenu = document.getElementById('userNameMenu');
    const nameOfUser = document.getElementById('nameOfUser');
    const logoutBtn = document.getElementById('logoutBtn');

    const loginLink = document.getElementById('loginMenu');
    const loginLinkMobile = document.getElementById('loginMenuMob');
    const loginMenuIcon = document.getElementById('loginMenuIcon');
    const loginMenuMobIcon = document.getElementById('loginMenuMobIcon');
    const secondLayerLogin = document.getElementById('secondLayerLogin');
    const secondLayerLoginMob = document.getElementById('SecondLayerLoginMob');

    if (userEmail && firstName) {
        if (userNameMenu) {
            userNameMenu.textContent = `Hey ${firstName} `;
        }
        if (nameOfUser) {
            nameOfUser.textContent = `${firstName} `;
        }
    }

    function resetMenu() {
        if (loginLink) {
            loginLink.textContent = 'Login';
            loginLink.href = 'login.html';
            if (loginMenuIcon) {
                loginMenuIcon.style.display = 'none';
            }
            loginLink.removeEventListener('mouseenter', showDesktopSubMenu);
            loginLink.removeEventListener('mouseleave', hideDesktopSubMenu);
        }

        if (loginLinkMobile) {
            loginLinkMobile.textContent = 'Login';
            loginLinkMobile.href = 'login.html';
            if (loginMenuMobIcon) {
                loginMenuMobIcon.style.display = 'none';
            }
            loginLinkMobile.removeEventListener('click', toggleMobileSubMenu);
        }

        if (secondLayerLogin) {
            secondLayerLogin.style.display = 'none';
        }

        if (secondLayerLoginMob) {
            secondLayerLoginMob.style.display = 'none';
        }

        localStorage.removeItem('userEmail');
        localStorage.removeItem('firstName');
        localStorage.removeItem('userRole'); 
        localStorage.removeItem('isLoggedOut'); 
        localStorage.removeItem('username'); 
    }

    function logoutHandler(event) {
        event.preventDefault();
        logoutUser().then(() => { 
            resetMenu();
            window.location.href = 'index.html';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutHandler);
    }
});

//Show User Menu

//Load Content

function loadContent(page) {
    if (page === 'Dashboard') {
        document.getElementById('content').innerHTML = `<div class="container-fluid">
            <div class="row">
              <div class="col-lg-3 col-6">
                <div class="small-box text-bg-primary">
                  <div class="inner">
                    <h3 id="ordersCount"></h3>
                    <p>New Orders</p>
                  </div>
                  <svg class="small-box-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" >
                    <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" ></path>
                  </svg>
                  <a href="#" class="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover" >
                    More info 
                    <i class="bi bi-link-45deg"></i>
                  </a>
                </div>
              </div>
              <div class="col-lg-3 col-6">
                <div class="small-box text-bg-warning">
                  <div class="inner">
                    <h3 id="usersCount"></h3>
                    <p>Users</p>
                  </div>
                  <svg class="small-box-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" >
                    <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z" ></path>
                  </svg>
                  <a href="#" class="small-box-footer link-dark link-underline-opacity-0 link-underline-opacity-50-hover" >
                    More info 
                    <i class="bi bi-link-45deg"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>`;
    } else {
        fetch(page)
            .then(response => {
                if (!response.ok) throw new Error(`Error loading: ${response.statusText}`);
                return response.text();
            })
            .then(data => {
                document.getElementById('content').innerHTML = data;
                if (page === 'profile-admin.html') { 
                    initializeProfilePage();
                }
                if (page === 'change-password-admin.html') { 
                    initializeChangePasswordPage();
                }
                if (page === 'users-list.html') { 
                    initializeUserListPage();
                }
                if (page === 'roles.html') { 
                    initializeRolesListPage();
                }
                if (page === 'user-role.html') { 
                    initializeUserRoleListPage();
                }
                if (page === 'user-orders.html') { 
                    initializeUserOrdersListPage();
                }
            })
            .catch(error => {
                console.error(error);
                document.getElementById('content').innerHTML = '<p>An error has occurred!</p>';
            });
    }
}

//Load Content

//Profile Page

async function initializeProfilePage() {
    const username = localStorage.getItem('username'); 
    let userID = null;

    const confirmationMessage = document.getElementById('confirmationMessage');
    const overlay = document.getElementById('Overlay');
    const form = document.getElementById('profileForm');

    if (!overlay || !confirmationMessage || !form) {
        console.error("Required elements (overlay, confirmationMessage, form) are missing from the DOM.");
        return;
    }

    showOverlay();

    if (username) {
        try {
            const data = await getUserProfile(username);

            setTimeout(() => {
                userID = data.userID || '';
                document.getElementById('firstName').value = data.firstName || '';
                document.getElementById('lastName').value = data.lastName || '';
                document.getElementById('email').value = data.email || '';
                document.getElementById('companyName').value = data.companyName || '';
                document.getElementById('staffSize').value = data.staffSize || '';
                document.getElementById('mobileCode').value = data.mobileCode || '';
                document.getElementById('phoneNumber').value = data.phoneNumber || '';

                hideOverlay();
            }, 200); 
        } catch (error) {
            console.error("Error loading user profile:", error);
            showConfirmationMessage('Unable to load user profile. Please try again later.', 'error');
            hideOverlay(); 
        }
    } else {
        console.error("Username not found in localStorage. Redirecting to login page.");
        window.location.href = 'login.html';
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        let isValid = true;
        const fields = form.querySelectorAll('input, select');

        const updatedData = {
            userID,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            companyName: document.getElementById('companyName').value,
            staffSize: document.getElementById('staffSize').value,
            mobileCode: document.getElementById('mobileCode').value,
            phoneNumber: document.getElementById('phoneNumber').value
        };

        if (form.checkValidity() === false) {
            form.classList.add('was-validated');
            isValid = false;
        }

        fields.forEach(field => {
            const errorMessage = validateField(field);
            showError(field, errorMessage);
            if (errorMessage) {
                isValid = false;
            }
        });

        if (!isValid) {
            console.warn("Form validation failed.");
            return;
        }

        showOverlay(); 

        try {
            const response = await updateUserProfile(updatedData);

            if (response && response.message) {
                if (response.message.toLowerCase() === 'profile updated successfully') {
                    showConfirmationMessage('Profile updated successfully.', 'success');

                    setTimeout(async () => {
                        await reloadUserProfile(username);
                        hideOverlay(); 
                    }, 200); 
                } else {
                    showConfirmationMessage(response.message, 'error');
                    hideOverlay(); 
                }
            } else {
                throw new Error('Invalid server response.');
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            showConfirmationMessage('Error updating profile. Please try again.', 'error');
            hideOverlay(); 
        }
    });

    function validateField(field) {
        const fieldID = field.id;
        const fieldname = field.getAttribute('aria-label');
        const fieldValue = field.value;

        if (fieldID === 'staffSize' && !fieldValue) {
            return 'Staff Size is required';
        }

        if (fieldID === 'mobileCode' && !fieldValue) {
            return 'Mobile Code is required';
        }

        if (fieldID === 'phoneNumber' && !isValidPhoneNumber(fieldValue)) {
            return 'Please enter a valid phone number.';
        }

        if (!fieldValue) {
            return `${fieldname} is required`;
        }

        return null;
    }

    function isValidPhoneNumber(phoneNumber) {
        const digitsOnly = phoneNumber.replace(/\D/g, '');
        return digitsOnly.length <= 20;
    }

    function showError(field, errorMessage) {
        const errorElement = field.nextElementSibling;

        if (errorMessage) {
            field.classList.add('is-invalid');
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
        } else {
            field.classList.remove('is-invalid');
            if (errorElement) {
                errorElement.textContent = '';
            }
        }
    }

    function showOverlay() {
        overlay.style.display = 'flex';
    }

    function hideOverlay() {
        overlay.style.display = 'none';
    }

    function showConfirmationMessage(message, type) {
        confirmationMessage.style.display = 'block';
        confirmationMessage.textContent = message;

        confirmationMessage.className = ''; 
        if (type === 'success') {
            confirmationMessage.classList.add('alert', 'alert-success');
        } else if (type === 'error') {
            confirmationMessage.classList.add('alert', 'alert-danger');
        }

        setTimeout(() => {
            confirmationMessage.style.display = 'none';
        }, 5000);
    }

    async function reloadUserProfile(username) {
        try {
            const data = await getUserProfile(username);

            setTimeout(() => {
                userID = data.userID;

                document.getElementById('firstName').value = data.firstName || '';
                document.getElementById('lastName').value = data.lastName || '';
                document.getElementById('companyName').value = data.companyName || '';
                document.getElementById('email').value = data.email || '';
                document.getElementById('staffSize').value = data.staffSize || '';
                document.getElementById('mobileCode').value = data.mobileCode || '';
                document.getElementById('phoneNumber').value = data.phoneNumber || '';

            }, 200);
        } catch (error) {
            console.error("Error reloading user profile:", error);
            showConfirmationMessage('Unable to reload user profile. Please try again later.', 'error');
        }
    }
};

//Profile Page

//Change Password Page

async function initializeChangePasswordPage() {
    if (!isUserLoggedIn()) {
        window.location.href = 'login.html';
    }

    const form = document.getElementById('changePasswordForm');
    const confirmationMessageElement = document.getElementById('confirmationMessage');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        let isValid = true;

        const currentPassword = document.getElementById('currentPassword').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        resetFields();

        if (!currentPassword) {
            showFieldError('currentPassword', 'Current Password is required.');
            isValid = false;
        }
        if (!newPassword) {
            showFieldError('newPassword', 'New Password is required.');
            isValid = false;
        }
        if (!confirmPassword) {
            showFieldError('confirmPassword', 'Confirm Password is required.');
            isValid = false;
        }

        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            showFieldError('confirmPassword', 'New Password and Confirm Password do not match.');
            isValid = false;
        }

        if (currentPassword && newPassword && currentPassword === newPassword) {
            showFieldError('confirmPassword', 'New Password cannot be the same as Current Password.');
            isValid = false;
        }

        if (!isValid) return; 

        try {
            const data = {
                currentPassword: currentPassword,
                newPassword: newPassword,
            };

            const response = await changePassword(data);

            showSuccessMessage(response.message || 'Password changed successfully.');

            form.reset();
            resetFields();
            setTimeout(() => {
                confirmationMessageElement.style.display = 'none';
            }, 5000); 
        } catch (error) {
            showFieldError('currentPassword', error.message || 'Current Password is incorrect.');
        }
    });

    function resetFields() {
        const fields = document.querySelectorAll('.form-control');
        fields.forEach(field => {
            field.classList.remove('is-invalid');
            const errorElement = field.nextElementSibling;
            if (errorElement) errorElement.textContent = '';
        });
    }

    function showFieldError(fieldId, errorMessage) {
        const field = document.getElementById(fieldId);
        const errorElement = field.nextElementSibling; 
        field.classList.add('is-invalid');
        if (errorElement) errorElement.textContent = errorMessage;
    }

    function showSuccessMessage(message) {
        confirmationMessageElement.style.display = 'block';
        confirmationMessageElement.textContent = message;
        confirmationMessageElement.style.color = 'green';
    }

    function isUserLoggedIn() {
        return true;
    }
};

//Change Password Page

//Get New Order Count

async function updateOrdersCount() {
    const ordersCountElement = document.getElementById('ordersCount');
    if (ordersCountElement) {
      const count = await getNewOrdersCount();
      ordersCountElement.textContent = count; 
    } else {
      console.error('Element with ID "ordersCount" not found.');
    }
  }
  
  window.addEventListener('load', updateOrdersCount);

//Get New Order Count

//Get Users Count

async function updateUsersCount() {
    const usersCountElement = document.getElementById('usersCount');
    if (usersCountElement) {
      const count = await getUsersCount();
      usersCountElement.textContent = count; 
    } else {
      console.error('Element with ID "usersCount" not found.');
    }
  }
  
  window.addEventListener('load', updateUsersCount);

//Get Users Count

//Get Users List

async function initializeUserListPage() {
    const usersListTableBody = document.getElementById('usersListTableBody');
    const overlay = document.getElementById('Overlay');

    if (!overlay || !usersListTableBody) {
        showToast('Required elements are missing from the DOM.', 'danger');
        return;
    }

    let usersList = [];

    function showOverlay() {
        overlay.style.display = 'flex';
    }

    function hideOverlay() {
        overlay.style.display = 'none';
    }

    function showToast(message, type = 'info') {
        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            console.error('Toast container not found in DOM!');
            return;
        }

        toastContainer.insertAdjacentHTML('beforeend', toastHTML);

        setTimeout(() => {
            const toastElement = document.getElementById(toastId);
            if (toastElement) {
                toastElement.remove();
            }
        }, 10000);
    }

    async function handleDeleteUsers() {
        const selectedRadioBtn = document.querySelector('.user-radio:checked'); 

        if (!selectedRadioBtn) {
            showToast('You must select a user to delete.', 'warning');
            return;
        }

        const username = selectedRadioBtn.dataset.username; 

        showConfirmationModal(username, async () => {
            try {
                const { deletedUsers, undeletableUsers } = await deleteUsers([username]); 

                if (deletedUsers && deletedUsers.length > 0) {
                    showToast('User successfully deleted.', 'success');
                }

                if (undeletableUsers && undeletableUsers.length > 0) {
                    const message = `
                        The selected user cannot be deleted because they are currently using our services. 
                        <br>If necessary, please remove their associated orders before attempting to delete this account.
                    `;
                    showToast(message, 'danger');
                }

                selectedRadioBtn.checked = false;

                const row = selectedRadioBtn.closest('tr');
                if (deletedUsers.includes(username)) {
                    $('#usersListTable').DataTable().row(row).remove().draw();
                }
            } catch (error) {
                showToast(`Error: ${error.message}`, 'danger');
            } finally {
                selectedRadioBtn.checked = false; 
            }
        });
    }

    function showConfirmationModal(username, onConfirm) {
        const modalElement = document.getElementById('confirmationModal');
        const modalBody = document.getElementById('confirmationModalBody');
        const confirmButton = document.getElementById('confirmDeleteButton');

        modalBody.innerHTML = `
            Are you sure you want to delete the following user?
            <br>${username}
        `;

        confirmButton.onclick = async () => {
            const bootstrapModal = bootstrap.Modal.getOrCreateInstance(modalElement);
            bootstrapModal.hide();
            await onConfirm();
        };

        const modal = new bootstrap.Modal(modalElement, {});
        modal.show();
    }

    function resetFormValidation(form) {
        const fields = form.querySelectorAll('.form-control');
        fields.forEach(field => {
            field.classList.remove('is-invalid');
            const feedback = field.nextElementSibling;
            if (feedback) feedback.style.display = 'none';
        });
    }

    function resetForm(form) {
        form.reset();
        resetFormValidation(form);
    }

    async function handleAddUser() {
        const modalElement = document.getElementById('addUserModal');
        const modalBodyElement = document.getElementById('modalBodyAddUser');

        modalBodyElement.innerHTML = `
            <form id="addUserForm" method="post">
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" id="firstName" placeholder="First name" required>
                        <div class="invalid-feedback">Please enter your first name.</div>
                    </div>
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" id="lastName" placeholder="Last name" required>
                        <div class="invalid-feedback">Please enter your last name.</div>
                    </div>
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" id="companyName" placeholder="Company name" required>
                        <div class="invalid-feedback">Please enter your company name.</div>
                    </div>
                    <div class="form-group col-md-6">
                        <select id="staffSize" class="form-control" required>
                            <option value="" disabled selected hidden>Staff size</option>
                            <option value="1-50">1-50</option>
                            <option value="51-100">51-100</option>
                            <option value="101-200">101-200</option>
                            <option value="201-500">201-500</option>
                            <option value="501-1000">501-1000</option>
                            <option value="1001-5000">1001-5000</option>
                            <option value="Above 5000">Above 5000</option>
                        </select>
                        <div class="invalid-feedback">Please select your staff size.</div>
                    </div>
                    <div class="form-group col-md-12">
                        <input type="email" class="form-control" id="email" placeholder="Email" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$" required>
                        <div class="invalid-feedback">Please enter a valid email address.</div>
                    </div>
                    <div class="form-group col-md-6">
                        <select id="mobileCode" class="form-control" required>
                            <option value="" disabled selected hidden>Choose your country</option>
                            <option value="+213" data-country-code="DZ" tabindex="0">Algeria (+213)</option>
                            <option value="+376" data-country-code="AD" tabindex="0">Andorra (+376)</option>
                            <option value="+244" data-country-code="AO" tabindex="0">Angola (+244)</option>
                            <option value="+1264" data-country-code="AI" tabindex="0">Anguilla (+1264)</option>
                            <option value="+1268" data-country-code="AG" tabindex="0">Antigua &amp; Barbuda (+1268)</option>
                            <option value="+54" data-country-code="AR" tabindex="0">Argentina (+54)</option>
                            <option value="+374" data-country-code="AM" tabindex="0">Armenia (+374)</option>
                            <option value="+297" data-country-code="AW" tabindex="0">Aruba (+297)</option>
                            <option value="+61" data-country-code="AU" tabindex="0">Australia (+61)</option>
                            <option value="+43" data-country-code="AT" tabindex="0">Austria (+43)</option>
                            <option value="+994" data-country-code="AZ" tabindex="0">Azerbaijan (+994)</option>
                            <option value="+1242" data-country-code="BS" tabindex="0">Bahamas (+1242)</option>
                            <option value="+973" data-country-code="BH" tabindex="0">Bahrain (+973)</option>
                            <option value="+880" data-country-code="BD" tabindex="0">Bangladesh (+880)</option>
                            <option value="+1246" data-country-code="BB" tabindex="0">Barbados (+1246)</option>
                            <option value="+375" data-country-code="BY" tabindex="0">Belarus (+375)</option>
                            <option value="+32" data-country-code="BE" tabindex="0">Belgium (+32)</option>
                            <option value="+501" data-country-code="BZ" tabindex="0">Belize (+501)</option>
                            <option value="+229" data-country-code="BJ" tabindex="0">Benin (+229)</option>
                            <option value="+1441" data-country-code="BM" tabindex="0">Bermuda (+1441)</option>
                            <option value="+975" data-country-code="BT" tabindex="0">Bhutan (+975)</option>
                            <option value="+591" data-country-code="BO" tabindex="0">Bolivia (+591)</option>
                            <option value="+387" data-country-code="BA" tabindex="0">Bosnia Herzegovina (+387)</option>
                            <option value="+267" data-country-code="BW" tabindex="0">Botswana (+267)</option>
                            <option value="+55" data-country-code="BR" tabindex="0">Brazil (+55)</option>
                            <option value="+673" data-country-code="BN" tabindex="0">Brunei (+673)</option>
                            <option value="+359" data-country-code="BG" tabindex="0">Bulgaria (+359)</option>
                            <option value="+226" data-country-code="BF" tabindex="0">Burkina Faso (+226)</option>
                            <option value="+257" data-country-code="BI" tabindex="0">Burundi (+257)</option>
                            <option value="+855" data-country-code="KH" tabindex="0">Cambodia (+855)</option>
                            <option value="+237" data-country-code="CM" tabindex="0">Cameroon (+237)</option>
                            <option value="+1" data-country-code="CA" tabindex="0">Canada (+1)</option>
                            <option value="+238" data-country-code="CV" tabindex="0">Cape Verde Islands (+238)</option>
                            <option value="+1345" data-country-code="KY" tabindex="0">Cayman Islands (+1345)</option>
                            <option value="+236" data-country-code="CF" tabindex="0">Central African Republic (+236)</option>
                            <option value="+56" data-country-code="CL" tabindex="0">Chile (+56)</option>
                            <option value="+86" data-country-code="CN" tabindex="0">China (+86)</option>
                            <option value="+57" data-country-code="CO" tabindex="0">Colombia (+57)</option>
                            <option value="+269" data-country-code="KM" tabindex="0">Comoros (+269)</option>
                            <option value="+242" data-country-code="CG" tabindex="0">Congo (+242)</option>
                            <option value="+682" data-country-code="CK" tabindex="0">Cook Islands (+682)</option>
                            <option value="+506" data-country-code="CR" tabindex="0">Costa Rica (+506)</option>
                            <option value="+385" data-country-code="HR" tabindex="0">Croatia (+385)</option>
                            <option value="+53" data-country-code="CU" tabindex="0">Cuba (+53)</option>
                            <option value="+90392" data-country-code="CY" tabindex="0">Cyprus North (+90392)</option>
                            <option value="+357" data-country-code="CY" tabindex="0">Cyprus South (+357)</option>
                            <option value="+42" data-country-code="CZ" tabindex="0">Czech Republic (+42)</option>
                            <option value="+45" data-country-code="DK" tabindex="0">Denmark (+45)</option>
                            <option value="+253" data-country-code="DJ" tabindex="0">Djibouti (+253)</option>
                            <option value="+1809" data-country-code="DM" tabindex="0">Dominica (+1809)</option>
                            <option value="+1809" data-country-code="DO" tabindex="0">Dominican Republic (+1809)</option>
                            <option value="+593" data-country-code="EC" tabindex="0">Ecuador (+593)</option>
                            <option value="+20" data-country-code="EG" tabindex="0">Egypt (+20)</option>
                            <option value="+503" data-country-code="SV" tabindex="0">El Salvador (+503)</option>
                            <option value="+240" data-country-code="GQ" tabindex="0">Equatorial Guinea (+240)</option>
                            <option value="+291" data-country-code="ER" tabindex="0">Eritrea (+291)</option>
                            <option value="+372" data-country-code="EE" tabindex="0">Estonia (+372)</option>
                            <option value="+251" data-country-code="ET" tabindex="0">Ethiopia (+251)</option>
                            <option value="+500" data-country-code="FK" tabindex="0">Falkland Islands (+500)</option>
                            <option value="+298" data-country-code="FO" tabindex="0">Faroe Islands (+298)</option>
                            <option value="+679" data-country-code="FJ" tabindex="0">Fiji (+679)</option>
                            <option value="+358" data-country-code="FI" tabindex="0">Finland (+358)</option>
                            <option value="+33" data-country-code="FR" tabindex="0">France (+33)</option>
                            <option value="+594" data-country-code="GF" tabindex="0">French Guiana (+594)</option>
                            <option value="+689" data-country-code="PF" tabindex="0">French Polynesia (+689)</option>
                            <option value="+241" data-country-code="GA" tabindex="0">Gabon (+241)</option>
                            <option value="+220" data-country-code="GM" tabindex="0">Gambia (+220)</option>
                            <option value="+7880" data-country-code="GE" tabindex="0">Georgia (+7880)</option>
                            <option value="+49" data-country-code="DE" tabindex="0">Germany (+49)</option>
                            <option value="+233" data-country-code="GH" tabindex="0">Ghana (+233)</option>
                            <option value="+350" data-country-code="GI" tabindex="0">Gibraltar (+350)</option>
                            <option value="+30" data-country-code="GR" tabindex="0">Greece (+30)</option>
                            <option value="+299" data-country-code="GL" tabindex="0">Greenland (+299)</option>
                            <option value="+1473" data-country-code="GD" tabindex="0">Grenada (+1473)</option>
                            <option value="+590" data-country-code="GP" tabindex="0">Guadeloupe (+590)</option>
                            <option value="+671" data-country-code="GU" tabindex="0">Guam (+671)</option>
                            <option value="+502" data-country-code="GT" tabindex="0">Guatemala (+502)</option>
                            <option value="+224" data-country-code="GN" tabindex="0">Guinea (+224)</option>
                            <option value="+245" data-country-code="GW" tabindex="0">Guinea - Bissau (+245)</option>
                            <option value="+592" data-country-code="GY" tabindex="0">Guyana (+592)</option>
                            <option value="+509" data-country-code="HT" tabindex="0">Haiti (+509)</option>
                            <option value="+504" data-country-code="HN" tabindex="0">Honduras (+504)</option>
                            <option value="+852" data-country-code="HK" tabindex="0">Hong Kong (+852)</option>
                            <option value="+36" data-country-code="HU" tabindex="0">Hungary (+36)</option>
                            <option value="+354" data-country-code="IS" tabindex="0">Iceland (+354)</option>
                            <option value="+91" data-country-code="IN" tabindex="0">India (+91)</option>
                            <option value="+62" data-country-code="ID" tabindex="0">Indonesia (+62)</option>
                            <option value="+98" data-country-code="IR" tabindex="0">Iran (+98)</option>
                            <option value="+964" data-country-code="IQ" tabindex="0">Iraq (+964)</option>
                            <option value="+353" data-country-code="IE" tabindex="0">Ireland (+353)</option>
                            <option value="+972" data-country-code="IL" tabindex="0">Israel (+972)</option>
                            <option value="+39" data-country-code="IT" tabindex="0">Italy (+39)</option>
                            <option value="+1876" data-country-code="JM" tabindex="0">Jamaica (+1876)</option>
                            <option value="+81" data-country-code="JP" tabindex="0">Japan (+81)</option>
                            <option value="+962" data-country-code="JO" tabindex="0">Jordan (+962)</option>
                            <option value="+7" data-country-code="KZ" tabindex="0">Kazakhstan (+7)</option>
                            <option value="+254" data-country-code="KE" tabindex="0">Kenya (+254)</option>
                            <option value="+686" data-country-code="KI" tabindex="0">Kiribati (+686)</option>
                            <option value="+850" data-country-code="KP" tabindex="0">Korea North (+850)</option>
                            <option value="+82" data-country-code="KR" tabindex="0">Korea South (+82)</option>
                            <option value="+965" data-country-code="KW" tabindex="0">Kuwait (+965)</option>
                            <option value="+996" data-country-code="KG" tabindex="0">Kyrgyzstan (+996)</option>
                            <option value="+856" data-country-code="LA" tabindex="0">Laos (+856)</option>
                            <option value="+371" data-country-code="LV" tabindex="0">Latvia (+371)</option>
                            <option value="+961" data-country-code="LB" tabindex="0">Lebanon (+961)</option>
                            <option value="+266" data-country-code="LS" tabindex="0">Lesotho (+266)</option>
                            <option value="+231" data-country-code="LR" tabindex="0">Liberia (+231)</option>
                            <option value="+218" data-country-code="LY" tabindex="0">Libya (+218)</option>
                            <option value="+417" data-country-code="LI" tabindex="0">Liechtenstein (+417)</option>
                            <option value="+370" data-country-code="LT" tabindex="0">Lithuania (+370)</option>
                            <option value="+352" data-country-code="LU" tabindex="0">Luxembourg (+352)</option>
                            <option value="+853" data-country-code="MO" tabindex="0">Macao (+853)</option>
                            <option value="+389" data-country-code="MK" tabindex="0">Macedonia (+389)</option>
                            <option value="+261" data-country-code="MG" tabindex="0">Madagascar (+261)</option>
                            <option value="+265" data-country-code="MW" tabindex="0">Malawi (+265)</option>
                            <option value="+60" data-country-code="MY" tabindex="0">Malaysia (+60)</option>
                            <option value="+960" data-country-code="MV" tabindex="0">Maldives (+960)</option>
                            <option value="+223" data-country-code="ML" tabindex="0">Mali (+223)</option>
                            <option value="+356" data-country-code="MT" tabindex="0">Malta (+356)</option>
                            <option value="+692" data-country-code="MH" tabindex="0">Marshall Islands (+692)</option>
                            <option value="+596" data-country-code="MQ" tabindex="0">Martinique (+596)</option>
                            <option value="+222" data-country-code="MR" tabindex="0">Mauritania (+222)</option>
                            <option value="+269" data-country-code="YT" tabindex="0">Mayotte (+269)</option>
                            <option value="+52" data-country-code="MX" tabindex="0">Mexico (+52)</option>
                            <option value="+691" data-country-code="FM" tabindex="0">Micronesia (+691)</option>
                            <option value="+373" data-country-code="MD" tabindex="0">Moldova (+373)</option>
                            <option value="+377" data-country-code="MC" tabindex="0">Monaco (+377)</option>
                            <option value="+976" data-country-code="MN" tabindex="0">Mongolia (+976)</option>
                            <option value="+1664" data-country-code="MS" tabindex="0">Montserrat (+1664)</option>
                            <option value="+212" data-country-code="MA" tabindex="0">Morocco (+212)</option>
                            <option value="+258" data-country-code="MZ" tabindex="0">Mozambique (+258)</option>
                            <option value="+95" data-country-code="MN" tabindex="0">Myanmar (+95)</option>
                            <option value="+264" data-country-code="NA" tabindex="0">Namibia (+264)</option>
                            <option value="+674" data-country-code="NR" tabindex="0">Nauru (+674)</option>
                            <option value="+977" data-country-code="NP" tabindex="0">Nepal (+977)</option>
                            <option value="+31" data-country-code="NL" tabindex="0">Netherlands (+31)</option>
                            <option value="+687" data-country-code="NC" tabindex="0">New Caledonia (+687)</option>
                            <option value="+64" data-country-code="NZ" tabindex="0">New Zealand (+64)</option>
                            <option value="+505" data-country-code="NI" tabindex="0">Nicaragua (+505)</option>
                            <option value="+227" data-country-code="NE" tabindex="0">Niger (+227)</option>
                            <option value="+234" data-country-code="NG" tabindex="0">Nigeria (+234)</option>
                            <option value="+683" data-country-code="NU" tabindex="0">Niue (+683)</option>
                            <option value="+672" data-country-code="NF" tabindex="0">Norfolk Islands (+672)</option>
                            <option value="+670" data-country-code="NP" tabindex="0">Northern Marianas (+670)</option>
                            <option value="+47" data-country-code="NO" tabindex="0">Norway (+47)</option>
                            <option value="+968" data-country-code="OM" tabindex="0">Oman (+968)</option>
                            <option value="+680" data-country-code="PW" tabindex="0">Palau (+680)</option>
                            <option value="+507" data-country-code="PA" tabindex="0">Panama (+507)</option>
                            <option value="+675" data-country-code="PG" tabindex="0">Papua New Guinea (+675)</option>
                            <option value="+595" data-country-code="PY" tabindex="0">Paraguay (+595)</option>
                            <option value="+51" data-country-code="PE" tabindex="0">Peru (+51)</option>
                            <option value="+63" data-country-code="PH" tabindex="0">Philippines (+63)</option>
                            <option value="+48" data-country-code="PL" tabindex="0">Poland (+48)</option>
                            <option value="+351" data-country-code="PT" tabindex="0">Portugal (+351)</option>
                            <option value="+1787" data-country-code="PR" tabindex="0">Puerto Rico (+1787)</option>
                            <option value="+974" data-country-code="QA" tabindex="0">Qatar (+974)</option>
                            <option value="+262" data-country-code="RE" tabindex="0">Reunion (+262)</option>
                            <option value="+40" data-country-code="RO" tabindex="0">Romania (+40)</option>
                            <option value="+7" data-country-code="RU" tabindex="0">Russia (+7)</option>
                            <option value="+250" data-country-code="RW" tabindex="0">Rwanda (+250)</option>
                            <option value="+378" data-country-code="SM" tabindex="0">San Marino (+378)</option>
                            <option value="+239" data-country-code="ST" tabindex="0">Sao Tome &amp; Principe (+239)</option>
                            <option value="+966" data-country-code="SA" tabindex="0">Saudi Arabia (+966)</option>
                            <option value="+221" data-country-code="SN" tabindex="0">Senegal (+221)</option>
                            <option value="+381" data-country-code="CS" tabindex="0">Serbia (+381)</option>
                            <option value="+248" data-country-code="SC" tabindex="0">Seychelles (+248)</option>
                            <option value="+232" data-country-code="SL" tabindex="0">Sierra Leone (+232)</option>
                            <option value="+65" data-country-code="SG" tabindex="0">Singapore (+65)</option>
                            <option value="+421" data-country-code="SK" tabindex="0">Slovak Republic (+421)</option>
                            <option value="+386" data-country-code="SI" tabindex="0">Slovenia (+386)</option>
                            <option value="+677" data-country-code="SB" tabindex="0">Solomon Islands (+677)</option>
                            <option value="+252" data-country-code="SO" tabindex="0">Somalia (+252)</option>
                            <option value="+27" data-country-code="ZA" tabindex="0">South Africa (+27)</option>
                            <option value="+211" data-country-code="SS" tabindex="0">South Sudan (+211)</option>
                            <option value="+34" data-country-code="ES" tabindex="0">Spain (+34)</option>
                            <option value="+94" data-country-code="LK" tabindex="0">Sri Lanka (+94)</option>
                            <option value="+290" data-country-code="SH" tabindex="0">St. Helena (+290)</option>
                            <option value="+1869" data-country-code="KN" tabindex="0">St. Kitts (+1869)</option>
                            <option value="+1758" data-country-code="SC" tabindex="0">St. Lucia (+1758)</option>
                            <option value="+249" data-country-code="SD" tabindex="0">Sudan (+249)</option>
                            <option value="+597" data-country-code="SR" tabindex="0">Suriname (+597)</option>
                            <option value="+268" data-country-code="SZ" tabindex="0">Swaziland (+268)</option>
                            <option value="+46" data-country-code="SE" tabindex="0">Sweden (+46)</option>
                            <option value="+41" data-country-code="CH" tabindex="0">Switzerland (+41)</option>
                            <option value="+963" data-country-code="SI" tabindex="0">Syria (+963)</option>
                            <option value="+886" data-country-code="TW" tabindex="0">Taiwan (+886)</option>
                            <option value="+7" data-country-code="TJ" tabindex="0">Tajikstan (+7)</option>
                            <option value="+66" data-country-code="TH" tabindex="0">Thailand (+66)</option>
                            <option value="+228" data-country-code="TG" tabindex="0">Togo (+228)</option>
                            <option value="+676" data-country-code="TO" tabindex="0">Tonga (+676)</option>
                            <option value="+1868" data-country-code="TT" tabindex="0">Trinidad &amp; Tobago (+1868)</option>
                            <option value="+216" data-country-code="TN" tabindex="0">Tunisia (+216)</option>
                            <option value="+90" data-country-code="TR" tabindex="0">Turkey (+90)</option>
                            <option value="+7" data-country-code="TM" tabindex="0">Turkmenistan (+7)</option>
                            <option value="+993" data-country-code="TM" tabindex="0">Turkmenistan (+993)</option>
                            <option value="+1649" data-country-code="TC" tabindex="0">Turks &amp; Caicos Islands (+1649)</option>
                            <option value="+688" data-country-code="TV" tabindex="0">Tuvalu (+688)</option>
                            <option value="+256" data-country-code="UG" tabindex="0">Uganda (+256)</option>
                            <option value="+971" data-country-code="AE" tabindex="0">United Arab Emirates (+971)</option>
                            <option value="+44" data-country-code="GB" tabindex="0">United Kingdom (+44)</option>
                            <option value="+1" data-country-code="US" tabindex="0">United States of America (+1)</option>
                            <option value="+380" data-country-code="UA" tabindex="0">Ukraine (+380)</option>
                            <option value="+598" data-country-code="UY" tabindex="0">Uruguay (+598)</option>
                            <option value="+7" data-country-code="UZ" tabindex="0">Uzbekistan (+7)</option>
                            <option value="+678" data-country-code="VU" tabindex="0">Vanuatu (+678)</option>
                            <option value="+379" data-country-code="VA" tabindex="0">Vatican City (+379)</option>
                            <option value="+58" data-country-code="VE" tabindex="0">Venezuela (+58)</option>
                            <option value="+84" data-country-code="VN" tabindex="0">Vietnam (+84)</option>
                            <option value="+1284" data-country-code="VG" tabindex="0">Virgin Islands - British (+1284)</option>
                            <option value="+1340" data-country-code="VI" tabindex="0">Virgin Islands - US (+1340)</option>
                            <option value="+681" data-country-code="WF" tabindex="0">Wallis &amp; Futuna (+681)</option>
                            <option value="+969" data-country-code="YE" tabindex="0">Yemen (North)(+969)</option>
                            <option value="+967" data-country-code="YE" tabindex="0">Yemen (South)(+967)</option>
                            <option value="+260" data-country-code="ZM" tabindex="0">Zambia (+260)</option>
                            <option value="+263" data-country-code="ZW" tabindex="0">Zimbabwe (+263)</option>
                        </select>
                        <div class="invalid-feedback">Please choose your mobile code.</div>
                    </div>
                    <div class="form-group col-md-6">
                        <input type="number" class="form-control" id="phoneNumber" placeholder="Phone number" required>
                        <div class="invalid-feedback">Please enter a valid phone number.</div>
                    </div>
                </div>
            </form>
        `;

        const addUserForm = document.getElementById('addUserForm');
        const confirmButton = document.getElementById('addUserConfirmButton');

        resetForm(addUserForm);

        const modal = new bootstrap.Modal(modalElement, {});
        modal.show();

        confirmButton.onclick = async () => {
            const fields = Array.from(addUserForm.querySelectorAll('.form-control'));
            let isFormValid = true;

            fields.forEach(field => {
                if (!field.value.trim()) {
                    isFormValid = false;
                    field.classList.add('is-invalid');
                    const feedback = field.nextElementSibling;
                    if (feedback) feedback.style.display = 'block';
                } else {
                    field.classList.remove('is-invalid');
                    const feedback = field.nextElementSibling;
                    if (feedback) feedback.style.display = 'none';
                }
            });

            if (!isFormValid) {
                showToast('Please fix errors in the form.', 'warning');
                return;
            }

            const userData = {
                firstName: addUserForm.querySelector('#firstName').value,
                lastName: addUserForm.querySelector('#lastName').value,
                companyName: addUserForm.querySelector('#companyName').value,
                staffSize: addUserForm.querySelector('#staffSize').value,
                email: addUserForm.querySelector('#email').value,
                mobileCode: addUserForm.querySelector('#mobileCode').value,
                phoneNumber: addUserForm.querySelector('#phoneNumber').value,
            };

            try {
                showOverlay();
                await addUser(userData);
                showToast('User added successfully!', 'success');
                resetForm(addUserForm);

                const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
                bootstrapModal.hide();

                await refreshUsersList();
            } catch (error) {
                showToast('Failed to add user: ' + (error.error || error.message), 'danger');
            } finally {
                hideOverlay();
            }
        };
    }

    async function handleEditUser() {
        const selectedRadioBtn = document.querySelector('.user-radio:checked');
    
        if (!selectedRadioBtn) {
            showToast('You must select a user to edit.', 'warning');
            return;
        }
    
        const username = selectedRadioBtn.dataset.username;
    
        const user = usersList.find(u => u.username === username);
        if (!user) {
            showToast('Selected user not found!', 'danger');
            return;
        }
    
        const modalElement = document.getElementById('editUserModal');
        const modalBodyElement = document.getElementById('modalBodyEditUser');
    
        modalBodyElement.innerHTML = `
            <form id="editUserForm">
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="editFirstName" class="form-label">First name</label>
                        <input type="text" class="form-control" id="editFirstName" value="${user.firstName}" placeholder="First name" required>
                        <div class="invalid-feedback">Please enter your first name.</div>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="editLastName" class="form-label">Last name</label>
                        <input type="text" class="form-control" id="editLastName" value="${user.lastName}" placeholder="Last name" required>
                        <div class="invalid-feedback">Please enter your last name.</div>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="editCompanyName" class="form-label">Company name</label>
                        <input type="text" class="form-control" id="editCompanyName" value="${user.companyName}" placeholder="Company name" required>
                        <div class="invalid-feedback">Please enter your company name.</div>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="editStaffSize" class="form-label">Staff size</label>
                        <select id="editStaffSize" class="form-control" required>
                            <option value="${user.staffSize}" selected>${user.staffSize}</option>
                            <option value="1-50">1-50</option>
                            <option value="51-100">51-100</option>
                            <option value="101-200">101-200</option>
                            <option value="201-500">201-500</option>
                            <option value="501-1000">501-1000</option>
                            <option value="1001-5000">1001-5000</option>
                            <option value="Above 5000">Above 5000</option>
                        </select>
                        <div class="invalid-feedback">Please select your staff size.</div>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="editEmail" class="form-label">Email</label>
                        <input type="email" class="form-control" id="editEmail" value="${user.email}" placeholder="Email" required>
                        <div class="invalid-feedback">Please enter a valid email address.</div>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="editUsername" class="form-label">Username</label>
                        <input type="text" class="form-control" id="editUsername" value="${user.username}" placeholder="Username" required>
                        <div class="invalid-feedback">Please enter a valid username.</div>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="editMobileCode" class="form-label">Mobile code</label>
                        <select id="editMobileCode" class="form-control" required>
                            <option value="${user.mobileCode}" selected>${user.mobileCode}</option>
                            <option value="+213" data-country-code="DZ" tabindex="0">Algeria (+213)</option>
                            <option value="+376" data-country-code="AD" tabindex="0">Andorra (+376)</option>
                            <option value="+244" data-country-code="AO" tabindex="0">Angola (+244)</option>
                            <option value="+1264" data-country-code="AI" tabindex="0">Anguilla (+1264)</option>
                            <option value="+1268" data-country-code="AG" tabindex="0">Antigua &amp; Barbuda (+1268)</option>
                            <option value="+54" data-country-code="AR" tabindex="0">Argentina (+54)</option>
                            <option value="+374" data-country-code="AM" tabindex="0">Armenia (+374)</option>
                            <option value="+297" data-country-code="AW" tabindex="0">Aruba (+297)</option>
                            <option value="+61" data-country-code="AU" tabindex="0">Australia (+61)</option>
                            <option value="+43" data-country-code="AT" tabindex="0">Austria (+43)</option>
                            <option value="+994" data-country-code="AZ" tabindex="0">Azerbaijan (+994)</option>
                            <option value="+1242" data-country-code="BS" tabindex="0">Bahamas (+1242)</option>
                            <option value="+973" data-country-code="BH" tabindex="0">Bahrain (+973)</option>
                            <option value="+880" data-country-code="BD" tabindex="0">Bangladesh (+880)</option>
                            <option value="+1246" data-country-code="BB" tabindex="0">Barbados (+1246)</option>
                            <option value="+375" data-country-code="BY" tabindex="0">Belarus (+375)</option>
                            <option value="+32" data-country-code="BE" tabindex="0">Belgium (+32)</option>
                            <option value="+501" data-country-code="BZ" tabindex="0">Belize (+501)</option>
                            <option value="+229" data-country-code="BJ" tabindex="0">Benin (+229)</option>
                            <option value="+1441" data-country-code="BM" tabindex="0">Bermuda (+1441)</option>
                            <option value="+975" data-country-code="BT" tabindex="0">Bhutan (+975)</option>
                            <option value="+591" data-country-code="BO" tabindex="0">Bolivia (+591)</option>
                            <option value="+387" data-country-code="BA" tabindex="0">Bosnia Herzegovina (+387)</option>
                            <option value="+267" data-country-code="BW" tabindex="0">Botswana (+267)</option>
                            <option value="+55" data-country-code="BR" tabindex="0">Brazil (+55)</option>
                            <option value="+673" data-country-code="BN" tabindex="0">Brunei (+673)</option>
                            <option value="+359" data-country-code="BG" tabindex="0">Bulgaria (+359)</option>
                            <option value="+226" data-country-code="BF" tabindex="0">Burkina Faso (+226)</option>
                            <option value="+257" data-country-code="BI" tabindex="0">Burundi (+257)</option>
                            <option value="+855" data-country-code="KH" tabindex="0">Cambodia (+855)</option>
                            <option value="+237" data-country-code="CM" tabindex="0">Cameroon (+237)</option>
                            <option value="+1" data-country-code="CA" tabindex="0">Canada (+1)</option>
                            <option value="+238" data-country-code="CV" tabindex="0">Cape Verde Islands (+238)</option>
                            <option value="+1345" data-country-code="KY" tabindex="0">Cayman Islands (+1345)</option>
                            <option value="+236" data-country-code="CF" tabindex="0">Central African Republic (+236)</option>
                            <option value="+56" data-country-code="CL" tabindex="0">Chile (+56)</option>
                            <option value="+86" data-country-code="CN" tabindex="0">China (+86)</option>
                            <option value="+57" data-country-code="CO" tabindex="0">Colombia (+57)</option>
                            <option value="+269" data-country-code="KM" tabindex="0">Comoros (+269)</option>
                            <option value="+242" data-country-code="CG" tabindex="0">Congo (+242)</option>
                            <option value="+682" data-country-code="CK" tabindex="0">Cook Islands (+682)</option>
                            <option value="+506" data-country-code="CR" tabindex="0">Costa Rica (+506)</option>
                            <option value="+385" data-country-code="HR" tabindex="0">Croatia (+385)</option>
                            <option value="+53" data-country-code="CU" tabindex="0">Cuba (+53)</option>
                            <option value="+90392" data-country-code="CY" tabindex="0">Cyprus North (+90392)</option>
                            <option value="+357" data-country-code="CY" tabindex="0">Cyprus South (+357)</option>
                            <option value="+42" data-country-code="CZ" tabindex="0">Czech Republic (+42)</option>
                            <option value="+45" data-country-code="DK" tabindex="0">Denmark (+45)</option>
                            <option value="+253" data-country-code="DJ" tabindex="0">Djibouti (+253)</option>
                            <option value="+1809" data-country-code="DM" tabindex="0">Dominica (+1809)</option>
                            <option value="+1809" data-country-code="DO" tabindex="0">Dominican Republic (+1809)</option>
                            <option value="+593" data-country-code="EC" tabindex="0">Ecuador (+593)</option>
                            <option value="+20" data-country-code="EG" tabindex="0">Egypt (+20)</option>
                            <option value="+503" data-country-code="SV" tabindex="0">El Salvador (+503)</option>
                            <option value="+240" data-country-code="GQ" tabindex="0">Equatorial Guinea (+240)</option>
                            <option value="+291" data-country-code="ER" tabindex="0">Eritrea (+291)</option>
                            <option value="+372" data-country-code="EE" tabindex="0">Estonia (+372)</option>
                            <option value="+251" data-country-code="ET" tabindex="0">Ethiopia (+251)</option>
                            <option value="+500" data-country-code="FK" tabindex="0">Falkland Islands (+500)</option>
                            <option value="+298" data-country-code="FO" tabindex="0">Faroe Islands (+298)</option>
                            <option value="+679" data-country-code="FJ" tabindex="0">Fiji (+679)</option>
                            <option value="+358" data-country-code="FI" tabindex="0">Finland (+358)</option>
                            <option value="+33" data-country-code="FR" tabindex="0">France (+33)</option>
                            <option value="+594" data-country-code="GF" tabindex="0">French Guiana (+594)</option>
                            <option value="+689" data-country-code="PF" tabindex="0">French Polynesia (+689)</option>
                            <option value="+241" data-country-code="GA" tabindex="0">Gabon (+241)</option>
                            <option value="+220" data-country-code="GM" tabindex="0">Gambia (+220)</option>
                            <option value="+7880" data-country-code="GE" tabindex="0">Georgia (+7880)</option>
                            <option value="+49" data-country-code="DE" tabindex="0">Germany (+49)</option>
                            <option value="+233" data-country-code="GH" tabindex="0">Ghana (+233)</option>
                            <option value="+350" data-country-code="GI" tabindex="0">Gibraltar (+350)</option>
                            <option value="+30" data-country-code="GR" tabindex="0">Greece (+30)</option>
                            <option value="+299" data-country-code="GL" tabindex="0">Greenland (+299)</option>
                            <option value="+1473" data-country-code="GD" tabindex="0">Grenada (+1473)</option>
                            <option value="+590" data-country-code="GP" tabindex="0">Guadeloupe (+590)</option>
                            <option value="+671" data-country-code="GU" tabindex="0">Guam (+671)</option>
                            <option value="+502" data-country-code="GT" tabindex="0">Guatemala (+502)</option>
                            <option value="+224" data-country-code="GN" tabindex="0">Guinea (+224)</option>
                            <option value="+245" data-country-code="GW" tabindex="0">Guinea - Bissau (+245)</option>
                            <option value="+592" data-country-code="GY" tabindex="0">Guyana (+592)</option>
                            <option value="+509" data-country-code="HT" tabindex="0">Haiti (+509)</option>
                            <option value="+504" data-country-code="HN" tabindex="0">Honduras (+504)</option>
                            <option value="+852" data-country-code="HK" tabindex="0">Hong Kong (+852)</option>
                            <option value="+36" data-country-code="HU" tabindex="0">Hungary (+36)</option>
                            <option value="+354" data-country-code="IS" tabindex="0">Iceland (+354)</option>
                            <option value="+91" data-country-code="IN" tabindex="0">India (+91)</option>
                            <option value="+62" data-country-code="ID" tabindex="0">Indonesia (+62)</option>
                            <option value="+98" data-country-code="IR" tabindex="0">Iran (+98)</option>
                            <option value="+964" data-country-code="IQ" tabindex="0">Iraq (+964)</option>
                            <option value="+353" data-country-code="IE" tabindex="0">Ireland (+353)</option>
                            <option value="+972" data-country-code="IL" tabindex="0">Israel (+972)</option>
                            <option value="+39" data-country-code="IT" tabindex="0">Italy (+39)</option>
                            <option value="+1876" data-country-code="JM" tabindex="0">Jamaica (+1876)</option>
                            <option value="+81" data-country-code="JP" tabindex="0">Japan (+81)</option>
                            <option value="+962" data-country-code="JO" tabindex="0">Jordan (+962)</option>
                            <option value="+7" data-country-code="KZ" tabindex="0">Kazakhstan (+7)</option>
                            <option value="+254" data-country-code="KE" tabindex="0">Kenya (+254)</option>
                            <option value="+686" data-country-code="KI" tabindex="0">Kiribati (+686)</option>
                            <option value="+850" data-country-code="KP" tabindex="0">Korea North (+850)</option>
                            <option value="+82" data-country-code="KR" tabindex="0">Korea South (+82)</option>
                            <option value="+965" data-country-code="KW" tabindex="0">Kuwait (+965)</option>
                            <option value="+996" data-country-code="KG" tabindex="0">Kyrgyzstan (+996)</option>
                            <option value="+856" data-country-code="LA" tabindex="0">Laos (+856)</option>
                            <option value="+371" data-country-code="LV" tabindex="0">Latvia (+371)</option>
                            <option value="+961" data-country-code="LB" tabindex="0">Lebanon (+961)</option>
                            <option value="+266" data-country-code="LS" tabindex="0">Lesotho (+266)</option>
                            <option value="+231" data-country-code="LR" tabindex="0">Liberia (+231)</option>
                            <option value="+218" data-country-code="LY" tabindex="0">Libya (+218)</option>
                            <option value="+417" data-country-code="LI" tabindex="0">Liechtenstein (+417)</option>
                            <option value="+370" data-country-code="LT" tabindex="0">Lithuania (+370)</option>
                            <option value="+352" data-country-code="LU" tabindex="0">Luxembourg (+352)</option>
                            <option value="+853" data-country-code="MO" tabindex="0">Macao (+853)</option>
                            <option value="+389" data-country-code="MK" tabindex="0">Macedonia (+389)</option>
                            <option value="+261" data-country-code="MG" tabindex="0">Madagascar (+261)</option>
                            <option value="+265" data-country-code="MW" tabindex="0">Malawi (+265)</option>
                            <option value="+60" data-country-code="MY" tabindex="0">Malaysia (+60)</option>
                            <option value="+960" data-country-code="MV" tabindex="0">Maldives (+960)</option>
                            <option value="+223" data-country-code="ML" tabindex="0">Mali (+223)</option>
                            <option value="+356" data-country-code="MT" tabindex="0">Malta (+356)</option>
                            <option value="+692" data-country-code="MH" tabindex="0">Marshall Islands (+692)</option>
                            <option value="+596" data-country-code="MQ" tabindex="0">Martinique (+596)</option>
                            <option value="+222" data-country-code="MR" tabindex="0">Mauritania (+222)</option>
                            <option value="+269" data-country-code="YT" tabindex="0">Mayotte (+269)</option>
                            <option value="+52" data-country-code="MX" tabindex="0">Mexico (+52)</option>
                            <option value="+691" data-country-code="FM" tabindex="0">Micronesia (+691)</option>
                            <option value="+373" data-country-code="MD" tabindex="0">Moldova (+373)</option>
                            <option value="+377" data-country-code="MC" tabindex="0">Monaco (+377)</option>
                            <option value="+976" data-country-code="MN" tabindex="0">Mongolia (+976)</option>
                            <option value="+1664" data-country-code="MS" tabindex="0">Montserrat (+1664)</option>
                            <option value="+212" data-country-code="MA" tabindex="0">Morocco (+212)</option>
                            <option value="+258" data-country-code="MZ" tabindex="0">Mozambique (+258)</option>
                            <option value="+95" data-country-code="MN" tabindex="0">Myanmar (+95)</option>
                            <option value="+264" data-country-code="NA" tabindex="0">Namibia (+264)</option>
                            <option value="+674" data-country-code="NR" tabindex="0">Nauru (+674)</option>
                            <option value="+977" data-country-code="NP" tabindex="0">Nepal (+977)</option>
                            <option value="+31" data-country-code="NL" tabindex="0">Netherlands (+31)</option>
                            <option value="+687" data-country-code="NC" tabindex="0">New Caledonia (+687)</option>
                            <option value="+64" data-country-code="NZ" tabindex="0">New Zealand (+64)</option>
                            <option value="+505" data-country-code="NI" tabindex="0">Nicaragua (+505)</option>
                            <option value="+227" data-country-code="NE" tabindex="0">Niger (+227)</option>
                            <option value="+234" data-country-code="NG" tabindex="0">Nigeria (+234)</option>
                            <option value="+683" data-country-code="NU" tabindex="0">Niue (+683)</option>
                            <option value="+672" data-country-code="NF" tabindex="0">Norfolk Islands (+672)</option>
                            <option value="+670" data-country-code="NP" tabindex="0">Northern Marianas (+670)</option>
                            <option value="+47" data-country-code="NO" tabindex="0">Norway (+47)</option>
                            <option value="+968" data-country-code="OM" tabindex="0">Oman (+968)</option>
                            <option value="+680" data-country-code="PW" tabindex="0">Palau (+680)</option>
                            <option value="+507" data-country-code="PA" tabindex="0">Panama (+507)</option>
                            <option value="+675" data-country-code="PG" tabindex="0">Papua New Guinea (+675)</option>
                            <option value="+595" data-country-code="PY" tabindex="0">Paraguay (+595)</option>
                            <option value="+51" data-country-code="PE" tabindex="0">Peru (+51)</option>
                            <option value="+63" data-country-code="PH" tabindex="0">Philippines (+63)</option>
                            <option value="+48" data-country-code="PL" tabindex="0">Poland (+48)</option>
                            <option value="+351" data-country-code="PT" tabindex="0">Portugal (+351)</option>
                            <option value="+1787" data-country-code="PR" tabindex="0">Puerto Rico (+1787)</option>
                            <option value="+974" data-country-code="QA" tabindex="0">Qatar (+974)</option>
                            <option value="+262" data-country-code="RE" tabindex="0">Reunion (+262)</option>
                            <option value="+40" data-country-code="RO" tabindex="0">Romania (+40)</option>
                            <option value="+7" data-country-code="RU" tabindex="0">Russia (+7)</option>
                            <option value="+250" data-country-code="RW" tabindex="0">Rwanda (+250)</option>
                            <option value="+378" data-country-code="SM" tabindex="0">San Marino (+378)</option>
                            <option value="+239" data-country-code="ST" tabindex="0">Sao Tome &amp; Principe (+239)</option>
                            <option value="+966" data-country-code="SA" tabindex="0">Saudi Arabia (+966)</option>
                            <option value="+221" data-country-code="SN" tabindex="0">Senegal (+221)</option>
                            <option value="+381" data-country-code="CS" tabindex="0">Serbia (+381)</option>
                            <option value="+248" data-country-code="SC" tabindex="0">Seychelles (+248)</option>
                            <option value="+232" data-country-code="SL" tabindex="0">Sierra Leone (+232)</option>
                            <option value="+65" data-country-code="SG" tabindex="0">Singapore (+65)</option>
                            <option value="+421" data-country-code="SK" tabindex="0">Slovak Republic (+421)</option>
                            <option value="+386" data-country-code="SI" tabindex="0">Slovenia (+386)</option>
                            <option value="+677" data-country-code="SB" tabindex="0">Solomon Islands (+677)</option>
                            <option value="+252" data-country-code="SO" tabindex="0">Somalia (+252)</option>
                            <option value="+27" data-country-code="ZA" tabindex="0">South Africa (+27)</option>
                            <option value="+211" data-country-code="SS" tabindex="0">South Sudan (+211)</option>
                            <option value="+34" data-country-code="ES" tabindex="0">Spain (+34)</option>
                            <option value="+94" data-country-code="LK" tabindex="0">Sri Lanka (+94)</option>
                            <option value="+290" data-country-code="SH" tabindex="0">St. Helena (+290)</option>
                            <option value="+1869" data-country-code="KN" tabindex="0">St. Kitts (+1869)</option>
                            <option value="+1758" data-country-code="SC" tabindex="0">St. Lucia (+1758)</option>
                            <option value="+249" data-country-code="SD" tabindex="0">Sudan (+249)</option>
                            <option value="+597" data-country-code="SR" tabindex="0">Suriname (+597)</option>
                            <option value="+268" data-country-code="SZ" tabindex="0">Swaziland (+268)</option>
                            <option value="+46" data-country-code="SE" tabindex="0">Sweden (+46)</option>
                            <option value="+41" data-country-code="CH" tabindex="0">Switzerland (+41)</option>
                            <option value="+963" data-country-code="SI" tabindex="0">Syria (+963)</option>
                            <option value="+886" data-country-code="TW" tabindex="0">Taiwan (+886)</option>
                            <option value="+7" data-country-code="TJ" tabindex="0">Tajikstan (+7)</option>
                            <option value="+66" data-country-code="TH" tabindex="0">Thailand (+66)</option>
                            <option value="+228" data-country-code="TG" tabindex="0">Togo (+228)</option>
                            <option value="+676" data-country-code="TO" tabindex="0">Tonga (+676)</option>
                            <option value="+1868" data-country-code="TT" tabindex="0">Trinidad &amp; Tobago (+1868)</option>
                            <option value="+216" data-country-code="TN" tabindex="0">Tunisia (+216)</option>
                            <option value="+90" data-country-code="TR" tabindex="0">Turkey (+90)</option>
                            <option value="+7" data-country-code="TM" tabindex="0">Turkmenistan (+7)</option>
                            <option value="+993" data-country-code="TM" tabindex="0">Turkmenistan (+993)</option>
                            <option value="+1649" data-country-code="TC" tabindex="0">Turks &amp; Caicos Islands (+1649)</option>
                            <option value="+688" data-country-code="TV" tabindex="0">Tuvalu (+688)</option>
                            <option value="+256" data-country-code="UG" tabindex="0">Uganda (+256)</option>
                            <option value="+971" data-country-code="AE" tabindex="0">United Arab Emirates (+971)</option>
                            <option value="+44" data-country-code="GB" tabindex="0">United Kingdom (+44)</option>
                            <option value="+1" data-country-code="US" tabindex="0">United States of America (+1)</option>
                            <option value="+380" data-country-code="UA" tabindex="0">Ukraine (+380)</option>
                            <option value="+598" data-country-code="UY" tabindex="0">Uruguay (+598)</option>
                            <option value="+7" data-country-code="UZ" tabindex="0">Uzbekistan (+7)</option>
                            <option value="+678" data-country-code="VU" tabindex="0">Vanuatu (+678)</option>
                            <option value="+379" data-country-code="VA" tabindex="0">Vatican City (+379)</option>
                            <option value="+58" data-country-code="VE" tabindex="0">Venezuela (+58)</option>
                            <option value="+84" data-country-code="VN" tabindex="0">Vietnam (+84)</option>
                            <option value="+1284" data-country-code="VG" tabindex="0">Virgin Islands - British (+1284)</option>
                            <option value="+1340" data-country-code="VI" tabindex="0">Virgin Islands - US (+1340)</option>
                            <option value="+681" data-country-code="WF" tabindex="0">Wallis &amp; Futuna (+681)</option>
                            <option value="+969" data-country-code="YE" tabindex="0">Yemen (North)(+969)</option>
                            <option value="+967" data-country-code="YE" tabindex="0">Yemen (South)(+967)</option>
                            <option value="+260" data-country-code="ZM" tabindex="0">Zambia (+260)</option>
                            <option value="+263" data-country-code="ZW" tabindex="0">Zimbabwe (+263)</option>
                        </select>
                        <div class="invalid-feedback">Please choose your mobile code.</div>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="editPhoneNumber" class="form-label">Phone number</label>
                        <input type="text" class="form-control" id="editPhoneNumber" value="${user.phoneNumber}" placeholder="Phone number" required>
                        <div class="invalid-feedback">Please enter a valid phone number.</div>
                    </div>
                </div>
            </form>
        `;
    
        const confirmButton = document.getElementById('editUserConfirmButton');
        confirmButton.onclick = async () => {
            const editUserForm = document.getElementById('editUserForm');
            if (!validateEditUserForm(editUserForm)) {
                showToast('Please fix errors in the form.', 'warning');
                return;
            }
    
            const updatedUser = {
                email: document.getElementById('editEmail').value,
                username: document.getElementById('editUsername').value,
                firstName: document.getElementById('editFirstName').value,
                lastName: document.getElementById('editLastName').value,
                companyName: document.getElementById('editCompanyName').value,
                staffSize: document.getElementById('editStaffSize').value,
                mobileCode: document.getElementById('editMobileCode').value,
                phoneNumber: document.getElementById('editPhoneNumber').value,
                currentEmail: user.email
            };
    
            try {
                await editUser(updatedUser);
                showToast('User updated successfully!', 'success');
                const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
                bootstrapModal.hide();
    
                refreshUsersList();
            } catch (error) {
                showToast(`Error: ${error.error || error.message}`, 'danger');
            }
        };
    
        const modal = new bootstrap.Modal(modalElement, {});
        modal.show();
    }
    
    function validateEditUserForm(form) {
        const fields = form.querySelectorAll('.form-control');
        let isFormValid = true;
    
        fields.forEach(field => {
            if (!field.value.trim()) {
                isFormValid = false;
                field.classList.add('is-invalid');
            } else {
                field.classList.remove('is-invalid');
            }
        });
    
        return isFormValid;
    }    

    async function refreshUsersList() {
        usersList = await getUsersListForAdmin();
        usersListTableBody.innerHTML = '';

        $('#usersListTable').DataTable().clear();

        usersList.forEach((userList, index) => {
            const username = userList.username || '';
            const firstName = userList.firstName || '';
            const lastName = userList.lastName || '';
            const companyName = userList.companyName || '';
            const staffSize = userList.staffSize || '';
            const email = userList.email || '';
            const mobileCode = userList.mobileCode || '';
            const phoneNumber = userList.phoneNumber || '';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="radio" class="user-radio" data-username="${username}" name="userSelection"></td> <!-- تغییر به رادیو -->
                <th scope="row">${index + 1}</th>
                <td>${username}</td>
                <td>${firstName}</td>
                <td>${lastName}</td>
                <td>${companyName}</td>
                <td>${staffSize}</td>
                <td>${email}</td>
                <td>${mobileCode}</td>
                <td>${phoneNumber}</td>
            `;

            usersListTableBody.appendChild(row);
        });

        $('#usersListTable').DataTable().rows.add(usersList).draw();
    }

    showOverlay();

    try {
        usersList = await getUsersListForAdmin();

        usersListTableBody.innerHTML = '';

        usersList.forEach((userList, index) => {
            const username = userList.username || '';
            const firstName = userList.firstName || '';
            const lastName = userList.lastName || '';
            const companyName = userList.companyName || '';
            const staffSize = userList.staffSize || '';
            const email = userList.email || '';
            const mobileCode = userList.mobileCode || '';
            const phoneNumber = userList.phoneNumber || '';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="radio" class="user-radio" data-username="${username}" name="userSelection"></td> <!-- تغییر به رادیو -->
                <th scope="row">${index + 1}</th>
                <td>${username}</td>
                <td>${firstName}</td>
                <td>${lastName}</td>
                <td>${companyName}</td>
                <td>${staffSize}</td>
                <td>${email}</td>
                <td>${mobileCode}</td>
                <td>${phoneNumber}</td>
            `;

            usersListTableBody.appendChild(row);
        });

        $('#usersListTable').DataTable({
            language: {
                search: 'Search:',
                infoEmpty: 'Showing 0 to 0 of 0 entries',
                lengthMenu: 'Show _MENU_',
                emptyTable: 'No data available in table',
                zeroRecords: 'No matching records found',
                infoFiltered: '(filtered from max total entries)'
            },
            pagingType: 'numbers',
            pageLength: 10,
            lengthMenu: [
                [5, 10, 20, -1],
                [5, 10, 20, 'All']
            ],
            order: [],
            columnDefs: [
                { orderable: false, targets: [0, 1, 6, 7, 8, 9] },
                { orderable: true, targets: [2, 3, 4, 5] }
            ],
            columns: [
                {
                    data: null,
                    orderable: false,
                    className: 'select-radio',
                    render: function (data, type, row) {
                        return `<input type="radio" class="user-radio" data-username="${row.username}" name="userSelection">`; // تغییر به رادیو
                    }
                },
                {
                    data: null,
                    orderable: false,
                    searchable: false,
                    render: function (data, type, row, meta) {
                        return meta.row + meta.settings._iDisplayStart + 1;
                    }
                },
                { data: 'username' },
                { data: 'firstName' },
                { data: 'lastName' },
                { data: 'companyName' },
                { data: 'staffSize' },
                { data: 'email' },
                { data: 'mobileCode' },
                { data: 'phoneNumber' }
            ]
        });

        $('<button>')
            .text('Delete')
            .attr('id', 'deleteButton')
            .addClass('btn btn-danger ml-2')
            .on('click', handleDeleteUsers)
            .appendTo('#usersListTable_wrapper .dataTables_length');

        $('<button>')
            .text('Edit')
            .attr('id', 'editUserButton')
            .addClass('btn btn-primary ml-2')
            .on('click', handleEditUser)
            .appendTo('#usersListTable_wrapper .dataTables_length');

        $('<button>')
            .text('Add user')
            .attr('id', 'addUserButton')
            .addClass('btn btn-success ml-2')
            .on('click', handleAddUser)
            .appendTo('#usersListTable_wrapper .dataTables_length');

        hideOverlay();
    } catch (error) {
        showToast('Error loading Users List: ' + error.message, 'danger');
        hideOverlay();
    }

    const draggables = document.querySelectorAll('.draggable');

    draggables.forEach((container) => {
    let isDown = false;       
    let startX;               
    let startY;               
    let scrollLeft;           
    let scrollTop;            

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('active'); 
        startX = e.pageX - container.offsetLeft;
        startY = e.pageY - container.offsetTop;
        scrollLeft = container.scrollLeft;
        scrollTop = container.scrollTop;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('mousemove', (e) => {
        if(!isDown) return; 
        e.preventDefault();

        const x = e.pageX - container.offsetLeft;
        const y = e.pageY - container.offsetTop;

        const walkX = (x - startX); 
        const walkY = (y - startY);

        container.scrollLeft = scrollLeft - walkX;
        container.scrollTop = scrollTop - walkY;
    });
    });
}

//Get Users List

//Get Roles List

async function initializeRolesListPage() {
    const rolesListTableBody = document.getElementById('rolesListTableBody');
    const overlay = document.getElementById('Overlay');

    let dataTableInstance = null;

    if (!overlay || !rolesListTableBody) {
        showRoleToast('Required elements are missing from the DOM.', 'danger');
        return;
    }

    const showOverlay = () => (overlay.style.display = 'flex');
    const hideOverlay = () => (overlay.style.display = 'none');

    function showRoleToast(message, type = 'info') {
        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        const toastContainer = document.getElementById('toastContainerRole');
        if (!toastContainer) {
            console.error('Toast container not found in DOM!');
            return;
        }

        toastContainer.insertAdjacentHTML('beforeend', toastHTML);

        setTimeout(() => {
            const toastElement = document.getElementById(toastId);
            if (toastElement) {
                toastElement.remove();
            }
        }, 5000);
    }

    async function loadRolesList() {
        showOverlay();

        try {
            const rolesList = await getRolesListForAdmin();

            if (!dataTableInstance) {
                dataTableInstance = $('#rolesListTable').DataTable({
                    data: [],
                    columns: [
                        { title: '', orderable: false },
                        { title: 'No', orderable: false },
                        { title: 'Role Name' },
                    ],
                    language: {
                        search: 'Search:',
                        infoEmpty: 'Showing 0 to 0 of 0 entries',
                        lengthMenu: 'Show _MENU_',
                        emptyTable: 'No data available in table',
                        zeroRecords: 'No matching records found',
                        infoFiltered: '(filtered from max total entries)',
                    },
                    pagingType: 'numbers',
                    pageLength: 10,
                    lengthMenu: [
                        [5, 10, 20, -1],
                        [5, 10, 20, 'All'],
                    ],
                    order: [],
                });
            } else {
                dataTableInstance.clear();
            }

            const tableData = rolesList.map((roleList, index) => {
                const roleName = roleList.roleName || '';
                return [
                    `<input type="radio" class="role-radio" data-role-name="${roleName}" name="editRoleSelection">`, // تغییر چک‌باکس به رادیو
                    index + 1,
                    roleName,
                ];
            });

            dataTableInstance.rows.add(tableData).draw();

            const tableControls = document.querySelector('#rolesListTable_wrapper .dataTables_length');
            if (tableControls && !document.getElementById('deleteButton')) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('btn', 'btn-danger', 'ml-2');
                deleteButton.id = 'deleteButton';

                deleteButton.addEventListener('click', handleDeleteRoles);

                const addRoleButton = document.createElement('button');
                addRoleButton.textContent = 'Add Role';
                addRoleButton.classList.add('btn', 'btn-success', 'ml-2');
                addRoleButton.id = 'addRoleButton';

                addRoleButton.addEventListener('click', showAddRoleModal);

                tableControls.appendChild(deleteButton);
                tableControls.appendChild(addRoleButton);
            }

            hideOverlay();
        } catch (error) {
            showRoleToast('Error loading roles list: ' + error.message, 'danger');
            hideOverlay();
        }
    }

    async function showAddRoleModal() {
        const modalElement = document.getElementById('addRoleModal');
        const roleNameInput = document.getElementById('addRoleNameInput');
        const confirmButton = document.getElementById('addRoleConfirmButton');

        confirmButton.onclick = async () => {
            const roleName = roleNameInput.value.trim();

            if (!roleName) {
                showRoleToast('Role name cannot be empty.', 'warning');
                return;
            }

            try {
                await addRole(roleName);
                showRoleToast('Role successfully added.', 'success');
                roleNameInput.value = '';
                const bootstrapModal = bootstrap.Modal.getOrCreateInstance(modalElement);
                bootstrapModal.hide();
                await loadRolesList();
            } catch (error) {
                showRoleToast(`Error adding role: ${error.message}`, 'danger');
            }
        };

        const modal = new bootstrap.Modal(modalElement, {});
        modal.show();
    }

    async function handleDeleteRoles() {
        const selectedRadioBtn = document.querySelector('.role-radio:checked');
        if (!selectedRadioBtn) {
            showRoleToast('You must select a role to delete.', 'warning');
            return;
        }

        const roleName = selectedRadioBtn.dataset.roleName;

        showRoleConfirmationModal([roleName], async () => {
            try {
                const response = await deleteRoles([roleName]);

                const { deletedRoles, undeletableRoles } = response;

                if (deletedRoles?.length > 0) {
                    showRoleToast(`${deletedRoles.length} role were successfully deleted.`, 'success');
                    await loadRolesList();
                }

                if (undeletableRoles?.length > 0) {
                    const message = `
                        The selected role cannot be deleted as it is associated with users.
                    `;
                    showRoleToast(message, 'danger');
                }
            } catch (error) {
                showRoleToast(`Error: ${error.message}`, 'danger');
            } finally {
                selectedRadioBtn.checked = false;
            }
        });

        function showRoleConfirmationModal(roleNames, onConfirm) {
            const modalElement = document.getElementById('rolesConfirmationModal');
            const modalBody = document.getElementById('rolesConfirmationModalBody');
            const confirmButton = document.getElementById('rolesConfirmDeleteButton');

            modalBody.innerHTML = `
                Are you sure you want to delete the following roles?
                <br>${roleNames.join(', ')}
            `;

            confirmButton.onclick = async () => {
                try {
                    const bootstrapModal = bootstrap.Modal.getOrCreateInstance(modalElement);
                    bootstrapModal.hide();
                    await onConfirm();
                } catch (err) {
                    showRoleToast(`Error confirming delete: ${err.message}`, 'danger');
                }
            };

            const modal = new bootstrap.Modal(modalElement, {});
            modal.show();
        }
    }

    const draggables = document.querySelectorAll('.draggable');

    draggables.forEach((container) => {
    let isDown = false;       
    let startX;               
    let startY;               
    let scrollLeft;           
    let scrollTop;            

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('active'); 
        startX = e.pageX - container.offsetLeft;
        startY = e.pageY - container.offsetTop;
        scrollLeft = container.scrollLeft;
        scrollTop = container.scrollTop;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('mousemove', (e) => {
        if(!isDown) return; 
        e.preventDefault();

        const x = e.pageX - container.offsetLeft;
        const y = e.pageY - container.offsetTop;

        const walkX = (x - startX); 
        const walkY = (y - startY);

        container.scrollLeft = scrollLeft - walkX;
        container.scrollTop = scrollTop - walkY;
    });
    });

    await loadRolesList();
}

//Get Roles List

//Get User Role List

async function initializeUserRoleListPage() {
    const userRoleListTableBody = document.getElementById('userRoleListTableBody');
    const toastContainer = document.getElementById('toastContainerUserRole');
    const overlay = document.getElementById('Overlay');

    let dataTableInstance = null; 

    if (!overlay || !userRoleListTableBody || !toastContainer) {
        showUserRoleToast('Required elements are missing from the DOM.', 'danger');
        return;
    }

    const showOverlay = () => (overlay.style.display = 'flex');
    const hideOverlay = () => (overlay.style.display = 'none');

    function showUserRoleToast(message, type = 'info') {
        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        if (!toastContainer) {
            console.error('Toast container not found in DOM!');
            return;
        }

        toastContainer.insertAdjacentHTML('beforeend', toastHTML);

        setTimeout(() => {
            const toastElement = document.getElementById(toastId);
            if (toastElement) {
                toastElement.remove();
            }
        }, 5000);
    }

    async function loadUserRoles() {
        showOverlay();

        try {
            const userRoleList = await getUserRoleListForAdmin(); 

            if (!dataTableInstance) {
                dataTableInstance = $('#userRoleListTable').DataTable({
                    data: [], 
                    columns: [
                        { title: '', orderable: false },
                        { title: 'No', orderable: false },
                        { title: 'Username' },
                        { title: 'First Name' },
                        { title: 'Last Name' },
                        { title: 'Role Name' },
                    ],
                    language: {
                        search: 'Search:',
                        infoEmpty: 'Showing 0 to 0 of 0 entries',
                        lengthMenu: 'Show _MENU_',
                        emptyTable: 'No data available in table',
                        zeroRecords: 'No matching records found',
                        infoFiltered: '(filtered from max total entries)',
                    },
                    pagingType: 'numbers',
                    pageLength: 10,
                    lengthMenu: [
                        [5, 10, 20, -1],
                        [5, 10, 20, 'All'],
                    ],
                    order: [],
                });
            } else {
                dataTableInstance.clear();
            }

            const tableData = userRoleList.map((userRole, index) => {
                const username = userRole.username || '';
                const firstName = userRole.firstName || '';
                const lastName = userRole.lastName || '';
                const roleName = userRole.roleName || '';

                return [
                    `<input type="radio" class="user-role-radio" data-username="${username}" data-role-name="${roleName}" name="editRoleSelection">`,
                    index + 1,
                    username,
                    firstName,
                    lastName,
                    roleName,
                ];
            });

            dataTableInstance.rows.add(tableData).draw();

            const tableControls = document.querySelector('#userRoleListTable_wrapper .dataTables_length');
            if (tableControls && !document.getElementById('editButton')) {
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.classList.add('btn', 'btn-primary', 'ml-2');
                editButton.id = 'editButton';

                editButton.addEventListener('click', handleEditUserRole);

                tableControls.appendChild(editButton);
            }

            hideOverlay(); 
        } catch (error) {
            showUserRoleToast('Error loading user roles: ' + error.message, 'danger');
            hideOverlay();
        }
    }

    async function handleEditUserRole() {
        const selectedRadio = document.querySelector('.user-role-radio:checked');

        if (!selectedRadio) {
            showUserRoleToast('Please select a user to edit their role.', 'warning');
            return;
        }

        const username = selectedRadio.dataset.username;
        const roleName = selectedRadio.dataset.roleName; 

        const roleDropdown = document.getElementById('roleDropdown');
        const modalUsername = document.getElementById('editUserRoleModalUsername');
        const confirmButton = document.getElementById('editUserRoleConfirmButton');

        showOverlay();

        try {
            const rolesList = await getUserRolesListForDropdown();

            roleDropdown.innerHTML = '';

            rolesList.forEach((role) => {
                const option = document.createElement('option');
                option.value = role.roleName;
                option.textContent = role.roleName;

                if (role.roleName === roleName) {
                    option.selected = true;
                }

                roleDropdown.appendChild(option);
            });

            modalUsername.textContent = username;

            confirmButton.onclick = async () => {
                const selectedRole = roleDropdown.value;

                try {
                    const response = await updateUserRole(username, selectedRole);

                    showUserRoleToast(response.message, 'success');
                    $('#editUserRoleModal').modal('hide');
                    await loadUserRoles(); 
                } catch (error) {
                    showUserRoleToast(`Error updating role: ${error.message}`, 'danger');
                }
            };

            const modal = new bootstrap.Modal(document.getElementById('editUserRoleModal'), {});
            modal.show();
        } catch (error) {
            showUserRoleToast(`Error fetching roles: ${error.message}`, 'danger');
        } finally {
            hideOverlay();
        }
    }

    const draggables = document.querySelectorAll('.draggable');

    draggables.forEach((container) => {
    let isDown = false;       
    let startX;               
    let startY;               
    let scrollLeft;           
    let scrollTop;            

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('active'); 
        startX = e.pageX - container.offsetLeft;
        startY = e.pageY - container.offsetTop;
        scrollLeft = container.scrollLeft;
        scrollTop = container.scrollTop;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('mousemove', (e) => {
        if(!isDown) return; 
        e.preventDefault();

        const x = e.pageX - container.offsetLeft;
        const y = e.pageY - container.offsetTop;

        const walkX = (x - startX); 
        const walkY = (y - startY);

        container.scrollLeft = scrollLeft - walkX;
        container.scrollTop = scrollTop - walkY;
    });
    });

    await loadUserRoles(); 
}

//Get User Role List

//Get User Orders List

async function initializeUserOrdersListPage() {
    const userOrdersTableBody = document.getElementById('userOrdersTableBody');
    const toastContainer = document.getElementById('toastContainerUserOrders');
    const overlay = document.getElementById('Overlay');
    const confirmButton = document.getElementById('editUserOrdersConfirmButton');
    const addConfirmButton = document.getElementById('addUserOrdersConfirmButton');

    if (!userOrdersTableBody || !toastContainer || !overlay || !confirmButton || !addConfirmButton) {
        document.addEventListener('DOMContentLoaded', () => {
            initializeUserOrdersListPage();
        });
        return;
    }

    let dataTableInstance = null;

    function initializeModernDatePicker(element) {
        if (!element) {
            console.error('Datepicker element not found.');
            return;
        }
        element.value = "";
        return flatpickr(element, {
            enableTime: false,
            dateFormat: "Y-m-d"
        });
    }

    function initializeSelect2ForDropdown(element) {
        if (!element) {
            console.error('Dropdown element for Select2 not found.');
            return;
        }
        const placeholderText = element.dataset.placeholder || 'Select an option';
        const parentModal = $(element).closest('.modal');
        $(element)
            .select2({
                placeholder: placeholderText,
                allowClear: true,
                width: '100%',
                minimumResultsForSearch: 0,
                dropdownParent: parentModal.length ? parentModal : $(element).parent()
            })
            .on('select2:open', function () {
                const modal = $(this).closest('.modal');
                if (modal && modal.length > 0) {
                    modal.css('overflow', 'hidden');
                }
            });
    }

    const showOverlay = () => (overlay.style.display = 'block');
    const hideOverlay = () => (overlay.style.display = 'none');

    function showUserOrdersToast(message, type = 'info') {
        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0 show" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        setTimeout(() => {
            const toastElement = document.getElementById(toastId);
            if (toastElement) {
                toastElement.remove();
            }
        }, 5000);
    }

    function clearErrorMessage(element) {
        element.classList.remove('is-invalid');
        if (element.nextElementSibling && element.nextElementSibling.classList.contains('error-message')) {
            element.nextElementSibling.remove();
        }
    }

    function markFieldInvalid(field) {
        field.classList.add('is-invalid');
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.style.color = 'red';
        errorMessage.style.fontSize = '0.85rem';
        errorMessage.textContent = 'This field is required';
        field.parentNode.insertBefore(errorMessage, field.nextSibling);
    }

    function addClearOnInput(element) {
        if (!element) return;
        if (element.tagName.toLowerCase() === 'select') {
            if (!element.dataset.hasValidationHandler) {
                element.addEventListener('change', function () {
                    clearErrorMessage(this);
                });
                element.dataset.hasValidationHandler = "true";
            }
        } else {
            if (!element.dataset.hasValidationHandler) {
                element.addEventListener('input', function () {
                    clearErrorMessage(this);
                });
                element.dataset.hasValidationHandler = "true";
            }
        }
    }

    function clearAllValidationErrors(container) {
        const invalidFields = container.querySelectorAll('.is-invalid');
        invalidFields.forEach(field => clearErrorMessage(field));
    }

    function validateAddUserOrderForm() {
        let isValid = true;
        const userDropdown = document.getElementById('chooseUserDropdownAdd');
        const productDropdown = document.getElementById('productsDropdownAdd');
        const requestedDateInput = document.getElementById('requestedDatePickerAdd');
        const startDateInput = document.getElementById('startDatePickerAdd');
        const endDateInput = document.getElementById('endDatePickerAdd');
        const usernameInput = document.getElementById('usernameProductInputAdd');
        const passwordInput = document.getElementById('passwordProductInputAdd');

        [userDropdown, productDropdown, requestedDateInput, startDateInput, endDateInput, usernameInput, passwordInput].forEach(el => {
            if (el) clearErrorMessage(el);
        });
        if (!userDropdown.value) {
            markFieldInvalid(userDropdown);
            isValid = false;
        }
        if (!productDropdown.value) {
            markFieldInvalid(productDropdown);
            isValid = false;
        }
        if (!requestedDateInput.value) {
            markFieldInvalid(requestedDateInput);
            isValid = false;
        }
        if (!startDateInput.value) {
            markFieldInvalid(startDateInput);
            isValid = false;
        }
        if (!endDateInput.value) {
            markFieldInvalid(endDateInput);
            isValid = false;
        }
        if (!usernameInput.value) {
            markFieldInvalid(usernameInput);
            isValid = false;
        }
        if (!passwordInput.value) {
            markFieldInvalid(passwordInput);
            isValid = false;
        }
        return isValid;
    }

    function validateEditUserOrderForm() {
        let isValid = true;
        const productDropdown = document.getElementById('productsDropdown');
        const startDateInput = document.getElementById('startDatePicker');
        const endDateInput = document.getElementById('endDatePicker');
        const usernameInput = document.getElementById('usernameProductInput');
        const passwordInput = document.getElementById('passwordProductInput');

        [productDropdown, startDateInput, endDateInput, usernameInput, passwordInput].forEach(el => {
            if (el) clearErrorMessage(el);
        });
        if (!productDropdown.value) {
            markFieldInvalid(productDropdown);
            isValid = false;
        }
        if (!startDateInput.value) {
            markFieldInvalid(startDateInput);
            isValid = false;
        }
        if (!endDateInput.value) {
            markFieldInvalid(endDateInput);
            isValid = false;
        }
        if (!usernameInput.value.trim()) {
            markFieldInvalid(usernameInput);
            isValid = false;
        }
        if (!passwordInput.value.trim()) {
            markFieldInvalid(passwordInput);
            isValid = false;
        }
        return isValid;
    }

    function initializeStatusFilter() {
        const filterContainer = document.querySelector('#userOrdersTable_wrapper .dataTables_filter');
        if (!filterContainer) return;
        let statusFilterWrapper = document.getElementById('statusFilterWrapper');
        if (!statusFilterWrapper) {
            statusFilterWrapper = document.createElement('div');
            statusFilterWrapper.id = 'statusFilterWrapper';
            statusFilterWrapper.style.display = 'inline-flex';
            statusFilterWrapper.style.alignItems = 'baseline';
            statusFilterWrapper.style.marginLeft = '20px';
            const label = document.createElement('label');
            label.setAttribute('for', 'filterStatus');
            label.textContent = 'Order Status: ';
            label.style.marginRight = '5px';
            label.style.width = '180px';
            statusFilterWrapper.appendChild(label);
            const select = document.createElement('select');
            select.id = 'filterStatus';
            select.className = 'form-control form-control-sm';
            select.innerHTML = `
                <option value="">All</option>
                <option value="Request">Request</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Active - Last Day">Active - Last Day</option>
            `;
            statusFilterWrapper.appendChild(select);
            filterContainer.appendChild(statusFilterWrapper);
            select.addEventListener('change', function () {
                dataTableInstance.draw();
            });
        }
    }

    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        const statusFilterElem = document.getElementById('filterStatus');
        const filterStatus = statusFilterElem ? statusFilterElem.value : "";
        const status = data[11] || "";
        if (filterStatus && status !== filterStatus) {
            return false;
        }
        return true;
    });

    function addEditAddButtons() {
        const tableControls = document.querySelector('#userOrdersTable_wrapper .dataTables_length');
        if (tableControls) {
            let editButton = document.getElementById('editButton');
            if (!editButton) {
                editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.classList.add('btn', 'btn-primary', 'ml-2');
                editButton.id = 'editButton';
                tableControls.appendChild(editButton);
                editButton.addEventListener('click', handleEditUserOrder);
            }
            let addButton = document.getElementById('addButton');
            if (!addButton) {
                addButton = document.createElement('button');
                addButton.textContent = 'Add order';
                addButton.classList.add('btn', 'btn-success', 'ml-2');
                addButton.id = 'addButton';
                tableControls.appendChild(addButton);
                addButton.addEventListener('click', handleAddUserOrder);
            }
        }
    }

    async function loadUserOrders() {
        showOverlay();
        try {
            const userOrdersList = await getUserOrdersListForAdmin(); 

            if (!dataTableInstance) {
                dataTableInstance = $('#userOrdersTable').DataTable({
                    data: [],
                    columns: [
                        { title: '', orderable: false },
                        { title: 'No', orderable: false },
                        { title: 'Username' },
                        { title: 'First Name' },
                        { title: 'Last Name' },
                        { title: 'Product Name' },
                        { title: 'Requested Date' },
                        { title: 'Start Date' },
                        { title: 'End Date' },
                        { title: 'Product Username' },
                        { title: 'Product Password' },
                        { title: 'Status' }
                    ],
                    language: {
                        search: 'Search:',
                        infoEmpty: 'Showing 0 to 0 of 0 entries',
                        lengthMenu: 'Show _MENU_',
                        emptyTable: 'No data available in table',
                        zeroRecords: 'No matching records found',
                        infoFiltered: '(filtered from max total entries)',
                    },
                    pagingType: 'numbers',
                    pageLength: 10,
                    lengthMenu: [
                        [5, 10, 20, -1],
                        [5, 10, 20, 'All']
                    ],
                    order: [],
                    drawCallback: function(settings) {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        $('#userOrdersTable tbody tr').each(function () {
                            const startDateText = $(this).find('td:nth-child(8)').text().trim();
                            const endDateText = $(this).find('td:nth-child(9)').text().trim();
                            const startDateVal = startDateText ? new Date(startDateText) : null;
                            const endDateVal = endDateText ? new Date(endDateText) : null;
                            $(this).removeClass('table-success table-danger table-warning');
                            if (startDateVal && endDateVal) {
                                endDateVal.setHours(0, 0, 0, 0);
                                if (endDateVal > today) {
                                    $(this).addClass('table-success');
                                } else if (endDateVal < today) {
                                    $(this).addClass('table-danger');
                                } else {
                                    $(this).addClass('table-warning');
                                }
                            }
                        });
                    }
                });
                initializeStatusFilter();
                addEditAddButtons();
            } else {
                dataTableInstance.clear();
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tableData = userOrdersList.map((userOrder, index) => {
                const username         = userOrder.username || '';
                const firstName        = userOrder.firstName || '';
                const lastName         = userOrder.lastName || '';
                const productName      = userOrder.productName || '';
                const requestDate      = userOrder.requestDate ? userOrder.requestDate.split('T')[0] : '';
                const startDate        = userOrder.startDate ? userOrder.startDate.split('T')[0] : '';
                const endDate          = userOrder.endDate ? userOrder.endDate.split('T')[0] : '';
                const usernameProduct  = userOrder.usernameProduct || '';
                const passwordProduct  = userOrder.passwordProduct || '';
                const userProductID    = userOrder.userProductID || '';

                let status = '';
                if (!startDate && !endDate) {
                    status = 'Request';
                } else if (endDate) {
                    const endDateObj = new Date(endDate);
                    endDateObj.setHours(0, 0, 0, 0);
                    if (endDateObj > today) {
                        status = 'Active';
                    } else if (endDateObj < today) {
                        status = 'Expired';
                    } else {
                        status = 'Active - Last Day';
                    }
                }

                return [
                    `<input type="radio" class="user-order-radio" 
                        data-user-product-id="${userProductID}" 
                        data-username="${username}" 
                        data-product-name="${productName}" 
                        data-first-name="${firstName}" 
                        data-last-name="${lastName}" 
                        data-request-date="${requestDate}" 
                        data-start-date="${startDate}" 
                        data-end-date="${endDate}" 
                        data-username-product="${usernameProduct}" 
                        data-password-product="${passwordProduct}" 
                        name="editOrderSelection">`,
                    index + 1,
                    username,
                    firstName,
                    lastName,
                    productName,
                    requestDate,
                    startDate,
                    endDate,
                    usernameProduct,
                    passwordProduct,
                    status
                ];
            });

            dataTableInstance.rows.add(tableData).draw();

            const userDropdownAdd = document.getElementById('chooseUserDropdownAdd');
            if (userDropdownAdd) {
                userDropdownAdd.setAttribute('data-placeholder', 'Select a user');
                userDropdownAdd.innerHTML = '<option value="" selected>Select a user</option>';
                const usersList = await getUsersList();
                usersList.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.username;
                    option.textContent = `${user.username} - ${user.firstName} ${user.lastName}`;
                    userDropdownAdd.appendChild(option);
                });
                initializeSelect2ForDropdown(userDropdownAdd);
            }

            hideOverlay();
        } catch (error) {
            console.error('Error loading user orders:', error);
            showUserOrdersToast('Error loading user orders: ' + error.message, 'danger');
            hideOverlay();
        }
    }

    async function handleEditUserOrder() {
        const selectedRadio = document.querySelector('.user-order-radio:checked');
        if (!selectedRadio) {
            showUserOrdersToast('Please select an order to edit.', 'warning');
            return;
        }
        const userProductID = selectedRadio.dataset.userProductId;
        const username = selectedRadio.dataset.username;
        const productName = selectedRadio.dataset.productName;
        const startDate = selectedRadio.dataset.startDate;
        const endDate = selectedRadio.dataset.endDate;
        const usernameProduct = selectedRadio.dataset.usernameProduct;
        const passwordProduct = selectedRadio.dataset.passwordProduct;

        const productsDropdown = document.getElementById('productsDropdown');
        const modalUsername = document.getElementById('editUserOrdersModalUsername');
        const startDatePicker = document.getElementById('startDatePicker');
        const endDatePicker = document.getElementById('endDatePicker');
        const usernameProductInput = document.getElementById('usernameProductInput');
        const passwordProductInput = document.getElementById('passwordProductInput');

        const editModal = document.getElementById('editUserOrdersModal');
        if (editModal) {
            clearAllValidationErrors(editModal);
        }
        [productsDropdown, startDatePicker, endDatePicker, usernameProductInput, passwordProductInput].forEach(addClearOnInput);

        const startDateInstance = initializeModernDatePicker(startDatePicker);
        const endDateInstance = initializeModernDatePicker(endDatePicker);

        const productsList = await getProductsListForDropdown();
        productsDropdown.innerHTML = '<option value="" disabled selected>Select a product</option>';
        productsList.forEach((product) => {
            const option = document.createElement('option');
            option.value = product.productName;
            option.textContent = product.productName;
            if (product.productName.trim().toLowerCase() === productName.trim().toLowerCase()) {
                option.setAttribute('selected', 'selected');
            }
            productsDropdown.appendChild(option);
        });
        productsDropdown.setAttribute('data-placeholder', 'Select an option');
        initializeSelect2ForDropdown(productsDropdown);

        modalUsername.textContent = username;
        if (startDateInstance) startDateInstance.setDate(startDate || "");
        if (endDateInstance) endDateInstance.setDate(endDate || "");
        usernameProductInput.value = usernameProduct;
        passwordProductInput.value = passwordProduct;
        new bootstrap.Modal(editModal).show();
    }

    async function handleConfirmEditUserOrder() {
        if (!validateEditUserOrderForm()) {
            return;
        }
        const selectedRadio = document.querySelector('.user-order-radio:checked');
        if (!selectedRadio) {
            showUserOrdersToast('Please select an order to update.', 'warning');
            return;
        }
        const userProductID = selectedRadio.dataset.userProductId;
        const username = selectedRadio.dataset.username;
        const productName = document.getElementById('productsDropdown').value;
        const startDate = document.getElementById('startDatePicker').value;
        const endDate = document.getElementById('endDatePicker').value;
        const usernameProduct = document.getElementById('usernameProductInput').value;
        const passwordProduct = document.getElementById('passwordProductInput').value;

        if (!userProductID || !username || !productName || !startDate || !endDate || !usernameProduct || !passwordProduct) {
            showUserOrdersToast('All fields are required.', 'danger');
            return;
        }
        showOverlay();
        try {
            const response = await updateUserOrders({
                userProductID,
                username,
                productName,
                startDate,
                endDate,
                usernameProduct,
                passwordProduct
            });
            if (!response.success) {
                throw new Error(response.message || 'Failed to update user order.');
            }
            showUserOrdersToast('Order updated successfully!', 'success');
            $('#editUserOrdersModal').modal('hide');
            await loadUserOrders();
        } catch (error) {
            showUserOrdersToast('Failed to update order: ' + error.message, 'danger');
        } finally {
            hideOverlay();
        }
    }

    async function handleAddUserOrder() {
        const modalElement = document.getElementById('addUserOrdersModal');
        if (!modalElement) {
            console.error('Add User Orders Modal not found.');
            return;
        }
        const modalAdd = new bootstrap.Modal(modalElement);
        const userDropdown = document.getElementById('chooseUserDropdownAdd');
        const productDropdown = document.getElementById('productsDropdownAdd');

        userDropdown.innerHTML = '';
        productDropdown.innerHTML = '';

        try {
            const usersList = await getUsersList();
            userDropdown.setAttribute('data-placeholder', 'Select a user');
            userDropdown.innerHTML = '<option value="" disabled selected>Select a user</option>';
            usersList.forEach(user => {
                const option = document.createElement('option');
                option.value = user.username;
                option.textContent = `${user.username} - ${user.firstName} ${user.lastName}`;
                userDropdown.appendChild(option);
            });
            initializeSelect2ForDropdown(userDropdown);

            const productsList = await getProductsListForDropdown();
            productDropdown.setAttribute('data-placeholder', 'Select a product');
            productDropdown.innerHTML = '<option value="" disabled selected>Select a product</option>';
            productsList.forEach(product => {
                const option = document.createElement('option');
                option.value = product.productName;
                option.textContent = product.productName;
                productDropdown.appendChild(option);
            });
            initializeSelect2ForDropdown(productDropdown);

            const requestedDateInput = document.getElementById('requestedDatePickerAdd');
            const startDateInputAdd = document.getElementById('startDatePickerAdd');
            const endDateInputAdd = document.getElementById('endDatePickerAdd');
            const usernameProductInputAdd = document.getElementById('usernameProductInputAdd');
            const passwordProductInputAdd = document.getElementById('passwordProductInputAdd');

            if (requestedDateInput) requestedDateInput.value = "";
            if (startDateInputAdd) startDateInputAdd.value = "";
            if (endDateInputAdd) endDateInputAdd.value = "";
            if (usernameProductInputAdd) usernameProductInputAdd.value = "";
            if (passwordProductInputAdd) passwordProductInputAdd.value = "";

            initializeModernDatePicker(requestedDateInput);
            initializeModernDatePicker(startDateInputAdd);
            initializeModernDatePicker(endDateInputAdd);

            clearAllValidationErrors(modalElement);

            [userDropdown, productDropdown, requestedDateInput, startDateInputAdd, endDateInputAdd, usernameProductInputAdd, passwordProductInputAdd].forEach(addClearOnInput);

            modalAdd.show();
        } catch (error) {
            console.error('Error loading data for Add modal:', error.message);
        }
    }

    async function handleConfirmAddUserOrder() {
        if (!validateAddUserOrderForm()) {
            return;
        }
        const userDropdown = document.getElementById('chooseUserDropdownAdd');
        const productDropdown = document.getElementById('productsDropdownAdd');
        const requestedDate = document.getElementById('requestedDatePickerAdd').value;
        const startDate = document.getElementById('startDatePickerAdd').value;
        const endDate = document.getElementById('endDatePickerAdd').value;
        const usernameProduct = document.getElementById('usernameProductInputAdd').value;
        const passwordProduct = document.getElementById('passwordProductInputAdd').value;

        if (!userDropdown || !productDropdown || !requestedDate || !startDate || !endDate || !usernameProduct || !passwordProduct) {
            showUserOrdersToast('Please fill all required fields for adding a new order.', 'danger');
            return;
        }
        const username = userDropdown.value;
        const productName = productDropdown.value;
        if (!username || !productName) {
            showUserOrdersToast('User and product must be selected.', 'danger');
            return;
        }
        showOverlay();
        try {
            const response = await addUserOrder({
                username,
                productName,
                requestedDate,
                startDate,
                endDate,
                usernameProduct,
                passwordProduct
            });
            if (!response.success) {
                throw new Error(response.message || 'Failed to add user order.');
            }
            showUserOrdersToast('Order added successfully!', 'success');
            $('#addUserOrdersModal').modal('hide');
            await loadUserOrders();
        } catch (error) {
            showUserOrdersToast('Failed to add order: ' + error.message, 'danger');
        } finally {
            hideOverlay();
        }
    }

    const editModalEl = document.getElementById('editUserOrdersModal');
    if (editModalEl) {
        editModalEl.addEventListener('hidden.bs.modal', function () {
            clearAllValidationErrors(editModalEl);
        });
    }
    const addModalEl = document.getElementById('addUserOrdersModal');
    if (addModalEl) {
        addModalEl.addEventListener('hidden.bs.modal', function () {
            clearAllValidationErrors(addModalEl);
        });
    }

    confirmButton.addEventListener('click', handleConfirmEditUserOrder);
    addConfirmButton.addEventListener('click', handleConfirmAddUserOrder);

    const draggables = document.querySelectorAll('.draggable');

    draggables.forEach((container) => {
    let isDown = false;       
    let startX;               
    let startY;               
    let scrollLeft;           
    let scrollTop;            

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('active'); 
        startX = e.pageX - container.offsetLeft;
        startY = e.pageY - container.offsetTop;
        scrollLeft = container.scrollLeft;
        scrollTop = container.scrollTop;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('mousemove', (e) => {
        if(!isDown) return; 
        e.preventDefault();

        const x = e.pageX - container.offsetLeft;
        const y = e.pageY - container.offsetTop;

        const walkX = (x - startX); 
        const walkY = (y - startY);

        container.scrollLeft = scrollLeft - walkX;
        container.scrollTop = scrollTop - walkY;
    });
    });

    await loadUserOrders();
}

//Get User Orders List


