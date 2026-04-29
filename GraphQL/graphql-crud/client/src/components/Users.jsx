import { useQuery, useMutation, gql } from "@apollo/client";

const GET_USERS = gql`
  query {
    getUsers {
      id
      name
      email
      age
    }
  }
`;

const DELETE_USER = gql`
  mutation($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`;

function Users() {
  const { loading, error, data, refetch } = useQuery(GET_USERS);

  const [deleteUser] = useMutation(DELETE_USER);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;

  const handleDelete = async (id) => {
    await deleteUser({ variables: { id } });
    refetch(); // refresh list
  };

  return (
    <div>
      <h2>All Users</h2>

      {data.getUsers.map((user) => (
        <div key={user.id} style={{ marginBottom: "10px" }}>
          <p>
            {user.name} ({user.age}) - {user.email}
          </p>

          <button onClick={() => handleDelete(user.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default Users;