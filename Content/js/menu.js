//Menu

function toggleMenu() {
    const menu = document.getElementById("firstLayerMenu");
    menu.classList.toggle("menu-open");

    if (menu.classList.contains("menu-open")) {
        document.addEventListener("click", closeMenuOutside);
    } else {
        document.removeEventListener("click", closeMenuOutside);
    }
}

function closeMenuOutside(event) {
    const menu = document.getElementById("firstLayerMenu");
    const icon = document.querySelector(".humbergerMenu .icon");

    if (!menu.contains(event.target) && !icon.contains(event.target)) {
        menu.classList.remove("menu-open");
        document.removeEventListener("click", closeMenuOutside);
        resetSubmenus();
    }
}

function toggleSubmenu(event, icon) {
    event.stopPropagation(); 

    const parentLink = icon.parentElement; 
    const submenu = parentLink.nextElementSibling; 

    if (submenu) {
        submenu.classList.toggle("active"); 
        icon.classList.toggle("rotate"); 
    }

    event.preventDefault(); 
}

function handleNavLinkClick(event) {
    const target = event.target;

    if (target.classList.contains("navLinkIcon")) {
        event.preventDefault(); 
        toggleSubmenu(event, event.target); 
    }
}

function resetSubmenus() {
    const allSubmenus = document.querySelectorAll(".SecondLayerMobileMenu.active, .thirdLayerMenu.active");
    const allIcons = document.querySelectorAll(".navLinkIcon.rotate");

    allSubmenus.forEach((submenu) => submenu.classList.remove("active"));
    allIcons.forEach((icon) => icon.classList.remove("rotate"));
}

window.addEventListener("load", function () {
    const navLinks = document.querySelectorAll("#firstLayerMenu .navLink, #firstLayerMenu .navLinkItems");

    navLinks.forEach((link) => {
        link.addEventListener("click", function (event) {
            const isIconClick = event.target.classList.contains("navLinkIcon"); 
            if (isIconClick) {
                event.preventDefault();
                toggleSubmenu(event, event.target); 
            }
        });
    });
});

//Menu

//Menu After Login

window.addEventListener("load", async function () {
    let timeoutId;

    setTimeout(async function () {
        const isLoggedOut = localStorage.getItem("isLoggedOut"); 
        const userEmail = localStorage.getItem('userEmail');
        const firstName = localStorage.getItem('firstName');
        let userRole;

        if (isLoggedOut === "true") {
            resetMenu(); 
            return; 
        }

        try {
            userRole = await getUserRole();
        } catch (error) {
            console.error("Error fetching user role:", error);
            userRole = null; 
        }

        const loginLink = document.getElementById('loginMenu');
        const loginLinkMobile = document.getElementById('loginMenuMob');
        const loginMenuIcon = document.getElementById('loginMenuIcon');
        const loginMenuMobIcon = document.getElementById('loginMenuMobIcon');
        const secondLayerLogin = document.getElementById('secondLayerLogin');
        const secondLayerLoginMob = document.getElementById('SecondLayerLoginMob');

        const adminMenu = document.getElementById('adminMenu');
        const adminMenuMob = document.getElementById('adminMenuMob');

        const logoutLink = document.getElementById('logoutMenu');
        const logoutLinkMobile = document.getElementById('logoutMenuMob');
        const logoutLinkAdmin = document.getElementById('logoutMenuAdmin');
        const logoutLinkMobileAdmin = document.getElementById('logoutMenuMobAdmin');

        if (secondLayerLogin) secondLayerLogin.style.display = 'none';
        if (secondLayerLoginMob) secondLayerLoginMob.style.display = 'none';
        if (adminMenu) adminMenu.style.display = 'none';
        if (adminMenuMob) adminMenuMob.style.display = 'none';

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

            if (adminMenu) {
                adminMenu.style.display = 'none';
            }

            if (adminMenuMob) {
                adminMenuMob.style.display = 'none';
            }

            if (logoutLink) {
                logoutLink.style.display = 'none';
                logoutLink.removeEventListener('click', logoutHandler);
            }

            if (logoutLinkMobile) {
                logoutLinkMobile.style.display = 'none';
                logoutLinkMobile.removeEventListener('click', logoutHandler);
            }

            if (logoutLinkAdmin) {
                logoutLinkAdmin.style.display = 'none';
                logoutLinkAdmin.removeEventListener('click', logoutHandler);
            }

            if (logoutLinkMobileAdmin) {
                logoutLinkMobileAdmin.style.display = 'none';
                logoutLinkMobileAdmin.removeEventListener('click', logoutHandler);
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

        if (!userRole) {
            resetMenu();
            return;
        }

        function showDesktopSubMenu() {
            clearTimeout(timeoutId);
            if (userRole === 'admin' && adminMenu) {
                adminMenu.style.display = 'block';
            } else if (secondLayerLogin) {
                secondLayerLogin.style.display = 'block';
            }
        }

        function hideDesktopSubMenu() {
            timeoutId = setTimeout(function () {
                if (userRole === 'admin' && adminMenu) {
                    adminMenu.style.display = 'none';
                } else if (secondLayerLogin) {
                    secondLayerLogin.style.display = 'none';
                }
            }, 300);
        }

        function toggleMobileSubMenu(event) {
            event.preventDefault();
            if (userRole === 'admin' && adminMenuMob) {
                adminMenuMob.style.display = adminMenuMob.style.display === 'block' ? 'none' : 'block';
            } else if (secondLayerLoginMob) {
                secondLayerLoginMob.style.display = secondLayerLoginMob.style.display === 'block' ? 'none' : 'block';
            }
        }

        if (userEmail && firstName) {
            if (loginLink) {
                loginLink.textContent = `Hey ${firstName} `;
                if (loginMenuIcon) {
                    loginLink.appendChild(loginMenuIcon);
                    loginMenuIcon.style.display = 'inline-block';
                    loginLink.href = '#';
                }

                loginLink.addEventListener('mouseenter', showDesktopSubMenu);
                loginLink.addEventListener('mouseleave', hideDesktopSubMenu);

                if (secondLayerLogin) {
                    secondLayerLogin.addEventListener('mouseenter', function () {
                        clearTimeout(timeoutId);
                    });

                    secondLayerLogin.addEventListener('mouseleave', function () {
                        timeoutId = setTimeout(function () {
                            secondLayerLogin.style.display = 'none';
                        }, 100);
                    });
                }

                if (adminMenu) {
                    adminMenu.addEventListener('mouseenter', function () {
                        clearTimeout(timeoutId);
                    });

                    adminMenu.addEventListener('mouseleave', function () {
                        timeoutId = setTimeout(function () {
                            adminMenu.style.display = 'none';
                        }, 100);
                    });
                }
            }

            if (loginLinkMobile) {
                loginLinkMobile.textContent = `Hey ${firstName} `;
                if (loginMenuMobIcon) {
                    loginLinkMobile.appendChild(loginMenuMobIcon);
                    loginMenuMobIcon.style.display = 'inline-block';
                    loginLinkMobile.href = '#';
                }

                loginLinkMobile.addEventListener('click', toggleMobileSubMenu);
            }

            if (logoutLink) {
                logoutLink.style.display = 'block';
                logoutLink.addEventListener('click', logoutHandler);
            }

            if (logoutLinkMobile) {
                logoutLinkMobile.style.display = 'block';
                logoutLinkMobile.addEventListener('click', logoutHandler);
            }

            if (logoutLinkAdmin) {
                logoutLinkAdmin.style.display = 'block';
                logoutLinkAdmin.addEventListener('click', logoutHandler);
            }

            if (logoutLinkMobileAdmin) {
                logoutLinkMobileAdmin.style.display = 'block';
                logoutLinkMobileAdmin.addEventListener('click', logoutHandler);
            }
        } else {
            resetMenu();
        }
    }, 50);
});

//Menu After Login
