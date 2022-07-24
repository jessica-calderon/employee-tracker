// dependencies 
const db = require('./db/connection');
const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");

// Start server after DB connection
db.connect(err => {
    if (err) throw err;
    console.log('Database connected.');
    questionPrompt();
});
function questionPrompt() {
    const firstQuestion = [{
        type: "list",
        name: "choice",
        message: "Please choose one of the following options:",
        loop: false,
        choices: ["View all departments", "View all roles", "View all employees", "View employees by department", "View employees by manager", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Update employee manager", "Delete a department", "Delete a role", "Delete an employee", "View total utilized budget per department", "Quit"]
    }]
}
inquirer.prompt(questionPrompt)
    .then(response => {
        switch (response.choice) {
            case "View all departments":
                viewAll("DEPARTMENT");
                break;
            case "View all roles":
                viewAll("ROLE");
                break;
            case "View all employees":
                viewAll("EMPLOYEE");
                break;
            case "View employees by manager":
                viewEmployeesByManager();
                break;
            case "View employees by department":
                viewEmployeesByDept();
                break;
            case "Add a department":
                addDept();
                break;
            case "Add a role":
                addRole();
                break;
            case "Add an employee":
                addEmployee();
                break;
            case "Update role for an employee":
                updateRole();
                break;
            case "Update employee's manager":
                updateManager();
                break;
            case "Delete a department":
                deleteDept();
                break;
            case "Delete a role":
                deleteRole();
                break;
            case "Delete an employee":
                deleteEmployee();
                break;
            case "View the total utilized budget of a department":
                viewBudget();
                break;
            default:
                connection.end();
        }
    })
    .catch(err => {
        console.error(err);
    });
// view all table queries 
const viewAll = (table) => {
    let query;
    // view dept t
    if (table === "DEPARTMENT") {
        query = `SELECT * FROM DEPARTMENT`;
    } else if (table === "ROLE") {
        // view role 
        query = `SELECT R.id AS id, title, salary, D.name AS department
      FROM ROLE AS R LEFT JOIN DEPARTMENT AS D
      ON R.department_id = D.id;`;
    } else {
        // view employee
        query = `SELECT E.id AS id, E.first_name AS first_name, E.last_name AS last_name, 
      R.title AS role, D.name AS department, CONCAT(M.first_name, " ", M.last_name) AS manager
      FROM EMPLOYEE AS E LEFT JOIN ROLE AS R ON E.role_id = R.id
      LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
      LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id;`;

    }
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);

        questionPrompt();
    });
};
const addDept = () => {
    let questions = [
        {
            type: "input",
            name: "name",
            message: "What would you like to name the new department?"
        }
    ];

    inquirer.prompt(questions)
        .then(response => {
            const query = `INSERT INTO department (name) VALUES (?)`;
            connection.query(query, [response.name], (err, res) => {
                if (err) throw err;
                console.log(`Successfully added ${response.name} department with id ${res.insertId}`);
                questionPrompt();
            });
        })
        .catch(err => {
            console.error(err);
        });
}

const addRole = () => {
    // get depts with department_id to make the choices object
    const departments = [];
    connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
        if (err) throw err;

        res.forEach(dep => {
            let qObj = {
                name: dep.name,
                value: dep.id
            }
            departments.push(qObj);
        });

        //  role questions
        let questions = [
            {
                type: "input",
                name: "title",
                message: "What is the new roles title?"
            },
            {
                type: "input",
                name: "salary",
                message: "What is the new roles salary?"
            },
            {
                type: "list",
                name: "dept",
                choices: departments,
                message: "What department would you like to assign this role to?"
            }
        ];

        inquirer.prompt(questions)
            .then(response => {
                const query = `INSERT INTO ROLE (title, salary, department_id) VALUES (?)`;
                connection.query(query, [[response.title, response.salary, response.dept]], (err, res) => {
                    if (err) throw err;
                    console.log(`Successfully added ${response.title} role with ${res.insertId}`);
                    questionPrompt();
                });
            })
            .catch(err => {
                console.error(err);
            });
    });
}
const addEmployee = () => {
    // get all the employees for mgr selection
    connection.query("SELECT * FROM EMPLOYEE", (err, res) => {
        if (err) throw err;
        const employeeSelection = [
            {
                name: 'None',
                value: 0
            }
        ]; // manager n/a
        res.forEach(({ first_name, last_name, id }) => {
            employeeSelection.push({
                name: first_name + " " + last_name,
                value: id
            });
        });

        // get all roles
        connection.query("SELECT * FROM ROLE", (err, res) => {
            if (err) throw err;
            const roleSelection = [];
            res.forEach(({ title, id }) => {
                roleSelection.push({
                    name: title,
                    value: id
                });
            });

            let questions = [
                {
                    type: "input",
                    name: "first_name",
                    message: "What is the employee's first name?"
                },
                {
                    type: "input",
                    name: "last_name",
                    message: "What is the employee's last name?"
                },
                {
                    type: "list",
                    name: "role_id",
                    choices: roleSelection,
                    message: "What is the employee's role?"
                },
                {
                    type: "list",
                    name: "manager_id",
                    choices: employeeSelection,
                    message: "Who is the employee's manager?"
                }
            ]

            inquirer.prompt(questions)
                .then(response => {
                    const query = `INSERT INTO EMPLOYEE (first_name, last_name, role_id, manager_id) VALUES (?)`;
                    let manager_id = response.manager_id !== 0 ? response.manager_id : null;
                    connection.query(query, [[response.first_name, response.last_name, response.role_id, manager_id]], (err, res) => {
                        if (err) throw err;
                        console.log(`Successfully added employee ${response.first_name} ${response.last_name} with id ${res.insertId}`);
                        questionPrompt();
                    });
                })
                .catch(err => {
                    console.error(err);
                });
        })
    });
}

const updateRole = () => {
    // get all employees 
    connection.query("SELECT * FROM EMPLOYEE", (err, res) => {
        if (err) throw err;
        const employeeSelection = [];
        res.forEach(({ first_name, last_name, id }) => {
            employeeSelection.push({
                name: first_name + " " + last_name,
                value: id
            });
        });

        // get all roles 
        connection.query("SELECT * FROM ROLE", (err, res) => {
            if (err) throw err;
            const roleSelection = [];
            rs.forEach(({ title, id }) => {
                roleSelection.push({
                    name: title,
                    value: id
                });
            });

            let questions = [
                {
                    type: "list",
                    name: "id",
                    choices: employeeSelection,
                    message: "Which employee role would you like to update?"
                },
                {
                    type: "list",
                    name: "role_id",
                    choices: roleSelection,
                    message: "What is the employee's new role?"
                }
            ]

            inquirer.prompt(questions)
                .then(response => {
                    const query = `UPDATE EMPLOYEE SET ? WHERE ?? = ?;`;
                    connection.query(query, [
                        { role_id: response.role_id },
                        "id",
                        response.id
                    ], (err, res) => {
                        if (err) throw err;

                        console.log("Successfully updated employee's role!");
                        questionPrompt();
                    });
                })
                .catch(err => {
                    console.error(err);
                });
        })
    });
}
const viewEmployeesByManager = () => {
    // get all employees 
    connection.query("SELECT * FROM EMPLOYEE", (err, res) => {
        if (err) throw err;
        const employeeSelection = [{
            name: 'None',
            value: 0
        }];
        res.forEach(({ first_name, last_name, id }) => {
            employeeSelection.push({
                name: first_name + " " + last_name,
                value: id
            });
        });

        let questions = [
            {
                type: "list",
                name: "manager_id",
                choices: employeeSelection,
                message: "What role do you want to update?"
            },
        ]

        inquirer.prompt(questions)
            .then(response => {
                let manager_id, query;
                if (response.manager_id) {
                    query = `SELECT E.id AS id, E.first_name AS first_name, E.last_name AS last_name, 
            R.title AS role, D.name AS department, CONCAT(M.first_name, " ", M.last_name) AS manager
            FROM EMPLOYEE AS E LEFT JOIN ROLE AS R ON E.role_id = R.id
            LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
            LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id
            WHERE E.manager_id = ?;`;
                } else {
                    manager_id = null;
                    query = `SELECT E.id AS id, E.first_name AS first_name, E.last_name AS last_name, 
            R.title AS role, D.name AS department, CONCAT(M.first_name, " ", M.last_name) AS manager
            FROM EMPLOYEE AS E LEFT JOIN ROLE AS R ON E.role_id = R.id
            LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
            LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id
            WHERE E.manager_id is null;`;
                }
                connection.query(query, [response.manager_id], (err, res) => {
                    if (err) throw err;
                    console.table(res);
                    questionPrompt();
                });
            })
            .catch(err => {
                console.error(err);
            });
    });
}

const updateManager = () => {
    // get all employees
    connection.query("SELECT * FROM EMPLOYEE", (err, res) => {
        if (err) throw err;
        const employeeSelection = [];
        res.forEach(({ first_name, last_name, id }) => {
            employeeSelection.push({
                name: first_name + " " + last_name,
                value: id
            });
        });

        const managerSelection = [{
            name: 'None',
            value: 0
        }]; // mgr n/a
        res.forEach(({ first_name, last_name, id }) => {
            managerSelection.push({
                name: first_name + " " + last_name,
                value: id
            });
        });

        let questions = [
            {
                type: "list",
                name: "id",
                choices: employeeSelection,
                message: "Which employee would you like to update?"
            },
            {
                type: "list",
                name: "manager_id",
                choices: managerSelection,
                message: "Which manager would you like to update to?"
            }
        ]

        inquirer.prompt(questions)
            .then(response => {
                const query = `UPDATE EMPLOYEE SET ? WHERE id = ?;`;
                let manager_id = response.manager_id !== 0 ? response.manager_id : null;
                connection.query(query, [
                    { manager_id: manager_id },
                    response.id
                ], (err, res) => {
                    if (err) throw err;

                    console.log("Successfully updated employee's manager!");
                    questionPrompt();
                });
            })
            .catch(err => {
                console.error(err);
            });
    })

};
const deleteDept = () => {
    // set dept array
    const departments = [];
    // get all depts
    connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
        if (err) throw err;

        res.forEach(dep => {
            let dept = {
                name: dep.name,
                value: dep.id
            }
            departments.push(dept);
        });

        let questions = [
            {
                type: "list",
                name: "id",
                choices: departments,
                message: "Which department would you like to delete?"
            }
        ];

        inquirer.prompt(questions)
            .then(response => {
                const query = `DELETE FROM DEPARTMENT WHERE id = ?`;
                connection.query(query, [response.id], (err, res) => {
                    if (err) throw err;
                    console.log(`${res.affectedRows} successfully deleted!`);
                    questionPrompt();
                });
            })
            .catch(err => {
                console.error(err);
            });
    });
};

const deleteRole = () => {
    // set dept empty array    
    const departments = [];
    // get all roles
    connection.query("SELECT * FROM ROLE", (err, res) => {
        if (err) throw err;

        const roleChoice = [];
        res.forEach(({ title, id }) => {
            roleChoice.push({
                name: title,
                value: id
            });
        });

        let questions = [
            {
                type: "list",
                name: "id",
                choices: roleChoice,
                message: "What role would you like to delete?"
            }
        ];

        inquirer.prompt(questions)
            .then(response => {
                const query = `DELETE FROM ROLE WHERE id = ?`;
                connection.query(query, [response.id], (err, res) => {
                    if (err) throw err;
                    console.log(`${res.affectedRows} successfully deleted!`);
                    questionPrompt();
                });
            })
            .catch(err => {
                console.error(err);
            });
    });
};

const deleteEmployee = () => {
    // get all employees
    connection.query("SELECT * FROM EMPLOYEE", (err, res) => {
        if (err) throw err;
        // set employee array
        const employeeSelection = [];
        res.forEach(({ first_name, last_name, id }) => {
            employeeSelection.push({
                name: first_name + " " + last_name,
                value: id
            });
        });

        let questions = [
            {
                type: "list",
                name: "id",
                choices: employeeSelection,
                message: "Which employee would you like to delete?"
            }
        ];

        inquirer.prompt(questions)
            .then(response => {
                const query = `DELETE FROM EMPLOYEE WHERE id = ?`;
                connection.query(query, [response.id], (err, res) => {
                    if (err) throw err;
                    console.log(`${res.affectedRows} successfully deleted!`);
                    questionPrompt();
                });
            })
            .catch(err => {
                console.error(err);
            });
    });
};
