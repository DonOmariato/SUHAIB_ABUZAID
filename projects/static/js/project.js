function clickedModalShow(projectId) {
    var modal = new bootstrap.Modal(document.getElementById('projectModal'));
    modal.show();
    fetch(`/projects/getProjects/${projectId}`)
        .then(response => response.json())
        .then(data => {

            document.getElementById("project-name").innerText = data.project.name;
            document.getElementById("project-location").innerText = data.project.location;
            document.getElementById("project-duration").innerText = `Duration: ${data.project.duration}`;
            document.getElementById("project-description").innerText = data.project.description;


            const imageModel = document.getElementById("modal-images");
            imageModel.innerHTML = data.project.images.map(image =>
                `<img src="${image.url}" alt="Project Image" class="project-image">`
            ).join("");

        })
        .catch(error => console.error("Error:", error));
}
