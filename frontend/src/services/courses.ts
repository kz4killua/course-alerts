import instance from "@/services/base";

import type { Term } from "@/types";


export async function listTerms(registrationOpen?: boolean) {
  return await instance.get<Term[]>("courses/terms", {
    params: { registration_open: registrationOpen },
  });
}