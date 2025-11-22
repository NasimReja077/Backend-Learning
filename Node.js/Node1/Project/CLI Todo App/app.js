import readline from "readline";

const rl = readline.createInterface({
     input : process.stdin,
     output : process.stdout
})

const todoes = [];

const showMenu = () => {
     console.log("\n--- TODO APP MENU ---");
     console.log("1: Add Todo");
     console.log("2: View Todos");
     console.log("3: Exit");
     rl.question("Choose an option: ", handleInpute);
}
const handleInpute = (option) => {
     if(option === "1"){
          rl.question("Enter your todo: ", (task) => {
               todoes.push(task);
               console.log("Task Added:", task);
               showMenu();
          });
     }else if (option === "2"){
          console.log("\n--- Your Todos ---");
          todoes.forEach((task, index) => {
               console.log(`${index + 1} : ${task}`);
          })
          showMenu();
     } else if (option === "3"){
          console.log("Exiting Todo App. Goodbye!");
          rl.close();
     }else{
          console.log("Invalid option. Please try again.");
          showMenu();
     }
}
showMenu();
