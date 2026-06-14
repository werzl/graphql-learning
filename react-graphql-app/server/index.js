import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const db = {
	users: [
		{ id: '1', name: 'Alice Smith', email: 'alice@example.com' },
		{ id: '2', name: 'Bob Jones', email: 'bob@example.com' }
	]
};

const typeDefs = `#graphql
	type User {
		id: ID!
		name: String!
		email: String!
	}
	
	type Query {
		users: [User]
		user(id: ID!): User
  	}

	type Mutation {
		createUser(name: String!, email: String!): User
	}
`

const resolvers = {
	Query: {
		users: () => db.users,
		user: (_, args) => db.users.find(u => u.id === args.id),
	},
	Mutation: {
		createUser: (_, args) => {
			const newUser = {
				id: String(db.users.length + 1),
				name: args.name,
				email: args.email
			};

			db.users.push(newUser);
			return newUser;
		}
	}
};

const server = new ApolloServer({ typeDefs, resolvers });

// Starts an ApolloServer with a sandbox to test queries on at localhost:4000 
const result = await startStandaloneServer(server, {
	listen: {port: 4000}
});

console.log(`Server ready at ${result.url}`);