let editingEmployeeId = null;

async function displayEmployees() {

    const tableBody = document.getElementById("employeeTableBody");

    try {

        const response = await fetch("/api/employees");
        const employees = await response.json();

        tableBody.innerHTML = "";

        if (employees.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">No employees found</td>
                </tr>
            `;

            return;
        }

        employees.forEach(function(employee) {

            const row = `
                <tr>

                    <td>${employee.employee_id}</td>

                    <td>${employee.name}</td>

                    <td>${employee.department}</td>

                    <td>${employee.email}</td>

                    <td>${employee.phone}</td>

                    <td>

                        <button
                            onclick="editEmployee(
                                '${employee.employee_id}',
                                '${employee.name}',
                                '${employee.department}',
                                '${employee.email}',
                                '${employee.phone}'
                            )"
                            style="background:#3498db;">
                            Edit
                        </button>

                        <button
                            onclick="deleteEmployee('${employee.employee_id}')"
                            style="background:#e74c3c;">
                            Delete
                        </button>

                    </td>

                </tr>
            `;

            tableBody.innerHTML += row;

        });

    } catch (error) {

        console.error(error);

        alert("Unable to load employees");

    }
}


function showEmployeeForm() {

    editingEmployeeId = null;

    document.getElementById("formTitle").textContent = "Add Employee";

    document.getElementById("employeeId").disabled = false;

    document.getElementById("employeeId").value = "";
    document.getElementById("employeeName").value = "";
    document.getElementById("department").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";

    document.getElementById("employeeForm").style.display = "block";
}


function hideEmployeeForm() {

    document.getElementById("employeeForm").style.display = "none";

}


function editEmployee(employeeId, name, department, email, phone) {

    editingEmployeeId = employeeId;

    document.getElementById("formTitle").textContent = "Edit Employee";

    document.getElementById("employeeId").value = employeeId;

    document.getElementById("employeeId").disabled = true;

    document.getElementById("employeeName").value = name;

    document.getElementById("department").value = department;

    document.getElementById("email").value = email;

    document.getElementById("phone").value = phone;

    document.getElementById("employeeForm").style.display = "block";
}


async function saveEmployee() {

    const employeeId =
        document.getElementById("employeeId").value.trim();

    const employeeName =
        document.getElementById("employeeName").value.trim();

    const department =
        document.getElementById("department").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const phone =
        document.getElementById("phone").value.trim();


    if (
        employeeId === "" ||
        employeeName === "" ||
        department === "" ||
        email === "" ||
        phone === ""
    ) {

        alert("Please fill all fields");

        return;
    }


    try {

        let response;


        if (editingEmployeeId === null) {

            response = await fetch("/api/employees", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    employee_id: employeeId,
                    name: employeeName,
                    department: department,
                    email: email,
                    phone: phone

                })

            });

        } else {

            response = await fetch(
                `/api/employees/${editingEmployeeId}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        name: employeeName,
                        department: department,
                        email: email,
                        phone: phone

                    })

                }
            );

        }


        const result = await response.json();


        if (!response.ok) {

            alert(result.message);

            return;
        }


        alert(result.message);

        hideEmployeeForm();

        editingEmployeeId = null;

        displayEmployees();


    } catch (error) {

        console.error(error);

        alert("Unable to save employee");

    }

}


async function deleteEmployee(employeeId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this employee?"
    );


    if (!confirmDelete) {

        return;
    }


    try {

        const response = await fetch(
            `/api/employees/${employeeId}`,
            {
                method: "DELETE"
            }
        );


        const result = await response.json();


        if (!response.ok) {

            alert(result.message);

            return;
        }


        alert(result.message);

        displayEmployees();


    } catch (error) {

        console.error(error);

        alert("Unable to delete employee");

    }

}


displayEmployees();