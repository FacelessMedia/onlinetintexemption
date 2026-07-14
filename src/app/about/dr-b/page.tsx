import { permanentRedirect } from "next/navigation";

export default function RetiredProviderProfile() {
  permanentRedirect("/about/clinical-providers");
}
