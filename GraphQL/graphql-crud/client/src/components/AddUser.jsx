import { useState } from "react";
import { useMutation, gql } from "@apollo/client";

const ADD_USER = gql`
  mutation($name: String!, $email: String!, $age: Int!) {
    addUser(name: $name, email: $email, age: $age) {
      id
    }
  }
`;

function AddUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: ""
  });

  const [addUser] = useMutation(ADD_USER);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await addUser({
      variables: {
        name: form.name,
        email: form.email,
        age: parseInt(form.age)
      }
    });

    setForm({ name: "", email: "", age: "" });
  };

  return (
    <div>
      <h2>Add User</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          placeholder="Age"
          type="number"
          value={form.age}
          onChange={(e) =>
            setForm({ ...form, age: e.target.value })
          }
        />

        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default AddUser;