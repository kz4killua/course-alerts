import instance from "@/services/base";

import type { Term, Course } from "@/types";


export async function listTerms(registrationOpen?: boolean) {
  return await instance.get<Term[]>("courses/terms/", {
    params: { registration_open: registrationOpen },
  });
}


export async function listCourses(term?: string, search?: string) {
  return await instance.get<Course[]>("courses/", {
    params: { term, search },
  });
}