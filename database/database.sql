CREATE DATABASE employee_attendance;

USE employee_attendance;


CREATE TABLE employees (

    id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id VARCHAR(20) NOT NULL UNIQUE,

    name VARCHAR(100) NOT NULL,

    department VARCHAR(100) NOT NULL,

    email VARCHAR(100) NOT NULL,

    phone VARCHAR(15) NOT NULL

);


CREATE TABLE attendance (

    id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id VARCHAR(20) NOT NULL,

    attendance_date DATE NOT NULL,

    status ENUM('Present', 'Absent') NOT NULL,

    FOREIGN KEY (employee_id)
    REFERENCES employees(employee_id)

);
