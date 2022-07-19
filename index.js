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
  