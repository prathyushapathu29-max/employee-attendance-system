async function loadDashboard() {

    try {

        const response = await fetch("/api/dashboard");

        if (!response.ok) {

            throw new Error("Dashboard API failed");

        }


        const data = await response.json();


        console.log("Dashboard Data:", data);


        // TOTAL EMPLOYEES

        document.getElementById("totalEmployees").textContent =
            data.totalEmployees;


        // PRESENT TODAY

        document.getElementById("presentEmployees").textContent =
            data.presentEmployees;


        // ABSENT TODAY

        document.getElementById("absentEmployees").textContent =
            data.absentEmployees;


        // PRESENT EMPLOYEE TABLE

        const tableBody =
            document.getElementById("presentEmployeeTable");


        tableBody.innerHTML = "";


        if (
            !data.presentList ||
            data.presentList.length === 0
        ) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No employees marked Present today
                    </td>
                </tr>
            `;

            return;
        }


        data.presentList.forEach(function(employee) {

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
                        <span class="present-status">
                            Present
                        </span>
                    </td>

                </tr>
            `;


            tableBody.innerHTML += row;

        });


    } catch (error) {

        console.error("Dashboard Error:", error);


        document.getElementById("totalEmployees").textContent = "0";

        document.getElementById("presentEmployees").textContent = "0";

        document.getElementById("absentEmployees").textContent = "0";


        document.getElementById(
            "presentEmployeeTable"
        ).innerHTML = `
            <tr>
                <td colspan="4">
                    Unable to load today's attendance
                </td>
            </tr>
        `;

    }

}


/* DISPLAY TODAY'S DATE */

function displayTodayDate() {

    const today = new Date();


    const options = {

        day: "2-digit",

        month: "long",

        year: "numeric"

    };


    document.getElementById("todayDate").textContent =
        today.toLocaleDateString(
            "en-IN",
            options
        );

}


/* START DASHBOARD */

displayTodayDate();

loadDashboard();