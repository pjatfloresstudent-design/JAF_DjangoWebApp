let allStudents = [];

async function loadStudents() {
    const loadingMessage = document.getElementById("loading-message");
    const errorMessage = document.getElementById("error-message");
    const studentCount = document.getElementById("student-count");
    const tableBody = document.getElementById("student-table-body");
    const refreshButton = document.getElementById("refresh-students");

    try {
        loadingMessage.textContent = "Loading students...";
        errorMessage.textContent = "";

        refreshButton.disabled = true;

        const response = await fetch("/api/students/");

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(
                    "Authentication required. Please log in."
                );
            }

            throw new Error("HTTP error: " + response.status);
        }

        const data = await response.json();

        allStudents = data.students;

        studentCount.textContent = data.count;

        populateProgramFilter();
        renderStudents();

        loadingMessage.textContent = "";

    } catch (error) {
        loadingMessage.textContent = "";

        errorMessage.textContent = error.message;

        console.error("Student loading error:", error);

    } finally {
        refreshButton.disabled = false;
    }
}


function populateProgramFilter() {
    const programFilter =
        document.getElementById("program-filter");

    const selectedProgram = programFilter.value;

    const programs = [
        ...new Set(
            allStudents
                .map(student => student.program)
                .filter(Boolean)
        )
    ].sort();

    programFilter.replaceChildren();

    const allOption = document.createElement("option");

    allOption.value = "";
    allOption.textContent = "All programs";

    programFilter.appendChild(allOption);

    programs.forEach(function(program) {
        const option = document.createElement("option");

        option.value = program;
        option.textContent = program;

        programFilter.appendChild(option);
    });

    if (programs.includes(selectedProgram)) {
        programFilter.value = selectedProgram;
    }
}


function renderStudents() {
    const searchInput =
        document.getElementById("student-search");

    const programFilter =
        document.getElementById("program-filter");

    const resultCount =
        document.getElementById("result-count");

    const tableBody =
        document.getElementById("student-table-body");

    const searchTerm =
        searchInput.value.trim().toLowerCase();

    const selectedProgram =
        programFilter.value;

    const filteredStudents =
        allStudents.filter(function(student) {

            const name =
                (student.student_name || "").toLowerCase();

            const email =
                (student.email || "").toLowerCase();

            const matchesSearch =
                name.includes(searchTerm) ||
                email.includes(searchTerm);

            const matchesProgram =
                selectedProgram === "" ||
                student.program === selectedProgram;

            return matchesSearch && matchesProgram;
        });


    tableBody.replaceChildren();


    if (filteredStudents.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 5;

        cell.textContent =
            "No matching Student records found.";

        row.appendChild(cell);

        tableBody.appendChild(row);

    } else {

        filteredStudents.forEach(function(student) {

            const row = document.createElement("tr");

            [
                student.id,
                student.student_name,
                student.program,
                student.year_level,
                student.email
            ].forEach(function(value) {

                const cell =
                    document.createElement("td");

                cell.textContent = value ?? "";

                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });
    }


    resultCount.textContent =
        "Showing " +
        filteredStudents.length +
        " of " +
        allStudents.length +
        " students";
}


document
    .getElementById("student-search")
    .addEventListener("input", renderStudents);


document
    .getElementById("program-filter")
    .addEventListener("change", renderStudents);


document
    .getElementById("clear-filters")
    .addEventListener("click", function() {

        document.getElementById("student-search").value = "";

        document.getElementById("program-filter").value = "";

        renderStudents();
    });


document
    .getElementById("refresh-students")
    .addEventListener("click", loadStudents);


loadStudents();

