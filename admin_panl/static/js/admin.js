document.addEventListener('DOMContentLoaded', function () {

    bindDeleteButtonEvents();
    bindEditButtonEvents();

    document.getElementById('contact-info-form').onsubmit = function (event) {
        event.preventDefault();
        const contentData = new FormData(this);

        fetch('adminpan/contact-Info/', {
            method: 'POST',
            body: contentData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
            .then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
            .then(data => {
                console.log(data);
                if (data.status === 'error') {
                    alert(data.message);
                } else {
                    document.getElementById("footer-address").textContent = data.address;
                    document.getElementById("footer-phone1").textContent = data.phone1;
                    document.getElementById("footer-phone1").href = "tel:" + data.phone1;
                    document.getElementById("footer-phone2").textContent = data.phone2;
                    document.getElementById("footer-phone2").href = "tel:" + data.phone2;
                    document.getElementById("footer-email").textContent = data.email;
                    document.getElementById("footer-email").href = "mailto:" + data.email;
                    alert('Contact updated successfully!');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            });
    };

    document.getElementById("new-project-form").addEventListener("submit", function (event) {
        event.preventDefault();
        let formData = new FormData(this);

        fetch("/projects/addProject/", {
            method: "POST",
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert(data.message);
                    addNewProjectToDOM(data.project);
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error("Error:", error));
    });

    function addNewProjectToDOM(project, isEdit = false) {
        const projectRow = document.getElementById(`project-${project.id}`);
        if (isEdit && projectRow) {
            projectRow.innerHTML = `
              <td>${project.name}</td>
              <td>${project.location}</td>
              <td>${project.duration}</td>
              <td class="m-2 d-flex gap-1">
                 <button class="btn btn-sm btn-primary edit-btn" data-id="${project.id}">
                    <i class="bi bi-pencil-square"></i> edit
                 </button>
                 <button class="btn btn-sm btn-danger delete-btn" data-id="${project.id}">
                    <i class="bi bi-trash"></i> delete
                 </button>
               </td>
            `;
        } else {
            const newRow = `
            <tr id="project-${project.id}">
                <td>${project.name}</td>
                <td>${project.location}</td>
                <td>${project.duration}</td>
                <td class="m-2 d-flex gap-1">
                    <button class="btn btn-sm btn-primary edit-btn" data-id="${project.id}">
                        <i class="bi bi-pencil-square"></i> edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${project.id}">
                        <i class="bi bi-trash"></i> delete
                    </button>
                </td>
            </tr>
            `;
            document.getElementById("projects-table-body").innerHTML += newRow;
        }

        bindDeleteButtonEvents();
        bindEditButtonEvents();
    }

    function bindDeleteButtonEvents() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.removeEventListener('click', handleDeleteClick);
            button.addEventListener('click', handleDeleteClick);
        });
    }

    function handleDeleteClick() {
        let projectId = this.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this project?')) {
            fetch(`/projects/deleteProject/${projectId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById(`project-${projectId}`).remove();
                    } else {
                        alert('Error deleting project.');
                    }
                })
                .catch(error => alert('Error: ' + error));
        }
    }

    function openEditModel(projectId) {
        var editModel = new bootstrap.Modal(document.getElementById('editProjectModal'));
        editModel.show();

        fetch(`/projects/getProjects/${projectId}/`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    document.getElementById('edit-project-modal-id').value = data.project.id;
                    document.getElementById('edit-project-modal-name').value = data.project.name;
                    document.getElementById('edit-project-modal-description').value = data.project.description;
                    document.getElementById('edit-project-modal-duration').value = data.project.duration;
                    document.getElementById('edit-project-modal-location').value = data.project.location;

                    let imagesContainer = document.getElementById('edit-project-modal-images');
                    imagesContainer.innerHTML = "";


                    deleteImages = [];

                    let deleteImagesInput = document.getElementById('deleted-images-input');
                    if (!deleteImagesInput) {
                        deleteImagesInput = document.createElement('input');
                        deleteImagesInput.type = 'hidden';
                        deleteImagesInput.id = 'deleted-images-input';
                        deleteImagesInput.name = 'deletedImages';
                        imagesContainer.appendChild(deleteImagesInput);
                    }

                    data.project.images.forEach((image) => {
                        let imageWrapper = document.createElement('div');
                        imageWrapper.classList.add('image-wrapper');

                        let imageElement = document.createElement('img');
                        imageElement.src = image.url;
                        imageElement.classList.add('img-thumbnail', 'project-image');

                        let deleteButton = document.createElement('button');
                        deleteButton.innerHTML = "✖";
                        deleteButton.classList.add('delete-image-btn');
                        deleteButton.setAttribute("data-id", image.id);

                        imageWrapper.appendChild(imageElement);
                        imageWrapper.appendChild(deleteButton);
                        imagesContainer.appendChild(imageWrapper);
                    });

                    deleteImagesModel();
                } else {
                    alert('Error loading project data');
                }
            })
            .catch(error => alert('Error: ' + error));
    }

    function bindEditButtonEvents() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.removeEventListener('click', handleEditClick);
            button.addEventListener('click', handleEditClick);
        });
    }

    function handleEditClick() {
        openEditModel(this.dataset.id);
    }

    let deleteImages = [];

    function deleteImagesModel() {
        console.log("✅ deleteImagesModel() is running...");
        let deleteImagesInput = document.getElementById('deleted-images-input');
        const deleteButtons = document.querySelectorAll('.delete-image-btn');

        console.log("Found delete buttons:", deleteButtons.length);

        deleteButtons.forEach(button => {
            button.removeEventListener('click', handleImageDelete);
            button.addEventListener('click', handleImageDelete);
        });
    }

    function handleImageDelete() {
        let imgId = this.getAttribute('data-id');
        console.log("Clicked delete button with imgId:", imgId);

        let deleteImagesInput = document.getElementById('deleted-images-input');
        if (imgId && !deleteImages.includes(imgId)) {
            deleteImages.push(imgId);
            if (deleteImagesInput) {
                deleteImagesInput.value = JSON.stringify(deleteImages);
                console.log("Updated deleteImages:", deleteImages);
                console.log("Hidden input value:", deleteImagesInput.value);
            } else {
                console.error("deleteImagesInput is still null!");
            }
        }
        this.parentElement.remove();
    }

    document.getElementById('edit-project-form').addEventListener("submit", function (event) {
        event.preventDefault();

        let submitButton = document.getElementById('save-project-btn');
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';
        const projectId = document.getElementById('edit-project-modal-id').value;
        let editProjectForm = new FormData(this);

        editProjectForm.append('deleted_images', JSON.stringify(deleteImages));

        for (let pair of editProjectForm.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        fetch(`/projects/updateProject/${projectId}/`, {
            method: 'POST',
            body: editProjectForm,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    if (data.project) {
                        addNewProjectToDOM(data.project, true);
                    } else {
                        console.error("❌ No project data returned!");
                    }
                } else {
                    alert('Error updating project: ' + (data.message || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
                alert('An error occurred while saving the project.');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = "Save";
            });
    });

    function getCookie(name) {
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
    }
});