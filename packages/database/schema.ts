//Export so that drizzle config can read the schemas and generate types

export * from "./models/user";
export * from "./models/form";
export * from "./models/form-field";

//after writing do genrate cmd and then migrate cmd to update the database with new schema changes. Also, make sure to update the types in the codebase if there are any changes in the schema.
