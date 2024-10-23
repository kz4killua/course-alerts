import instance from "@/services/base";
import type { Term, Section } from "@/types";


export async function createAlertSubscription(term: Term["term"], courseReferenceNumbers: Section["course_reference_number"][]) {
  return await instance.post("alerts/subscriptions", {
    term: term,
    course_reference_numbers: courseReferenceNumbers,
  });
}