import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import {
	buildSchema,
	Ctx,
	Field,
	FieldResolver,
	ID,
	ObjectType,
	Query,
	Resolver,
	Root,
} from 'type-graphql';

@ObjectType()
export class User {
	@Field(() => ID)
	id!: string;

	@Field(() => String)
	name!: string;
}

@ObjectType()
export class Project {
	@Field(() => ID)
	id!: string;

	@Field(() => String)
	name!: string;

	@Field(() => ID)
	userId!: string;

	@Field(() => User)
	user!: User;
}

// in memory mock data 
// needs a separate "Record" because Project doesn't store Project.user
interface ProjectRecord {
	id: string;
	name: string;
	userId: string;
}

interface Context {
	db: {
		users: User[];
		projects: ProjectRecord[];
	};
}

const db: Context['db'] = {
	users: [
		{ id: '1', name: 'Alice Smith' },
		{ id: '2', name: 'Bob Jones' },
		{ id: '3', name: 'Muffin Man' },
	],
	projects: [
		{ id: '1', name: 'Apollo Demo', userId: '1' },
		{ id: '2', name: 'GraphQL Learning', userId: '2' },
		{ id: '3', name: 'Drury Lane', userId: '4' },
	],
};

const resolvers = {
	Query: {
		// Fetches the list of projects
		projects: (ctx: Context): ProjectRecord[] => {
			console.log("DB QUERY - Retrieve Projects");
			return ctx.db.projects
		},
	},
	Project: {
		// Resolves the user for each project
		user: (project: ProjectRecord, ctx: Context): User => {
			console.log("DB QUERY - Retrieve User");
			const user = ctx.db.users.find((u) => u.id === project.userId);
			if (!user) {
				throw new Error(`User ${project.userId} not found`);
			}
			return user;
		},
	},
};

// type-graphql requires the root Query (and field resolvers) to be decorated
// class methods, so these just call the resolvers above
@Resolver(() => Project)
export class ProjectResolver {
	@Query(() => [Project])
	projects(@Ctx() ctx: Context) {
		return resolvers.Query.projects(ctx);
	}

	@FieldResolver(() => User)
	user(@Root() project: ProjectRecord, @Ctx() ctx: Context) {
		return resolvers.Project.user(project, ctx);
	}
}

const schema = await buildSchema({
	resolvers: [ProjectResolver],
	validate: false,
});

const server = new ApolloServer<Context>({ schema });

// Starts an ApolloServer with a sandbox to test queries on at localhost:4000
const result = await startStandaloneServer(server, {
	listen: { port: 4000 },
	context: async () => ({ db }),
});

console.log(`Server ready at ${result.url}`);
