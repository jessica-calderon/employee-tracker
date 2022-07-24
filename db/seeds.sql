use employee_db; 

INSERT INTO department (name)
VALUES ("Information Technology");
INSERT INTO department (name)
VALUES ("Human Resources");
INSERT INTO department (name)
VALUES ("Marketing");
INSERT INTO department (name)
VALUES ("Accounting");

INSERT INTO role (title, salary, department_id)
VALUES ("Network Architect", 100000, 1);
INSERT INTO role (title, salary, department_id)
VALUES ("Recruiter", 150000, 2);
INSERT INTO role (title, salary, department_id)
VALUES ("Digital Marketing", 120000, 2);
INSERT INTO role (title, salary, department_id)
VALUES ("Sales", 125000, 3);
INSERT INTO role (title, salary, department_id)
VALUES ("Accountant", 250000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Jess", "Wilkinson", 1, 3);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Darcey", "Edwards", 2, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Spinner", "Mason", 3, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Emma", "Nelson", 4, 3);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Manny", "Santos", 5, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Jimmy", "Brooks", 2, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Amit", "Knowles", 4, 7);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Glen", "Cantrell", 1, 2);
