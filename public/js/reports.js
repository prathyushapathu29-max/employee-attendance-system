async function displayReports() {

    const tableBody =
        document.getElementById("reportTableBody");

    try {

        const response =
            await fetch("/api/reports");

        if (!response.ok) {

            throw new Error("Failed to fetch reports");

        }

        const reports =
            await response.json();

        tableBody.innerHTML = "";


        if (reports.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No employees found
                    </td>
                </tr>
            `;

            return;
        }


        reports.forEach(function(report) {

            const totalDays =
                Number(report.totalDays) || 0;

            const presentDays =
                Number(report.presentDays) || 0;

            const absentDays =
                Number(report.absentDays) || 0;


            let percentage = 0;


            if (totalDays > 0) {

                percentage =
                    (presentDays / totalDays) * 100;

            }


            percentage =
                percentage.toFixed(2);


            const row = `

                <tr>

                    <td>
                        ${report.employee_id}
                    </td>

                    <td>
                        ${report.name}
                    </td>

                    <td>
                        ${totalDays}
                    </td>

                    <td>
                        ${presentDays}
                    </td>

                    <td>
                        ${absentDays}
                    </td>

                    <td class="percentage-cell">
                        ${percentage}%
                    </td>

                </tr>

            `;


            tableBody.innerHTML += row;

        });


    } catch (error) {

        console.error(error);

        alert("Unable to load reports");

    }

}


displayReports();