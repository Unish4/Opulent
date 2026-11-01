import LegalPage from "../components/LegalPage";
import { SITE } from "../config/site";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and conditions"
      intro="By creating an account or placing an order you agree to these terms. Please read them before you pay."
      sections={[
        {
          heading: "Who we are",
          body: [
            `${SITE.name} is an online store that sells in-game currency, passes and packs for mobile games to customers in Nepal.${SITE.operatorName ? ` The store is run by ${SITE.operatorName}.` : ""}`,
            "We are not part of, endorsed by or affiliated with Garena, Tencent, Moonton, Supercell, Konami, Roblox Corporation or any other game publisher. Game names and logos belong to their owners.",
          ],
        },
        {
          heading: "Your account",
          body: [
            "You must sign in to place an order. Keep your sign-in details to yourself. You are responsible for what happens under your account.",
            "We may suspend an account that is used for fraud, abuse or fake payment proof.",
          ],
        },
        {
          heading: "Orders and prices",
          body: [
            "All prices are in Nepali rupees (NPR). The price shown when you create an order is the price of that order. Later price changes do not affect it.",
            "We may pause a game or mark a package unavailable at any time. Unavailable packages cannot be ordered.",
          ],
        },
        {
          heading: "How payment works",
          body: [
            "You pay with eSewa using the QR code shown on your order page, and you must pay the exact amount. You then send your order ID and payment screenshot to us on WhatsApp.",
            "Our team checks every payment by hand against our eSewa records. An order is not paid until we confirm it. A screenshot alone is not proof of payment.",
            "If we receive no payment for an order for about two days, the order is cancelled automatically.",
          ],
        },
        {
          heading: "Delivery",
          body: [
            "Top-ups are made by our team after we confirm your payment. We do not promise a delivery time.",
            "We deliver to the player ID, server ID, login or account email you entered. For most games we do not need your password.",
          ],
        },
        {
          heading: "Games that need your login details",
          body: [
            "For a few games, currently Roblox and eFootball, a top-up can only be made by signing in to your account. For those games the order form asks for your login and password, and you must agree before ordering.",
            "We use your login details only to complete your order. They are stored encrypted, only the admin handling your order can view them, and they are deleted when the order is completed, cancelled or rejected. Change your password after the top-up.",
            "If the game blocks the sign-in, for example with two-step verification, our team will contact you on WhatsApp. Only enter your password on the order form, never in a WhatsApp message.",
            "Some game publishers do not allow anyone else to sign in to your account. Giving us your login is your choice and your responsibility. We are not responsible for restrictions a publisher places on your account.",
          ],
        },
        {
          heading: "Your details must be correct",
          body: [
            "You are responsible for the details you enter. If you notice a mistake, contact us on WhatsApp straight away. We can correct it before the top-up is delivered.",
            "A top-up that has been delivered cannot be taken back. If it was delivered to the ID you gave us, we cannot reverse it.",
          ],
        },
        {
          heading: "Refunds",
          body: [
            "Refunds are described in our refund policy. They are reviewed case by case and are not automatic.",
          ],
        },
        {
          heading: "Games and publishers",
          body: [
            "Game publishers set their own rules and can change or restrict accounts and items. We are not responsible for actions taken by a publisher.",
            "Our responsibility for an order is limited to the amount you paid for it.",
          ],
        },
        {
          heading: "Changes to these terms",
          body: [
            "We may update these terms. The date at the top shows the latest version. Orders already placed keep the terms that applied when you placed them.",
          ],
        },
      ]}
    />
  );
}
