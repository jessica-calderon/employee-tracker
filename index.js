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
    }
})