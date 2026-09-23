async function loadAttendance() {

    const date =
        document.getElementById("attendanceDate").value;

    if (date === "") {

        alert("Please select a date");

        return;
    }


    try {

        const response =
            await fetch("/api/employees");

        const employees =
            await response.json();


        const tableBody =
            document.getElementById("attendanceTableBody");

        tableBody.innerHTML = "";


        if (employees.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No employees found
                    </td>
                </tr>
            `;

            return;
        }


        employees.forEach(function(employee, index) {

            const row = `
                <tr>

                    <td>
                        ${employee.employee_id}
                    </td>

                    <td>
                        ${employee.name}
                    </td>

                    <td>
                        ${employee.department}
                    </td>

                    <td>

                        <select
                            class="attendance-status"
                            id="status-${index}">

                            <option value="Present">
                                Present
                            </option>

                            <option value="Absent">
                                Absent
                            </option>

                        </select>

                    </td>

                </tr>
            `;


            tableBody.innerHTML += row;

        });


        /* LOAD EXISTING ATTENDANCE */

        const attendanceResponse =
            await fetch(
                `/api/attendance?date=${date}`
            );

        const attendance =
            await attendanceResponse.json();


        attendance.forEach(function(record) {

            const employeeIndex =
                employees.findIndex(function(employee) {

                    return employee.employee_id ===
                        record.employee_id;

                });


            if (employeeIndex !== -1) {

                document.getElementById(
                    `status-${employeeIndex}`
                ).value = record.status;

            }

        });


    } catch (error) {

        console.error(error);

        alert("Unable to load attendance");

    }

}



async function saveAttendance() {

    const date =
        document.getElementById("attendanceDate").value;


    if (date === "") {

        alert("Please select a date");

        return;
    }


    try {

        const response =
            await fetch("/api/employees");

        const employees =
            await response.json();


        if (employees.length === 0) {

            alert("No employees found");

            return;
        }


        for (
            let index = 0;
            index < employees.length;
            index++
        ) {

            const employee =
                employees[index];


            const statusElement =
                document.getElementById(
                    `status-${index}`
                );


            if (!statusElement) {

                alert("Please click Load Employees first");

                return;
            }


            const status =
                statusElement.value;


            const attendanceResponse =
                await fetch("/api/attendance", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        employee_id:
                            employee.employee_id,

                        attendance_date:
                            date,

                        status:
                            status

                    })

                });


            const result =
                await attendanceResponse.json();


            if (!attendanceResponse.ok) {

                alert(result.message);

                return;
            }

        }


        alert("Attendance saved successfully");

        loadAttendance();


    } catch (error) {

        console.error(error);

        alert("Unable to save attendance");

    }

}