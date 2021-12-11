import axios from ".";

import { GetClinicas } from "../interfaces/services";

export const getClinicas: GetClinicas = (params, id) =>
  axios
    .get("/clinicas" + (id ? `/${id}` : "'"), { params })
    .then((res) => res.data)
    .catch((e) => undefined); 

    

