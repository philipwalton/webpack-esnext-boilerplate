export const sleep = (time) => {
  return new Promise((resolve, reject) => setTimeout(resolve, time));
};
