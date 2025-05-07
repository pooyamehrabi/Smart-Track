//Menu

$(function () {
    $("#menu").load("menu.html");
});

//Menu

//modal - Get Started

document.addEventListener('DOMContentLoaded', function () {

    const modalBody = document.querySelector(".modal-body");
    const productID = "3";
    sessionStorage.setItem("productID", productID);

    const buttonIds = ["getStarted", "getStarted1", "getStarted2"];

    buttonIds.forEach(id => {
        const button = document.getElementById(id);

        if (button) { 
            button.addEventListener("click", function () {
                const username = localStorage.getItem("username") || "guestUser";
                let formContent;

                if (username !== "guestUser") {
                    formContent = `
                        <div class="loggedInUserModal" id="getStartedForm" data-productid="${productID}">
                            <span class="loggedInModalText">
                                Would you like to request a demo for the product?
                            </span>
                            <button type="button" class="btn btn-primary loggedInUserBtn" id="submitLoggedInForm">
                                Submit
                            </button>
                        </div>
                    `;
                } else {
                    formContent = `
                        <form class="needs-validation" novalidate id="getStartedForm" method="post" data-productid="${productID}">
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
                                    <input type="email" class="form-control" id="email" placeholder="Email"
                                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$" required>
                                    <div class="invalid-feedback">Please enter a valid email address.</div>
                                </div>

                                <div class="form-group col-md-6">
                                    <select id="mobileCode" class="form-control" required>
                                        <option value="" disabled selected hidden>Choose your country</option>
                                        <!-- Country options here -->
                                    </select>
                                    <div class="invalid-feedback">Please choose your mobile code.</div>
                                </div>

                                <div class="form-group col-md-6">
                                    <input type="number" class="form-control" id="phoneNumber" placeholder="Phone number" required>
                                    <div class="invalid-feedback">Please enter a valid phone number.</div>
                                </div>

                            </div>

                            <button type="submit" class="btn btn-primary" id="submitGuestForm">Submit</button>
                        </form>
                    `;
                }

                modalBody.innerHTML = formContent;

                $('#getStartedModal').modal('show');
            });
        }
    });

    document.addEventListener("click", async function (event) {
        const productID = sessionStorage.getItem("productID");

        if (event.target.id === "submitLoggedInForm") {
            const username = localStorage.getItem("username");

            if (username) {
                try {
                    const data = { username, productID };
                    const response = await saveLoggedInUserProduct(data);
                    if (response && response.trackingCode) {
                        sessionStorage.setItem("trackingCode", response.trackingCode);
                        window.location.replace("confirmation.html");
                    } else {
                        alert("Error: Tracking code not found.");
                    }
                } catch (error) {
                    console.error("Error occurred while sending data for logged-in user:", error);
                    alert("Error occurred while processing your request.");
                }
            }
        }
    });

    document.addEventListener("submit", async function (event) {
        const form = event.target;

        if (form.id === "getStartedForm") {
            event.preventDefault();

            let isValid = true;
            const fields = form.querySelectorAll('input, select');

            fields.forEach(field => {
                const errorMessage = validateField(field);
                showError(field, errorMessage);
                if (errorMessage) {
                    isValid = false;
                }
            });

            if (!isValid) {
                form.classList.add("was-validated");
                return;
            }

            const data = {
                firstName: form.querySelector("#firstName")?.value.trim(),
                lastName: form.querySelector("#lastName")?.value.trim(),
                companyName: form.querySelector("#companyName")?.value.trim(),
                staffSize: form.querySelector("#staffSize")?.value.trim(),
                email: form.querySelector("#email")?.value.trim(),
                mobileCode: form.querySelector("#mobileCode")?.value.trim(),
                phoneNumber: form.querySelector("#phoneNumber")?.value.trim(),
                productID,
            };

            try {
                const response = await save(data);
                if (response && response.trackingCode) {
                    sessionStorage.setItem("trackingCode", response.trackingCode);
                    form.reset();
                    form.classList.remove("was-validated");
                    window.location.replace("confirmation.html");
                } else {
                    alert("Error: Tracking code not found.");
                }
            } catch (error) {
                console.error("Error occurred while sending form data for guest user:", error);

                if (error instanceof Response) {
                    const errorDetails = await error.json();
                    if (errorDetails.field === "email") {
                        const emailField = form.querySelector("#email");
                        const emailErrorElement = emailField.nextElementSibling;
                        if (emailErrorElement) {
                            emailErrorElement.textContent = "This email address is already in use.";
                        }
                        emailField.classList.add("is-invalid");
                    }
                    if (errorDetails.field === "phoneNumber") {
                        const phoneField = form.querySelector("#phoneNumber");
                        const phoneErrorElement = phoneField.nextElementSibling;
                        if (phoneErrorElement) {
                            phoneErrorElement.textContent = "The phone number is already in use.";
                        }
                        phoneField.classList.add("is-invalid");
                    }
                } else {
                    alert("Error occurred while processing your request.");
                }
            }
        }
    });

    function validateField(field) {
        const fieldID = field.id;
        const fieldname = field.placeholder;
        const fieldValue = field.value.trim();

        if (fieldID === 'staffSize' && !fieldValue) {
            return `Please select your staff size.`;
        }

        if (fieldID === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(fieldValue)) {
                return 'Please enter a valid email address.';
            }
        }

        if (fieldID === 'mobileCode' && !fieldValue) {
            return `Please choose your mobile code.`;
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
        return digitsOnly.length > 0 && digitsOnly.length <= 20;
    }

    function showError(field, errorMessage) {
        const errorElement = field.nextElementSibling;

        if (errorMessage) {
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
        } else {
            if (errorElement) {
                errorElement.textContent = '';
            }
        }
    }
});

//modal - Get Started

//Fix Get Started Button

document.addEventListener('scroll', function () {
    const button = document.getElementById('fixBtnGetStarted');
    const solutionDetails = document.querySelector('.solutionDetails');
    const footer = document.getElementById('footer');

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    const solutionDetailsOffsetTop = solutionDetails.offsetTop;
    const footerOffsetTop = footer.offsetTop;

    if (scrollPosition >= solutionDetailsOffsetTop && (scrollPosition + window.innerHeight < footerOffsetTop)) {
      button.style.display = 'block';
    } else {
      button.style.display = 'none';
    }
  });

//Fix Get Started Button

//Footer

$(function () {
    $("#footer").load("footer.html");
});

//Footer