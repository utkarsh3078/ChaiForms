import UserService from "@repo/services/user";
import FormService from "@repo/services/form";

export const userService = new UserService();
export const formService = new FormService();

//Converting class to object and exporting it so that we can use it in our trpc router
