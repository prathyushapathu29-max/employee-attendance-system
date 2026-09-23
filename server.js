const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));


/* GET ALL EMPLOYEES */

app.get("/api/employees", async (req, res) => {

    try {

        const [rows] = await db.query(
            "SELECT * FROM employees ORDER BY id DESC"
        );

        res.json(rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch employees"
        });

    }

});


/* ADD EMPLOYEE */

app.post("/api/employees", async (req, res) => {

    const {
        employee_id,
        name,
        department,
        email,
        phone
    } = req.body;


    if (
        !employee_id ||
        !name ||
        !department ||
        !email ||
        !phone
    ) {

        return res.status(400).json({
            message: "All fields are required"
        });

    }


    try {

        const [result] = await db.execute(

            `INSERT INTO employees
            (employee_id, name, department, email, phone)
            VALUES (?, ?, ?, ?, ?)`,

            [
                employee_id,
                name,
                department,
                email,
                phone
            ]

        );


        res.status(201).json({

            message:
                "Employee added successfully",

            id:
                result.insertId

        });


    } catch (error) {

        console.error(error);


        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({

                message:
                    "Employee ID already exists"

            });

        }


        res.status(500).json({

            message:
                "Failed to add employee"

        });

    }

});


/* UPDATE EMPLOYEE */

app.put("/api/employees/:employee_id", async (req, res) => {

    const {
        name,
        department,
        email,
        phone
    } = req.body;


    if (
        !name ||
        !department ||
        !email ||
        !phone
    ) {

        return res.status(400).json({

            message:
                "All fields are required"

        });

    }


    try {

        const [result] = await db.execute(

            `UPDATE employees
             SET name = ?,
                 department = ?,
                 email = ?,
                 phone = ?
             WHERE employee_id = ?`,

            [
                name,
                department,
                email,
                phone,
                req.params.employee_id
            ]

        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                message:
                    "Employee not found"

            });

        }


        res.json({

            message:
                "Employee updated successfully"

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            message:
                "Failed to update employee"

        });

    }

});


/* DELETE EMPLOYEE */

app.delete("/api/employees/:employee_id", async (req, res) => {

    try {

        const [result] = await db.execute(

            "DELETE FROM employees WHERE employee_id = ?",

            [req.params.employee_id]

        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                message:
                    "Employee not found"

            });

        }


        res.json({

            message:
                "Employee deleted successfully"

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            message:
                "Failed to delete employee"

        });

    }

});


/* GET ATTENDANCE */

app.get("/api/attendance", async (req, res) => {

    try {

        let query = `

            SELECT
                a.id,
                a.employee_id,
                e.name,
                e.department,
                a.attendance_date,
                a.status

            FROM attendance a

            JOIN employees e
            ON a.employee_id = e.employee_id

        `;


        const values = [];


        if (req.query.date) {

            query += `
                WHERE a.attendance_date = ?
            `;

            values.push(req.query.date);

        }


        query += `
            ORDER BY a.attendance_date DESC
        `;


        const [rows] =
            await db.query(query, values);


        res.json(rows);


    } catch (error) {

        console.error(error);


        res.status(500).json({

            message:
                "Failed to fetch attendance"

        });

    }

});


/* SAVE OR UPDATE ATTENDANCE */

app.post("/api/attendance", async (req, res) => {

    const {
        employee_id,
        attendance_date,
        status
    } = req.body;


    if (
        !employee_id ||
        !attendance_date ||
        !status
    ) {

        return res.status(400).json({

            message:
                "Employee ID, date and status are required"

        });

    }


    try {

        const [existing] =
            await db.execute(

                `SELECT id
                 FROM attendance
                 WHERE employee_id = ?
                 AND attendance_date = ?`,

                [
                    employee_id,
                    attendance_date
                ]

            );


        if (existing.length > 0) {

            await db.execute(

                `UPDATE attendance
                 SET status = ?
                 WHERE employee_id = ?
                 AND attendance_date = ?`,

                [
                    status,
                    employee_id,
                    attendance_date
                ]

            );


            return res.json({

                message:
                    "Attendance updated successfully"

            });

        }


        const [result] =
            await db.execute(

                `INSERT INTO attendance
                (employee_id, attendance_date, status)
                VALUES (?, ?, ?)`,

                [
                    employee_id,
                    attendance_date,
                    status
                ]

            );


        res.status(201).json({

            message:
                "Attendance saved successfully",

            id:
                result.insertId

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            message:
                "Failed to save attendance"

        });

    }

});


/* ATTENDANCE REPORTS */

app.get("/api/reports", async (req, res) => {

    try {

        const [rows] =
            await db.query(`

            SELECT

                e.employee_id AS employee_id,

                e.name AS name,

                COUNT(a.id) AS totalDays,

                COALESCE(
                    SUM(
                        CASE
                            WHEN a.status = 'Present'
                            THEN 1
                            ELSE 0
                        END
                    ),
                    0
                ) AS presentDays,

                COALESCE(
                    SUM(
                        CASE
                            WHEN a.status = 'Absent'
                            THEN 1
                            ELSE 0
                        END
                    ),
                    0
                ) AS absentDays,

                CASE

                    WHEN COUNT(a.id) = 0
                    THEN 0

                    ELSE ROUND(

                        (
                            SUM(
                                CASE
                                    WHEN a.status = 'Present'
                                    THEN 1
                                    ELSE 0
                                END
                            ) * 100.0
                        )
                        /
                        COUNT(a.id),

                        2

                    )

                END AS attendancePercentage

            FROM employees e

            LEFT JOIN attendance a

            ON e.employee_id =
               a.employee_id

            GROUP BY
                e.employee_id,
                e.name

            ORDER BY
                e.employee_id

        `);


        res.json(rows);


    } catch (error) {

        console.error(error);


        res.status(500).json({

            message:
                "Failed to fetch reports"

        });

    }

});


/* DASHBOARD */

app.get("/api/dashboard", async (req, res) => {

    try {

        const [totalResult] =
            await db.query(

                "SELECT COUNT(*) AS totalEmployees FROM employees"

            );


        const [presentResult] =
            await db.query(`

                SELECT COUNT(*) AS presentEmployees

                FROM attendance

                WHERE attendance_date =
                      CURDATE()

                AND status = 'Present'

            `);


        const [absentResult] =
            await db.query(`

                SELECT COUNT(*) AS absentEmployees

                FROM attendance

                WHERE attendance_date =
                      CURDATE()

                AND status = 'Absent'

            `);


        const [presentList] =
            await db.query(`

                SELECT
                    e.employee_id,
                    e.name,
                    e.department

                FROM employees e

                INNER JOIN attendance a

                ON e.employee_id =
                   a.employee_id

                WHERE a.attendance_date =
                      CURDATE()

                AND a.status = 'Present'

                ORDER BY e.employee_id

            `);


        res.json({

            totalEmployees:
                totalResult[0].totalEmployees,

            presentEmployees:
                presentResult[0].presentEmployees,

            absentEmployees:
                absentResult[0].absentEmployees,

            presentList:
                presentList

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            message:
                "Failed to load dashboard data"

        });

    }

});


/* START SERVER */

app.listen(PORT, () => {

    console.log("=================================");

    console.log(
        "Employee Attendance Server"
    );

    console.log(
        "Server running at http://localhost:3000"
    );

    console.log("=================================");

});