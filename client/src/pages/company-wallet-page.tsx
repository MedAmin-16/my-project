
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function CompanyWalletPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to the simplified crypto payment page
    setLocation('/crypto/payment');
  }, [setLocation]);

  return null;
}
