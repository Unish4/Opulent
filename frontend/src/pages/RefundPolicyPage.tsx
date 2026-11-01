import LegalPage from "../components/LegalPage";

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund policy"
      intro="Refunds are reviewed case by case and are not automatic. This page explains what usually happens in each situation."
      sections={[
        {
          heading: "How to ask for a refund",
          body: [
            "When a refund applies, you can request it from your order page, or message us on WhatsApp with your order ID. We may ask you for more details.",
            "We do not promise a refund time. Our team replies during working hours.",
          ],
        },
        {
          heading: "Wrong player details",
          body: [
            "If you notice a wrong ID before we deliver, tell us straight away. We will correct the order, and no refund is needed.",
            "If the top-up was already delivered to the ID you entered and confirmed, we cannot take it back and we cannot refund it.",
          ],
        },
        {
          heading: "Our mistake",
          body: [
            "If our team delivers to the wrong account or makes another error, we will deliver again or refund you in full.",
          ],
        },
        {
          heading: "A top-up we could not deliver",
          body: [
            "If we cannot complete your top-up, you can choose to try again or to be refunded.",
          ],
        },
        {
          heading: "Payment problems",
          body: [
            "If you pay twice, we refund the duplicate payment.",
            "If you pay more than the price, we refund the extra amount.",
            "If you pay less than the price, we will contact you to pay the rest or refund what you paid.",
            "If we receive a payment that does not match an order, we try to match it. If we cannot, we refund it.",
          ],
        },
        {
          heading: "How refunds are paid",
          body: [
            "Approved refunds are sent back to the eSewa account that made the payment. We do not send refunds to other accounts or numbers, even if asked on WhatsApp.",
            "A refund is final only when we have sent it and recorded its eSewa reference on your order.",
          ],
        },
      ]}
    />
  );
}
