import instance from "@/services/base";
import type { Term, Section } from "@/types";


export async function createAlertSubscriptions(term: Term["term"], courseReferenceNumbers: Section["course_reference_number"][]) {
  return await instance.post<Section[]>("alerts/subscriptions", {
    term: term,
    course_reference_numbers: courseReferenceNumbers,
  });
}


export async function listAlertSubscriptions(term?: Term["term"]) {
  return await instance.get<Section[]>("alerts/subscriptions", {
    params: { term },
  });
}


export async function deleteAlertSubscriptions(term: Term["term"], courseReferenceNumbers: Section["course_reference_number"][]) {
  return await instance.delete("alerts/subscriptions", {
    data: {
      term: term,
      course_reference_numbers: courseReferenceNumbers,
    },
  });
}