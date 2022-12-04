try {
  require("dotenv").config();
} catch {}

export const API_DNS = process.env.API_DNS;
export const AUTH_DNS = process.env.AUTH_DNS;

export const CLINIC_ID = Number(process.env.CLINIC_ID);

export const BEARER_TOKEN = process.env.BEARER_TOKEN;
