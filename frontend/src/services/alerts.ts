import instance from "@/services/base";
import type { Section, Subscription } from "@/types";


export async function createSubscriptions(sectionIds: Section["id"][]) {
  return await instance.post<Subscription[]>("alerts/subscriptions", {
    section_ids: sectionIds,
  });
}


export async function listSubscriptions() {
  return await instance.get<Subscription[]>("alerts/subscriptions");
}


export async function deleteSubscriptions(subscriptionIds: Subscription["id"][]) {
  return await instance.delete("alerts/subscriptions", {
    data: { subscription_ids: subscriptionIds },
  });
}