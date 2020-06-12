const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table");
// const sql = require("./sql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "employees_trackerDB"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  firstPrompt();
});

// function which prompts the user for what action they should take
function firstPrompt() {

  inquirer
    .prompt({
      type: "list",
      name: "task",
      message: "Would you like to do?",
      choices: [
        "View Employees",
		"View Departments",
		"View Roles",
        "View Employees by Manager",
        "Add Employee",
		"Add Role",
		"Add Department",
        "Remove Employees",
		"Remove Role",
		"Remove Department",
        "Update Employee Role",
        "Update Employee Manager",
		"Total Uilised Budget by Department",
        "End"]
    }) 
    .then(function ({ task }) {
      switch (task) {
        case "View Employees":
          viewEmployee();
          break;
        case "View Departments":
           viewDepartments();
          break;
		 case "View Roles":
           viewRoles();
          break;
         case "View Employees by Manager":
           viewEmployeeByManager();
           break;
        case "Add Employee":
          addEmployee();
          break;
		 case "Add Role":
          addRole();
          break;
		case "Add Department":
          addDepartment();
          break;
        case "Remove Employees":
          removeEmployees();
          break;
		case "Remove Role":
          removeRole();
          break;
		case "Remove Department":
          removeDepartment();
          break;
        case "Update Employee Role":
          updateEmployeeRole();
          break;
         case "Update Employee Manager":
           updateEmployeeManager();
           break;
		 case "Total Uilised Budget by Department":
		     budgetByDepartment();
			 break;
        case "End":
          connection.end();
          break;
      }
    });
}

//////////////////========================= 1."View Employees"/ READ all, SELECT * FROM

function viewEmployee() {
  console.log("Viewing employees\n");

  var query =
    `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  LEFT JOIN role r
	ON e.role_id = r.id
  LEFT JOIN department d
  ON d.id = r.department_id
  LEFT JOIN employee m
	ON m.id = e.manager_id`

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
    console.log("Employees viewed!\n");

    firstPrompt();
  });
  // console.log(query.sql);
}


//////////////////========================= 2."View departments"/ READ all, SELECT * FROM
function viewDepartments(){
 console.log("Viewing Departments\n");

  var query =
    `SELECT * from department`

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
    console.log("Departments viewed!\n");

    firstPrompt();
});
}
//////////////////========================= 2."View roles"/ READ all, SELECT * FROM
function viewRoles(){
console.log("Viewing Roles\n");
  var query =
    `SELECT r.id,r.title,r.salary,d.name as department from department d,role r where r.department_id=d.id`

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
    console.log("Roles viewed!\n");

    firstPrompt();
	});
}


//========================================= 3."View Employees by Manager"

// Make a mnager array

function viewEmployeeByManager() {
  console.log("Viewing employees by manager\n");

  var query =
    `SELECT e.manager_id,(select concat(em.first_name,' ',em.last_name) from employee em where em.id=e.manager_id) as manager
  FROM employee e where e.manager_id IS NOT NULL
  GROUP BY e.manager_id`

  connection.query(query, function (err, res) {
    if (err) throw err;

    // const departmentChoices = res.map(({ id, name }) => ({
    //   name: `${id} ${name}`,
    //   value: id
    // }));

    const managerChoices = res.map(data => ({
      value: data.manager_id, name: data.manager
    }));

    console.table(res);
    console.log("Manager view succeed!\n");

    promptManager(managerChoices);
  });
  // console.log(query.sql);
}

// User choose the manager list, then employees pop up

function promptManager(managerChoices) {

  inquirer
    .prompt([
      {
        type: "list",
        name: "managerId",
        message: "Which manager would you choose?",
        choices: managerChoices
      }
    ])
    .then(function (answer) {
      console.log("answer ", answer.managerId);

      var query =
        `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department 
  FROM employee e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id
  WHERE e.manager_id = ?`

      connection.query(query, answer.managerId, function (err, res) {
        if (err) throw err;

        console.table("response ", res);
        console.log(res.affectedRows + "Employees are viewed!\n");

        firstPrompt();
      });
    });
}


//========================================= 4."Add Employee" / CREATE: INSERT INTO

// Make a employee array

function addEmployee() {
  console.log("Inserting an employee!")

  var query =
    `SELECT r.id, r.title, r.salary 
      FROM role r`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const roleChoices = res.map(({ id, title, salary }) => ({
      value: id, title: `${title}`, salary: `${salary}`
    }));

    console.table(res);
    console.log("RoleToInsert!");

    promptInsert(roleChoices);
  });
}

function promptInsert(roleChoices) {

  inquirer
    .prompt([
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
        name: "roleId",
        message: "What is the employee's role?",
        choices: roleChoices
      },
      // {
      //   name: "manager_id",
      //   type: "list",
      //   message: "What is the employee's manager_id?",
      //   choices: manager
      // }
    ])
    .then(function (answer) {
      console.log(answer);

      var query = `INSERT INTO employee SET ?`
      // when finished prompting, insert a new item into the db with that info
      connection.query(query,
        {
          first_name: answer.first_name,
          last_name: answer.last_name,
          role_id: answer.roleId,
          manager_id: answer.managerId,
        },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log(res.insertedRows + "Inserted successfully!\n");

          firstPrompt();
        });
      // console.log(query.sql);
    });
}

//========================================= 5."Remove Employees" / DELETE, DELETE FROM

// Make a employee array to delete

function removeEmployees() {
  console.log("Deleting an employee");

  var query =
    `SELECT e.id, e.first_name, e.last_name
      FROM employee e`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const deleteEmployeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id, name: `${id} ${first_name} ${last_name}`
    }));

    console.table(res);
    console.log("ArrayToDelete!\n");

    promptDelete(deleteEmployeeChoices);
  });
}

// User choose the employee list, then employee is deleted

function promptDelete(deleteEmployeeChoices) {

  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to remove?",
        choices: deleteEmployeeChoices
      }
    ])
    .then(function (answer) {

      var query = `DELETE FROM employee WHERE ?`;
      // when finished prompting, insert a new item into the db with that info
      connection.query(query, { id: answer.employeeId }, function (err, res) {
        if (err) throw err;

        console.table(res);
        console.log(res.affectedRows + "Deleted!\n");

        firstPrompt();
      });
      // console.log(query.sql);
    });
}

//========================================= 6."Update Employee Role" / UPDATE,

function updateEmployeeRole() { 
  employeeArray();

}

function employeeArray() {
  console.log("Updating an employee");

  var query =
    `SELECT e.id, e.first_name, e.last_name, r.title as Role , d.name AS department, r.salary, (select CONCAT(m.first_name, ' ', m.last_name) from employee m where m.manager_id=e.id group by m.manager_id) AS manager 
  FROM employee e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id`
  

  connection.query(query, function (err, res) {
    if (err) throw err;

    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id, name: `${first_name} ${last_name}`      
    }));

    console.table(res);
    console.log("employeeArray To Update!\n")

    roleArray(employeeChoices);
  });
}

function roleArray(employeeChoices) {
  console.log("Updating an role");

  var query =
    `SELECT r.id, r.title, r.salary 
  FROM role r`
  let roleChoices;

  connection.query(query, function (err, res) {
    if (err) throw err;

    roleChoices = res.map(({ id, title, salary }) => ({
      value: id, title: `${title}`, salary: `${salary}`      
    }));

    console.table(res);
    console.log("roleArray to Update!\n")

    promptEmployeeRole(employeeChoices, roleChoices);
  });
}

function promptEmployeeRole(employeeChoices, roleChoices) {

  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to set with the role?",
        choices: employeeChoices
      },
      {
        type: "list",
        name: "roleId",
        message: "Which role do you want to update?",
        choices: roleChoices
      },
    ])
    .then(function (answer) {

      var query = `UPDATE employee SET role_id = ? WHERE id = ?`
      // when finished prompting, insert a new item into the db with that info
      connection.query(query,
        [ answer.roleId,  
          answer.employeeId
        ],
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log(res.affectedRows + "Updated successfully!");

          firstPrompt();
        });
      // console.log(query.sql);
    });
}



//////////////////========================= 7."Add Role" / CREATE: INSERT INTO

function addRole() {

  var query =
    `SELECT d.id, d.name, r.salary AS budget
    FROM employee e
    JOIN role r
    ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    GROUP BY d.id, d.name`

  connection.query(query, function (err, res) {
    if (err) throw err;

    // (callbackfn: (value: T, index: number, array: readonly T[]) => U, thisArg?: any)
    const departmentChoices = res.map(({ id, name }) => ({
      value: id, name: `${id} ${name}`
    }));

    console.table(res);
    console.log("Department array!");

    promptAddRole(departmentChoices);
  });
}

function promptAddRole(departmentChoices) {

  inquirer
    .prompt([
      {
        type: "input",
        name: "roleTitle",
        message: "Role title?"
      },
      {
        type: "input",
        name: "roleSalary",
        message: "Role Salary"
      },
      {
        type: "list",
        name: "departmentId",
        message: "Department?",
        choices: departmentChoices
      },
    ])
    .then(function (answer) {

      var query = `INSERT INTO role SET ?`

      connection.query(query, {
        title: answer.roleTitle,
        salary: answer.roleSalary,
        department_id: answer.departmentId
      },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log("Role Inserted!");

          firstPrompt();
        });

    });
}
//////////////////========================= 7."Add Department" / CREATE: INSERT INTO

function addDepartment() {

  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "Department name?"
      },
      
     
    ])
    .then(function (answer) {

      var query = `INSERT INTO department SET ?`

      connection.query(query, {
        name: answer.name
      },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log("Department Inserted!");

          firstPrompt();
        });

    });
}





//========================================= 8."Remove Role"


// Make a employee array to delete

function removeRole() {
  console.log("Deleting a role");

  var query =
    `SELECT r.id, r.title
      FROM role r`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const deleteRoleChoices = res.map(({ id, title }) => ({
      value: id, name: `${id} ${title}`
    }));

    console.table(res);
    console.log("ArrayToDelete!\n");

    promptRoleDelete(deleteRoleChoices);
  });
}

// User choose the employee list, then employee is deleted

function promptRoleDelete(deleteRoleChoices) {

  inquirer
    .prompt([
      {
        type: "list",
        name: "roleId",
        message: "Which role do you want to remove?",
        choices: deleteRoleChoices
      }
    ])
    .then(function (answer) {

      var query = `DELETE FROM role WHERE ?`;
      
      connection.query(query, { id: answer.roleId }, function (err, res) {
        if (err) throw err;

        console.table(res);
        console.log(res.affectedRows + "Deleted!\n");

        firstPrompt();
      });
	  var query2 = `delete from employee  WHERE ?`;
      
      connection.query(query2, { role_id: answer.roleId }, function (err, res) {
        if (err) throw err;

        console.table(res);
        console.log(res.affectedRows + "Reference employee record also Deleted!\n");

        firstPrompt();
      });
      // console.log(query.sql);
    });
}
//========================================= 8."Remove Role"


// Make a employee array to delete

function removeDepartment() {
  console.log("Deleting a department");

  var query =
    `SELECT d.id, d.name
      FROM department d`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const deleteDepartmentChoices = res.map(({ id, name }) => ({
      value: id, name: `${id} ${name}`
    }));

    console.table(res);
    console.log("ArrayToDelete!\n");

    promptDeptDelete(deleteDepartmentChoices);
  });
}

// User choose the employee list, then employee is deleted

function promptDeptDelete(deleteDepartmentChoices) {

  inquirer
    .prompt([
      {
        type: "list",
        name: "departmentId",
        message: "Which deprtment do you want to remove?",
        choices: deleteDepartmentChoices
      }
    ])
    .then(function (answer) {

      var query = `DELETE FROM department WHERE ?`;
      
      connection.query(query, { id: answer.departmentId }, function (err, res) {
        if (err) throw err;

        console.table(res);
        console.log(res.affectedRows + "Department Deleted!\n");

        firstPrompt();
      });
	  var query2 = `delete from role  WHERE ?`;
      
      connection.query(query2, { department_id: answer.departmentId }, function (err, res) {
        if (err) throw err;

        console.table(res);
        console.log(res.affectedRows + "Reference Role records also Deleted!\n");

        firstPrompt();
      });
      // console.log(query.sql);
    });
	
	
}
//========================================= 6."Update Employee Manager" / UPDATE,

function updateEmployeeManager() { 
  employeeArray2();

}

function employeeArray2() {
  console.log("Updating an employee manager");

  var query =
    `SELECT e.id, e.first_name, e.last_name, r.title as Role , d.name AS department, r.salary
  FROM employee e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id`
  

  connection.query(query, function (err, res) {
    if (err) throw err;

    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id, name: `${first_name} ${last_name}`      
    }));

    console.table(res);
    console.log("employeeArray To Update!\n")

    managerArray(employeeChoices);
  });
}

function managerArray(employeeChoices) {
  console.log("Updating a manager");

  var query =
    `SELECT e.id, e.first_name, e.last_name,
  FROM employee e`
  let managerChoices;

  connection.query(query, function (err, res) {
    if (err) throw err;

    managerChoices = res.map(({ id, first_name}) => ({
      value: id, title: `${first_name}`      
    }));

    console.table(res);
    console.log("managerArray to Update!\n")

    promptEmployeeRole(employeeChoices, managerChoices);
  });
}

function promptEmployeeRole(employeeChoices, managerChoices) {

  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to set with the manager?",
        choices: employeeChoices
      },
      {
        type: "list",
        name: "managerId",
        message: "Which manager do you want to select?",
        choices: managerChoices
      },
    ])
    .then(function (answer) {

      var query = `UPDATE employee SET manager_id = ? WHERE id = ?`
      // when finished prompting, insert a new item into the db with that info
      connection.query(query,
        [ answer.managerId,  
          answer.employeeId
        ],
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log(res.affectedRows + "Updated successfully!");

          firstPrompt();
        });
      // console.log(query.sql);
    });
}
function budgetByDepartment(){
	console.log("Viewing department budget\n");

  var query =
    `SELECT d.name AS department, sum(r.salary) as Budget
  FROM employee e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id
  group by r.department_id
  order by e.id asc
  `

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
    console.log("department budget viewed!\n");

    firstPrompt();
  });
	
	
	
}

  
