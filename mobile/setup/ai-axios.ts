import axios from "axios";

import { AI_API_URL } from "@/constants/api";

const aiAxios = axios.create({
  baseURL: AI_API_URL,
  timeout: 180_000,
  headers: {
    Accept: "application/json",
  },
});

export default aiAxios;
