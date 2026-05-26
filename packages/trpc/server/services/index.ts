import UserService from "@repo/services/user";

export const userService = new UserService();

//Converting class to object and exporting it so that we can use it in our trpc router
