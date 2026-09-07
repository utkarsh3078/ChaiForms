//Making hooks for auth api calls, using trpc mutations for sign up and sign in. Returning the mutateAsync and mutate functions, as well as the error, failureCount, isError, isIdle, isSuccess, and status properties from the mutation hook.

import { trpc } from "~/trpc/client";

export const useSignUp = () => {
  //Implementing chacehing for the getLoggedInUserInfo query, so that when a user signs up, the getLoggedInUserInfo query will be invalidated and refetched with the new user information.
  const utils = trpc.useUtils();
  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    mutate: createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.createUserWithEmailAndPassword.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
  });
  return {
    createUserWithEmailAndPasswordAsync,
    createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useSignIn = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: signInUserWithEmailAndPasswordAsync,
    mutate: signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.signInUserWithEmailAndPassword.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
  });
  return {
    signInUserWithEmailAndPasswordAsync,
    signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useSignOut = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: signOutUserMutationAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.signOutUser.useMutation();

  // The authentication cookie is httpOnly and owned by the API origin, so only the
  // API can clear it. A route handler on the web origin sets an unrelated cookie and
  // leaves the session intact.
  const signOutUserAsync = async () => {
    await signOutUserMutationAsync(undefined);
    await utils.auth.getLoggedInUserInfo.reset();
  };

  const signOutUser = () => {
    void signOutUserAsync();
  };

  return {
    signOutUserAsync,
    signOutUser,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useUser = () => {
  const {
    data: user,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.auth.getLoggedInUserInfo.useQuery();
  return {
    user,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
};
