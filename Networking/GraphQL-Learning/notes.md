# GraphQL + React (Vite) — Client & Server Notes

## 1. Overall Architecture

React (Vite)
    ↓
Apollo Client
    ↓
HttpLink
    ↓
HTTP POST /graphql
    ↓
Apollo Server
    ↓
GraphQL Schema
    ↓
Resolvers
    ↓
Mock Data / Database


---

# 2. SERVER

## Installation

npm install @apollo/server graphql


## Server Structure

server/
├── index.js
├── typeDefs.js
└── resolvers.js


---

# 3. Mock Data

const countriesData = [
  {
    countryId: "1",
    countryCode: "IN",
    countryName: "India"
  },
  {
    countryId: "2",
    countryCode: "US",
    countryName: "USA"
  }
];

const statesData = [
  {
    stateId: "101",
    stateCode: "AP",
    stateName: "Andhra Pradesh",
    countryId: "1"
  },
  {
    stateId: "102",
    stateCode: "TS",
    stateName: "Telangana",
    countryId: "1"
  },
  {
    stateId: "201",
    stateCode: "CA",
    stateName: "California",
    countryId: "2"
  }
];

const citiesData = [
  {
    cityId: "1001",
    cityCode: "VJA",
    cityName: "Vijayawada",
    stateId: "101"
  },
  {
    cityId: "1002",
    cityCode: "VSKP",
    cityName: "Visakhapatnam",
    stateId: "101"
  },
  {
    cityId: "1003",
    cityCode: "HYD",
    cityName: "Hyderabad",
    stateId: "102"
  },
  {
    cityId: "2001",
    cityCode: "LA",
    cityName: "Los Angeles",
    stateId: "201"
  }
];


---

# 4. GraphQL Schema / typeDefs

const typeDefs = `

  type country {
    countryCode: String
    countryName: String
    countryId: ID
    states: [state]
  }

  type state {
    stateCode: String
    stateName: String
    stateId: ID
    countryId: ID
    cities: [city]
  }

  type city {
    cityCode: String
    cityName: String
    cityId: ID
    stateId: ID
  }

  type Query {
    countries: [country]
    states: [state]
    cities: [city]
  }

  type Mutation {
    createCountry(
      countryCode: String!
      countryName: String!
    ): country

    updateCountry(
      countryId: ID!
      countryCode: String!
      countryName: String!
    ): country

    deleteCountry(
      countryId: ID!
    ): country
  }
`;


---

# 5. What does String! mean?

String

→ Field can be null.

String!

→ Field cannot be null.

Example:

countryCode: String!

This rejects:

null

But it DOES NOT reject:

""

because an empty string is still a String.

Therefore business validation is required:

if (!args.countryCode.trim()) {
  throw new Error("countryCode cannot be empty");
}


---

# 6. Query Resolvers

const resolvers = {

  Query: {

    countries: () => {
      return countriesData;
    },

    states: () => {
      return statesData;
    },

    cities: () => {
      return citiesData;
    }

  }

};


---

# 7. Relationships

Country → State → City

Example:

India
  |
  ├── Andhra Pradesh
  |       |
  |       ├── Vijayawada
  |       └── Visakhapatnam
  |
  └── Telangana
          |
          └── Hyderabad


The relationship is represented by IDs.

State:

countryId: "1"

means:

This state belongs to country "1".


City:

stateId: "101"

means:

This city belongs to state "101".


---

# 8. Relationship Resolver

country: {

  states: (parent) => {

    return statesData.filter(
      state => state.countryId === parent.countryId
    );

  }

}


If parent is:

{
  countryId: "1",
  countryName: "India"
}

then:

parent.countryId

is:

"1"

Therefore:

statesData.filter(
  state => state.countryId === "1"
)

returns India's states.


---

# 9. State → Cities

state: {

  cities: (parent) => {

    return citiesData.filter(
      city => city.stateId === parent.stateId
    );

  }

}


If:

parent.stateId = "101"

then:

citiesData.filter(
  city => city.stateId === "101"
)

returns:

Vijayawada
Visakhapatnam


---

# 10. Resolver Arguments

A resolver can receive:

(parent, args, context, info)


## parent

Data returned by the parent resolver.

Example:

country.states(parent)

parent could be:

{
  countryId: "1",
  countryName: "India"
}


## args

Arguments sent by the client.

Example:

query {
  country(countryId: "1") {
    countryName
  }
}

Then:

args.countryId

= "1"


## context

Shared request-level information.

Common uses:

- authenticated user
- authorization
- database connection
- request information
- logging


## info

GraphQL execution information.

Usually not important for beginner-level resolvers.


---

# 11. Nested GraphQL Query

query {
  countries {
    countryId
    countryName

    states {
      stateId
      stateName

      cities {
        cityId
        cityName
      }
    }
  }
}


The execution conceptually becomes:

Query.countries
      ↓
Country.states
      ↓
State.cities


---

# 12. Mutation

Mutation is used for changing data.

Usually:

Create
Update
Delete


Example:

type Mutation {

  createCountry(
    countryCode: String!
    countryName: String!
  ): country

}


Resolver:

Mutation: {

  createCountry: (parent, args) => {

    if (!args.countryCode.trim()) {
      throw new Error("countryCode cannot be empty");
    }

    if (!args.countryName.trim()) {
      throw new Error("countryName cannot be empty");
    }

    const newCountry = {
      countryId: String(countriesData.length + 1),
      countryCode: args.countryCode,
      countryName: args.countryName
    };

    countriesData.push(newCountry);

    return newCountry;
  }

}


---

# 13. Apollo Server

index.js

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import typeDefs from "./typeDefs.js";
import resolvers from "./resolvers.js";

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const { url } = await startStandaloneServer(server, {
  listen: {
    port: 4000
  }
});

console.log(`Server running at ${url}`);


GraphQL endpoint:

http://localhost:4000/graphql


---

# 14. CLIENT

Create Vite project:

npm create vite@latest client

Choose:

React
JavaScript


Install:

npm install


Install Apollo:

npm install @apollo/client graphql


---

# 15. Client Structure

client/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   └── apolloClient.js
└── package.json


---

# 16. Apollo Client

IMPORTANT:

We are using Apollo Client 4.

Installed version:

@apollo/client@4.2.12
graphql@16.14.2


Apollo Client 4 separates React APIs from core APIs.


## Core Apollo imports

import {
  ApolloClient,
  InMemoryCache,
  HttpLink
} from "@apollo/client";


## React Apollo imports

import {
  ApolloProvider,
  useQuery,
  useMutation
} from "@apollo/client/react";


IMPORTANT:

Do NOT do:

import { gql, useQuery } from "@apollo/client";


Instead:

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";


---

# 17. apolloClient.js

import {
  ApolloClient,
  InMemoryCache,
  HttpLink
} from "@apollo/client";

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql"
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

export default client;


---

# 18. Why HttpLink?

Apollo Client needs to know:

"Where should I send my GraphQL request?"


HttpLink provides that connection.

Apollo Client
      ↓
HttpLink
      ↓
HTTP POST
      ↓
http://localhost:4000/graphql


The GraphQL request is still an HTTP request.


---

# 19. main.jsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ApolloProvider } from "@apollo/client/react";

import App from "./App.jsx";
import client from "./apolloClient.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>

    <ApolloProvider client={client}>

      <App />

    </ApolloProvider>

  </StrictMode>
);


ApolloProvider makes Apollo Client available to React components.


---

# 20. useQuery

App.jsx

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_COUNTRIES = gql`

  query {

    countries {

      countryId
      countryCode
      countryName

    }

  }

`;


function App() {

  const {
    loading,
    error,
    data
  } = useQuery(GET_COUNTRIES);


  if (loading) {
    return <p>Loading...</p>;
  }


  if (error) {
    return <p>Error: {error.message}</p>;
  }


  return (

    <div>

      <h1>Countries</h1>

      {data.countries.map(country => (

        <div key={country.countryId}>

          <h3>
            {country.countryName}
          </h3>

          <p>
            {country.countryCode}
          </p>

        </div>

      ))}

    </div>

  );

}

export default App;


---

# 21. What useQuery gives us

const {
  loading,
  error,
  data
} = useQuery(GET_COUNTRIES);


loading

→ Request is currently running.


error

→ Something went wrong.


data

→ Successful GraphQL response.


Apollo handles much of:

- request
- loading state
- error state
- response
- cache
- refetching


---

# 22. gql

const GET_COUNTRIES = gql`

  query {

    countries {

      countryId
      countryName

    }

  }

`;


gql represents the GraphQL operation/document.

It tells Apollo:

"This is the GraphQL query I want to execute."


---

# 23. GraphQL Variables

Query:

const GET_COUNTRY = gql`

  query GetCountry($countryId: ID!) {

    country(countryId: $countryId) {

      countryId
      countryName

    }

  }

`;


React:

const { data } = useQuery(
  GET_COUNTRY,
  {
    variables: {
      countryId: "1"
    }
  }
);


Important:

Prefer variables instead of building query strings manually.


---

# 24. useMutation

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";


const CREATE_COUNTRY = gql`

  mutation CreateCountry(
    $countryCode: String!
    $countryName: String!
  ) {

    createCountry(
      countryCode: $countryCode
      countryName: $countryName
    ) {

      countryId
      countryCode
      countryName

    }

  }

`;


const [createCountry] =
  useMutation(CREATE_COUNTRY);


Call:

await createCountry({

  variables: {

    countryCode: "JP",
    countryName: "Japan"

  }

});


---

# 25. Complete Frontend → Backend Flow

User clicks button

       ↓

React Component

       ↓

useQuery()
or
useMutation()

       ↓

Apollo Client

       ↓

HttpLink

       ↓

HTTP POST /graphql

       ↓

Apollo Server

       ↓

GraphQL Schema

       ↓

Resolver

       ↓

Database / Mock Data

       ↓

Response

       ↓

Apollo Cache

       ↓

React re-render


---

# 26. GraphQL vs REST

REST:

GET /countries

GET /countries/1

GET /countries/1/states

GET /states/101/cities


GraphQL:

POST /graphql


The frontend specifies what it needs:

query {

  countries {

    countryName

    states {

      stateName

      cities {

        cityName

      }

    }

  }

}


---

# 27. Over-fetching

Over-fetching means:

The server sends more data than the frontend needs.


Example REST response:

{
  name,
  price,
  rating,
  description,
  images,
  seller,
  inventory,
  shipping,
  reviews
}


Frontend only needs:

name
price
rating


GraphQL:

product {

  name
  price
  rating

}


Only requested fields are returned.


---

# 28. Under-fetching

Under-fetching means:

The frontend needs additional related data and may need additional requests.


Example:

GET /countries/1

then:

GET /countries/1/states

then:

GET /states/101/cities


GraphQL can request nested data:

country {

  countryName

  states {

    stateName

    cities {

      cityName

    }

  }

}


---

# 29. Important Performance Understanding

GraphQL is NOT automatically faster than REST.

If REST returns exactly 14 fields:

REST → 14 fields

and GraphQL also returns exactly 14 fields:

GraphQL → 14 fields


The payload difference may be very small.


GraphQL's major advantage is:

- client-controlled data shape
- nested data fetching
- fewer request orchestration problems
- strong schema/type system
- introspection
- reusable queries
- convenient frontend data management


---

# 30. Mobile Performance

GraphQL can be useful for mobile applications because mobile networks can have:

- limited bandwidth
- higher latency
- unreliable connections
- expensive data usage


Instead of receiving unnecessary fields, the client can request only what it needs.


However:

GraphQL ≠ automatically better mobile performance.


Bad GraphQL queries can actually be expensive.

Example:

countries {
  states {
    cities {
      ...
    }
  }
}


If the data is huge, this can become expensive.


Production GraphQL applications therefore use:

- pagination
- caching
- query complexity limits
- depth limits
- DataLoader
- database optimization


---

# 31. Apollo Client vs GraphQL

GraphQL:

API/query language/specification


Apollo Server:

GraphQL server implementation


Apollo Client:

GraphQL client library for frontend


You can use GraphQL without Apollo Client:

React
 ↓
fetch()
 ↓
GraphQL Server


Or:

React
 ↓
Apollo Client
 ↓
GraphQL Server


Apollo Client provides useful frontend features such as:

- useQuery
- useMutation
- caching
- refetching
- pagination
- optimistic updates
- request management


---

# 32. Important Interview Mental Model

React does NOT directly talk to the database.

Correct:

React
 ↓
Apollo Client
 ↓
GraphQL API
 ↓
Resolvers
 ↓
Database


The frontend controls:

"What data do I need?"


The backend controls:

"How do I obtain that data?"


---

# 33. Learning Order

1. GraphQL definition
2. Schema / typeDefs
3. Query
4. Mutation
5. Resolver
6. parent
7. args
8. context
9. info
10. Relationships
11. GraphQL with fetch()
12. Apollo Client
13. ApolloProvider
14. useQuery
15. Variables
16. useMutation
17. Cache
18. Refetching
19. Pagination
20. Optimistic updates
21. Authentication
22. Context
23. Subscriptions
24. Performance
25. Error handling


---

# 34. Common Apollo Client 4 Errors

## Error:

does not provide an export named 'useQuery'


Cause:

Using Apollo Client 3 import syntax.


Wrong:

import {
  gql,
  useQuery
} from "@apollo/client";


Correct:

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";


---

## Error:

To initialize Apollo Client,
you must specify a 'link' property


Solution:

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql"
});


const client = new ApolloClient({

  link: httpLink,

  cache: new InMemoryCache()

});


---

# 35. Final Mental Model

GraphQL:

"What data do I want?"


Resolver:

"How do I get that data?"


Apollo Server:

"Run the GraphQL API."


Apollo Client:

"Help React communicate with the GraphQL API and manage the result."


HttpLink:

"Send the GraphQL operation over HTTP."


Schema:

"What data and operations are allowed?"


Database:

"Where the actual persistent data lives."
