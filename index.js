require('dotenv').config();
const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
// ascii art loader
const figlet = require('figlet');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'employee_DB',
});

// Connect to the DB
connection.connect((err) => {
  if (err) throw err;
  console.log(`Connected\n`);
  figlet('Employee Tracker', function(err, data) {
    if (err) {
      console.log('ASCII not loaded');
    } else {
      console.log(data);
    }  
    questionPrompt();
  });
});

function questionPrompt() {
  const firstQuestion = [{
    type: "list",
    name: "action",
    message: "Please choose one of the following options",
    loop: false,
    choices: ["View all employees", "View all roles", "View all departments", "Add a new employee", "Add a new role", "Add a new department", "Update an employee role", "Update an employee's manager", "View employees by manager", "Delete a department", "Delete a role", "Delete an employee", "View the total utilized budget of a department", "Exit"]
  }]
  
  inquirer.prompt(firstQuestion)
  .then(response => {
    switch (response.action) {
      case "View all employees":
        selectAll("EMPLOYEE");
        break;
      case "View all roles":
        selectAll("ROLE");
        break;
      case "View all departments":
        selectAll("DEPARTMENT");
        break;
      case "Add a new department":
        addNewDepartment();
        break;
      case "Add a new role":
        addNewRole();
        break;
      case "Add a new employee":
        addNewEmployee();
        break;
      case "Update an employee role":
        updateRole();
        break;
      case "View employees by manager":
        viewEmployeeByManager();
        break;
      case "Update an employee's manager":
        updateManager();
        break;
      case "Delete a department":
        deleteDepartment();
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
}


const selectAll = (table) => {
  // select all employees
  let query;
  if (table === "DEPARTMENT") {
    query = `SELECT * FROM DEPARTMENT`;
  } else if (table === "ROLE") {
    query = `SELECT R.id AS id, title, salary, D.name AS department
    FROM ROLE AS R LEFT JOIN DEPARTMENT AS D
    ON R.department_id = D.id;`;
  } else {
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

const addNewDepartment = () => {
  let questions = [
    {
      type: "input",
      name: "name",
      message: "What is the department name?"
    }
  ];

  inquirer.prompt(questions)
  .then(response => {
    const query = `INSERT INTO department (name) VALUES (?)`;
    connection.query(query, [response.name], (err, res) => {
      if (err) throw err;
      console.log(`Successfully updated departments`);
      questionPrompt();
    });
  })
  .catch(err => {
    console.error(err);
  });
}

const addNewRole = () => {
  // get all depts
  const departments = [];
  connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
    if (err) throw err;

    res.forEach(dep => {
      let quest = {
        name: dep.name,
        value: dep.id
      }
      departments.push(quest);
    });

    // new role inquirer
    let questions = [
      {
        type: "input",
        name: "title",
        message: "What is the title of the new role?"
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of the new role?"
      },
      {
        type: "list",
        name: "department",
        choices: departments,
        message: "What department would you like to add this role to?"
      }
    ];

    inquirer.prompt(questions)
    .then(response => {
      const query = `INSERT INTO ROLE (title, salary, department_id) VALUES (?)`;
      connection.query(query, [[response.title, response.salary, response.department]], (err, res) => {
        if (err) throw err;
        console.log(`Successfully updated role`);
        questionPrompt();
      });
    })
    .catch(err => {
      console.error(err);
    });
  });
}

const addNewEmployee = () => {
  // get all employees
  connection.query("SELECT * FROM EMPLOYEE", (err, res) => {
    if (err) throw err;
    const employeeSelection = [
      {
        name: 'None',
        value: 0
      }
    ]; // null mgr
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
          let manager_id = response.manager_id !== 0? response.manager_id: null;
          connection.query(query, [[response.first_name, response.last_name, response.role_id, manager_id]], (err, res) => {
            if (err) throw err;
            console.log(`Successfully updated manager`);
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
      res.forEach(({ title, id }) => {
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
            {role_id: response.role_id},
            "id",
            response.id
          ], (err, res) => {
            if (err) throw err;
            
            console.log("Successfully updated role!");
            questionPrompt();
          });
        })
        .catch(err => {
          console.error(err);
        });
      })
  });
}

const viewEmployeeByManager =  () => {
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
         message: "Which role would you like to update?"
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

const updateManager = ()=> {
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
    }]; 
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
        let manager_id = response.manager_id !== 0? response.manager_id: null;
        connection.query(query, [
          {manager_id: manager_id},
          response.id
        ], (err, res) => {
          if (err) throw err;
            
          console.log("New manager successfully updated");
          questionPrompt();
        });
      })
      .catch(err => {
        console.error(err);
      });
  })
  
};

const deleteDepartment = () => {
  const departments = [];
  connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
    if (err) throw err;

    res.forEach(dep => {
      let quest = {
        name: dep.name,
        value: dep.id
      }
      departments.push(quest);
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
        console.log(`Rows successfully deleted`);
        questionPrompt();
      });
    })
    .catch(err => {
      console.error(err);
    });
  });
};

const deleteRole = () => {
  const departments = [];
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
        type: "list",
        name: "id",
        choices: roleSelection,
        message: "Which role would you like to delete?"
      }
    ];

    inquirer.prompt(questions)
    .then(response => {
      const query = `DELETE FROM ROLE WHERE id = ?`;
      connection.query(query, [response.id], (err, res) => {
        if (err) throw err;
        console.log(`Row successfully deleted`);
        questionPrompt();
      });
    })
    .catch(err => {
      console.error(err);
    });
  });
};

const deleteEmployee = () => {
  connection.query("SELECT * FROM EMPLOYEE", (err, res) => {
    if (err) throw err;

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
        console.log(`Rows successfully deleted!`);
        questionPrompt();
      });
    })
    .catch(err => {
      console.error(err);
    });
  });
};

const viewBudget = () => {
  connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
    if (err) throw err;

    const depChoice = [];
    res.forEach(({ name, id }) => {
      depChoice.push({
        name: name,
        value: id
      });
    });

    let questions = [
      {
        type: "list",
        name: "id",
        choices: depChoice,
        message: "Which budget would you like to see?"
      }
    ];

    inquirer.prompt(questions)
    .then(response => {
      const query = `SELECT D.name, SUM(salary) AS budget FROM
      EMPLOYEE AS E LEFT JOIN ROLE AS R
      ON E.role_id = R.id
      LEFT JOIN DEPARTMENT AS D
      ON R.department_id = D.id
      WHERE D.id = ?
      `;
      connection.query(query, [response.id], (err, res) => {
        if (err) throw err;
        console.table(res);
        questionPrompt();
      });
    })
    .catch(err => {
      console.error(err);
    });
  });

};