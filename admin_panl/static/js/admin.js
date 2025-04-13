document.addEventListener('DOMContentLoaded', () => {
    const sendRequest = (url, method, body) => {
        return fetch(url, {
            method,
            body,
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            });
    };

    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            document.cookie.split(';').forEach(cookie => {
                cookie = cookie.trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                }
            });
        }
        return cookieValue;
    };

    // *** Contact Info mangment***
    const initContactInfoForm = () => {
        const form = document.getElementById('contact-info-form');
        if (!form) return;

        form.onsubmit = (event) => {
            event.preventDefault();
            const formData = new FormData(form);

            sendRequest('adminpan/contact-Info/', 'POST', formData)
                .then(data => {
                    if (data.status === 'error') {
                        alert(data.message);
                    } else {
                        updateContactInfo(data);
                        alert('Contact updated successfully!');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred. Please try again.');
                });
        };
    };

    const updateContactInfo = (data) => {
        document.getElementById('footer-address').textContent = data.address;
        document.getElementById('footer-phone1').textContent = data.phone1;
        document.getElementById('footer-phone1').href = `tel:${data.phone1}`;
        document.getElementById('footer-phone2').textContent = data.phone2;
        document.getElementById('footer-phone2').href = `tel:${data.phone2}`;
        document.getElementById('footer-email').textContent = data.email;
        document.getElementById('footer-email').href = `mailto:${data.email}`;
    };

    // ***Projects mangment***
    const initProjectForm = () => {
        const form = document.getElementById('new-project-form');
        if (!form) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(form);

            sendRequest('/projects/addProject/', 'POST', formData)
                .then(data => {
                    if (data.status === 'success') {
                        alert(data.message);
                        addProjectToTable(data.project);
                    } else {
                        alert(data.message);
                    }
                })
                .catch(error => console.error('Error:', error));
        });
    };

    const addProjectToTable = (project, isEdit = false) => {
        const tableBody = document.getElementById('projects-table-body');
        const projectRow = document.getElementById(`project-${project.id}`);

        const rowHTML = `
            <td>${project.name}</td>
            <td>${project.location}</td>
            <td>${project.duration}</td>
            <td class="m-2 d-flex gap-1">
                <button class="btn btn-sm btn-primary edit-btn" data-id="${project.id}">
                    <i class="bi bi-pencil-square"></i> ✏️
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${project.id}">
                    <i class="bi bi-trash"></i>  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="25" fill="currentColor" class="bi bi-dash"
                                            viewBox="0 0 16 16">
                                            <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
                                        </svg>
                </button>
            </td>
        `;

        if (isEdit && projectRow) {
            projectRow.innerHTML = rowHTML;
        } else {
            tableBody.innerHTML += `<tr id="project-${project.id}">${rowHTML}</tr>`;
        }

        bindProjectButtons();
    };

    const bindProjectButtons = () => {
        const deleteButtons = document.querySelectorAll('.projects-table .delete-btn');
        const editButtons = document.querySelectorAll('.projects-table .edit-btn');

        deleteButtons.forEach(btn => {
            btn.removeEventListener('click', handleProjectDelete);
            btn.addEventListener('click', handleProjectDelete);
        });

        editButtons.forEach(btn => {
            btn.removeEventListener('click', handleProjectEdit);
            btn.addEventListener('click', handleProjectEdit);
        });
    };

    const handleProjectDelete = function () {
        const projectId = this.getAttribute('data-id');
        if (!confirm('Are you sure you want to delete this project?')) return;

        sendRequest(`/projects/deleteProject/${projectId}/`, 'POST')
            .then(data => {
                if (data.success) {
                    document.getElementById(`project-${projectId}`).remove();
                } else {
                    alert('Error deleting project.');
                }
            })
            .catch(error => alert('Error: ' + error));
    };

    const handleProjectEdit = function () {
        openEditModal(this.getAttribute('data-id'));
    };

    const openEditModal = (projectId) => {
        const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
        modal.show();

        sendRequest(`/projects/getProjects/${projectId}/`, 'GET')
            .then(data => {
                if (data.status === 'success') {
                    populateEditModal(data.project);
                } else {
                    alert('Error loading project data');
                }
            })
            .catch(error => alert('Error: ' + error));
    };

    let deletedImages = [];

    const populateEditModal = (project) => {
        document.getElementById('edit-project-modal-id').value = project.id;
        document.getElementById('edit-project-modal-name').value = project.name;
        document.getElementById('edit-project-modal-description').value = project.description;
        document.getElementById('edit-project-modal-duration').value = project.duration;
        document.getElementById('edit-project-modal-location').value = project.location;

        const imagesContainer = document.getElementById('edit-project-modal-images');
        imagesContainer.innerHTML = '';

        const deletedImagesInput = document.createElement('input');
        deletedImagesInput.type = 'hidden';
        deletedImagesInput.id = 'deleted-images-input';
        deletedImagesInput.name = 'deletedImages';
        imagesContainer.appendChild(deletedImagesInput);

        project.images.forEach(image => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('image-wrapper');
            wrapper.innerHTML = `
                <img src="${image.url}" class="img-thumbnail project-image">
                <button class="delete-image-btn" data-id="${image.id}">✖</button>
            `;
            imagesContainer.appendChild(wrapper);
        });

        bindImageDeleteButtons();
    };

    const bindImageDeleteButtons = () => {
        document.querySelectorAll('.delete-image-btn').forEach(btn => {
            btn.removeEventListener('click', handleImageDelete);
            btn.addEventListener('click', handleImageDelete);
        });
    };

    const handleImageDelete = function () {
        const imgId = this.getAttribute('data-id');
        if (imgId && !deletedImages.includes(imgId)) {
            deletedImages.push(imgId);
            document.getElementById('deleted-images-input').value = JSON.stringify(deletedImages);
        }
        this.parentElement.remove();
    };

    const initEditProjectForm = () => {
        const form = document.getElementById('edit-project-form');
        if (!form) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const submitButton = document.getElementById('save-project-btn');
            submitButton.disabled = true;
            submitButton.textContent = 'Saving...';

            const projectId = document.getElementById('edit-project-modal-id').value;
            const formData = new FormData(form);
            formData.append('deleted_images', JSON.stringify(deletedImages));

            sendRequest(`/projects/updateProject/${projectId}/`, 'POST', formData)
                .then(data => {
                    if (data.success && data.project) {
                        addProjectToTable(data.project, true);
                    } else {
                        alert('Error updating project: ' + (data.message || 'Unknown error'));
                    }
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                    alert('An error occurred while saving the project.');
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Save';
                });
        });
    };

    // *** Admin Mangment***
    const initAdminForm = () => {
        const form = document.getElementById('admin-form');
        if (!form) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(form);

            sendRequest('adminpan/add-Admin/', 'POST', formData)
                .then(data => {
                    if (data.status === true) {
                        alert(data.message);
                        addAdminToTable(data.admin);
                    } else {
                        alert(data.message);
                        console.error('Failed to add admin:', data.message);
                    }
                })
                .catch(error => console.error('Error:', error));
        });
    };

    const addAdminToTable = (admin, isEdit = false) => {
        const tableBody = document.getElementById('admin-table-body');
        const adminRow = document.getElementById(`admin-${admin.id}`);

        const rowHtml = `
            <td>${admin.id}</td>
            <td>${admin.username}</td>
            <td>${admin.email}</td>
            <td class="actions">
                <button class="btn btn-sm btn-primary edit-btn" data-id="${admin.id}" title="Edit">✏️</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${admin.id}" title="Delete"> <svg xmlns="http://www.w3.org/2000/svg" width="18" height="25" fill="currentColor" class="bi bi-dash"
                                            viewBox="0 0 16 16">
                                            <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
                                        </svg></button>
            </td>
        `;
        if (isEdit && adminRow) {
            adminRow.innerHTML = rowHtml;
        } else {
            tableBody.innerHTML += `<tr id="admin-${admin.id}">${rowHtml}</tr>`;
        }
        bindAdminButtons();
    };

    const bindAdminButtons = () => {
        const deleteButtons = document.querySelectorAll('.admin-table .delete-btn');
        const editButtons = document.querySelectorAll('.admin-table .edit-btn')

        deleteButtons.forEach(btn => {
            btn.removeEventListener('click', handleAdminDelete);
            btn.addEventListener('click', handleAdminDelete);
        });
        editButtons.forEach(btn => {
            btn.removeEventListener('click', handleAdminEdit);
            btn.addEventListener('click', handleAdminEdit);
        });
    };
    const handleAdminDelete = function () {
        const adminId = this.getAttribute('data-id');
        if (!confirm('Are you sure you want to delete this Admin ?')) return;
        sendRequest(`adminpan/delete-Admin/${adminId}/`, 'POST')
            .then(data => {
                if (data.status === true) {
                    document.getElementById(`admin-${adminId}`).remove();
                } else {
                    alert(data.message);
                }
            })
            .catch(error => alert('Error: ' + error));
    };
    ///////////
    const handleAdminEdit = function () {
        openAdminModel(this.getAttribute('data-id'));
    };
    const openAdminModel = (adminId) => {
        const model = new bootstrap.Modal(document.getElementById('editAdminModal'));
        model.show();
        sendRequest(`adminpan/get-Admin/${adminId}/`, 'GET')
            .then(data => {
                if (data.status === true) {
                    populateAdminModel(data.admin);
                } else {
                    alert(data.message);
                }
            })
            .catch(error => alert('Error: ' + error));
    };
    const populateAdminModel = (admin) => {
        document.getElementById('edit-admin-id').value = admin.id;
        document.getElementById('edit-username').value = admin.username;
        document.getElementById('edit-email').value = admin.email;
    };
    const initEditAdminForm = () => {
        const adminForm = document.getElementById('edit-admin-form');
        if (!adminForm) { return; }
        adminForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const submitButton = document.getElementById('save-admin-btn');
            submitButton.disabled = true;
            submitButton.textContent = 'Saving...';

            const adminId = document.getElementById('edit-admin-id').value;
            const formData = new FormData(adminForm);

            sendRequest(`adminpan/update-Admin/${adminId}/`, 'POST', formData)

                .then(data => {
                    console.log('Response from server:', data);
                    if (data.status === true) {
                        addAdminToTable(data.admin, true);
                    } else {
                        alert('Error updating admin: ' + (data.message || 'Unknown error'));
                    }
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                    alert('An error occurred while saving the admin.');
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Save';
                });
        });

    };
    ///////////////
    initContactInfoForm();
    initProjectForm();
    initEditProjectForm();
    initAdminForm();
    bindProjectButtons();
    bindAdminButtons();
    initEditAdminForm();
});