import instance from "@/services/base";

import type { Term, Course, Section } from "@/types";


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


export async function listSections(course: string, term?: string) {
  return await instance.get<Section[]>(`courses/${course}/sections/`, {
    params: { term },
  });
}