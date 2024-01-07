import BillingForm from "@/components/BillingForm";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { get } from "http";
import React from "react";

async function page() {
  const subscriptionPlan = await getUserSubscriptionPlan();

  return <BillingForm subscriptionPlan={subscriptionPlan} />;
}

export default page;
