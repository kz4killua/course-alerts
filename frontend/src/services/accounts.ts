import instance from "@/services/base";
import type { User } from "@/types";


export async function refreshAccessToken(refreshToken: string) {
  return await instance.post<{ access: string }>("accounts/token/refresh", {
    refresh: refreshToken,
  });
}


export async function verifyAccessToken(accessToken: string) {
  return await instance.post("accounts/token/verify", {
    token: accessToken,
  });
}


export async function requestSignIn(email: string) {
  return await instance.post("accounts/signin/request", {
    email,
  });
}


export async function verifySignIn(email: string, code: string) {
  return await instance.post<{ access: string, refresh: string }>("accounts/signin/verify", {
    email,
    code,
  });
}


export async function updateAccount(phone: string) {
  return await instance.patch("accounts/me", {
    phone,
  });
}


export async function getProfile() {
  return await instance.get<User>("accounts/me");
}