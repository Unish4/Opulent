import LegalPage from "../components/LegalPage";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="This page explains what information we collect when you use the store, why, and who can see it."
      sections={[
        {
          heading: "What we collect",
          body: [
            "Account details: your name, email address and phone number, provided through our sign-in service.",
            "Order details: the game, package, price, and the player ID, server ID, in-game name, login or account email you enter. For a few games (currently Roblox and eFootball) we also collect your account password, see below.",
            "Payment records: the eSewa transaction ID and amount that our team copies from our own eSewa statement after you pay. Payment screenshots are sent to us on WhatsApp and are not stored on this website.",
            "Support messages you send us on WhatsApp.",
          ],
        },
        {
          heading: "Player check",
          body: [
            "When you press Check player, we send your player ID to a lookup service to show the in-game name. We keep a copy of the result for up to seven days so the same ID does not need to be checked again.",
          ],
        },
        {
          heading: "Login details for some games",
          body: [
            "For games that can only be topped up by signing in, the order form asks for your login and password. We store the password encrypted. Only the admin handling your order, or an owner, can view it, and each time it is viewed that is recorded.",
            "The password is deleted when your order is completed, cancelled or rejected. If an order fails and stays open, it is deleted after seven days at the latest. We never show the password to anyone else and never send it in messages.",
          ],
        },
        {
          heading: "Why we use it",
          body: [
            "To process orders and top-ups, to answer support requests, to keep records of payments and refunds, and to prevent fraud and misuse.",
          ],
        },
        {
          heading: "Who sees it",
          body: [
            "Our admin team sees the details needed to process orders. Access depends on role, and admin actions are recorded.",
            "Service providers that process data for us: Clerk (sign-in), MongoDB Atlas (database), Render and Vercel (hosting), a player lookup provider, Cloudinary (images only), WhatsApp and Telegram. Telegram is used only for internal alerts with an order reference, game and amount.",
            "We do not sell your information and we do not use advertising trackers.",
          ],
        },
        {
          heading: "How long we keep it",
          body: [
            "We keep order and payment records for as long as we need them for accounting, disputes and legal reasons. Cached player check results expire after seven days.",
          ],
        },
        {
          heading: "Your choices",
          body: [
            "You can ask us to correct your details or delete your account by messaging us. We may need to keep order and payment records even after an account is deleted.",
          ],
        },
        {
          heading: "Cookies and sign-in",
          body: [
            "Our sign-in provider uses cookies or similar storage to keep you signed in. We store a temporary draft of your order form in your browser while you sign in. It is removed when you place the order or close the tab.",
          ],
        },
      ]}
    />
  );
}
