import Users from "./components/Users.jsx";
import AddUser from "./components/AddUser";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>GraphQL CRUD App</h1>
      <AddUser />
      <Users />
    </div>
  );
}

export default App;