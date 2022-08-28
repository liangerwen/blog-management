export const getAuth = () => {
  return localStorage.getItem('USER_TOKEN');
};

export const setAuth = (token: string) => {
  localStorage.setItem('USER_TOKEN', token);
};

export const clearAuth = () => {
  setAuth('');
};
