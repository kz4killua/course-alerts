export function getAccessToken() {
  return localStorage.getItem('ACCESS_TOKEN');
}

export function setAccessToken(token: string) {
  localStorage.setItem('ACCESS_TOKEN', token);
}

export function removeAccessToken() {
  localStorage.removeItem('ACCESS_TOKEN');
}

export function getRefreshToken() {
  return localStorage.getItem('REFRESH_TOKEN');
}

export function setRefreshToken(token: string) {
  localStorage.setItem('REFRESH_TOKEN', token);
}

export function removeRefreshToken() {
  localStorage.removeItem('REFRESH_TOKEN');
}