import { SupplyChainApp } from "./supply-chain-app";
import { getCurrentUser } from "@/lib/auth";

export default function Page() {
  return <SupplyChainApp currentUser={getCurrentUser()} />;
}
