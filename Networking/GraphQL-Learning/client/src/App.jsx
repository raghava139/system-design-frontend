import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_COUNTRIES = gql`
  query {
    countries {
      countryId
      countryCode
      countryName
      states{
      stateName
      }
    }
  }
`;

function App() {

  // simple using fetch method
  // const [countries, setCountries] = useState([]);

  // useEffect(() => {
  //   const fetchCountries = async () => {
  //     const response = await fetch("http://localhost:4000/graphql", {
  //       method: "POST",

  //       headers: {
  //         "Content-Type": "application/json",
  //       },

  //       body: JSON.stringify({
  //         query: `
  //           query {
  //             countries {
  //               countryId
  //               countryCode
  //               countryName
  //               states{
  //                 stateName
  //               }
  //             }
  //           }
  //         `,
  //       }),
  //     });

  //     const result = await response.json();

  //     console.log(result);

  //     setCountries(result.data.countries);
  //   };

  //   fetchCountries();
  // }, []);


  //using use Query
  const { loading, error, data } = useQuery(GET_COUNTRIES);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      <h1>Countries</h1>

      {data.countries.map((country) => (
        <div key={country.countryId}>
          <h3>{country.countryName}</h3>
          <p>{country.countryCode}</p>
        </div>
      ))}
    </div>
  );
}

export default App;