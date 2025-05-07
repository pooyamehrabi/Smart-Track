const serverUrl = `${window.location.protocol}//${window.location.hostname}:3000`;

async function save(data) {

    const response = await fetch(`${serverUrl}/submit-form`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw response;
    }

    const responseData = await response.json();
    sessionStorage.setItem('trackingCode', responseData.insertId);
    return responseData;
}

async function saveLoggedInUserProduct(data) {
    const response = await fetch(`${serverUrl}/submit-logged-in-user-product`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw response;
    }

    const responseData = await response.json();
    return responseData;
}


async function sendContactForm(data) {

    const response = await fetch(`${serverUrl}/contact-us`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.error || 'Error submitting the contact form');
    }

    const responseData = await response.json();
    return responseData;
}

async function login(credentials) {
    const response = await fetch(`${serverUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include' 
    });

    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.message || 'Invalid username or password');
    }

    const responseData = await response.json();
    localStorage.setItem('username', credentials.username);
    localStorage.setItem('userEmail', responseData.email);
    localStorage.setItem('firstName', responseData.firstName);
    return responseData;
}

async function getCaptcha() {
    try {
        const response = await fetch(`${serverUrl}/captcha`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch CAPTCHA');
        }

        const captcha = await response.text();
        return captcha;
    } catch (error) {
        console.error('Error fetching CAPTCHA:', error);
        throw error;
    }
}

async function setUserRole(username) {
    try {
        const response = await fetch(`${serverUrl}/setUserRole`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
            credentials: 'include', 
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                `Error setting user role: ${errorData.error || response.statusText}`
            );
        }

        const sessionData = await response.json();
        return sessionData;
    } catch (error) {
        console.error('Error in setUserRole:', error.message);
        throw error;
    }
}

async function getUserRole() {
    try {
        const response = await fetch(`${serverUrl}/getUserRole`, { 
            method: "GET", 
            credentials: "include" 
        });

        const data = await response.json();

        if (!data.success) {
            return null; 
        }

        return data.role; 
    } catch (error) {
        console.error("Error verifying user role:", error.message);
        return null; 
    }
}

async function getUserProfile(username) {
    try {
        const response = await fetch(`${serverUrl}/api/getUserProfile?username=${username}`);

        if (!response.ok) {
            throw new Error('Failed to fetch user profile.');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

async function updateUserProfile(data) {
    try {
        const response = await fetch(`${serverUrl}/api/updateUserProfile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update user profile.');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

async function changePassword(data) {
    try {
        const response = await fetch(`${serverUrl}/api/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            throw new Error(errorDetails.error || 'Error changing password');
        }

        return await response.json();
    } catch (error) {
        console.error('Error in changePassword function:', error.message);
        throw error;
    }
}

async function register(data) {
    const response = await fetch(`${serverUrl}/register-form`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData;
}



async function sendCodeToEmail(data) {
    try {
        const response = await fetch(`${serverUrl}/api/send-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            throw new Error(errorDetails.error || 'Error sending code');
        }

        return await response.json();
    } catch (error) {
        console.error('Error in sendCodeToEmail function:', error.message);
        throw error;
    }
}

async function resetPassword(data) {
    try {
        const response = await fetch(`${serverUrl}/api/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            throw new Error(errorDetails.error || 'Error resetting password');
        }

        return await response.json();
    } catch (error) {
        console.error('Error in resetPassword function:', error.message);
        throw error;
    }
}

async function getUserProducts(username) {
    try {
        const response = await fetch(`${serverUrl}/api/getUserProducts?username=${username}`);

        if (!response.ok) {
            throw new Error('Failed to fetch user products.');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user products:', error);
        throw error;
    }
}

async function logoutUser() {
    try {
        const response = await fetch(`${serverUrl}/logout`, {
            method: "POST",
            credentials: "include",
        });

        if (response.ok) {
            localStorage.setItem("isLoggedOut", "true");
            document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; 
            return "Logout successful!";
        } else {
            throw new Error("Logout request failed!");
        }
    } catch (error) {
        console.error("Error during logout:", error.message);
        return "Logout failed!";
    }
}

async function getNewOrdersCount() {
    try {
      const response = await fetch(`${serverUrl}/api/getNewOrdersCount`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Failed to fetch orders count:', error);
      return 0; 
    }
}

async function getUsersCount() {
    try {
      const response = await fetch(`${serverUrl}/api/getUsersCount`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Failed to fetch orders count:', error);
      return 0; 
    }
}

async function getUsersListForAdmin() {
    try {
        const response = await fetch(`${serverUrl}/api/getUsersListForAdmin`);

        if (!response.ok) {
            throw new Error('Failed to fetch user list.');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user products:', error);
        throw error;
    }
}

async function deleteUsers(usernames) {
    try {

        const response = await fetch(`${serverUrl}/api/deleteUsers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usernames }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            const errorDetails = errorResponse.message || 'Unknown server error.';
            throw new Error(`Failed to delete users: ${errorDetails}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting users:', error.message);
        throw error;
    }
}

async function addUser(data) {
    const response = await fetch(`${serverUrl}/api/add-user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }

    const responseData = await response.json();
    return responseData;
}

async function editUser(data) {
    const response = await fetch(`${serverUrl}/api/edit-user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }

    const responseData = await response.json();
    return responseData;
}

async function getRolesListForAdmin() {
    try {
        const response = await fetch(`${serverUrl}/api/getRolesListForAdmin`);

        if (!response.ok) {
            throw new Error('Failed to fetch role list.');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching role:', error);
        throw error;
    }
}

async function deleteRoles(roleNames) {
    try {
        const response = await fetch(`${serverUrl}/api/deleteRoles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roleNames }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.message || 'Failed to delete roles.');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting roles:', error.message);
        throw error;
    }
}

async function addRole(roleName) {
    try {
        const response = await fetch(`${serverUrl}/api/addRole`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roleName }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.message || 'Failed to add role.');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding role:', error.message);
        throw error;
    }
}

async function getUserRoleListForAdmin() {
    try {
        const response = await fetch(`${serverUrl}/api/getUserRoleListForAdmin`);

        if (!response.ok) {
            throw new Error('Failed to fetch user role list.');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user role:', error);
        throw error;
    }
}

async function updateUserRole(username, roleName) {
    try {
        const response = await fetch(`${serverUrl}/api/updateUserRole`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, roleName }),
        });

        if (!response.ok) {
            throw new Error('Failed to update user role.');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
}

async function getUserRolesListForDropdown() {
    try {
        const response = await fetch(`${serverUrl}/api/getUserRolesListForDropdown`);

        if (!response.ok) {
            throw new Error('Failed to fetch roles list for dropdown.');
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error('Failed to fetch data: ' + data.message);
        }

        return data.roles; 
    } catch (error) {
        console.error('Error fetching roles list for dropdown:', error);
        throw error;
    }
}

async function getUserOrdersListForAdmin() {
    try {
        const response = await fetch(`${serverUrl}/api/getUserOrdersListForAdmin`);

        if (!response.ok) {
            const error = await response.text();
            throw new Error('Failed to fetch user orders: ' + error);
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }
}

async function updateUserOrders(payload) {
    try {
        const response = await fetch(`${serverUrl}/api/updateUserOrders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error('Failed to update user orders: ' + error);
        }

        return response.json();
    } catch (error) {
        console.error('Error updating user orders:', error);
        throw error;
    }
}

async function getProductsListForDropdown() {
    try {
        const response = await fetch(`${serverUrl}/api/getProductsListForDropdown`);

        if (!response.ok) {
            const error = await response.text();
            throw new Error('Failed to fetch product list for dropdown: ' + error);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error('Failed to fetch product list: ' + data.message);
        }

        return data.roles;
    } catch (error) {
        console.error('Error fetching product list:', error);
        throw error;
    }
}

async function getUsersList() {
    try {
        const response = await fetch(`${serverUrl}/api/getUsersList`);

        if (!response.ok) {
            const error = await response.text();
            throw new Error('Failed to fetch users: ' + error);
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

async function addUserOrder(payload) {
    try {
        const response = await fetch(`${serverUrl}/api/addUserOrder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error('Failed to add user order: ' + error);
        }

        return response.json();
    } catch (error) {
        console.error('Error adding user order:', error);
        throw error;
    }
}